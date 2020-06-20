// Write your JavaScript code.
//jQuery
$(function () {
    //Dashboard Timer - runs every 5min to get updated dashboard data
    setInterval(function () {
        appDashboard.dashBoardLastUpdated = moment().format('MMM Do YYYY, h:mm:ss a');
        appDashboard.isInitial = false;
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
        selectedLabel: '',
        showSummaryDetail: true,
        dashboardMessages: [],
        thresholdData: [],
        thresholdValue: {},
        //storeObjectData: {},
        category: 2,//default  0 = Company, 1 = Region, 2 = Store, 3 = Territory
        storeObjectID: 108,//default
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
        dashBoardLastUpdated: moment().format('MMM Do YYYY, h:mm:ss a'),
        dashboardAllMessages: [],
        page: 1,
        numResults: 5
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

                    this.carsList = response.data.data.carsList;
                    this.saList = response.data.data.saList;
                    this.salesList = response.data.data.salesList;

                    this.storeList = response.data.data.storeList;
                    this.companyList = response.data.data.storeList;

                    //Dashboard Data Objects
                    this.regionData = this.companyData.filter(cd => cd.store > 100 && cd.region == 1); //data for region1
                    this.storeData = this.companyData.filter(cd => cd.store == appSideNav.storeObjectID)[0];
                    this.services = this.allStoreServices.filter(ss => ss.storeId == appSideNav.storeObjectID);

                    //Build Threshld Collection
                    appDashboard.thresholdValue = appDashboard.thresholdData.filter(t => t.tbl_threshold_store == appDashboard.storeObjectID)[0];

                    //Mobile ProtoType Start - using 1200 == XL size limit to switch from desktop to mobile
                    if (screen.width < 1200) {
                        this.isMobile = true;
                        this.category = 1;
                        this.storeObjectID = 0;
                    }

                    //Desktop or Mobile
                    if (this.isMobile) {
                        if (this.isInitial == true) {
                            //Mobile select lists
                            this.territorySelectList = this.companyList.filter(cd => cd.store_list_store == 1000000);
                            this.regionSelectList = this.companyList.filter(cd => cd.store_list_store <= 100);
                            this.storeSelectList = this.companyList.filter(cd => cd.store_list_store > 100 && cd.store_list_region == 1);

                            this.selectedTerritory = 1000000;
                            this.selectedRegion = 1;
                            this.selectedStore = 101;
                            //End Mobile Select List

                            this.mobileGrouping();
                        } else {
                            //Load Messages and start pagination
                            //Maintain All Messages
                            this.dashboardAllMessages = response.data.data.comments;

                            //Paginate Messages initial page and size
                            this.pagedResults = Paginator(response.data.data.comments, this.page, this.numResults);
                            this.dashboardMessages = this.pagedResults.data;
                            //End Message Pagination
                        }
                    } else {
                        //Desktop
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

                            //Update Dashboard Label
                            this.selectedLabel = "Store " + appSideNav.storeObjectID;

                            //Testing Browser Width
                            this.browserWidth = window.innerWidth;

                            //Load Messages and start pagination
                            //Maintain All Messages
                            this.dashboardAllMessages = response.data.data.comments;

                            //Paginate Messages initial page and size
                            this.pagedResults = Paginator(response.data.data.comments, this.page, this.numResults);
                            this.dashboardMessages = this.pagedResults.data;
                            //End Message Pagination

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

                                //Labor - range is 140(0%) to 220(100%)
                                angle = (140 + appDashboard.storeData.laborDollars_Calc);
                                angle = angle.toString();
                                angle = "-" + angle;

                                console.log("Labor Angle: " + angle)
                                $('#needle-labor').css('transform', 'rotate(' + angle + 'deg)');

                                //Sales - range is 140(0%) to 220(200%)
                                console.log("Sales Percent: " + appDashboard.storeData.sales_LastYear_Percent_Calc);
                                angle = (((appDashboard.storeData.sales_LastYear_Percent_Calc / 100) * 40) + 140);
                                angle = angle.toString();
                                angle = "-" + angle;

                                console.log("Sales Angle: " + angle)
                                $('#needle-sales').css('transform', 'rotate(' + angle + 'deg)');

                                //SA - range is 140(0%) to 220(200%)
                                console.log("SA Percent: " + appDashboard.storeData.sA_LastYear_Percent_Calc);
                                angle = (((appDashboard.storeData.sA_LastYear_Percent_Calc / 100) * 40) + 140);
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
            //appDashboard.storeObjectData = appDashboard.companyData.filter(t => t.store == appDashboard.storeObjectID)[0];

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

                //Labor - range is 140(0%) to 220(100%)
                angle = (140 + appDashboard.storeData.laborDollars_Calc);
                angle = angle.toString();
                angle = "-" + angle;

                console.log("Labor Angle: " + angle)
                $('#needle-labor').css('transform', 'rotate(' + angle + 'deg)');

                //Sales - range is 140(0%) to 220(200%)
                console.log("Sales Percent: " + appDashboard.storeData.sales_LastYear_Percent_Calc);
                angle = (((appDashboard.storeData.sales_LastYear_Percent_Calc / 100) * 40) + 140);
                angle = angle.toString();
                angle = "-" + angle;

                console.log("Sales Angle: " + angle)
                $('#needle-sales').css('transform', 'rotate(' + angle + 'deg)');

                //SA - range is 140(0%) to 220(200%)
                console.log("SA Percent: " + appDashboard.storeData.sA_LastYear_Percent_Calc);
                angle = (((appDashboard.storeData.sA_LastYear_Percent_Calc / 100) * 40) + 140);
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
        loadMoreMessages: function() {
            //Paginate Messages
            this.page = this.page + 1;
            this.numResults = this.numResults + 5;

            this.pagedResults = Paginator(this.dashboardAllMessages, this.page, this.numResults);
            this.dashboardMessages = this.pagedResults.data;
            //End Pagination
        },
        mobileGrouping: function () {
            //Data Grouping - Start
            this.territories = this.companyData.filter(cd => cd.territory == 1000000 && cd.store < 1000000 && cd.store > 100);
            this.currentTerritory = this.companyData.filter(cd => cd.store == 1000000)[0];

            //Territory Data Summary - using as default for mobile size Prototype
            this.territoryDataList = [];
            this.territory = this.territories;

            //Territory Name - use i instead of Territory Name eg.1000000
            this.territoryData = {
                name: 0,
                cars: 0,
                fleetCars: 0,
                cars_LastYear: 0,
                fleetCars_LastYear: 0,
                sales: 0,
                fleetSales: 0,
                sales_LastYear: 0,
                sales_LastYear_Percent_Calc: 0,
                fleetSales_LastYear: 0,
                sA_Calc: 0,
                sA_LastYear_Percent_Calc: 0,
                tA_Calc: 0,
                sA_Calc_LastYear: 0,
                tA_Calc_LastYear: 0,
                tA_Calc_Threshold: 0
            };

            //ToDo - Summaries for SA and some others need to be reviewed, some are not simple cumulative results.
            for (var j = 0; j < this.territory.length; j++) {
                //console.log(this.territory[j]);
                this.territoryData.name = this.territory[j].territory / 1000000;
                this.territoryData.cars = this.territoryData.cars + this.territory[j].cars;
                this.territoryData.fleetCars = this.territoryData.fleetCars + this.territory[j].fleetCars;
                this.territoryData.cars_LastYear = this.territoryData.cars_LastYear + this.territory[j].cars_LastYear;
                this.territoryData.fleetCars_LastYear = this.territoryData.fleetCars_LastYear + this.territory[j].fleetCars_LastYear;

                this.territoryData.sales = this.territoryData.sales + this.territory[j].sales;
                this.territoryData.fleetSales = this.territoryData.fleetSales + this.territory[j].fleetSales;
                this.territoryData.sales_LastYear = this.territoryData.sales_LastYear + this.territory[j].sales_LastYear;
                this.territoryData.sales_LastYear_Percent_Calc = this.territoryData.sales_LastYear_Percent_Calc + this.territory[j].sales_LastYear_Percent_Calc;
                this.territoryData.fleetSales_LastYear = this.territoryData.fleetSales_LastYear + this.territory[j].fleetSale_LastYear;

                //SA if Territory Level, not cumulative
                this.territoryData.sA_Calc = this.currentTerritory.sA_Calc;
                this.territoryData.sA_Calc_LastYear = this.currentTerritory.sA_Calc_LastYear;
                this.territoryData.sA_LastYear_Percent_Calc = this.currentTerritory.sA_LastYear_Percent_Calc;

                this.territoryData.tA_Calc = this.territoryData.tA_Calc + this.territory[j].tA_Calc;
                this.territoryData.tA_Calc_LastYear = this.territoryData.tA_Calc_LastYear + this.territory[j].tA_Calc_LastYear;
                this.territoryData.tA_Calc_Threshold = this.territory[j].tA_Calc_Threshold; 
            }

            //Add Summary to List of Terrotory Summaries
            this.territoryDataList.push(this.territoryData);

            //Mobile Dashboard initial load
            this.dashBoardData = this.territoryDataList;
            this.dashBoardLevel = "Territory";
            //Data Grouping End

            //Territory is default for now
            appSideNav.storeObjectID = 1000000;
            appSideNav.category = 3;
            appDashboard.isInitial = false;
            appDashboard.selectedLabel = "Territory " + 1;
            appDashboard.getDashboardNumbers();
        },
        drillDown: function () {
            this.summaryDataList = [];
            this.drillDownId = parseInt(event.target.text);

            if (this.dashBoardLevel == "Territory") {
                //Territory was clicked, get regions
                //Get Regions for Territory
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
                        sales_LastYear_Percent_Calc: 0,
                        fleetSales_LastYear: 0,
                        sA_Calc: 0,
                        sA_LastYear_Percent_Calc: 0,
                        tA_Calc: 0,
                        sA_Calc_LastYear: 0,
                        tA_Calc_LastYear: 0,
                        tA_Calc_Threshold: 0
                    };

                    if (this.summaryItem != null) {
                        this.summaryItem = this.summaryItem.filter(function (el) {
                            return el.region == i + 1
                        });

                        for (var j = 0; j < this.summaryItem.length; j++) {
                            this.summaryData.name = this.summaryItem[j].region;
                            this.summaryData.cars = this.summaryItem[j].cars;
                            this.summaryData.fleetCars = this.summaryItem[j].fleetCars;
                            this.summaryData.cars_LastYear = this.summaryItem[j].cars_LastYear;
                            this.summaryData.fleetCars_LastYear = this.summaryItem[j].fleetCars_LastYear;

                            this.summaryData.sales = this.summaryItem[j].sales;
                            this.summaryData.fleetSales = this.summaryItem[j].fleetSales;
                            this.summaryData.sales_LastYear = this.summaryItem[j].sales_LastYear;
                            this.summaryData.sales_LastYear_Percent_Calc = this.summaryItem[j].sales_LastYear_Percent_Calc;
                            this.summaryData.fleetSales_LastYear = this.summaryItem[j].fleetSale_LastYear;

                            //SA is at region Level, not cumulative
                            this.summaryData.sA_Calc = this.summaryItem[j].sA_Calc;
                            this.summaryData.sA_LastYear_Percent_Calc = this.summaryItem[j].sA_LastYear_Percent_Calc;
                            this.summaryData.sA_Calc_LastYear = this.summaryItem[j].sA_Calc;

                            this.summaryData.tA_Calc = this.summaryData.tA_Calc + this.summaryItem[j].tA_Calc;
                            this.summaryData.tA_Calc_LastYear = this.summaryData.tA_Calc_LastYear + this.summaryItem[j].tA_Calc_LastYear;
                            this.summaryData.tA_Calc_Threshold = this.summaryItem[j].tA_Calc_Threshold; 
                        }

                        //Add Summary to List of Terrotory Summaries
                        this.summaryDataList.push(this.summaryData);
                    }
                }

                //Set to Mobile Dashboard List
                this.dashBoardData = this.summaryDataList;

                //Get Dashboard numbers
                appSideNav.storeObjectID = this.dashBoardData[0].name;//Default
                appSideNav.category = 1;
                appDashboard.isInitial = false;
                appDashboard.selectedLabel = "Region " + this.dashBoardData[0].name;
                appDashboard.getDashboardNumbers();

            } else if (this.dashBoardLevel == "Region") {
                //Region was clicked, get stores for region
                this.stores = groupBy(this.companyData, item => item.store && item.region == this.drillDownId);

                //Set Row Header Text
                this.dashBoardLevel = "Store";

                //Set Select List
                this.selectedRegion = this.drillDownId;

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
                        sales_LastYear_Percent_Calc: 0,
                        fleetSales_LastYear: 0,
                        sA_Calc: 0,
                        sA_LastYear_Percent_Calc: 0,
                        tA_Calc: 0,
                        sA_Calc_LastYear: 0,
                        tA_Calc_LastYear: 0,
                        tA_Calc_Threshold: 0
                    };

                    var store = this.storesForRegion[i];

                    this.summaryData.name = store.store;
                    this.summaryData.cars = store.cars;
                    this.summaryData.fleetCars = store.fleetCars;
                    this.summaryData.cars_LastYear = store.cars_LastYear;
                    this.summaryData.fleetCars_LastYear = store.fleetCars_LastYear;

                    this.summaryData.sales = store.sales;
                    this.summaryData.fleetSales = store.fleetSales;
                    this.summaryData.sales_LastYear = store.sales_LastYear;
                    this.summaryData.sales_LastYear_Percent_Calc =store.sales_LastYear_Percent_Calc;
                    this.summaryData.fleetSales_LastYear = store.fleetSale_LastYear;

                    this.summaryData.sA_Calc = store.sA_Calc;
                    this.summaryData.sA_LastYear_Percent_Calc = store.sA_LastYear_Percent_Calc;
                    this.summaryData.tA_Calc = store.tA_Calc;
                    this.summaryData.sA_Calc_LastYear = store.sA_Calc;
                    this.summaryData.tA_Calc_LastYear = store.tA_Calc_LastYear;
                    this.summaryData.tA_Calc_Threshold = store.tA_Calc_Threshold;

                    //Add Summary to List of Terrotory Summaries
                    this.summaryDataList.push(this.summaryData);
                }

                //Set to Mobile Dashboard List
                this.dashBoardData = this.summaryDataList;

                //Get New list of stores
                this.storeSelectList = this.companyList.filter(cd => cd.store_list_store > 100 && cd.store_list_region == this.selectedRegion);
                this.selectedStore = this.dashBoardData[0].name;//Default Selected

                //Load Defult Store for selected region
                appSideNav.storeObjectID = this.dashBoardData[0].name;//Default
                appSideNav.category = 2;
                appDashboard.isInitial = false;
                appDashboard.selectedLabel = "Store " + this.dashBoardData[0].name;
                appDashboard.getDashboardNumbers();

            } else if (this.dashBoardLevel == "Store") {
                //Store was clicked, get details to display in detail view
                this.category = 2;
                this.storeObjectID = this.drillDownId;
                this.selectedStore = this.drillDownId;

                //Load Defult Store for selected region
                appSideNav.storeObjectID = this.storeObjectID;
                appSideNav.category = 2;
                appDashboard.isInitial = false;
                appDashboard.selectedLabel = "Store " + this.storeObjectID;
                appDashboard.getDashboardNumbers();

                //Flip to Detail view when store is clicked from Summary view
                this.showSummaryDetail = !this.showSummaryDetail;
                //Change active class on summaryDetail tabs
                $('#summaryDetail li:nth-child(2) a').toggleClass('active') // Select second tab
                $('#summaryDetail li:last-child a').toggleClass('active') // Select last tab

            } else if (this.dashBoardLevel == "All") {
                //Reload Territory Level
                this.mobileGrouping();
            }
        },
        drillUp: function () {
            if (this.dashBoardLevel == "Region") {
                this.dashBoardLevel = "All";
                //Reload Territory Level
                //this.mobileGrouping();
            } else if (this.dashBoardLevel == "Store") {
                this.dashBoardLevel = "Territory"
            }

            this.drillDown();
        },
        selectedStoreChanged: function () {
            this.dashBoardLevel == "Store"

            appSideNav.storeObjectID = this.selectedStore;
            appSideNav.category = 2;
            appDashboard.isInitial = false;
            appDashboard.selectedLabel = "Store " + this.selectedStore;
            appDashboard.getDashboardNumbers();
        },
        selectedRegionChanged: function () {
            this.dashBoardLevel == "Region"

            //Get New list of stores
            this.storeSelectList = this.companyList.filter(cd => cd.store_list_store > 100 && cd.store_list_region == this.selectedRegion);
            this.selectedStore = this.storeSelectList[0].store_list_store;

            appSideNav.storeObjectID = this.selectedRegion;
            appSideNav.category = 1;
            appDashboard.isInitial = false;
            appDashboard.selectedLabel = "Region " + this.selectedRegion;
            appDashboard.getDashboardNumbers();
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
            if (!value) return ''

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

