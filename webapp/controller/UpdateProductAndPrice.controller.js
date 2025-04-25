sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel"
], function(Controller, MessageToast, JSONModel) {
    "use strict";

    return Controller.extend("pricemanagement.controller.UpdateProductAndPrice", {
        getResourceBundle: function () {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

        onInit: function () {
            const oFormModel = new JSONModel({
                currentProduct: {},
                currentPrice: {}
            });
            this.getView().setModel(oFormModel, "form");

            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteUpdateProductAndPrice").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
            const oParams = oEvent.getParameter("arguments");
            const sId = oParams.ProductAndPriceId;
            const oView = this.getView();
            const oModel = oView.getModel();

            const sPath = "/ProductSet('" + sId + "')";

            oModel.read(sPath, {
                success: function (oProductData) {
                    console.log("✅ Product loaded:", oProductData);
                    oView.getModel("form").setProperty("/currentProduct", oProductData);

                    const priceFilter = [
                        new sap.ui.model.Filter("ProductId", "EQ", oProductData.Id)
                    ];

                    oModel.read("/PriceSet", {
                        filters: priceFilter,
                        success: function (oPriceResult) {
                            console.log("✅ Prices found:", oPriceResult);
                            if (oPriceResult.results && oPriceResult.results.length > 0) {
                                const latestPrice = oPriceResult.results[0];
                                oView.getModel("form").setProperty("/currentPrice", latestPrice);
                            } else {
                                console.warn("⚠️ No prices found.");
                            }
                        },
                        error: function (oError) {
                            console.error("❌ Error loading prices:", oError);
                            MessageToast.show("Error loading price data.");
                        }
                    });

                },
                error: function (oError) {
                    console.error("❌ Error loading product:", oError);
                    MessageToast.show("Error loading product data.");
                }
            });
        },

        onNavBack: function() {
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteProductAndPriceList");
        },

        onCancel: function() {
            const oModel = this.getView().getModel("form");
            oModel.setProperty("/currentProduct", {
                ExternalCode: "",
                Name: "",
                Barcode: "",
                CategoryId: "",
                SupplierId: "",
                QuantityUnit: "",
                Uom: "",
                Weight: "",
                Discontinued: ""
            });
            oModel.setProperty("/currentPrice", {
                ProductId: "",
                Value: "",
                Currency: "",
                ValidFrom: null,
                ValidTo: null
            });
        },

        onSubmit: async function() {
            const oForm = this.getView().getModel("form");
            const oProductData = oForm.getProperty("/currentProduct");
            const oPriceData = oForm.getProperty("/currentPrice");

            console.log('📦 Product to update:', oProductData);
            console.log('💰 Price to update:', oPriceData);

            // Normalize data
            oProductData.Uom = oProductData.Uom.toUpperCase();
            oPriceData.Currency = oPriceData.Currency.toUpperCase();

            this.getView().setBusy(true);

            try {
                await this._updateProduct(oProductData);
                await this._updatePrice(oPriceData);
                MessageToast.show("Product and Price successfully updated!");
                this.onCancel(); // Clear fields
            } catch (error) {
                console.error("❌ Update error:", error);
                MessageToast.show("Update failed: " + error.message);
            } finally {
                this.getView().setBusy(false);
            }
        },

        _updateProduct: function(oData) {
            const oModel = this.getView().getModel();
            const sPath = `/ProductSet('${oData.Id}')`;

            // Primeiro, buscar o CSRF Token
            oModel.setHeaders({
                "X-CSRF-Token": "Fetch"
            });

            return new Promise((resolve, reject) => {
                oModel.update(sPath, oData, {
                    success: function() {
                        console.log("✅ Product successfully updated.");
                        resolve();
                    },
                    error: function(oError) {
                        console.error("❌ Error updating product:", oError);
                        reject(new Error("Failed to update product."));
                    }
                });
            });
        },

        _updatePrice: function(oData) {
            const oModel = this.getView().getModel();
            const sPath = `/PriceSet(ProductId='${oData.ProductId}',ValidFrom=datetime'${oData.ValidFrom}')`;

            
            // Primeiro, buscar o CSRF Token
            oModel.setHeaders({
                "X-CSRF-Token": "Fetch"
            });
            
            return new Promise((resolve, reject) => {
                oModel.update(sPath, oData, {
                    success: function() {
                        console.log("✅ Price successfully updated.");
                        resolve();
                    },
                    error: function(oError) {
                        console.error("❌ Error updating price:", oError);
                        reject(new Error("Failed to update price."));
                    }
                });
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
