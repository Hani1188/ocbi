// Write your JavaScript code.
//jQuery
$(function () {

});

//Globals
var user = $('#userRole');

function onNodeSelecting(args) {
    var id = args.nodeData.id;
    //Determine Level Clicked

    appSideNav.storeObjectID = id;
    if (window.location.href.includes("Settings")) {
        //Settings
        console.log("Settings page detected...");
    }
    else if (window.location.href.includes("Analytics")) {
        //Analytics
        console.log("Analytics page detected...");
        appSideNav.storeObjectID = id;
        appAnalytics.storeObjectID = id;
        appAnalytics.isInitial = false;
        appAnalytics.getAnalyticsOverview();
        appAnalytics.getStoreAnalytics();
    }
    else {
        if (args.nodeData.id == 99) { // Company Clicked
            //Company
            appSideNav.category = 0;
        }
        else if (parseInt(args.nodeData.parentID) == 99) { // Territory Clicked
            //Territory
            appSideNav.category = 3;
        }
        else if (parseInt(args.nodeData.parentID) >= 1000000) { //Region Clicked
            //Region
            appSideNav.category = 1;
        }    
        else if (args.nodeData.parentID.length == 1 && args.nodeData.hasChildren == false) { //Store Clicked
            //Store
            appSideNav.category = 2;      
        }
          
        //Dashboard Update Store Data
        console.log("Dashboard page detected...");
        appSideNav.storeObjectID = id;
        appDashboard.storeObjectID = id;
        appDashboard.isInitial = false; 
        appDashboard.getDashboardNumbers();
    }
    console.log("getting store: " + id);
}

//Vue
var appSideNav = new Vue({
    el: '#appSideNav',
    components: {
        //Locally Register Components here
    },
    data: {
        isLoading: false,
        isInitial: true,
        category: 2,//default  0 = Company, 1 = Region, 2 = Store, 3 = Territory
        storeObjectID: 101,//default
        storeList: [],
        navigation: [],
        navTree: [],
    },
    computed: {
        // a computed getter
    },
    // define methods under the `methods` object
    methods: {
        getAllData() {
            var route = 'Home/GetStoreList';
            axios.post(route).then((response) => {
                this.storeList = response.data.data.storeList;
                appDashboard.storeLookup = this.storeList;
 
                this.loadTreeView();
                this.buildSideNav();
            });
        },
        loadTreeView() {
            var data = [];
            this.navigation = [];

            this.storeList.filter(d => d.store != 99).forEach(item => {
                data.push({
                    label: item.storeLabel,
                    store: item.store,
                    region: item.region,
                    territory: item.territory
                });
            });


            //All Stores
            var isAllStoredEnabled = false;
            if (userRole == "Admin") {
                isAllStoredEnabled = true
                console.log("All Stored Enabled");
            }

            this.navigation.push({
                id: 99,
                label: "Company",
                expanded: true,
                subChild: [],
                disabled: !isAllStoredEnabled
            });

            //debugger;
            //console.log("Raw: " + data);

            //find list of territories
            var territories = data.filter(t => t.territory >= 1000000 && t.store == t.territory && t.store != 99).sort((a, b) => Number(a.territory) - Number(b.territory));

            //territories = _.sortBy(territories, ["territory"]);
            //console.log("Filtered: " + territories);

            territories.forEach(t => {
                var isTerritoryExpanded = false;
                var isTerritoryEnabled = false;

                if (t.territory === 1000000) {
                    isTerritoryExpanded = true
                    //console.log("Territory Expanded");
                }

                if (userRole == "Admin") {
                    isTerritoryEnabled = true
                    //console.log("Territory Enabled");
                }

                //console.log("Territory: " + t.territory);

                //push each territory to All Stores
                this.navigation[0].subChild.push({
                    id: t.territory,
                    label: t.label,
                    subChild: [],
                    expanded: isTerritoryExpanded,
                    disabled: !isTerritoryEnabled
                });

                //find list of regions in that territory
                var regions = data.filter(reg => reg.store <= 100 && reg.store == reg.region && reg.territory == t.territory)
                    .sort((a, b) => Number(a.region) - Number(b.region));

                var territoryChild = this.navigation[0].subChild.filter(item => item.id == t.territory)[0].subChild;
                if (!(regions == null || regions == undefined || regions.length <= 0)) {
                    regions.forEach(r => {
                        var isRegionExpanded = false;
                        var isRegionEnabled = false;

                        if (r.region == 1) {
                            isRegionExpanded = true;
                        }

                        //push each region to the territory's subChild
                        territoryChild.push({
                            id: r.region,
                            label: r.label,
                            subChild: [],
                            expanded: isRegionExpanded,
                            disabled: !isRegionEnabled
                        });

                        var stores = data.filter(st => st.store > 100 && st.region == r.region && st.territory == t.territory)
                            .sort((a, b) => Number(a.store) - Number(b.store));
                        // create region store <li> and append in the tree list under that region
                        var regionChild = territoryChild.filter(reg => reg.id == r.region)[0].subChild;

                        if (!(stores == null || stores == undefined || stores.length <= 0)) {
                            stores.forEach(s => {
                                var isSelected = false;

                                if (s.store == "101") {
                                    storeObjectID = s.store;
                                    isSelected = true;
                                }

                                //console.log("Store: " + s.store);

                                regionChild.push({
                                    id: s.store,
                                    label: s.label,
                                    isSelected: isSelected
                                    //subChild: [{ id: s.store, label: '<div><ul><li>Mobile</li><li>Web</li></ul></div>'}]
                                });
                            });
                        }

                    });
                }
            });
        },
        buildSideNav() {

            //TreeNav
            ej.base.enableRipple(true);

            treeNav = new ej.navigations.TreeView({
                fields: {
                    dataSource: appSideNav.navigation,
                    id: 'id',
                    text: 'label',
                    child: 'subChild',
                    selected: 'isSelected'
                },
                nodeSelecting: onNodeSelecting
            }, '#treeNav');

            this.isLoading = false;
        },
    },
    created: function () {
       this.getAllData();
    }
});
