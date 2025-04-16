sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/base/Log",
    "sap/m/MessageToast"
], function (Controller, Log, MessageToast) {
    "use strict";

    return Controller.extend("pricemanagement.controller.Worklist", {
        getResourceBundle: function () {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

        onInit: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        },

        onUpdateFinished: function (oEvent) {
            const oTable = oEvent.getSource();
            const iTotalItems = oEvent.getParameter("total");

            try {
                const oI18n = this.getResourceBundle();
                const sTitle = iTotalItems && oTable.getBinding("items").isLengthFinal()
                    ? oI18n.getText("worklistTableTitleCount", [iTotalItems])
                    : oI18n.getText("worklistTableTitle");

                this.getView().getModel().setProperty("/worklistTableTitle", sTitle);
                this.fetchNewPrices();
            } catch (oError) {
                console.error("Error in onUpdateFinished:", oError);
            }
        },

        fetchNewPrices: function () {
            console.log("Starting price fetch...");
            const oTable = this.byId("table");
            const aItems = oTable.getItems();
            const oModel = this.getView().getModel();

            if (aItems.length > 0) {
                const processItems = async () => {
                    for (const oItem of aItems) {
                        let sPath;
                        try {
                            const oContext = oItem.getBindingContext();
                            sPath = oContext.getPath();
                            const oProduct = oModel.getProperty(`${sPath}/toProduct`);

                            if (!oProduct || !oProduct.ExternalCode) {
                                console.warn(`Product ID not found for item at path: ${sPath}`);
                                continue;
                            }

                            console.log(`Fetching price for product: ${oProduct.ExternalCode}`);

                            const oResponse = await this.ajaxRequest(oProduct.ExternalCode);
                            const fPrice = oResponse[0].d.UnitPrice;

                            oModel.setProperty(`${sPath}/NewPrice`, fPrice);
                            console.log(`Price updated for product ${oProduct.ExternalCode}: ${fPrice}`);

                        } catch (oError) {
                            console.error(`Error processing item: ${oError.message}`);
                            if (sPath) {
                                oModel.setProperty(`${sPath}/NewPrice`, "N/A");
                            }
                        }
                    }
                };

                processItems().catch(oError => {
                    console.error(`Error in fetchNewPrices: ${oError.message}`);
                });
            }
        },

        ajaxRequest: function (sProductId) {
            return new Promise((resolve, reject) => {
                const sUrl = `https://cors-anywhere.herokuapp.com/https://services.odata.org/V2/Northwind/Northwind.svc/Products(${sProductId})`;

                $.ajax({
                    url: sUrl,
                    method: 'GET',
                    dataType: 'json',
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    success: (oData, sTextStatus, oJqXHR) => {
                        if (!oData || !oData.d) {
                            reject(new Error("Invalid response format"));
                            return;
                        }
                        resolve([oData, sTextStatus, oJqXHR]);
                    },
                    error: (oJqXHR, sTextStatus, sErrorThrown) => {
                        reject(new Error(`AJAX error: ${sTextStatus} - ${sErrorThrown}`));
                    }
                });
            });
        },

        onReject: function () {
            const oTable = this.byId("table");
            const aContexts = oTable.getSelectedContexts();
            const oModel = this.getView().getModel();

            for (let i = 0; i < aContexts.length; i++) {
                let path = aContexts[i].getPath();
                path = path + '/Status';
                oModel.setProperty(path, 'R');
            }

            oModel.submitChanges();
        },

        onApprove: function () {
            const oTable = this.byId("table");
            const aContexts = oTable.getSelectedContexts();
            const oModel = this.getView().getModel();

            oModel.setDeferredGroups(["approveGroup"]);

            aContexts.forEach(function (context) {
                oModel.setProperty(context.getPath() + '/Status', 'A');
            });

            oModel.submitChanges({
                groupId: "approveGroup",
                success: function () {
                    MessageToast.show("Items approved successfully");
                },
                error: function () {
                    MessageToast.show("Error approving items");
                }
            });
        },

        onProductAndPriceListButton: function () {
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteProductAndPriceList");
        },

        onRequestListButton: function () {
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteRequestList");
        }
    });
});
