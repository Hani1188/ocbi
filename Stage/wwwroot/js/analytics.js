
// Write your JavaScript code.
//jQuery
$(function () {
    //Analytics Timer - runs every 5min to get updated analytics data
    setInterval(function () {
        appAnalytics.analyticsLastUpdated = moment().format('MMM Do YYYY, h:mm:ss a');
        appAnalytics.isInitial = false;
        appAnalytics.getAnalyticsOverview();
    }, 300000);

    document.getElementById('historyGridControlSelect').onchange = function () {
        var columnType = document.getElementById('historyGridControlSelect').value;
        if (columnType == "Sales") {
            appAnalytics.historyGrid.showHider.show('% of Sales', 'headerText');
            appAnalytics.historyGrid.showHider.show('Sales($)', 'headerText');
            appAnalytics.historyGrid.showHider.show("Last Year's Sales($)", 'headerText');

            appAnalytics.historyGrid.showHider.hide('% of Cars', 'headerText');
            appAnalytics.historyGrid.showHider.hide('Cars($)', 'headerText');
            appAnalytics.historyGrid.showHider.hide("Last Year's Cars($)", 'headerText');
        }
        else {
            appAnalytics.historyGrid.showHider.hide('% of Sales', 'headerText');
            appAnalytics.historyGrid.showHider.hide('Sales($)', 'headerText');
            appAnalytics.historyGrid.showHider.hide("Last Year's Sales($)", 'headerText');

            appAnalytics.historyGrid.showHider.show('% of Cars', 'headerText');
            appAnalytics.historyGrid.showHider.show('Cars($)', 'headerText');
            appAnalytics.historyGrid.showHider.show("Last Year's Cars($)", 'headerText');
        }
    };
});

//Globals
function buildAnalytics() {
    // initialize syncfusion control
    ej.base.enableRipple(true);

    //Build Controls
    if (appAnalytics.isInitial) {
        appAnalytics.historyGrid = new ej.grids.Grid({
            dataSource: appAnalytics.storeDataHistory,
            gridLines: 'Both',
            allowPaging: true,
            pageSettings: { pageCount: 2 },
            gridLines: 'Both',
            columns: [
                { field: 'store', headerText: 'Store', type: 'number', width: 100 },
                { field: 'sales_Calc', headerText: '% of Sales', type: 'number', width: 100 },
                { field: 'sales', headerText: 'Sales($)', type: 'number', width: 100 },
                { field: 'sales_LastYear', headerText: "Last Year's Sales($)", type: 'number', width: 100 },
                { field: 'cS_Calc', headerText: '% of Cars', type: 'number', width: 100 },
                { field: 'cars', headerText: 'Cars($)', type: 'number', width: 100 },
                { field: 'cars_LastYear', headerText: "Last Year's Cars($)", type: 'number', width: 100 },
            ],
        });
        appAnalytics.historyGrid.appendTo('#historyGrid');
    } else {
        appAnalytics.historyGrid.refresh(); // refresh the Grid.
    }

    // By default hide Cars
    appAnalytics.historyGrid.showHider.hide('% of Cars', 'headerText');
    appAnalytics.historyGrid.showHider.hide('Cars($)', 'headerText');
    appAnalytics.historyGrid.showHider.hide("Last Year's Cars($)", 'headerText');

    //Syncfusion
    //Globals
    var xWidth = 3;

    var chartOV = new ej.charts.Chart({
        //Initializing Primary X Axis
        primaryXAxis: {
            majorGridLines: { width: 0 }, minorGridLines: { width: 0 },
            majorTickLines: { width: 0 }, minorTickLines: { width: 0 },
            interval: 1, lineStyle: { width: 0 }, valueType: 'Category',
            labelStyle: {
                fontFamily: 'muli'
            }
        },
        //Initializing Primary X Axis
        primaryYAxis: {
            labelFormat: '{value}K',
            minimum: 0,
            lineStyle: { width: 0 },
            majorTickLines: { width: 0 },
            minorTickLines: { width: 0 },
            labelStyle: {
                fontFamily: 'muli'
            }
        },
        chartArea: {
            border: {
                width: 0
            }
        },
        //Initializing Chart Series
        series: [
            {
                type: 'Line',
                dataSource: appAnalytics.analyticsOverview,
                xName: 'dayCount', width: xWidth, fill: '#601ccf', marker: {
                    visible: true,
                    width: 10,
                    height: 10
                },
                yName: 'sales', name: 'Sales',
            },
            {
                type: 'Line',
                dataSource: appAnalytics.analyticsOverview,
                xName: 'dayCount', width: xWidth, fill: '#e65e05', marker: {
                    visible: true,
                    width: 10,
                    height: 10
                },
                yName: 'cars', name: 'Cars',
            },
            {
                type: 'Line',
                dataSource: appAnalytics.analyticsOverview,
                xName: 'dayCount', width: xWidth, fill: '#1ad5db', marker: {
                    visible: true,
                    width: 10,
                    height: 10
                },
                yName: 'fleetCars', name: 'Fleet',
            },
            {
                type: 'Line',
                dataSource: appAnalytics.analyticsOverview,
                xName: 'dayCount', width: xWidth, fill: '#47e22f', marker: {
                    visible: true,
                    width: 10,
                    height: 10
                },
                yName: 'serviceAverage', name: 'Service Average',
            },
            {
                type: 'Line',
                dataSource: appAnalytics.analyticsOverview,
                xName: 'dayCount', width: xWidth, fill: '#6b219d', marker: {
                    visible: true,
                    width: 10,
                    height: 10
                },
                yName: 'ticketAverage', name: 'Ticket Average',
            }
        ],
        //Initializing Chart Title
        title: '',
        //Initializing Tooltip
        tooltip: {
            enable: true
        },
        width: '100%',
        height: '90%'
    });
    chartOV.appendTo('#ovLineChart');

    var chartCM = new ej.charts.Chart({
        //Initializing Primary X Axis
        primaryXAxis: {
            majorGridLines: { width: 0 }, minorGridLines: { width: 0 },
            majorTickLines: { width: 0 }, minorTickLines: { width: 0 },
            interval: 1, lineStyle: { width: 0 }, valueType: 'DateTime', labelFormat: 'dd MMM',
            labelStyle: {
                fontFamily: 'muli'
            }
        },
        //Initializing Primary X Axis
        primaryYAxis: {
            labelFormat: '${value}',
            minimum: 0,
            //maximum: 150,
            interval: 500,
            lineStyle: { width: 0 },
            majorTickLines: { width: 0 },
            minorTickLines: { width: 0 },
            visible: true,
            labelStyle: {
                fontFamily: 'muli'
            }
        },
        legendSettings: {
            visible: true,
            position: 'Top',
            //Legend alignment as near
            alignment: 'Near'
        },
        chartArea: {
            border: {
                width: 0
            }
        },
        //Initializing Chart Series
        series: [
            {
                type: 'SplineArea',
                dataSource: appAnalytics.comparitiveSalesData,
                xName: 'date', width: 2, marker: {
                    visible: true,
                    width: 10,
                    height: 10
                },
                yName: 'total',
                border: { color: 'transparent' },
                opacity: 0.5,
                fill: '#fcca46'
            },
            {
                type: 'Spline',
                dataSource: appAnalytics.comparitiveSalesData,
                xName: 'date', width: xWidth, marker: {
                    visible: true,
                    width: 10,
                    height: 10
                },
                yName: 'previousTotal',
                border: { color: 'transparent' },
                opacity: 0.5
            },
        ],
        //Initializing Chart Title
        title: '',
        //Initializing Tooltip
        tooltip: {
            enable: true
        },
        width: '100%',
        height: '90%'
    });
    chartCM.appendTo('#cmLineChart');

    this.isLoading = false;
}

