sap.ui.define([
    "./BaseController",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/ui/core/routing/History",
    "sap/ui/model/Sorter",
    "com/cnhi/btp/warrantyclaimsrequestor/model/ReqHelper",
    "sap/ui/core/BusyIndicator",
    'sap/m/Token'
],
    function (BaseController, MessageBox, Filter, FilterOperator, MessageToast, History, Sorter, ReqHelper, BusyIndicator, Token) {
        "use strict";
        var sServiceUrl;
        return BaseController.extend("com.cnhi.btp.warrantyclaimsrequestor.controller.Main", {
            
            /* =========================================================== */
            /* lifecycle methods                                           */
            /* =========================================================== */

            /**
             * Called when this controller is instantiated.
             * @public
             */
            onInit: function () {
                sServiceUrl = this.getOwnerComponent().getModel("ClaimApprovalCAP").sServiceUrl;
                this.getRouter().getRoute("main").attachPatternMatched(this._onObjectMatched, this);
            },
            _onObjectMatched: function(oEvent){
                var oLocalModel = this.getModel('LocalModel');
                var bIsRequestor = oLocalModel.getProperty("/IsRequestorLoggedIn");
                
                if(bIsRequestor){
                    var dToday = new Date();
                    if(!oLocalModel.getProperty("/FromDate")){
                        oLocalModel.setProperty("/FromDate", new Date(dToday.setDate(dToday.getDate() - 7)));
                        oLocalModel.setProperty("/ToDate", new Date());
                    }
                    if (!oLocalModel.setProperty("/MultiClmno")){
                        oLocalModel.setProperty("/MultiClmno", []);
    
                    }
                    var oMultiInput = this.getView().byId("Main_MI_Clmno");
                    var fnValidator = function(args){
                        var text = args.text;

                        return new Token({key: text, text: text});
                    };

                    oMultiInput.addValidator(fnValidator);
                    //Call if logged in user is the requestor
                    this._getWarrantyListPromise("page");


                } else {
                    //Call if logged in user is not the requestor
                    this._getClaimsFromCAPMPromise("page");
                }
            },

            /* =========================================================== */
            /* event handlers                                              */
            /* =========================================================== */
            onRefresh: function(oEvent){
                var clmno = undefined;
                if (oEvent.getSource().getMetadata().getElementName() === "sap.ui.comp.smartmultiinput.SmartMultiInput" || 
                    oEvent.getSource().getMetadata().getElementName() === "sap.m.MultiInput") {
                    var tokens = oEvent.getSource().getTokens().map(token => token.getText());
                    if (oEvent.getParameter("type") === "removed") {
                        var removedTokens = oEvent.getParameter("removedTokens").map(token => token.getText());
                        for (const idx in removedTokens) {
                            var index = tokens.indexOf(removedTokens[idx]);
                            if (index !== -1) {
                                tokens.splice(index, 1);
                            }
                        }
                    }
                    if ( tokens.length === 0) {
                        this.getView().byId("Main_DRS").setEditable(true);
                        this.getView().byId("Main_DRS").setDateValue(this._vFromDate);
                        this.getView().byId("Main_DRS").setSecondDateValue(this._vToDate);
                    } else {
                        this.getView().byId("Main_DRS").setEditable(false);
                        this._vFromDate =  this.getView().byId("Main_DRS").getDateValue();
                        this.getView().byId("Main_DRS").setDateValue(undefined);
                        this._vToDate =  this.getView().byId("Main_DRS").getSecondDateValue();
                        this.getView().byId("Main_DRS").setSecondDateValue(undefined);
                    }

                    clmno = tokens.length === 0 ? undefined: tokens;
                } else {
                    var tokens = this.getView().byId("Main_MI_Clmno").getTokens().map(token => token.getText());
                    clmno = tokens.length === 0 ? undefined: tokens;
                }
                var oLocalModel = this.getModel('LocalModel');
                var bIsRequestor = oLocalModel.getProperty("/IsRequestorLoggedIn");
                if(bIsRequestor){
                    this._getWarrantyListPromise("page",clmno);
                } else {
                    //Call if logged in user is not the requestor
                    this._getClaimsFromCAPMPromise("page",clmno);
                }
            },
            
            /**
             * Event handler for table item
             * navigate to detail view
             * @param {sap.ui.base.Event} oEvent item press event
             * @public
             */
            onItemPress: function(oEvent){
                var oSrc = oEvent.getSource();
                var oBindingObj = oSrc.getBindingContext("LocalModel").getObject();
                this.getRouter().navTo("detail",{
                    claim: oBindingObj.Clmno
                });
            },

            onRowsUpdated: function(oEvent){
                var oSrc = oEvent.getSource();
                var oLocalModel = this.getModel('LocalModel');
                var iRows = oSrc.getBinding("rows").iLength;
                oLocalModel.setProperty("/claimTblTitle", this.getResourceBundle().getText("tblTitle",[iRows]));
            },

            onClearSortFilter: function(){
                var oTable = this.getControl('claimsTbl');
                var oBindingRows = oTable.getBinding('rows');
                oBindingRows.filter([]);
                oBindingRows.sort(null);
                this._resetFilterAndSortingState();
            },
            _resetFilterAndSortingState : function() {
                var oTable = this.getControl('claimsTbl');
                var aColumns = oTable.getColumns();
                for (var i = 0; i < aColumns.length; i++) {
                    aColumns[i].setSorted(false);
                    aColumns[i].setFiltered(false);
                }
            },
            

            _rebindTable: function(){
                var oSmartTable = this.getControl('claimsSmartTbl');
                if(oSmartTable.isInitialised()){
                    oSmartTable.rebindTable();
                }
            },
            

            handleChange: function(){

            },
            afterValueHelpClose: function(){
                
            },
            onFilter: function(oEvent){
                var oParams;
            }
        });
    });
