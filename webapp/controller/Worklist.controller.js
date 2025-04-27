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
                // No need to call fetchNewPrices anymore as prices are already handled
            } catch (oError) {
                console.error("Error in onUpdateFinished:", oError);
            }
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
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteWorklist");
        },

        onAddRequest: function() {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteCreateRequest");
        },
    });
});
