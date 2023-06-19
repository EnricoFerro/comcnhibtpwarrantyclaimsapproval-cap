sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "com/cnhi/btp/warrantyclaimsrequestor/model/models",
    "./controller/ErrorHandler"
],
    function (UIComponent, Device, models, ErrorHandler) {
        "use strict";

        return UIComponent.extend("com.cnhi.btp.warrantyclaimsrequestor.Component", {
            metadata: {
                manifest: "json"
            },

            /**
             * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
             * @public
             * @override
             */
            init: function () {
                var me = this;
                me._oErrorHandler = new ErrorHandler(this);

                // set the device model
                this.setModel(models.createDeviceModel(), "device");

                //get logged in user info
                this._getLoggedInUserInfo();

                // call the base component's init function
                UIComponent.prototype.init.apply(this, arguments);

                // create the device model
                this._deviceModel = models.createDeviceModel();
                this.setModel(this._deviceModel, "device");

                // enable routing
                this.getRouter().initialize();
            },

            _getLoggedInUserInfo: function () {
                var oLocalModel = this.getModel('LocalModel');
                var sEmailId, sName;

                try {
                    var oStartUpParams = this.getComponentData().startupParameters;
                    oLocalModel.setProperty("/IsRequestorLoggedIn", oStartUpParams.Approver ? false : true);
                } catch (error) {
                    oLocalModel.setProperty("/IsRequestorLoggedIn", true);
                }

                try {
                    sEmailId = sap.ushell.Container.getService("UserInfo").getEmail();
                    sName = sap.ushell.Container.getService("UserInfo").getFullName();
                    if (!sEmailId) {
                        // sEmailId = "testuser@mindsetconsulting.com";
                        //sName = "Test User";
                        sEmailId = "harikrishnaanatha@mindsetconsulting.com";
                        sName = "Harikrishna Anantha";
                        sEmailId = "abhilashgampa@mindsetconsulting.com";
                        sName = "Abhilash Gampa";
                        //sEmailId = "matthewwhigham@mindsetconsulting.com";
                        //sName = "Matthew Whigham";
                        //sEmailId = "jonathanbragg@mindsetconsulting.com";
                        //sName = "Jonathan Bragg";
                    }
                } catch (error) {
                    sEmailId = "testuser@mindsetconsulting.com";
                    sName = "Test User";
                }
                oLocalModel.setProperty("/LoggedInUserID", sEmailId);
                oLocalModel.setProperty("/LoggedInUserName", sName);
                /*
                try {
                    sap.ushell.Container.getServiceAsync("UserInfo").then(containerService => {
                        sEmailId = containerService.getEmail();
                        sName = containerService.getFullName();
                        oLocalModel.setProperty("/LoggedInUserID", sEmailId);
                        oLocalModel.setProperty("/LoggedInUserName", sName);
                    }).catch(error => {
                        oLocalModel.setProperty("/LoggedInUserID", undefined);
                        oLocalModel.setProperty("/LoggedInUserName", undefined);
                    })
                } catch (error) {
                    //sEmailId = "testuser@mindsetconsulting.com";
                    //sName = "Test User";
                }
                oLocalModel.setProperty("/LoggedInUserID", sEmailId);
                oLocalModel.setProperty("/LoggedInUserName", sName);
                */
            },

            getDeviceModel: function getDeviceModel() {
                return this._deviceModel;
            }
        });
    }
);