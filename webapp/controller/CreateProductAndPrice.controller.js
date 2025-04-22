sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel"
], function(Controller, MessageToast, JSONModel) {
    "use strict";

    return Controller.extend("pricemanagement.controller.CreateProductAndPrice", {
        onInit: function() {
            var oNow = new Date();

            var oFormModel = new JSONModel({
                newProduct: {
                    ExternalCode: "",
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
                    ValidFrom: oNow,
                    ValidTo: null
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
            oModel.setProperty("/newPrice", {
                ProductId: "",
                Value: "",
                Currency: "",
                ValidFrom: null, // oNow?
                ValidTo: null
            });
        },

        onSubmit: async function() {
            var oForm = this.getView().getModel("form");
            var oProductData = oForm.getProperty("/newProduct");
            var oPriceData = oForm.getProperty("/newPrice");
            console.log('Product: ', oProductData)
            console.log('Price: ', oPriceData)

            oProductData.Uom = oProductData.Uom.toUpperCase();
            oPriceData.Currency = oPriceData.Currency.toUpperCase();

            this.getView().setBusy(true);
            try {
                const oCreatedProduct = await this._createProduct(oProductData);
                // await this._createProduct(oProductData);
                // await this._createPrice(oPriceData);
                oPriceData.ProductId = oCreatedProduct.Id
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
        },

        onExternalCodeChange: async function(oEvent) {
            const sExternalCode = oEvent.getParameter("value");
            const oFormModel = this.getView().getModel("form");
        
            if (!sExternalCode) {
                return; // não faz nada se o campo estiver vazio
            }
        
            this.getView().setBusy(true); // mostra loading
        
            try {
                const oResponse = await this.ajaxRequest(sExternalCode);
                const oProductData = oResponse[0].d;
        
                // Atualiza o form com os dados retornados
                oFormModel.setProperty("/newProduct/Name", oProductData.ProductName || "");
                // oFormModel.setProperty("/newProduct/CategoryId", oProductData.CategoryId ? `Categoria ${oProductData.CategoryId}` : "");
                // oFormModel.setProperty("/newProduct/SupplierID", oProductData.SupplierID ? `Fornecedor ${oProductData.SupplierID}` : "");
                oFormModel.setProperty("/newProduct/CategoryId", oProductData.CategoryId || "");
                oFormModel.setProperty("/newProduct/SupplierID", oProductData.SupplierID || "");
                oFormModel.setProperty("/newProduct/Weight", oProductData.Weight || "");
                oFormModel.setProperty("/newProduct/Discontinued", oProductData.Discontinued || "");
        
                // MessageToast.show("Dados do produto carregados com sucesso!");
                console.error("API fetch", oProductData);
            } catch (oError) {
                MessageToast.show("Produto não encontrado.");
                console.error("Erro ao buscar produto:", oError);
            } finally {
                this.getView().setBusy(false);
            }
        },

        ajaxRequest: function(sExternalCode) {
            return new Promise((resolve, reject) => {
                // Temporary CORS proxy - replace with your actual backend endpoint
                const sUrl = `https://cors-anywhere.herokuapp.com/https://services.odata.org/V2/Northwind/Northwind.svc/Products(${sExternalCode})`;
                
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
    });
});
