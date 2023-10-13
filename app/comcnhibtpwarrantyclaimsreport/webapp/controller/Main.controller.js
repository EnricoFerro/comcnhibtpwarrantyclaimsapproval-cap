sap.ui.define([
    "./BaseController",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/routing/History",
    "sap/ui/model/Sorter",
    "com/cnhi/btp/warrantyclaimsreport/model/ReqHelper",
    'sap/ui/model/type/String',
    'sap/m/Token'
],
    function (BaseController, MessageBox,  MessageToast, History, Sorter, ReqHelper,TypeString, Token) {
        "use strict";
        var sServiceUrl;
        return BaseController.extend("com.cnhi.btp.warrantyclaimsreport.controller.Main", {
            
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

                this._oSmartFilterBar  = this.getView().byId("smartFilterBar");
                this._oMultiInputClmno = this.getView().byId("Main_MI_Clmno");
                this._oMultiInputClmnoVH = this.getView().byId("Main_MI_Clmno_VH");
                this._oDRSCreateDate   = this.getView().byId("Main_DRS");
                this._oMultiCmbBoxUiStatus = this.getView().byId("Maim_MCB_UiStatus");

                this._oLocalModel = this.getModel('LocalModel');
                
                this._oLocalModel.setProperty("/Results", []);

            },
            _onObjectMatched: function(oEvent){
                
                var bIsRequestor = this._oLocalModel.getProperty("/IsRequestorLoggedIn");
                
                if(bIsRequestor){
                    var dToday = new Date();
                    if(!this._oLocalModel.getProperty("/FromDate")){
                        this._oLocalModel.setProperty("/FromDate", new Date(new Date().getFullYear(), 0, 1));
                        this._oLocalModel.setProperty("/ToDate", new Date());
                    }
                    if (!this._oLocalModel.setProperty("/MultiClmno")){
                        this._oLocalModel.setProperty("/MultiClmno", []);
    
                    }

                    if (this._oMultiInputClmno) {
                        var fnValidator = function(args){
                            var text = args.text;
    
                            return new Token({key: text, text: text});
                        };
                        this._oMultiInputClmno.addValidator(fnValidator);
                    }



                    this._oLocalModel.setProperty("/MultiUiStatus",["C","IP","R","A"]);

                    //Call if logged in user is the requestor
                    //this._getWarrantyListPromise("page");

                } else {
                    //Call if logged in user is not the requestor
                    this._getClaimsFromCAPMPromise("page");
                }
            },
            mapMIToTokenRange: function(oToken) {
                return {
                    key: oToken.getKey(),
                    text: oToken.getText(),
                    range: {
                        exclude: false,
                        operation: "EQ",
                        value1: oToken.getText(),
                        value2: null
                    }
                }
            },
            mapToTokenRange: function(oToken) {
                var oRange = oToken.getCustomData().find(item => item.getKey("range"))
                return {
                    key: oToken.getKey(),
                    text: oToken.getText(),
                    range: oRange ? oRange.getValue() : undefined
                }
            },
            mapFromTokenRange: function(oRange) {
                return new Token({
                    key: oRange.key,
                    text: oRange.text
                }).data("range", oRange.range);
            },
            onMIClmnoValueHelp: function(oEvent){
                var oView = this.getView();
                if (!this.oVHClmnoPopup) {
                    this.oVHClmnoPopup = sap.ui.xmlfragment(oView.getId(), "com.cnhi.btp.warrantyclaimsreport.fragment.VHClmnoPopup", this);
                    // to get access to the controller's model
                    oView.addDependent(this.oVHClmnoPopup);
                    this.oVHClmnoPopup.setRangeKeyFields([{
                        label: "Clmno",
                        key: "Clmno",
                        type: "string",
                        typeInstance: new TypeString({}, {
                            maxLength: 12
                        })
                    }]);
                    this.oVHClmnoPopup.setTokens(this._oMultiInputClmnoVH.getTokens());
                }
                this.oVHClmnoPopup.open();
            },
            onVHClmnoCancelPress: function() {
                this.oVHClmnoPopup.close();
            },
            onVHClmnoOkPress: function(oEvent) {
                var aTokens = oEvent.getParameter("tokens");
                this._oMultiInputClmnoVH.setTokens(aTokens);
                this.oVHClmnoPopup.close();
            },
            onClearSmartFilterBar: function() {
                this._oMultiInputClmno.removeAllTokens();
                this._oMultiInputClmnoVH.removeAllTokens();
                if (this.oVHClmnoPopup) {
                    this.oVHClmnoPopup.destroy(true);
                    this.oVHClmnoPopup = undefined;
                }
                this._oMultiCmbBoxUiStatus.setSelectedKeys(["C","IP","R","A"]);

                this._oLocalModel.setProperty("/Results", []);
                this._oLocalModel.setProperty("/FromDate", undefined);
                this._oLocalModel.setProperty("/ToDate",  undefined);
            },

            onBeforeVariantFetch: function() {
                if (this._oSmartFilterBar) {
                    this._oSmartFilterBar.setFilterData({
                        _CUSTOM: {
                            CustomClmno:      this._oMultiInputClmno.getTokens().map(oToken => this.mapToTokenRange(oToken)),
                            CustomClmnoVH:    this._oMultiInputClmnoVH.getTokens().map(oToken => this.mapToTokenRange(oToken)),
                            CustomCreateDate: { 
                                "First": this._oDRSCreateDate.getDateValue(), 
                                "Second": this._oDRSCreateDate.getSecondDateValue()
                            },
                            CustomUiStatus:   this._oMultiCmbBoxUiStatus.getSelectedKeys()
                        }
                    });
                }
            },
            onAfterVariantLoad: function(oEvent) {
                if (this._oSmartFilterBar) {
                    var oData = this._oSmartFilterBar.getFilterData();
                    var oCustomFieldData = oData["_CUSTOM"];
                    if (oCustomFieldData) {
                        this._oMultiInputClmno.setTokens(oCustomFieldData.CustomClmno.map(item => this.mapFromTokenRange(item)));
                        this._oMultiInputClmnoVH.setTokens(oCustomFieldData.CustomClmnoVH.map(item => this.mapFromTokenRange(item)))
                        if ( this.oVHClmnoPopup ) { 
                            this.oVHClmnoPopup.destroy(true);
                            this.oVHClmnoPopup = undefined; 
                        }
                        if (oCustomFieldData.CustomCreateDate.First) {
                            this._oDRSCreateDate.setDateValue(new Date(oCustomFieldData.CustomCreateDate.First));
                        } else {
                            this._oDRSCreateDate.setDateValue(undefined);
                        }
                        if (oCustomFieldData.CustomCreateDate.Second) {
                            this._oDRSCreateDate.setSecondDateValue(new Date(oCustomFieldData.CustomCreateDate.Second));
                        } else {
                            this._oDRSCreateDate.setSecondDateValue(undefined);
                        }
                        this._oMultiCmbBoxUiStatus.setSelectedKeys(oCustomFieldData.CustomUiStatus);
                    }
                }
            },

            /* =========================================================== */
            /* event handlers                                              */
            /* =========================================================== */
            onRefresh: function(oEvent){
                /*var clmno = undefined;
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
                    clmno = tokens.length === 0 ? undefined: tokens;
                } else {
                    var tokens = this._oMultiInputClmno.getTokens().map(token => token.getText());
                    clmno = tokens.length === 0 ? undefined: tokens;
                }*/

                this._oLocalModel.setProperty("/MultiUiStatus", $.extend(true, [], this._oMultiCmbBoxUiStatus.getSelectedKeys()));

                var oClmnoVHFilters = this._oMultiInputClmnoVH.getTokens().map(oToken => this.mapToTokenRange(oToken));
                var oClmnoFilters = this._oMultiInputClmno.getTokens().map(oToken => this.mapMIToTokenRange(oToken));

                var bIsRequestor = this._oLocalModel.getProperty("/IsRequestorLoggedIn");
                if(bIsRequestor){
                    this._getWarrantyListPromise2("page",{ claimNo: oClmnoFilters.concat(oClmnoVHFilters) });
                } else {
                    //Call if logged in user is not the requestor
                    this._getClaimsFromCAPMPromise("page",oClmnoFilters.concat(oClmnoVHFilters));
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
                    id: oBindingObj.id
                });
            },

            onRowsUpdated: function(oEvent){
                var oSrc = oEvent.getSource();
                var iRows = oSrc.getBinding("rows").iLength;
                this._oLocalModel.setProperty("/claimTblTitle", this.getResourceBundle().getText("Main_TBL_Title",[iRows]));
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
