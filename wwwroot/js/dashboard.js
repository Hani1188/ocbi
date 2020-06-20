// Write your JavaScript code.
//jQuery
$(function () {
    //Dashboard Timer - runs every 5min to get updated dashboard data
    setInterval(function () {
        appDashboard.dashBoardLastUpdated = moment().format('MMM Do YYYY, h:mm:ss a');
        appDashboard.isInitial = false;
        appDashboard.isTimerRefresh = true;
        appDashboard.getDashboardNumbers();
    }, 300000);

    //Mobile Summary/Detail tabs
    $('#summaryDetail a').on('click', function (e) {
        e.preventDefault()
        $(this).tab('show')
    })
});

//Vue
var appDashboard = new Vue({
    el: '#appDashboard',
    components: {
        //Locally Register Components here
    },
    data: {
        isLoading: false,
        isInitial: true,
        isMobile: false,
        isTimerRefresh: false,
        isDetailOnly: false,
        showSummaryDetail: true,
        dashboardMessages: [],
        //storeObjectData: {},
        category: 2,//default  0 = Company, 1 = Region, 2 = Store, 3 = Territory
        storeObjectID: 101,//default
        storeData: [],
        regionData: [],
        companyData: [],
        dashBoardData: [],
        territory: [],
        territories: [],
        regions: [],
        companyList: [],
        territorySelectList: [],
        regionSelectList: [],
        storeSelectList: [],
        storeList: [],
        selectedTerritory: '',
        selectedRegion: '',
        selectedStore: '',
        navigation: [],
        salesGauge: null,
        navTree: [],
        storeData: appSideNav.storeData,
        isNewMessage: false,
        allStoreServices: [],
        services: [],
        carsList: [],
        saList: [],
        salesList: [],
        message: {
            storeObjectID: '',
        },
        mobileParentItem: null,
        mobileSummaryItems: null,
        territoryLookup: [],
        regionLookup: [],
        storeLookup: [],
        //Thresholds colors
        dashBoardLevel: "",
        serviceThresholds: [],
        dashBoardLastUpdated: moment().format('MMM Do YYYY, h:mm:ss a'),
        dashboardAllMessages: [],
        page: 1,
        numResults: 5,
        roleLevel: '',
        showEmployeeWarning: false,
    },
    computed: {
        // a computed getter
    },
    methods: {
        getDashboardNumbers() {
            var route = 'Home/GetDashboardNumbers';
            var data = {
                Category: appSideNav.category,
                storeObjectID: appSideNav.storeObjectID,
                lastUpdatedDateTime: null
            }
            axios.post(route, data).then((response) => {
                if (response.data.success) {
                    this.companyData = response.data.data.numbersList;
                    this.allStoreServices = response.data.data.services;

                    this.carsList = response.data.data.carsList;
                    this.saList = response.data.data.saList;
                    this.salesList = response.data.data.salesList;

                    this.filteredCompany = this.companyData.filter(cd => cd.storeType == 'COMPANY');
                    this.filteredTerritories = this.companyData.filter(cd => cd.storeType == 'TERRITORY');
                    this.filteredRegions = this.companyData.filter(cd => cd.storeType == 'REGION');
                    this.filteredStores = this.companyData.filter(cd => cd.storeType == 'STORE');

                    //Dashboard Data Objects
                    this.storeData = this.companyData.filter(cd => cd.store == appSideNav.storeObjectID)[0];
                    this.services = this.allStoreServices.filter(ss => ss.storeId == appSideNav.storeObjectID);

                    if (this.storeData.employeesDue == null)
                        this.showEmployeeWarning = false;
                    else
                        this.showEmployeeWarning = true;

                    //Mobile ProtoType Start - using 1200 == XL size limit to switch from desktop to mobile
                    if (screen.width < 1200 || window.innerWidth < 1200) {
                        this.isMobile = true;
                    }

                    this.roleLevel = $('#userRole').val();

                    if (this.isInitial == true) {
                        this.mobileParentItem = this.filteredCompany[0];
                        //odometer.innerHTML = this.storeData.guageCars_Count;  
                        this.isInitial = false;
                    }          

                    //Delay to fire Odometer and Speedometer and Gauges
                    setTimeout(function () {
                        appDashboard.refreshDashboard();
                        appDashboard.refreshMobileSummary();  
                        
                        var el = document.querySelector('.odometer');
                        od = new Odometer({
                            el: el,
                            value: appDashboard.storeData.guageCars_Count,
                            // Any option (other than auto and selector) can be passed in here
                            format: '',
                            theme: 'car'
                        });
                       // od.update(appDashboard.storeData.guageCars_Count);
                        // or
                        el.innerHTML = appDashboard.storeData.guageCars_Count;
                    }, 1000);

                    //Maintain All Messages
                    this.dashboardAllMessages = response.data.data.comments;

                    //Paginate Messages initial page and size
                    this.pagedResults = Paginator(response.data.data.comments, this.page, this.numResults);
                    this.dashboardMessages = this.pagedResults.data;

                    this.isLoading = false;
                }
            }).catch(error => {
                console.log(error.response)
            });
        },
        refreshDashboard() {
            for (var i = 0; i < appDashboard.services.length; i++) {
                var angle = appDashboard.services[i].angle;
                var color = appDashboard.services[i].color;
                var newColor = "";

                if (color == "danger") {
                    newColor = "#fff";
                } else if (color == "warning") {
                    newColor = "#fcca46";
                } else if (color == "success") {
                    newColor = "#00a40d";
                };

                $("#" + appDashboard.services[i].title + ".mask .semi-circle--mask").attr({
                    style:
                        "-webkit-transform: rotate(" +
                        angle +
                        "deg);" +
                        "-moz-transform: rotate(" +
                        angle +
                        "deg);" +
                        "transform: rotate(" +
                        angle +
                        "deg);"
                });

                $("#" + appDashboard.services[i].title + ".mask .semi-circle").attr({
                    style:
                        "background:" + newColor + ";"
                });
            }  
        },
        getMessages() {
            var route = 'Home/LoadComments';
            var data = {
                Category: this.category,
                storeObjectID: this.storeObjectID,
                lastUpdatedDateTime: null
            }

            axios.post(route, data).then((response) => {
                this.dashboardMessages = response.data.data;

                //Load Messages and start pagination
                //Maintain All Messages
                this.dashboardAllMessages = response.data.data;

                //Paginate Messages initial page and size
                this.pagedResults = Paginator(response.data.data, this.page, this.numResults);
                this.dashboardMessages = this.pagedResults.data;

                //console.log(Paginator(this.dashboardMessages, this.page, this.numResults));
                //End Message Pagination
            });
        },
        insertMessages() {
            //debugger;
            var storeObject = appSideNav.storeList.filter(s => s.store_list_store == this.message.storeObjectID)[0];
            var route = 'Home/InsertComments';
            var data = {
                region: storeObject.store_list_region,
                territory: storeObject.store_list_territory,
                stores: [],
                security: 1,
                comment: $('#message-text').val(),
                Category: this.category,
                storeObjectID: this.message.storeObjectID,
                subject: $('#message-subject').val(),
                //ToDo - Future implementation - send email notification to all recipients for all selected Stores
                //notify: $('#message-send-notifcation').val()
            }

            if (this.message.storeObjectID == 0) {      //Company
                data.Category = 0;
                data.stores = appSideNav.storeList.filter(s => s.store_list_store > 100 && s.store_list_store < 1000000).map(function (v) {
                    return v.store_list_store;
                });
            } else if (this.message.storeObjectID < 100) {      //Region
                data.Category = 1;
                data.stores = appSideNav.storeList.filter(s => s.store_list_region == this.message.storeObjectID && s.store_list_store != this.message.storeObjectID).map(function (v) {
                    return v.store_list_store;
                });
            }
            else if (this.message.storeObjectID > 100 && this.message.storeObjectID < 1000000) {      //Store
                data.Category = 2;
                data.stores = appSideNav.storeList.filter(s => s.store_list_store == this.message.storeObjectID).map(function (v) {
                    return v.store_list_store;
                });
            }
            else if (this.message.storeObjectID >= 1000000) {       //Territory
                data.Category = 3;
                data.stores = appSideNav.storeList.filter(s => s.store_list_territory == this.message.storeObjectID && s.store_list_store != this.message.storeObjectID && s.store_list_region != this.message.storeObjectID).map(function (v) {
                    return v.store_list_store;
                });
            }

            //Save Message
            axios.post(route, data).then((response) => {
                //ToDo - updating the message colletion does not make sense only if the message is for the store that is selected.  Need to sort this out.
                //this.dashboardMessages = response.data.data;
                this.isNewMessage = false;
            });
        },
        loadMoreMessages: function() {
            //Paginate Messages
            this.page = this.page + 1;
            this.numResults = this.numResults + 5;

            this.pagedResults = Paginator(this.dashboardAllMessages, this.page, this.numResults);
            this.dashboardMessages = this.pagedResults.data;
            //End Pagination
        },
        drillDown: function (store) { 
            if (this.mobileParentItem.storeType != 'REGION') {
                var drilldownstore = this.companyData.filter(cd => cd.store == store);
                this.mobileParentItem = drilldownstore[0];
                this.refreshMobileSummary();
            } else
            {
                
            }
        },
        drillUp: function () {            
            if (this.mobileParentItem.storeType == 'COMPANY') {
                // Do Nothing
            } else if (this.mobileParentItem.storeType == 'TERRITORY') {
                this.mobileParentItem = this.filteredCompany[0];

            } else if (this.mobileParentItem.storeType == 'REGION') {
                this.mobileParentItem = this.filteredTerritories.filter(cd => cd.store == this.mobileParentItem.territory)[0];

            } else if (this.mobileParentItem.storeType == 'STORE') {
                this.mobileParentItem = this.filteredRegions.filter(cd => cd.store == this.mobileParentItem.region)[0];
            };
            this.refreshMobileSummary();
        },
        refreshMobileSummary: function () {
            if (this.mobileParentItem.storeType == 'COMPANY') {
                this.mobileSummaryItems = this.filteredTerritories;

            } else if (this.mobileParentItem.storeType == 'TERRITORY') {
                this.mobileSummaryItems = this.filteredRegions.filter(cd => cd.territory == this.mobileParentItem.store);

            } else if (this.mobileParentItem.storeType == 'REGION') {
                this.mobileSummaryItems = this.filteredStores.filter(cd => cd.region == this.mobileParentItem.store);

            } else if (this.mobileParentItem.storeType == 'STORE') {
                // should not happen
            };          
        },
        switchSummaryMode: function () {
            this.showSummaryDetail = !this.showSummaryDetail;
            $('#summaryDetail li:nth-child(2) a').toggleClass('active'); // Select second tab
            $('#summaryDetail li:last-child a').toggleClass('active'); // Select last tab
        },
        selectedStoreChanged: function () {
            appSideNav.storeObjectID = this.selectedStore;
            appSideNav.category = 2;
            appDashboard.isInitial = false;
            appDashboard.getDashboardNumbers();
        },
        getClass(val) {
            return val;
        }        
    },
    created: function () {
        this.isLoading = true;
        this.getDashboardNumbers();
    },
    filters: {
        toString: function (value) {
            if (!value) return ''
            return value.toString()

        },
        currency: function (value) {
            if (!value) return 0.00

            if(value == 0) return 0

            if (value > 0) return parseFloat(value, 10).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString();
        }
    }
});

//Pagination
function Paginator(items, page, per_page) {

    var page = page || 1,
        per_page = per_page || 10,
        offset = (page - 1) * per_page,

        paginatedItems = items.slice(offset).slice(0, per_page),
        total_pages = Math.ceil(items.length / per_page);
    return {
        page: page,
        per_page: per_page,
        pre_page: page - 1 ? page - 1 : null,
        next_page: (total_pages > page) ? page + 1 : null,
        total: items.length,
        total_pages: total_pages,
        data: paginatedItems
    };
}

//Grouping
function groupBy(list, keyGetter) {
    const map = new Map();
    list.forEach((item) => {
        const key = keyGetter(item);
        const collection = map.get(key);
        if (!collection) {
            map.set(key, [item]);
        } else {
            collection.push(item);
        }
    });
    return map;
}

