
// Write your JavaScript code.
//jQuery
$(function () {
    //Hide SideNav
    $('#appSideNav').hide();
    //Size of MainWrapper
    $('#mainWrapper').removeClass("col-xl-10");
    $('#mainWrapper').addClass("col-12");
});

//Globals

//Vue
var appSettings = new Vue({
    el: '#appSettings',
    components: {
        //Locally Register Components here
    },
    data: {
        isLoading: false,
        isInitial: true,
        category: 2,//default
        storeObjectID: 101,//default
        storeData: [],
        regionData: [],
        companyData: [],
        salesFleetAmount: 0,
        historyGrid: [],
        isAddingNewStoreData: false,
        isEditingStoreData: false,
        statesList: [],
        storeList: [],
        territories: [],
        regions: [],
        stores: [],
        managers: [],
        regionalManagers: [],
        addNewData: {
            addNewStoreObjectId: 1,  // 1=Store, 2=Region, 3=Territory
            parentID: 0,
            objectID: 0,
            address: "",
            address2: "",
            city: "",
            state: "",
            zip: "",
            manager: "",
        },
        editData: {
            editStoreObjectId: 1,  // 1=Store, 2=Region, 3=Territory
            parentID: 0,
            objectID: 0,
            address: "",
            address2: "",
            city: "",
            state: "",
            zip: "",
            manager: "",
        },
        employeeList: [],
    },
    computed: {
        // a computed getter
    },
    // define methods under the `methods` object
    methods: {
        getSettingsData() {
            var route = 'Settings/GetSettingsData';
            axios.post(route).then((response) => {
                this.storeData = response.data.data;
                this.isLoading = false;
            });
        },
        getAllEmployees() {
            var route = 'Settings/GetAllEmployees';
            axios.post(route).then((response) => {
                this.employeeList = response.data.data;
                this.storeManagers = this.employeeList.filter(e => e.position.includes('Store Manager'));
                this.regionalManagers = this.employeeList.filter(e => e.position.includes('Regional Manager'));
                this.isLoading = false;
            });
        },
        addNewStoreData() {
            //Get Data for New Store form
            var route = 'Settings/GetNewStoreFormData';
            axios.post(route).then((response) => {
                this.statesList = response.data.data.listOfStates;
                this.territories = response.data.data.territories;
                this.regions = response.data.data.regions;
                this.managers = response.data.data.managers;
                this.regionalManagers = response.data.data.regionalManagers;
                this.storeList = response.data.data.storeList;
                //this.regions = this.storeList.filter(s => s.store_list_store < 100 && s.store_list_store != 0);
                //debugger;
            });

            //Display Form
            this.isAddingNewStoreData = !this.isAddingNewStoreData;
        },
        editExistingStoreData() {
            var route = 'Settings/GetNewStoreFormData';
            axios.post(route).then((response) => {
                this.statesList = response.data.data.listOfStates;
                this.territories = response.data.data.territories;
                this.regions = response.data.data.regions;
                this.managers = response.data.data.managers;
                this.regionalManagers = response.data.data.regionalManagers;
                this.storeList = response.data.data.storeList;
                this.stores = this.storeList.filter(s => s.store_list_store > 100 && s.store_list_store < 1000000);
                //this.regions = this.storeList.filter(s => s.store_list_store < 100 && s.store_list_store != 0);
            });
            //Display Form
            this.isEditingStoreData = !this.isEditingStoreData;

        },
        saveNewStore() {
            //console.log(this.addNewData);
            var exists;
            if (this.addNewData.addNewStoreObjectId === 1) {
                exists = this.storeList.filter(s => s.store_list_store == this.addNewData.objectID)[0];
            }
            else if (this.addNewData.addNewStoreObjectId === 2) {
                exists = this.storeList.filter(s => s.store_list_region == this.addNewData.objectID)[0];
            }
            else {
                exists = this.storeList.filter(s => s.store_list_territory == this.addNewData.objectID)[0];
            }
            if (exists === undefined || exists === null) {
                var data = {
                    StoreTypeId: this.addNewData.addNewStoreObjectId,
                    ParentID: this.addNewData.parentID,
                    ObjectID: this.addNewData.objectID,
                    Address: this.addNewData.address,
                    Address2: this.addNewData.address2,
                    City: this.addNewData.city,
                    State: this.addNewData.state,
                    Zip: this.addNewData.zip,
                    Manager: this.addNewData.manager
                };
                var route = 'Settings/SaveNewStore';

                axios.post(route, data).then((response) => {
                    if (response.success) {
                        alert("Store Created Successfully - TODO");

                        //Hide Form
                        this.isAddingNewStoreData = !this.isAddingNewStoreData;

                    } else {
                        alert("There was an error creating the store.");
                    }

                });
            }
            else {
                alert("Store already exists.");
            }
        },
        saveStore() {
            var data = {
                StoreTypeId: this.editData.editStoreObjectId,
                ParentID: this.editData.parentID,
                ObjectID: this.editData.objectID,
                Address: this.editData.address,
                Address2: this.editData.address2,
                City: this.editData.city,
                State: this.editData.state,
                Zip: this.editData.zip,
                Manager: this.editData.manager,
            };
            var route = 'Settings/UpdateStore';
            axios.post(route, data).then((response) => {
                if (response.success) {
                    alert("Store Updated Successfully.");

                    //Hide Form
                    this.isAddingNewStoreData = !this.isAddingNewStoreData;

                } else {
                    alert("There was an error updating the store.");
                }
            });
        },
    },
    created: function () {
        //Commeted Out Until OCBI DB is rebuilt
        this.isLoading = true;
        this.getSettingsData();
    },
    filters: {
        toString: function (value) {
            if (!value) return ''
            return value.toString();

        }
    }
});

function loadStore() {
    var editObject = appSettings.storeList.filter(s => s.store_list_store == $("#storeEditList").val())[0];
    if (parseInt(appSettings.editData.editStoreObjectId) === 1) {
        //appSettings.editData.editStoreObjectId = 1;  // 1=Store, 2=Region, 3=Territory
        appSettings.editData.parentID = editObject.store_list_region;
        appSettings.editData.objectID = editObject.store_list_store;
    }
    else if (parseInt(appSettings.editData.editStoreObjectId) === 2) {
        appSettings.editData.parentID = editObject.store_list_territory;
        appSettings.editData.objectID = editObject.store_list_region;
    }
    else {
        appSettings.editData.parentID = editObject.store_list_territory;
        appSettings.editData.objectID = editObject.store_list_territory;
    }
    appSettings.editData.address = editObject.store_list_address;
    appSettings.editData.address2 = editObject.store_list_number_and_city;
    appSettings.editData.city = editObject.store_list_city;
    appSettings.editData.state = editObject.store_list_state;
    appSettings.editData.zip = editObject.store_list_zip;
    appSettings.editData.manager = editObject.store_manager;
};

function resetEdit() {
    appSettings.editData.parentID = "";
    appSettings.editData.objectID = "";
    appSettings.editData.address = "";
    appSettings.editData.address2 = "";
    appSettings.editData.city = "";
    appSettings.editData.state = "";
    appSettings.editData.zip = "";
    appSettings.editData.manager = "";
};