//Vue
var appAnalytics = new Vue({
    el: '#appAnalytics',
    components: {
        //Locally Register Components here
    },
    data: {
        isLoading: false,
        isInitial: true,
        category: 1,//default
        storeObjectID: 1,//default
        companyData: [],
        storeData: [],
        salesFleetAmount: 0,
        historyGrid: [],
        storeDataHistory: [],
        analyticsLastUpdated: moment().format('MMM Do YYYY, h:mm:ss a'),
        analyticsOverviewData: []
    },
    computed: {
        // a computed getter
    },
    // define methods under the `methods` object
    methods: {
        getAllNumbers() {
            var route = 'Home/GetAllNumbers';
            axios.post(route).then((response) => {
                this.companyData = response.data.data;
                this.storeData = this.companyData.filter(cd => cd.store > 100 && cd.region == this.storeObjectID);
                //this.salesFleetAmount = this.storeData.sales_Calc_LastYear;

                //Load Analytics Controls
                if (this.isInitial) {
                    buildAnalytics();
                    this.isInitial = false;
                } else {
                    //Reload Data in controls

                    this.isInitial = false;
                }
            });
        },
        getAnalyticsOverview() {
            var data = {
                Category: appSideNav.category,// 0 = Company, 1 = Region, 2 = Store, 3 = Territory
                Timeline: 1,// 0 = Current Date, 1 = One Week(past 7 days), 2 = One Month(past 30 days), 3 = One Year (past 365 days)
                ObjectID: appSideNav.storeObjectID,// Store/ Region/Territory Id
            }
            var route = 'Analytics/GetAnalyticsOverview';
            axios.post(route, data).then((response) => {
                this.analyticsOverview = response.data.data.analytics;
                this.companyData = response.data.data.numbersList;  
                this.storeList = response.data.data.storeList;
                this.storeDataHistory = this.companyData.filter(cd => cd.store > 100 && cd.region == this.storeObjectID);
             
                //Analytics Data Objects
                this.regionData = this.companyData.filter(cd => cd.store > 100 && cd.region == 1); //data for region1
                this.storeData = this.companyData.filter(cd => cd.store == appSideNav.storeObjectID)[0];

                //Overview Summary Totals
                this.analyticsOverviewData = [
                    {
                        id: 1,
                        title: "Sales",
                        value: 0,
                        trend: 0,
                        category: "sales",
                        previousTotal: 1200.00
                    },
                    {
                        id: 2,
                        title: "Cars",
                        value: 0,
                        trend: 0,
                        category: "cars",
                        previousTotal: 340
                    },
                    {
                        id: 3,
                        title: "Fleet",
                        value: 0,
                        trend: 0,
                        category: "fleet",
                        previousTotal: 12
                    },
                    {
                        id: 4,
                        title: "Service Average",
                        value: 0,
                        trend: 0,
                        category: "sa",
                        previousTotal: 16.98
                    },
                    {
                        id: 5,
                        title: "Ticket Average",
                        value: 0,
                        trend: 0,
                        category: "ta",
                        previousTotal: 823.98
                    }
                ]
           
                for (var i = 0; i < this.analyticsOverview.length; i++) {
                    this.analyticsOverviewData[0].value = this.analyticsOverviewData[0].value + this.analyticsOverview[i].sales;
                    this.analyticsOverviewData[1].value = this.analyticsOverviewData[1].value + this.analyticsOverview[i].cars;
                    this.analyticsOverviewData[2].value = this.analyticsOverviewData[2].value + this.analyticsOverview[i].fleetCars;
                    this.analyticsOverviewData[3].value = this.analyticsOverviewData[3].value + this.analyticsOverview[i].serviceAverage;
                    this.analyticsOverviewData[4].value = this.analyticsOverviewData[4].value + this.analyticsOverview[i].ticketAverage;
                }

                //Trend Calc
                for (var i = 0; i < this.analyticsOverviewData.length; i++) {
                    //(((endValue - startValue) / startValue) * 100) StartValue = current 10 day total, End Value = last 10 day total
                    this.analyticsOverviewData[i].trend = Math.floor(((this.analyticsOverviewData[i].value - this.analyticsOverviewData[i].previousTotal) / this.analyticsOverviewData[i].previousTotal) * 100);
                }
                //End Overview Summary Totals

                //Comparitive Analytics
                this.comparitiveSalesData = [
                    {
                        id: 1,
                        title: "Sales",
                        category: "sales",
                        total: 1390.00,
                        previousTotal: 1200.00,
                        date: moment().subtract(6, 'days').format()
                    },
                    {
                        id: 2,
                        title: "Sales",
                        category: "sales",
                        total: 1160.00,
                        previousTotal: 580.00,
                        date: moment().subtract(5, 'days').format()
                    },
                    {
                        id: 3,
                        title: "Sales",
                        category: "sales",
                        total: 1790.00,
                        previousTotal: 1900.00,
                        date: moment().subtract(4, 'days').format()
                    },
                    {
                        id: 4,
                        title: "Sales",
                        category: "sales",
                        total: 1650.00,
                        previousTotal: 1780.00,
                        date: moment().subtract(3, 'days').format()
                    },
                    {
                        id: 5,
                        title: "Sales",
                        category: "sales",
                        total: 1420.00,
                        previousTotal: 1270.00,
                        date: moment().subtract(2, 'days').format()
                    },
                    {
                        id: 6,
                        title: "Sales",
                        category: "sales",
                        total: 1320.00,
                        previousTotal: 800.00,
                        date: moment().subtract(1, 'days').format()
                    },
                    {
                        id: 7,
                        title: "Sales",
                        category: "sales",
                        total: 1090.00,
                        previousTotal: 1400.00,
                        date: moment().format()
                    },
                ]
                //End Comparitive Analytics

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

                    buildAnalytics();

                    this.isInitial = false;
                } else {
                    //Reload Data in controls
                    console.log("Refreshing Analytics...");
                    buildAnalytics();
                }

                this.isLoading = false;
            });
        },
        getStoreAnalytics() {
            //ProtoType use only
            this.storeData = this.companyData.filter(cd => cd.store == appSideNav.storeObjectID)[0];
        }
    },
    created: function () {
        //this.isLoading = true;
        this.getAnalyticsOverview();
    },
    filters: {
        toString: function (value) {
            if (!value) return ''
            return value.toString();

        },
        isCurrency: function (value) {
            //Convert to String
            var strValue = value.toString();

            if (strValue.indexOf(".") == -1) {
                value = strValue;
            } else {
                value = "$" + value.toFixed(2);
            }

            return value;
        }
    }
});


