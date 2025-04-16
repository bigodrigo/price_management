sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel"
], function(Controller, MessageToast, JSONModel) {
    "use strict";

    return Controller.extend("pricemanagement.controller.CreateProductAndPrice", {
        onInit: function() {
            var oFormModel = new JSONModel({
                newProduct: {
                    ExternalId: "",
                    Name: "",
                    Barcode: "",
                    CategoryId: "",
                    SupplierId: "",
                    QuantityUnit: "",
                    Uom: "",
                    Weight: "",
                    Discontinued: ""
                },
                newPrice: {
                    ProductId: "",
                    Value: "",
                    Currency: "",
                    ValidFrom: "",
                    ValidTo: ""
                }
            });
            this.getView().setModel(oFormModel, "form");
        },

        onNavBack: function() {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteProductAndPriceList");
        },

        onCancel: function() {
            var oModel = this.getView().getModel("form");
            oModel.setProperty("/newProduct", {
                ExternalId: "",
                Name: "",
                Barcode: "",
                CategoryId: "",
                SupplierId: "",
                QuantityUnit: "",
                Uom: "",
                Weight: "",
                Discontinued: ""
            });
            oModel.setProperty("/newPrice", {
                ProductId: "",
                Value: "",
                Currency: "",
                ValidFrom: "",
                ValidTo: ""
            });
        },

        onSubmit: async function() {
            var oForm = this.getView().getModel("form");
            var oProductData = oForm.getProperty("/newProduct");
            var oPriceData = oForm.getProperty("/newPrice");

            oProductData.Uom = oProductData.Uom.toUpperCase();
            oPriceData.Currency = oPriceData.Currency.toUpperCase();

            this.getView().setBusy(true);
            try {
                const oCreatedProduct = await this._createProduct(oProductData);
                // await this._createProduct(oProductData);
                await this._createPrice(oPriceData);
                const oCreatedPrice = await this._createPrice(oPriceData);
                console.log(oCreatedProduct)
                console.log(oCreatedPrice)
                MessageToast.show("Product and Price created successfully!");
                this.onCancel();
            } catch (error) {
                console.error("Error during creation:", error);
                MessageToast.show("Error: " + error.message);
            } finally {
                this.getView().setBusy(false);
            }
        },

        _createProduct: function(oData) {
            var oModel = this.getView().getModel();
            return new Promise((resolve, reject) => {
                oModel.create("/ProductSet", oData, {
                    success: function(oResponse) {
                        console.log("Product created:", oResponse);
                        resolve(oResponse);
                    },
                    error: function(oError) {
                        console.error("Product creation error:", oError);
                        reject(new Error("Failed to create product."));
                    }
                });
            });
        },

        _createPrice: function(oData) {
            var oModel = this.getView().getModel();
            return new Promise((resolve, reject) => {
                oModel.create("/PriceSet", oData, {
                    success: function(oResponse) {
                        console.log("Price created:", oResponse);
                        resolve(oResponse);
                    },
                    error: function(oError) {
                        console.error("Price creation error:", oError);
                        reject(new Error("Failed to create price."));
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
