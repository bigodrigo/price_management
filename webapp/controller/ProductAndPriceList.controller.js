sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (Controller,MessageToast,MessageBox) {
    "use strict";

    return Controller.extend("pricemanagement.controller.ProductAndPriceList", {
        getResourceBundle: function() {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

        onInit: function () {
           
        },

        onDeleteProductAndPrice: function (oEvent) {
            var oButton = oEvent.getSource();
            var oItem = oButton.getParent();
            var oContext = oItem.getBindingContext();
            var sProductAndPriceId = oContext.getProperty("Id");
            
            var that = this;
        
            MessageBox.confirm("Are you sure you want to delete the Product and Price?", {
                title: "Confirm Deletion",
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                emphasizedAction: MessageBox.Action.NO,
                onClose: function (sAction) {
                    if (sAction === MessageBox.Action.YES) {
                        that._deleteProductAndPrice(sProductAndPriceId);
                    }
                }
            });
        },

        _deleteProductAndPrice: function (sProductAndPriceId) {
            const oModel = this.getView().getModel();
            const oView = this.getView();
            const that = this;
        
            oView.setBusy(true);
            const sDeletePricesPath = "/PriceSet('" + sProductAndPriceId + "')";
        
            oModel.remove(sDeletePricesPath, {
                success: function () {
                    that._deleteProduct(sProductAndPriceId);
                },
                error: function (oError) {
                    oView.setBusy(false);
                    MessageBox.error("Error removing prices.", oError);
                }
            });
        },        
        
        _deleteProduct: function (sId) {
            const oModel = this.getView().getModel();
            const oView = this.getView();
        
            oModel.remove("/ProductSet('" + sId + "')", {
                success: function () {
                    oView.setBusy(false);
                    MessageToast.show("Product and its Prices deleted successfully!");
                    oModel.refresh(true);
                },
                error: function () {
                    oView.setBusy(false);
                    MessageBox.error("Error deleting Product.");
                }
            });
        },   
        
        formatPrices: function(aPrices) {
            console.log("Received prices:", aPrices);
        
            if (!aPrices || !Array.isArray(aPrices.results) || aPrices.results.length === 0) {
                return "No prices";
            }
        
            return aPrices.results.map(function(p) {
                return p.Value + " " + p.Currency;
            }).join(", ");
        },        

        onNavBack: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteWorklist");
        },

        onProductAndPriceListButton: function () {
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteProductAndPriceList");
        },

        onRequestListButton: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteWorklist");
        },

        onAddProductAndPrice: function() {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteCreateProductAndPrice");
        },

        onProductAndPricePress: function(oEvent) {
            var oItem = oEvent.getSource();
            var oContext = oItem.getBindingContext();
            var sId = oContext.getProperty("Id");
        
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteUpdateProductAndPrice", {
                ProductAndPriceId: sId
            });
        },        
    });
});
