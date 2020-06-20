// Write your JavaScript code.
//jQuery
$(function () {

});

//Globals
var user = $('#userRole');

function onNodeSelecting(args) {
    var id = args.nodeData.id;
    //Determine Level Clicked
    if (parseInt(args.nodeData.id) == 99) { // Company Clicked
        //Company
        console.log("Company " + id + " clicked, do nothing for now...not implemented.")
        appSideNav.storeObjectID = id;
        appSideNav.category = 0;
        appDashboard.isInitial = false;
        appDashboard.selectedLabel = "Company " + id;
        appDashboard.getDashboardNumbers();
    }
    else if (parseInt(args.nodeData.parentID) == 99) { // Territory Clicked
        //Territory
        console.log("Territory " + id + " clicked, do nothing for now...not implemented.")
        appSideNav.storeObjectID = id;
        appSideNav.category = 3;
        appDashboard.isInitial = false;
        appDashboard.selectedLabel = "Territory " + id;
        appDashboard.getDashboardNumbers();
    }
    else if (parseInt(args.nodeData.parentID) >= 1000000) { //Region Clicked
        //Region
        console.log("Region " + id + " clicked, do nothing for now...not implemented.")
        appSideNav.storeObjectID = id;
        appSideNav.category = 1;
        appDashboard.isInitial = false;
        appDashboard.selectedLabel = "Region " + id;
        appDashboard.getDashboardNumbers();
    }    
    else if (args.nodeData.parentID.length == 1 && args.nodeData.hasChildren == false) { //Store Clicked
        //Store
        //Test which page user is on
        appSideNav.category = 2;
        appSideNav.storeObjectID = id;
        if (window.location.href.includes("Settings")) {
            //Settings
            console.log("Settings page detected.  Do the stuff for settings.");
        }
        else if (window.location.href.includes("Analytics")) {
            //Analytics
            console.log("Analytics page detected.  Do the stuff for analytics.");
            appSideNav.storeObjectID = id;
            appAnalytics.storeObjectID = id;
            appAnalytics.isInitial = false;
            appAnalytics.getAnalyticsOverview();
            appAnalytics.getStoreAnalytics();
        }
        else {
            //Dashboard Update Store Data
            console.log("Dashboard page detected.  Do the stuff for dashboard.");
            appSideNav.storeObjectID = id;
            appDashboard.storeObjectID = id;
            appDashboard.isInitial = false;
            appDashboard.selectedLabel = "Store " + id;
            appDashboard.getDashboardNumbers();
        }
        console.log(id + " clicked, getting store data...")
    }
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
        storeObjectID: 108,//default
        storeData: [],
        regionData: [],
        companyData: [],
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
            var route = 'Home/GetDashboardNumbers';
            axios.post(route).then((response) => {
                this.companyData = response.data.data.numbersList;
                this.thresholdData = response.data.data.thresholdList;
                this.storeList = response.data.data.storeList;
                this.regionData = this.companyData.filter(cd => cd.store > 100 && cd.region == 1); //data for region1
                this.storeData = this.companyData.filter(cd => cd.store == this.storeObjectID)[0];

                this.loadTreeView();

                buildSideNav();
            });
        },
        loadTreeView() {
            var data = [];
            this.navigation = [];

            this.storeList.filter(d => d.store != 99).forEach(item => {
                data.push({
                    label: item.store_list_label,
                    store: item.store_list_store,
                    region: item.store_list_region,
                    territory: item.store_list_territory
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
                label: "All Stores",
                expanded: true,
                subChild: [],
                disabled: !isAllStoredEnabled
            });

            //debugger;
            console.log("Raw: " + data);

            //find list of territories
            var territories = data.filter(t => t.territory >= 1000000 && t.store == t.territory && t.store != 99).sort((a, b) => Number(a.territory) - Number(b.territory));

            //territories = _.sortBy(territories, ["territory"]);
            console.log("Filtered: " + territories);

            territories.forEach(t => {
                var isTerritoryExpanded = false;
                var isTerritoryEnabled = false;

                if (t.territory === 1000000) {
                    isTerritoryExpanded = true
                    console.log("Territory Expanded");
                }

                if (userRole == "Admin") {
                    isTerritoryEnabled = true
                    console.log("Territory Enabled");
                }

                console.log("Territory: " + t.territory);

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

                        if (userRole == "Admin" || userRole == "RegionalManager") {
                            isRegionEnabled = true;
                            console.log("Region Enabled");
                        }

                        console.log("Region: " + r.region);

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

                                if (s.store == "108") {
                                    isSelected = true;
                                }

                                console.log("Store: " + s.store);

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
    }
});
