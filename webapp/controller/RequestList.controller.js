sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (Controller, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("pricemanagement.controller.RequestList", {
        getResourceBundle: function() {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

        onInit: function () {

        },

        onDeleteRequest: function (oEvent) {
            var oButton = oEvent.getSource();
            var oItem = oButton.getParent(); // ColumnListItem
            var oContext = oItem.getBindingContext();
            var sRequestId = oContext.getProperty("Id");

            var that = this;
        
            MessageBox.confirm("Are you sure you want to delete the Request?", {
                title: "Confirm Deletion",
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                emphasizedAction: MessageBox.Action.NO,
                onClose: function (sAction) {
                    if (sAction === MessageBox.Action.YES) {
                        that._deleteRequest(sRequestId);
                    }
                }
            });
        },

        _deleteRequest: function (sRequestId) {
            const oModel = this.getView().getModel();
            const oView = this.getView();
            const that = this;
        
            oView.setBusy(true);
        
            const sDeleteRequestPath = "/RequestSet('" + sRequestId + "')";
        
            oModel.remove(sDeleteRequestPath, {
                success: function () {
                    oView.setBusy(false);
                    MessageToast.show("Request deleted successfully!");
                    oModel.refresh(true); // Refreshes the data on the screen
                },
                error: function () {
                    oView.setBusy(false);
                    MessageBox.error("Error deleting the Request.");
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

        onAddRequest: function() {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteCreateRequest");
        },

        onRequestPress: function(oEvent) {
            var oItem = oEvent.getSource();
            var oContext = oItem.getBindingContext();
            var sId = oContext.getProperty("Id");
        
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteUpdateRequest", {
                RequestId: sId
            });
        },
    });
});
