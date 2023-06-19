sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "com/cnhi/btp/warrantyclaimsapproval/model/ReqHelper",
], function (Controller, UIComponent, Filter, FilterOperator, ReqHelper) {
    "use strict";

    return Controller.extend("com.cnhi.btp.warrantyclaimsapproval.controller.BaseController", {
        /**
         * Convenience method for accessing the router.
         * @public
         * @returns {sap.ui.core.routing.Router} the router for this component
         */
        getRouter: function () {
            return UIComponent.getRouterFor(this);
        },

        /**
         * Convenience method for getting the view model by name.
         * @public
         * @param {string} [sName] the model name
         * @returns {sap.ui.model.Model} the model instance
         */
        getModel: function (sName) {
            return this.getView().getModel(sName) ? this.getView().getModel(sName) : this.getOwnerComponent().getModel(sName);
        },

        /**
         * Convenience method for setting the view model.
         * @public
         * @param {sap.ui.model.Model} oModel the model instance
         * @param {string} sName the model name
         * @returns {sap.ui.mvc.View} the view instance
         */
        setModel: function (oModel, sName) {
            return this.getView().setModel(oModel, sName);
        },

        /**
         * Getter for the resource bundle.
         * @public
         * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
         */
        getResourceBundle: function () {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },
        /**
         * Set busy indicators for the controls
         */
        loadBusyIndicator: function (sName, bIsBusy) {
            var oControl = this.getView().byId(sName);
            oControl = oControl ? oControl : sap.ui.getCore().byId(sName);
            oControl.setBusy(bIsBusy);
        },
        /**
         * Get UI control
         */
        getControl: function (sId) {
            var oControl = this.getView().byId(sId);
            oControl = oControl ? oControl : sap.ui.getCore().byId(sId);
            return oControl;
        },

        _getWarrantyListPromise: function (busyIndicatorId, claimId) {
            var that = this;
            return new Promise((resolve, reject) => {
                var aFinal = [], aFilter = [];
                var oLocalModel = that.getModel('LocalModel');
                var oDataModel = that.getModel();
                if (claimId == undefined || claimId == null) {
                    var oDateTimeInstance = sap.ui.core.format.DateFormat.getDateTimeInstance({
                        formatOptions: { UTC: true }
                    });
                    var oFrmDateYr = oLocalModel.getProperty('/FromDate').getFullYear();
                    var oFrmDateMnth = oLocalModel.getProperty('/FromDate').getMonth() + 1;
                    var oFrmDateDate = oLocalModel.getProperty('/FromDate').getDate();
                    var oFrmttdFrmDate = new Date([oFrmDateYr, oFrmDateMnth, oFrmDateDate].join('-'));
                    oFrmttdFrmDate.setDate(oFrmttdFrmDate.getDate());

                    
                    aFilter.push(new Filter({
                        path: "CreateDate",
                        operator: FilterOperator.BT,
                        value1: oFrmttdFrmDate,
                        value2: oLocalModel.getProperty('/ToDate')
                    }));
                } else {
                    if (Array.isArray(claimId)) {
                        for (const item of claimId) {
                            aFilter.push(new Filter({
                                path: "Clmno",
                                operator: FilterOperator.EQ,
                                value1: item,
                                value2: undefined
                            }));
                        }
                    } else {
                        aFilter.push(new Filter({
                            path: "Clmno",
                            operator: FilterOperator.EQ,
                            value1: claimId,
                            value2: undefined
                        }));
                    }

                }
                this.loadBusyIndicator(busyIndicatorId, true);
                oLocalModel.setProperty("/Results", []);
                oDataModel.read("/WarrantySet", {
                    filters: aFilter,
                    success: async function (oData) {
                        that.loadBusyIndicator(busyIndicatorId, false);
                        if (oData.results.length > 0) {
                            var aUniqueClaims = [...new Set(oData.results.map(function (el) {
                                return el.Clmno;
                            }))];
                            for (var i = 0; i < aUniqueClaims.length; i++) {
                                var aItems = oData.results.filter(function (el) {
                                    return el.Clmno === aUniqueClaims[i];
                                });
                                if (aItems.length > 0) {
                                    var oHeader = aItems[0];
                                    oHeader.Items = $.extend(true, [], aItems);
                                    oHeader.ActualData = JSON.stringify(aItems[0]);
                                    aFinal.push(oHeader);
                                }
                            }
                            oLocalModel.setProperty("/Results", $.extend(true, [], aFinal));
                            resolve(await that._getClaimsFromCAPMPromise(busyIndicatorId));
                        }
                    }
                });
            });
        },

        getIconForMimeType: function(sMimeType) {
            return sap.ui.core.IconPool.getIconForMimeType(sMimeType)
        },

        _getClaimsFromCAPMPromise: function (busyIndicatorId) {
            return new Promise((resolve, reject) => {


                var that = this;
                var sServiceUrl = this.getOwnerComponent().getModel("ClaimApprovalCAP").sServiceUrl;
                var oLocalModel = this.getModel('LocalModel');
                var bIsRequestor = oLocalModel.getProperty("/IsRequestorLoggedIn");
                var sLoggedInUserID = oLocalModel.getProperty("/LoggedInUserID");
                var aResults = oLocalModel.getProperty("/Results") ? oLocalModel.getProperty("/Results") : [];
                var sUrl = sServiceUrl + "ClaimSet";
                var aFinal = [], oRowObj;
                this.loadBusyIndicator(busyIndicatorId, true);
                ReqHelper.sendGetReq(sUrl).then(function (oRes) {
                    that.loadBusyIndicator(busyIndicatorId, false);
                    //if(oRes.value.length > 0){
                    if (bIsRequestor) {
                        for (var i = 0; i < aResults.length; i++) {
                            var iIdx = oRes.value.findIndex(function (el) {
                                return el.claimNo === aResults[i].Clmno;
                            });
                            aResults[i]['IsRequestor'] = true;
                            aResults[i]['IsApprover'] = false;
                            if (iIdx >= 0) {
                                if (oRes.value[iIdx].statusCode === 'C') {
                                    aResults[i]['nextApprover'] = '';
                                    aResults[i]['currentLevel'] = null;
                                    aResults[i]['NextApprovers'] = [];

                                    aResults[i]['uistatus'] = that.getResourceBundle().getText("notSubmitted");
                                    aResults[i]['uistatusstate'] = "None";
                                } else {
                                    aResults[i]['id'] = oRes.value[iIdx].id;
                                    aResults[i]['nextApprover'] = oRes.value[iIdx].nextApprover;
                                    aResults[i]['currentLevel'] = oRes.value[iIdx].currentLevel;
                                    aResults[i]['NextApprovers'] = oRes.value[iIdx].sequence ? oRes.value[iIdx].sequence : [];
                                    aResults[i]['CAPMStatusCode'] = oRes.value[iIdx].statusCode;
                                    aResults[i]['WorkflowStatus'] = oRes.value[iIdx].statusCode === 'A' ? 'Approved' : oRes.value[iIdx].statusCode === 'IP' ? 'Inprogress' : oRes.value[iIdx].statusCode === 'C' ? 'Completed' : oRes.value[iIdx].statusCode === 'R' ? 'Rejected' : 'None';

                                    if (oRes.value[iIdx].statusCode === 'IP') {
                                        aResults[i]['uistatus'] = that.getResourceBundle().getText("uiStatus", [oRes.value[iIdx].currentLevel]);
                                        aResults[i]['uistatusstate'] = "Warning";
                                    } else if (oRes.value[iIdx].statusCode === 'A') {
                                        aResults[i]['uistatus'] = that.getResourceBundle().getText("claimApproved");
                                        aResults[i]['uistatusstate'] = "Success";
                                    } else if (oRes.value[iIdx].statusCode === 'R') {
                                        aResults[i]['uistatus'] = that.getResourceBundle().getText("claimRejected");
                                        aResults[i]['uistatusstate'] = "Error";
                                    } else {
                                        aResults[i]['uistatus'] = that.getResourceBundle().getText("notSubmitted");
                                        aResults[i]['uistatusstate'] = "None";
                                    }
                                }
                                aFinal.push(aResults[i]);
                            } else {
                                aResults[i]['nextApprover'] = '';
                                aResults[i]['currentLevel'] = null;
                                aResults[i]['NextApprovers'] = [];

                                aResults[i]['uistatus'] = that.getResourceBundle().getText("notSubmitted");
                                aResults[i]['uistatusstate'] = "None";
                                
                                aFinal.push(aResults[i]);
                            }
                        }
                    } else {
                        for (var iIdx = 0; iIdx < oRes.value.length; iIdx++) {
                            oRowObj = {};
                            if (oRes.value[iIdx].nextApprover === sLoggedInUserID) {
                                oRowObj['id'] = oRes.value[iIdx].id;
                                oRowObj['nextApprover'] = oRes.value[iIdx].nextApprover;
                                oRowObj['currentLevel'] = oRes.value[iIdx].currentLevel;
                                oRowObj['NextApprovers'] = oRes.value[iIdx].sequence ? oRes.value[iIdx].sequence : [];
                                oRowObj['CAPMStatusCode'] = oRes.value[iIdx].statusCode;
                                oRowObj['WorkflowStatus'] = oRes.value[iIdx].statusCode === 'A' ? 'Approved' : oRes.value[iIdx].statusCode === 'IP' ? 'Inprogress' : oRes.value[iIdx].statusCode === 'C' ? 'Completed' : oRes.value[iIdx].statusCode === 'R' ? 'Rejected' : 'None';

                                oRowObj['IsRequestor'] = false;
                                oRowObj['IsApprover'] = true;
                                oRowObj['uistatus'] = that.getResourceBundle().getText("uiStatus", [oRes.value[iIdx].currentLevel]);
                                oRowObj['uistatusstate'] = "Warning";

                                oRowObj = Object.assign(oRowObj, JSON.parse(oRes.value[iIdx].claimActualData));
                                for (const iterator of ["CreateDate","FailureDate","RepairStart","RepairEnd","ManDate","SubDate"]) {
                                    oRowObj[iterator] = typeof oRowObj[iterator] === 'string' ? new Date(oRowObj[iterator]) : oRowObj[iterator]; 
                                }
                                /*
                                oRowObj.CreateDate = typeof oRowObj.CreateDate === 'string' ? new Date(oRowObj.CreateDate) : oRowObj.CreateDate;
                                oRowObj.FailureDate = typeof oRowObj.FailureDate === 'string' ? new Date(oRowObj.FailureDate) : oRowObj.FailureDate;
                                oRowObj.RepairStart = typeof oRowObj.RepairStart === 'string' ? new Date(oRowObj.RepairStart) : oRowObj.RepairStart;
                                oRowObj.RepairEnd = typeof oRowObj.RepairEnd === 'string' ? new Date(oRowObj.RepairEnd) : oRowObj.RepairEnd;
                                oRowObj.ManDate = typeof oRowObj.ManDate === 'string' ? new Date(oRowObj.ManDate) : oRowObj.ManDate;
                                oRowObj.SubDate
                                */
                                aFinal.push(oRowObj);
                            }
                        }
                    }
                    oLocalModel.setProperty("/Results", $.extend(true, [], aFinal));
                    //}
                    //that._rebindTable();
                    resolve();
                }.bind(this))
                    .catch(function (response) {
                        that.loadBusyIndicator(busyIndicatorId, false);
                        reject(response)
                    }.bind(this));
            });
        },
    });

});