// Write your JavaScript code.
//jQuery
$(function () {
    //Dashboard Timer - runs every 5min to get updated dashboard data
    setInterval(function () {
        appDashboard.dashBoardLastUpdated = moment().format('MMM Do YYYY, h:mm:ss a');
        appDashboard.isInitial = false;
        appDashboard.getDashboardNumbers();
    }, 300000);
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
        dashboardMessages: [],
        thresholdData: [],
        thresholdValue: {},
        storeObjectData: {},
        category: 2,//default  0 = Company, 1 = Region, 2 = Store, 3 = Territory
        storeObjectID: 108,//default
        storeData: [],
        regionData: [],
        companyData: [],
        dashBoardData: [],
        territory: [],
        territories: [],
        regions:[],
        storeList: [],
        navigation: [],
        salesGauge: null,
        salesFleetCount: 0,
        salesFleetAmount: 0,
        salesTotalCars: 848,
        serviceTotalService: 143,
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
        //Thresholds colors
        red: 'red',
        yellow: '#fcca46',
        green: '#00a40d',
        dashBoardLevel: "Territory",
        drillDownId: 0,
        browserWidth: '',
        serviceThresholds: [],
        dashBoardLastUpdated: moment().format('MMM Do YYYY, h:mm:ss a')
    },
    computed: {
        // a computed getter
    },
    // define methods under the `methods` object
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
                    this.thresholdData = response.data.data.thresholdList;
                    this.allStoreServices = response.data.data.services;
                    this.storeList = response.data.data.storeList;
                    this.carsList = response.data.data.carsList;
                    this.saList = response.data.data.saList;
                    this.salesList = response.data.data.salesList;

                    //Dashboard Data Objects
                    this.regionData = this.companyData.filter(cd => cd.store > 100 && cd.region == 1); //data for region1
                    this.storeData = this.companyData.filter(cd => cd.store == appSideNav.storeObjectID)[0];
                    this.services = this.allStoreServices.filter(ss => ss.storeId == appSideNav.storeObjectID);

                    //Mobile ProtoType Start
                    //Data Grouping - Start
                    //this.territories = groupBy(this.companyData, item => item.territory);
                    //this.regions = groupBy(this.companyData, item => item.region);
                    //this.stores = groupBy(this.companyData, item => item.store);

                    this.territories = _.groupBy(this.companyData, item => item.territory);
                    this.regions = _.groupBy(this.companyData, item => item.region);
                    this.stores = _.groupBy(this.companyData, item => item.store);

                    //Territory Data Summary - using as default for mobile size Prototype
                    this.territoryDataList = [];

                    //Selected Territory
                    for (var i = 1; i <= 1; i++) {
                        var territoryNum = i * 1000000;

                        //Get Array from Map
                        //This fails on Dev server - need to 
                        //this.territory = this.territories.get(territoryNum);
                        this.territory = this.territories;

                        //Territory Name - use i instead of Territory Name eg.1000000
                        this.territoryData = {
                            name: i,
                            cars: 0,
                            fleetCars: 0,
                            cars_LastYear: 0,
                            fleetCars_LastYear: 0,
                            sales: 0,
                            fleetSales: 0,
                            sales_LastYear: 0,
                            fleetSales_LastYear: 0,
                            sA_Calc: 0,
                            tA_Calc: 0,
                            sA_Calc_LastYear: 0,
                            tA_Calc_LastYear: 0
                        };

                        for (var j = 0; j < this.territory.length; j++) {
                            this.territoryData.cars = this.territoryData.cars + this.territory[j].cars;
                            this.territoryData.fleetCars = this.territoryData.fleetCars + this.territory[j].fleetCars;
                            this.territoryData.cars_LastYear = this.territoryData.cars_LastYear + this.territory[j].cars_LastYear;
                            this.territoryData.fleetCars_LastYear = this.territoryData.fleetCars_LastYear + this.territory[j].fleetCars_LastYear;

                            this.territoryData.sales = Math.round(this.territoryData.sales + this.territory[j].sales);
                            this.territoryData.fleetSales = Math.round(this.territoryData.fleetSales + this.territory[j].fleetSales);
                            this.territoryData.sales_LastYear = Math.round(this.territoryData.sales_LastYear + this.territory[j].sales_LastYear);
                            this.territoryData.fleetSales_LastYear = Math.round(this.territoryData.fleetSales_LastYear + this.territory[j].fleetSale_LastYear);

                            this.territoryData.sA_Calc = Math.round(this.territoryData.sA_Calc + this.territory[j].sA_Calc);
                            this.territoryData.tA_Calc = Math.round(this.territoryData.tA_Calc + this.territory[j].tA_Calc);
                            this.territoryData.sA_Calc_LastYear = Math.round(this.territoryData.sA_Calc_LastYear + this.territory[j].sA_Calc_LastYear);
                            this.territoryData.tA_Calc_LastYear = Math.round(this.territoryData.tA_Calc_LastYear + this.territory[j].tA_Calc_LastYear);
                        }

                        //Add Summary to List of Terrotory Summaries
                        this.territoryDataList.push(this.territoryData);
                    }

                    console.log("Territory Data Summary: " + this.territoryData.name + ", " + this.territoryData.cars + ", " + this.territoryData.fleetCars);

                    //Mobile Dashboard initial load
                    this.dashBoardData = this.territoryDataList;
                    //Data Grouping End

                    //Load Messages - Territory by default if mobile size
                    if (screen.width < 500) {
                        this.category = 1;
                        this.storeObjectID = 0;
                        this.getMessages();
                    } else {
                        //Use Defulat Store of 108 until this is sorted
                        this.dashboardMessages = response.data.data.comments;
                    }
                    //Mobile ProtoType End

                    //this.loadNumbers();

                    //Load Analytics Controls
                    if (this.isInitial) {
                        //SideNav
                        //ToDo - this should move out of here
                        appSideNav.storeList = this.storeList;

                        //Load TreeView
                        //ToDo - this should be moved.  SideNav should be self sufficient
                        appSideNav.loadTreeView();
                        appSideNav.buildSideNav();
                        //End SideNav

                        //Testing Browser Width
                        this.browserWidth = window.innerWidth;

                        //Delay to fire Odometer and Speedometer and Gauges
                        setTimeout(function () {
                            odometer.innerHTML = appDashboard.storeData.cars;

                            //Cars
                            //Set the angle to transform the needle.  See odometer in site.css to change range
                            var angle = 0;
                            angle = (118 - (appDashboard.storeData.cars * (118 / 70)));
                            angle = angle.toString();
                            angle = "-" + angle;

                            console.log("Car Angle: " + angle)
                            $('#needle').css('transform', 'rotate(' + angle + 'deg)');

                            //Labor
                            angle = (140 + (appDashboard.storeData.laborDollars_Calc * (140 / 70)));
                            angle = angle.toString();
                            angle = "-" + angle;

                            console.log("Labor Angle: " + angle)
                            $('#needle-labor').css('transform', 'rotate(' + angle + 'deg)');

                            //Sales
                            angle = (140 + ((appDashboard.storeData.sales_Calc * (140 / 70)) / 100));
                            angle = angle.toString();
                            angle = "-" + angle;

                            console.log("Sales Angle: " + angle)
                            $('#needle-sales').css('transform', 'rotate(' + angle + 'deg)');

                            //SA
                            angle = (140 + (appDashboard.storeData.sa_Calc * (140 / 70)));
                            angle = angle.toString();
                            angle = "-" + angle;

                            console.log("SA Angle: " + angle)
                            $('#needle-sa').css('transform', 'rotate(' + angle + 'deg)');

                            //Fleet
                            angle = (140 + (appDashboard.storeData.fleetCars * (140 / 70)));
                            angle = angle.toString();
                            angle = "-" + angle;

                            console.log("Fleet Angle: " + angle)
                            $('#needle-fleet').css('transform', 'rotate(' + angle + 'deg)');

                            //Service KPI
                            appDashboard.thresholdValue = appDashboard.thresholdData.filter(t => t.tbl_threshold_store == appDashboard.storeObjectID)[0];
                            appDashboard.storeObjectData = appDashboard.companyData.filter(t => t.store == appDashboard.storeObjectID)[0];

                            //Map Services to Threshold
                            appDashboard.services.forEach(element => {
                                //Find matching value in thresholdData
                                var key = "tbl_threshold_" + element.title.toLowerCase() + "_percentage";
                                console.log(key);
                                var value = appDashboard.thresholdValue[key];

                                element.threshold = value;
                                console.log(element);

                            });

                            for (var i = 0; i < appDashboard.services.length; i++) {
                                var newVal = Math.floor(appDashboard.services[i].percentage);
                                var newColor = "";
                                //KPI range is -90 to 90.  Need to determine ranges and what value is to be used.
                                if (newVal == 0) {
                                    newVal = -90
                                    newColor = "#fff";
                                } else if (appDashboard.services[i].percentage > appDashboard.services[i].threshold) {
                                    newVal = 45;
                                    newColor = "#00a40d";
                                } else if (appDashboard.services[i].percentage < appDashboard.services[i].threshold && appDashboard.services[i].percentage > 0) {
                                    newVal = 0;
                                    newColor = "#fcca46";
                                }

                                $("#" + appDashboard.services[i].title + ".mask .semi-circle--mask").attr({
                                    style:
                                        "-webkit-transform: rotate(" +
                                        newVal +
                                        "deg);" +
                                        "-moz-transform: rotate(" +
                                        newVal +
                                        "deg);" +
                                        "transform: rotate(" +
                                        newVal +
                                        "deg);"
                                });

                                $("#" + appDashboard.services[i].title + ".mask .semi-circle").attr({
                                    style:
                                        "background:" + newColor + ";"
                                });
                            }
                        //End Service KPIs
                        }, 1000);

                        this.isInitial = false;
                    } else {
                        console.log("Refreshing Dashboard...")

                        //Reload Data in controls
                        this.refreshDashboard();
                    }

                    this.isLoading = false;
                }
            }).catch(error => {
                console.log(error.response)
            });
        },
        refreshDashboard() {
            //Service KPI
            appDashboard.thresholdValue = appDashboard.thresholdData.filter(t => t.tbl_threshold_store == appDashboard.storeObjectID)[0];
            appDashboard.storeObjectData = appDashboard.companyData.filter(t => t.store == appDashboard.storeObjectID)[0];

            //Map Services to Threshold
            appDashboard.services.forEach(element => {
                //Find matching value in thresholdData
                var key = "tbl_threshold_" + element.title.toLowerCase() + "_percentage";
                console.log(key);
                var value = appDashboard.thresholdValue[key];

                element.threshold = value;
                console.log(element);

            });

            for (var i = 0; i < appDashboard.services.length; i++) {
                var newVal = Math.floor(appDashboard.services[i].percentage);
                var newColor = "";
                //KPI range is -90 to 90.  Need to determine ranges and what value is to be used.
                if (newVal == 0) {
                    newVal = -90
                    newColor = "#fff";
                } else if (appDashboard.services[i].percentage > appDashboard.services[i].threshold) {
                    newVal = 45;
                    newColor = "#00a40d";
                } else if (appDashboard.services[i].percentage < appDashboard.services[i].threshold && appDashboard.services[i].percentage > 0) {
                    newVal = 0;
                    newColor = "#fcca46";
                }

                $("#" + appDashboard.services[i].title + ".mask .semi-circle--mask").attr({
                    style:
                        "-webkit-transform: rotate(" +
                        newVal +
                        "deg);" +
                        "-moz-transform: rotate(" +
                        newVal +
                        "deg);" +
                        "transform: rotate(" +
                        newVal +
                        "deg);"
                });

                $("#" + appDashboard.services[i].title + ".mask .semi-circle").attr({
                    style:
                        "background:" + newColor + ";"
                });
            }

            //Delay to fire Odometer and Speedometer and Gauges
            setTimeout(function () {
                odometer.innerHTML = appDashboard.storeData.cars;

                //Set the angle to transform the needle.  See odometer in site.css to change range
                var angle = 0;
                angle = (118 - (appDashboard.storeData.cars * (118 / 70)));
                angle = angle.toString();
                angle = "-" + angle;

                console.log("Car Angle: " + angle)
                $('#needle').css('transform', 'rotate(' + angle + 'deg)');

                //Labor
                angle = (140 + (appDashboard.storeData.laborDollars_Calc * (140 / 70)));
                angle = angle.toString();
                angle = "-" + angle;

                console.log("Labor Angle: " + angle)
                $('#needle-labor').css('transform', 'rotate(' + angle + 'deg)');

                //Sales
                angle = (140 + ((appDashboard.storeData.sales_Calc * (140 / 70)) / 100));
                angle = angle.toString();
                angle = "-" + angle;

                console.log("Sales Angle: " + angle)
                $('#needle-sales').css('transform', 'rotate(' + angle + 'deg)');

                //SA
                angle = (140 + (appDashboard.storeData.sa_Calc * (140 / 70)));
                angle = angle.toString();
                angle = "-" + angle;

                console.log("SA Angle: " + angle)
                $('#needle-sa').css('transform', 'rotate(' + angle + 'deg)');

                //Fleet
                angle = (140 + (appDashboard.storeData.fleetCars * (140 / 70)));
                angle = angle.toString();
                angle = "-" + angle;

                console.log("Fleet Angle: " + angle)
                $('#needle-fleet').css('transform', 'rotate(' + angle + 'deg)');
            }, 1000);
        },
        loadNumbers() {
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
            });
        },
        insertMessages() {
            //debugger;
            var storeObject = this.storeList.filter(s => s.store_list_store == this.message.storeObjectID)[0];
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
                data.stores = this.storeList.filter(s => s.store_list_store > 100 && s.store_list_store < 1000000).map(function (v) {
                    return v.store_list_store;
                });
            } else if (this.message.storeObjectID < 100) {      //Region
                data.Category = 1;
                data.stores = this.storeList.filter(s => s.store_list_region == this.message.storeObjectID && s.store_list_store != this.message.storeObjectID).map(function (v) {
                    return v.store_list_store;
                });
            }
            else if (this.message.storeObjectID > 100 && this.message.storeObjectID < 1000000) {      //Store
                data.Category = 2;
                data.stores = this.storeList.filter(s => s.store_list_store == this.message.storeObjectID).map(function (v) {
                    return v.store_list_store;
                });
            }
            else if (this.message.storeObjectID >= 1000000) {       //Territory
                data.Category = 3;
                data.stores = this.storeList.filter(s => s.store_list_territory == this.message.storeObjectID && s.store_list_store != this.message.storeObjectID && s.store_list_region != this.message.storeObjectID).map(function (v) {
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
        drillDown: function (event) {
            if (event) {
                this.summaryDataList = [];
                this.drillDownId = parseInt(event.target.text);

                if (this.dashBoardLevel == "Territory") {
                    //Get Regions for Territory
                    console.log("Getting Regions for Territory " + this.drillDownId + "...");
                    this.regions = groupBy(this.companyData, item => item.region);
                    //Set Row Header Text
                    this.dashBoardLevel = "Region";

                    //Summarize Region
                    for (var i = 0; i <= this.regions.size; i++) {

                        this.summaryItem = this.regions.get(i + 1);

                        //Data Summary
                        this.summaryData = {
                            name: "",
                            cars: 0,
                            fleetCars: 0,
                            cars_LastYear: 0,
                            fleetCars_LastYear: 0,
                            sales: 0,
                            fleetSales: 0,
                            sales_LastYear: 0,
                            fleetSales_LastYear: 0,
                            sA_Calc: 0,
                            tA_Calc: 0,
                            sA_Calc_LastYear: 0,
                            tA_Calc_LastYear: 0
                        };

                        if (this.summaryItem != null) {
                            for (var j = 0; j < this.summaryItem.length; j++) {
                                this.summaryData.name = this.summaryItem[j].region;
                                this.summaryData.cars = this.summaryData.cars + this.summaryItem[j].cars;
                                this.summaryData.fleetCars = this.summaryData.fleetCars + this.summaryItem[j].fleetCars;
                                this.summaryData.cars_LastYear = this.summaryData.cars_LastYear + this.summaryItem[j].cars_LastYear;
                                this.summaryData.fleetCars_LastYear = this.summaryData.fleetCars_LastYear + this.summaryItem[j].fleetCars_LastYear;

                                this.summaryData.sales = Math.round(this.summaryData.sales + this.summaryItem[j].sales);
                                this.summaryData.fleetSales = Math.round(this.summaryData.fleetSales + this.summaryItem[j].fleetSales);
                                this.summaryData.sales_LastYear = Math.round(this.summaryData.sales_LastYear + this.summaryItem[j].sales_LastYear);
                                this.summaryData.fleetSales_LastYear = Math.round(this.summaryData.fleetSales_LastYear + this.summaryItem[j].fleetSale_LastYear);

                                this.summaryData.sA_Calc = Math.round(this.summaryData.sA_Calc + this.summaryItem[j].sA_Calc);
                                this.summaryData.tA_Calc = Math.round(this.summaryData.tA_Calc + this.summaryItem[j].tA_Calc);
                                this.summaryData.sA_Calc_LastYear = Math.round(this.summaryData.sA_Calc_LastYear + this.summaryItem[j].sA_Calc);
                                this.summaryData.tA_Calc_LastYear = Math.round(this.summaryData.tA_Calc_LastYear + this.summaryItem[j].tA_Calc_LastYear);
                            }

                            //Add Summary to List of Terrotory Summaries
                            this.summaryDataList.push(this.summaryData);
                        }
                    }

                    //Set to Mobile Dashboard List
                    this.dashBoardData = this.summaryDataList;
                } else if (this.dashBoardLevel == "Region") {
                    //Get Stores for Region
                    console.log("Getting Stores for Region " + this.drillDownId + "...");
                    this.stores = groupBy(this.companyData, item => item.store && item.region == this.drillDownId);
                    //Set Row Header Text
                    this.dashBoardLevel = "Store";

                    //Summarize Stores
                    this.summaryDataList = [];
                    this.storesForRegion = this.stores.get(true);
                    for (var i = 0; i < this.storesForRegion.length; i++) {

                        //Data Summary
                        this.summaryData = {
                            name: "",
                            cars: 0,
                            fleetCars: 0,
                            cars_LastYear: 0,
                            fleetCars_LastYear: 0,
                            sales: 0,
                            fleetSales: 0,
                            sales_LastYear: 0,
                            fleetSales_LastYear: 0,
                            sA_Calc: 0,
                            tA_Calc: 0,
                            sA_Calc_LastYear: 0,
                            tA_Calc_LastYear: 0
                        };

                        var store = this.storesForRegion[i];

                        this.summaryData.name = store.store;
                        this.summaryData.cars = store.cars;
                        this.summaryData.fleetCars = store.fleetCars;
                        this.summaryData.cars_LastYear = store.cars_LastYear;
                        this.summaryData.fleetCars_LastYear = store.fleetCars_LastYear;

                        this.summaryData.sales = Math.round(store.sales);
                        this.summaryData.fleetSales = Math.round(store.fleetSales);
                        this.summaryData.sales_LastYear = Math.round(store.sales_LastYear);
                        this.summaryData.fleetSales_LastYear = Math.round(store.fleetSale_LastYear);

                        this.summaryData.sA_Calc = Math.round(store.sA_Calc);
                        this.summaryData.tA_Calc = Math.round(store.tA_Calc);
                        this.summaryData.sA_Calc_LastYear = Math.round(store.sA_Calc);
                        this.summaryData.tA_Calc_LastYear = Math.round(store.tA_Calc_LastYear);

                        //Add Summary to List of Terrotory Summaries
                        this.summaryDataList.push(this.summaryData);

                        //Set to Mobile Dashboard List
                        this.dashBoardData = this.summaryDataList;
                    }
                } else if (this.dashBoardLevel == "Store") {
                    //Get Stores for Region
                    console.log("Getting data for store " + this.drillDownId + "...");

                    this.category = 2;
                    this.storeObjectID = this.drillDownId;
                    this.getMessages();
                }
            }
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

        }
    }
});

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

