sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel"
], function(Controller, MessageToast, JSONModel) {
    "use strict";

    return Controller.extend("pricemanagement.controller.CreateRequest", {
        onInit: function() {
            var oNow = new Date();
            var oFormModel = new JSONModel({
                newRequest: {
                    ProductId: "",
                    RequestDate: oNow, 
                    RequestTime: oNow, 
                    NewPrice: "",
                    Currency: "",
                    Status: "P",
                    ApprovalDate: null,
                    ApprovalTime: null,
                    ApproverUser: ""
                }
            });
            this.getView().setModel(oFormModel, "form");

            this._loadProducts();
        },

        _loadProducts: function() {
            const oView = this.getView();
            const oModel = this.getOwnerComponent().getModel();
            const oProductsModel = new JSONModel();

            // oView.setBusy(true);

            oModel.read("/ProductSet", {
                success: function(oData) {
                    console.log("Loaded products:", oData);
                    oProductsModel.setData({ products: oData.results });
                    oView.setModel(oProductsModel, "products");
                },
                error: function() {
                    MessageToast.show("Error loading products.");
                },
                complete: function() {
                    oView.setBusy(false);
                }
            });
        },
        
        onProductSelected: async function(oEvent) {
            const oView = this.getView();
            const sProductId = oEvent.getSource().getSelectedKey();
            console.log('Selected Product:', sProductId);
            const oFormModel = oView.getModel("form");
        
            if (!sProductId) {
                return;
            }

            // oView.setBusy(true);

            try {
                const sExternalCode = await this._getExternalCodeByProductId(sProductId);
                const oApiResponse = await this.ajaxRequest(sExternalCode);
                const fPrice = oApiResponse.d.UnitPrice;

                oFormModel.setProperty("/newRequest/NewPrice", fPrice);
                oFormModel.setProperty("/newRequest/ProductId", sProductId);
            } catch (error) {
                console.error("Erro ao buscar preço:", error);
                MessageToast.show("Erro ao buscar preço.");
            } finally {
                oView.setBusy(false);
            }
        },
        
        _getExternalCodeByProductId: function(sProductId) {
            const oProductsModel = this.getView().getModel("products");
            const aProducts = oProductsModel.getProperty("/products");

            const oProduct = aProducts.find(p => p.Id === sProductId);
            if (!oProduct) {
                throw new Error("Produto não encontrado.");
            }

            return Promise.resolve(oProduct.ExternalCode); 
        },
        
        onSubmit: async function() {
            var oFormData = this.getView().getModel("form").getProperty("/newRequest");
            console.log('Request: ', oFormData)

            oFormData.RequestDate = null;
            oFormData.RequestTime = null;

            // this.getView().setBusy(true);
            try {
                const oCreatedRequest = await this._createRequest(oFormData);
                console.log(oCreatedRequest)
                MessageToast.show("Request created successfully!");
                this.onCancel();
            } catch (error) {
                console.error("Error during creation:", error);
                MessageToast.show("Error: " + error.message);
            } finally {
                this.getView().setBusy(false);
            }
        },

        _createRequest: function(oData) {
            var oModel = this.getView().getModel();
            return new Promise((resolve, reject) => {
                oModel.create("/RequestSet", oData, {
                    success: function(oResponse) {
                        console.log("Request created:", oResponse);
                        resolve(oResponse);
                    },
                    error: function(oError) {
                        console.error("Request creation error:", oError);
                        reject(new Error("Failed to create Request."));
                    }
                });
            });
        },

        onNavBack: function() {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteWorklist");
        },

        onCancel: function() {
            const oNow = new Date();

            var oModel = this.getView().getModel("form");
            oModel.setProperty("/newRequest", {
                ProductId: "",
                RequestDate: oNow, 
                RequestTime: oNow, 
                NewPrice: "",
                Currency: "",
                Status: "P",
                ApprovalDate: null,
                ApprovalTime: null,
                ApproverUser: ""
            });
        },

        onProductAndPriceListButton: function () {
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteProductAndPriceList");
        },

        onRequestListButton: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteWorklist");
        },

        ajaxRequest: function(sExternalCode) {
            return new Promise((resolve, reject) => {
                const sUrl = `https://cors-anywhere.herokuapp.com/https://services.odata.org/V2/Northwind/Northwind.svc/Products(${sExternalCode})`;
                
                $.ajax({
                    url: sUrl,
                    method: 'GET',
                    dataType: 'json',
                    headers: {
                        'Accept': 'application/json'
                    },
                    success: (oData) => {
                        if (!oData || !oData.d) {
                            reject(new Error("Invalid response format"));
                            return;
                        }
                        resolve(oData);
                    },
                    error: (oError) => {
                        reject(oError);
                    }
                });
            });
        }
    });
});
