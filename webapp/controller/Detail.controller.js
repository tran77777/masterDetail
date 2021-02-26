sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/m/MessageToast",
	"sap/ui/comp/smarttable/SmartTable",
	"sap/ui/comp/smartfilterbar/SmartFilterBar",
	"sap/m/OverflowToolbar",
	"sap/m/ToolbarSpacer",
	"sap/m/OverflowToolbarButton",
	"sap/m/OverflowToolbarToggleButton",
	"sap/m/ObjectStatus",
	"sap/m/Button",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/Fragment",
	"sap/m/MessageBox"

], function(BaseController, JSONModel, formatter, MessageToast, SmartTable, SmartFilterBar, OverflowToolbar, ToolbarSpacer,
	OverflowToolbarButton, OverflowToolbarToggleButton, ObjectStatus, Button, Filter, FilterOperator, Fragment, MessageBox) {
	"use strict";

	// shortcut for sap.m.URLHelper

	return BaseController.extend("MySecondProject.MySecondProject.controller.Detail", {

		formatter: formatter,

		_mFilters: {
			activeVersion: new Filter("Version", FilterOperator.NE, "D"),
			deactiveVersion: new Filter("Version", FilterOperator.EQ, "D")
		},

		_oViewModel: new JSONModel({
			button: {
				visible: {
					Create: true,
					Update: true,
					DeactivateDelete: true,
					Restore: true,
					Refresh: true,
					Copy: true,
					ChangeSelectionMode: true,
					ChangeVersionMode: true
				},
				pressed: {
					ChangeSelectionMode: false,
					ChangeVersionMode: false
				}
			},
			table: {
				selectionMode: "Single",
				selectedItemsCount: 0
			},
			dialog: {
				title: "daw",
				inputValue: "",
				mode: ""
			}
		}),

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		onInit: function() {
			// Model used to manipulate control states. The chosen values make sure,
			// detail page is busy indication immediately so there is no break in
			// between the busy indication for loading the view's meta data
			// var oViewModel = new JSONModel({
			// 	busy: false,
			// 	delay: 0
			// });

			this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);

			this.setModel(this._oViewModel, "detailView");

			this.getOwnerComponent().getModel().metadataLoaded().then(this._onMetadataLoaded.bind(this));
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Event handler when the share by E-Mail button has been clicked
		 * @public
		 */
		onShareEmailPress: function() {
			var oViewModel = this.getModel("detailView");

			sap.m.URLHelper.triggerEmail(
				null,
				oViewModel.getProperty("/shareSendEmailSubject"),
				oViewModel.getProperty("/shareSendEmailMessage")
			);
		},

		/* =========================================================== */
		/* begin: internal methods                                     */
		/* =========================================================== */

		/**
		 * Binds the view to the object path and expands the aggregated line items.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
		_onObjectMatched: function(oEvent) {

			var sEntity = oEvent.getParameter("arguments").entity;
			this.getModel().metadataLoaded().then(function() {
				this.byId("thDetail").setText(this.getModel("i18n").getResourceBundle().getText("t" + sEntity));
				this._loadTable(sEntity);
			}.bind(this));
		},

		/**
		 * Binds the view to the object path. Makes sure that detail view displays
		 * a busy indicator while data for the corresponding element binding is loaded.
		 * @function
		 * @param {string} sObjectPath path to the object to be bound to the view.
		 * @private
		 */

		_loadTable: function(sEntity) {

			this._oSmartFilterBar = new SmartFilterBar({
				id: "sf" + sEntity,
				entitySet: "zjblessons_base_" + sEntity,
				liveMode: true,
				enableBasicSearch: false,
				useToolbar: true
			});

			var aToolbarElements = [
				new OverflowToolbarToggleButton({
					text: "{i18n>ttChangeSelectionMode}",
					tooltip: "{i18n>ttChangeSelectionMode}",
					type: "Default",
					icon: "{i18n>iChangeSelectionMode}",
					visible: "{detailView>/button/visible/ChangeSelectionMode}",
					//press: this.catalog.onChangeSelectionMode.bind(this),
					pressed: "{detailView>/button/pressed/ChangeSelectionMode}",
					press: this.onPressOnChangeSelectMode.bind(this)
				}),
				new Button({
					text: "{i18n>infSelectedItems} {detailView>/table/selectedItemsCount}",
					tooltip: "{i18n>ttResetSelections}",
					type: "Default",
					//press: this.catalog.onResetSelections.bind(this),
					enabled: true,
					visible: "{= ( (${detailView>/table/selectedItemsCount} > 0) && (${detailView>/table/selectionMode} === 'MultiToggle' ) ) }",
					iconFirst: false
				}),
				new OverflowToolbarToggleButton({
					text: "{i18n>ttDeactivateMode}",
					tooltip: "{i18n>ttDeactivateMode}",
					type: "Default",
					icon: "{i18n>iDeactivateMode}",
					visible: "{detailView>/button/visible/ChangeVersionMode}",
					pressed: "{detailView>/button/pressed/ChangeVersionMode}",
					press: this.onPressToogleDeactiveMode.bind(this)

					//press: this.catalog.onChangeVersionMode.bind(this)
				}),
				new ObjectStatus({
					text: "{i18n>infDeactivatedModeOn}",
					inverted: true,
					state: "Warning",
					visible: "{detailView>/button/pressed/ChangeVersionMode}"
				}),
				new ToolbarSpacer(),
				new OverflowToolbarButton({
					//id: "btnCreate",
					icon: "{i18n>iCreate}",
					type: "Default",
					tooltip: "{i18n>ttCreate}",
					text: "{i18n>ttCreate}",
					//press: this.catalog.onCreate.bind(this),
					visible: "{detailView>/button/visible/Create}",
					enabled: "{= !${detailView>/button/pressed/ChangeVersionMode} }",
					press: this.onCreatePress.bind(this)

				}),
				new OverflowToolbarButton({
					//id: "btnCopy",
					icon: "{i18n>iCopy}",
					type: "Default",
					tooltip: "{i18n>ttCopy}",
					text: "{i18n>ttCopy}",
					//press: this.catalog.onCopy.bind(this),
					visible: "{detailView>/button/visible/Copy}",
					enabled: "{= (${detailView>/table/selectedItemsCount} === 1) && !${detailView>/button/pressed/ChangeVersionMode} }",
					press: this.onPressCopy.bind(this)
				}),
				new OverflowToolbarButton({
					//id: "btnRefresh",
					icon: "{i18n>iRefresh}",
					type: "Default",
					tooltip: "{i18n>ttRefresh}",
					//press: this.catalog.onRefresh.bind(this),
					text: "{i18n>ttRefresh}",
					visible: "{detailView>/button/visible/Refresh}",
					press: this.onRefreshTable.bind(this)
				}),
				new OverflowToolbarButton({
					//id: "btnDeactivateDelete",
					text: "{= (${detailView>/button/pressed/ChangeVersionMode}) ? ${i18n>ttDelete} : ${i18n>ttDeactivate}}",
					tooltip: "{= (${detailView>/button/pressed/ChangeVersionMode}) ? ${i18n>ttDelete} : ${i18n>ttDeactivate}}",
					icon: "{= (${detailView>/button/pressed/ChangeVersionMode}) ? ${i18n>iDelete} : ${i18n>iDeactivate}}",
					visible: "{detailView>/button/visible/DeactivateDelete}",
					type: "Default",
					//press: this.catalog.onDeactivateDelete.bind(this),
					enabled: "{= ${detailView>/table/selectedItemsCount} > 0 }",
					press: this.onPressDeactivateDeleteButton.bind(this)
				}),
				new OverflowToolbarButton({
					//id: "btnRestore",
					icon: "{i18n>iRestore}",
					type: "Default",
					tooltip: "{i18n>ttRestore}",
					text: "{i18n>ttRestore}",
					//press: this.catalog.onRestore.bind(this),
					visible: "{detailView>/button/visible/Restore}",
					enabled: "{= ${detailView>/table/selectedItemsCount} > 0 && ${detailView>/button/pressed/ChangeVersionMode}}",
					press: this.onPressDeactivateDeleteButton.bind(this)
				})

			];

			this._oSmartTable = new SmartTable({
				entitySet: "zjblessons_base_" + sEntity,
				editable: false,
				smartFilterId: "sf" + sEntity,
				tableType: "Table",
				useExportToExcel: true,
				editTogglable: false,
				useVariantManagement: false,
				useTablePersonalisation: true,
				showVariantManagement: true,
				header: " ",

				showRowCount: true,
				enableAutoBinding: true,
				showFullScreenButton: true,
				visible: true,

				beforeRebindTable: this._onBeforeRebindTable.bind(this),
				customToolbar: new OverflowToolbar({
					design: "Transparent",
					content: aToolbarElements
				})
			});

			this._oTable = this._oSmartTable.getTable();
			this._oTable.bindProperty("selectionMode", {
				path: "detailView>/table/selectionMode"
			});

			this._oTable.setSelectionMode("Single");
			this._oTable.setSelectionBehavior("Row");
			this._oTable.attachRowSelectionChange(this.onSelectionChange.bind(this));

			this.getModel("detailView").setProperty("/table/selectedItemsCount", 0);
			this.getModel("detailView").setProperty("/table/selectionMode", "Single");
			this.getModel("detailView").setProperty("/button/pressed/ChangeSelectionMode", false);
			this.getModel("detailView").setProperty("/button/pressed/ChangeVersionMode", false);

			//this._oSmartTable.setCustomToolbar();

			// aToolbarElements.forEach(function(oElement) {
			// 	oToolbar.addContent(oElement);
			// });

			var oRowActionTemplate = new sap.ui.table.RowAction({
				items: [
					new sap.ui.table.RowActionItem({
						icon: "{i18n>iEdit}",
						type: "Custom",
						text: "{i18n>ttEdit}",
						press: this.onUpdatePress.bind(this),
						visible: "{= ${detailView>/button/visible/Update} && !${detailView>/button/pressed/ChangeVersionMode} }"
					})
				]
			});

			this._oTable.setRowActionTemplate(oRowActionTemplate);
			this._oTable.setRowActionCount(1);

			this.getView().byId("page").setContent(this._oSmartTable);

			this.getView().byId("page").destroyHeaderContent();
			this.getView().byId("page").addHeaderContent(this._oSmartFilterBar);
		},
		onActionPress: function() {
			debugger

			var oModel = this.getOwnerComponent().getModel();
			var infoMB = this.getView().getModel("i18n").getResourceBundle().getText("infoMB");
			var sStatusSuccessi18n = this.getView().getModel("i18n").getResourceBundle().getText("messageBoxSuccsess");
			var item = {
				GroupID: "",

				Version: "A",
				Language: "RU",
				GroupText: this.getModel("detailView").getProperty("/dialog/inputValue")
			}
			oModel.create("/zjblessons_base_Groups", item, {
				success: function() {
					sap.m.MessageBox.show(sStatusSuccessi18n, {
						icon: sap.m.MessageBox.Icon.SUCCESS,
						title: infoMB
					});

				}

			});

			this.onPressCancel();

		},
		onCreatePress: function() {
			this.getModel("detailView").setProperty("/dialog/mode", "create");
			this.onPressCreateDialog();
		},
		onUpdatePress: function() {
			this.getModel("detailView").setProperty("/dialog/mode", "update");
			this.onPressCreateDialog();
		},
		onPressCopy: function() {
			this.getModel("detailView").setProperty("/dialog/mode", "copy");
			this.onPressCreateDialog();
		},
		
		onPressCreateDialog: function(oEvent) {
			debugger
			this.getModel("detailView").setProperty("/dialog/inputValue", "")
			var oView = this.getView();
			var sMode = this.getModel("detailView").getProperty("/dialog/mode");
			if (sMode === "update" || sMode==="copy") {
				var sPath = this._oTable.getContextByIndex(this._oTable.getSelectedIndex()).getPath();
				var sGroupText = this.getView().getModel().getProperty(sPath).GroupText;
				this.getModel("detailView").setProperty("/dialog/inputValue", sGroupText);
			}
			sap.ui.core.Fragment.load({
					id: oView.getId(),
					name: "MySecondProject.MySecondProject.view.CreateDialog",
					controller: this
				})
				.then(oDialog => {

					this.getView().addDependent(oDialog);
					oDialog.setModel(this.getModel("detailView"));
					this.getView().byId("input").bindProperty("value", {
						path: "detailView>/dialog/inputValue"
					});
					oDialog.open();

					this._oDialog = oDialog;
				});
		},
		onCloseDialog: function() {
			// note: We don't need to chain to the pDialog promise, since this event-handler
			// is only called from within the loaded dialog itself.
			this.byId("createDialog").close();
		},

		onSelectionChange: function() {
			this.getModel("detailView").setProperty("/table/selectedItemsCount", this._oTable.getSelectedIndices().length);

			debugger
		},
		onPressDeactivateDeleteButton: function(oEvent) {
			debugger
			if (this.getView().getModel("detailView").getProperty("/button/pressed/ChangeVersionMode")) {
				this.PressdeleteRow();
				return;
			}
			var index = this._oTable.getSelectedIndices();

			MessageBox.confirm(this.getResourceBundle().getText("msgRestore"), {
				onClose: oAction => {
					if (oAction === MessageBox.Action.OK) {

						index.forEach(element => this.getView().getModel().setProperty(this._oTable.getContextByIndex(element).sPath + "/Version",

							this.getView().getModel("detailView").getProperty("/button/pressed/ChangeVersionMode") ? "A" : "D"));

						this.getModel().submitChanges({
							success: () => {
								MessageToast.show("msgSuccessRestore");
							}
						});
					}
				}
			});

		},
		onRefreshTable: function() {
			this._oSmartTable.rebindTable(true);
			MessageToast.show("msg");
		},
		onPressOnChangeSelectMode: function(oEvent) {
			debugger
			this.getView().getModel("detailView").setProperty("/table/selectionMode", oEvent.getParameter("pressed") ? "Multi" : "Single");
		},
		onPressToogleDeactiveMode: function(oEvent) {
			this._oSmartTable.rebindTable();
		},
		_onBeforeRebindTable: function(oEvent) {

			if (oEvent) {
				var sFilterKey = this.getModel("detailView").getProperty("/button/pressed/ChangeVersionMode") ? "deactiveVersion" :
					"activeVersion",
					oFilter = this._mFilters[sFilterKey];
				oEvent.getParameter("bindingParams").filters.push(oFilter);
			}
		},
		_onUpdate: function(oEvent) {
			debugger
			var sContextPath = oEvent.getSource().getBindingContext().getPath();
			sap.ui.core.Fragment.load({
					name: "MySecondProject.MySecondProject.view.EditGroup",
					controller: this
				})
				.then(oDialog => {
					// oDialog.getBeginButton().attachPress(this.onPressLogin.bind(this, oDialog, oEntity, resolve));
					// oDialog.getEndButton().attachPress(this.onPressCancelLogin.bind(this, oDialog, resolve));
					this.getView().addDependent(oDialog);
					oDialog.setModel(this.getModel());
					oDialog.bindObject(sContextPath);
					oDialog.open();
					this._oDialog = oDialog;
				});
		},
		onPressCancel: function(oEvent) {
			this._oDialog.destroy();
			this._oDialog = null;
		},
		onPressOKCreate: function(oEvent) {
			this.getModel().submitChanges({

				success: function(oData) {

					sap.m.MessageToast.show("awdawd");

				},

				error: function(oError) {}

			});
			this.onPressCancel();
		},
		PressdeleteRow: function(oEvent) {

			var index = this._oTable.getSelectedIndices();

			var a = [];
			var sMessageTosti18n = this.getView().getModel("i18n").getResourceBundle().getText("messageTostSelectError");
			var sdeletionSuccessfulStatus = this.getView().getModel("i18n").getResourceBundle().getText("deletionSuccessful");
			var sDeletionErrorSelected = this.getView().getModel("i18n").getResourceBundle().getText("deletionErrorSelected");
			for (var i = 0; i < index.length; i++) {
				var oSelectedContexts = this._oTable.getContextByIndex(index[i])
				a.push(oSelectedContexts);
			}
			if (a.length > 0) {
				var aPromise = a.map(function(oItem) {

					return this.removeP(oItem.getPath());

				}.bind(this));
				Promise.all(aPromise).then(function(aData) {
					sap.m.MessageBox.show(sdeletionSuccessfulStatus, {
						icon: sap.m.MessageBox.Icon.SUCCESS,
						title: "Success!"
					});
				}).catch(function() {
					sap.m.MessageBox.show(sdeletionSuccessfulStatus, {
						icon: sap.m.MessageBox.Icon.ERROR,
						title: "Failed!"
					});
				});

			} else {
				sap.m.MessageBox.show(sDeletionErrorSelected, {
					icon: sap.m.MessageBox.Icon.WARNING,
					title: "Note!"
				});
			}

		},
		removeP: function(sPath, mParameters) {
			return new Promise(function(fnResolve, fnReject) {
				var mRequestProps = jQuery.extend(true, {
					success: fnResolve,
					error: fnReject
				}, mParameters);

				this.getView().getModel().remove(sPath, mRequestProps);
			}.bind(this));
		},

		_onMetadataLoaded: function() {
			// Store original busy indicator delay for the detail view
			var iOriginalViewBusyDelay = this.getView().getBusyIndicatorDelay(),
				oViewModel = this.getModel("detailView");

			// Make sure busy indicator is displayed immediately when
			// detail view is displayed for the first time
			oViewModel.setProperty("/delay", 0);

			// Binding the view will set it to not busy - so the view is always busy if it is not bound
			oViewModel.setProperty("/busy", true);
			// Restore original busy indicator delay for the detail view
			oViewModel.setProperty("/delay", iOriginalViewBusyDelay);
		}

	});

});