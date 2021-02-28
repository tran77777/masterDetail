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
				title: "",
				inputValue: "",
				mode: "",
				updatePath: "",
				label: "",
				nameField: "",
				idField: ""
			}
		}),

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		onInit: function() {

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
				this.getModel("detailView").setProperty("/dialog/idField", this._oSmartTable.getEntitySet().slice(16, -1) + "ID");
				this.getModel("detailView").setProperty("/dialog/nameField", this._oSmartTable.getEntitySet().slice(16, -1) + "Text");
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

					pressed: "{detailView>/button/pressed/ChangeSelectionMode}",
					press: this.onPressOnChangeSelectMode.bind(this)
				}),
				new Button({
					text: "{i18n>infSelectedItems} {detailView>/table/selectedItemsCount}",
					tooltip: "{i18n>ttResetSelections}",
					type: "Default",

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

				}),
				new ObjectStatus({
					text: "{i18n>infDeactivatedModeOn}",
					inverted: true,
					state: "Warning",
					visible: "{detailView>/button/pressed/ChangeVersionMode}"
				}),
				new ToolbarSpacer(),
				new OverflowToolbarButton({

					icon: "{i18n>iCreate}",
					type: "Default",
					tooltip: "{i18n>ttCreate}",
					text: "{i18n>ttCreate}",

					visible: "{detailView>/button/visible/Create}",
					enabled: "{= !${detailView>/button/pressed/ChangeVersionMode} }",
					press: this.onCreatePress.bind(this)

				}),
				new OverflowToolbarButton({

					icon: "{i18n>iCopy}",
					type: "Default",
					tooltip: "{i18n>ttCopy}",
					text: "{i18n>ttCopy}",

					visible: "{detailView>/button/visible/Copy}",
					enabled: "{= (${detailView>/table/selectedItemsCount} === 1) && !${detailView>/button/pressed/ChangeVersionMode} }",
					press: this.onPressCopy.bind(this)
				}),
				new OverflowToolbarButton({

					icon: "{i18n>iRefresh}",
					type: "Default",
					tooltip: "{i18n>ttRefresh}",

					text: "{i18n>ttRefresh}",
					visible: "{detailView>/button/visible/Refresh}",
					press: this.onRefreshTable.bind(this)
				}),
				new OverflowToolbarButton({

					text: "{= (${detailView>/button/pressed/ChangeVersionMode}) ? ${i18n>ttDelete} : ${i18n>ttDeactivate}}",
					tooltip: "{= (${detailView>/button/pressed/ChangeVersionMode}) ? ${i18n>ttDelete} : ${i18n>ttDeactivate}}",
					icon: "{= (${detailView>/button/pressed/ChangeVersionMode}) ? ${i18n>iDelete} : ${i18n>iDeactivate}}",
					visible: "{detailView>/button/visible/DeactivateDelete}",
					type: "Default",

					enabled: "{= ${detailView>/table/selectedItemsCount} > 0 }",
					press: this.onPressDeactivateDeleteButton.bind(this)
				}),
				new OverflowToolbarButton({

					icon: "{i18n>iRestore}",
					type: "Default",
					tooltip: "{i18n>ttRestore}",
					text: "{i18n>ttRestore}",

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
			this._oSmartTable.setHeader(this.getResourceBundle().getText("tableHeader"))
			this._oTable.setSelectionMode("Single");
			this._oTable.setSelectionBehavior("Row");
			this._oTable.attachRowSelectionChange(this.onSelectionChange.bind(this));

			this.getModel("detailView").setProperty("/table/selectedItemsCount", 0);
			this.getModel("detailView").setProperty("/table/selectionMode", "Single");
			this.getModel("detailView").setProperty("/button/pressed/ChangeSelectionMode", false);
			this.getModel("detailView").setProperty("/button/pressed/ChangeVersionMode", false);

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
		onActionPress: function(oEvent) {

			var bUpdateMode = this.getModel("detailView").getProperty("/dialog/mode") === "update";
			if (bUpdateMode) {

				this._onUpdate();

			} else {
				var oModel = this.getOwnerComponent().getModel();
				var infoMB = this.getView().getModel("i18n").getResourceBundle().getText("statusSuccess");
				var sStatusSuccessi18n = this.getView().getModel("i18n").getResourceBundle().getText("StatusSuccessful");
				var sEntitySet = "/" + this._oSmartTable.getEntitySet();
				var idField = this.getModel("detailView").getProperty("/dialog/idField");
				var nameField = this.getModel("detailView").getProperty("/dialog/nameField");
				var item = {

					Version: "A",
					Language: "RU"

				}

				item[idField] = "";
				item[nameField] = this.getModel("detailView").getProperty("/dialog/inputValue");
				oModel.create(sEntitySet, item, {
					success: function() {
						sap.m.MessageBox.show(sStatusSuccessi18n, {
							icon: sap.m.MessageBox.Icon.SUCCESS,
							title: infoMB
						});

					}

				});

				this.onPressCancel();
			}
		},
		onCreatePress: function() {
			this.getModel("detailView").setProperty("/dialog/mode", "create");
			this.onPressCreateDialog();
		},
		onUpdatePress: function(oEvent) {
			this.getModel("detailView").setProperty("/dialog/mode", "update");
			var sPath = oEvent.getSource().getBindingContext().getPath();
			this.getModel("detailView").setProperty("/dialog/updatePath", sPath);
			this.onPressCreateDialog(sPath);
		},
		onPressCopy: function() {
			this.getModel("detailView").setProperty("/dialog/mode", "copy");
			var sPath = this._oTable.getContextByIndex(this._oTable.getSelectedIndex()).getPath();
			this.onPressCreateDialog(sPath);
		},

		onPressCreateDialog: function(sPath, oEvent) {

			var sPath =  sPath;
			this.getModel("detailView").setProperty("/dialog/inputValue", "")
			var oView = this.getView();
			var sMode = this.getModel("detailView").getProperty("/dialog/mode");
			var nameField = this.getModel("detailView").getProperty("/dialog/nameField");
			if (sMode === "update" || sMode === "copy") {

				var sValueField = this.getView().getModel().getProperty(sPath)[nameField];
				this.getModel("detailView").setProperty("/dialog/inputValue", sValueField);
			}
					Fragment.load({
					id: oView.getId(),
					name: "MySecondProject.MySecondProject.view.CreateDialog",
					controller: this
				})
				.then(oDialog => {
					debugger
					this.getView().addDependent(oDialog);

					oDialog.setTitle(sMode.toUpperCase() +" "+ this.getResourceBundle().getText("MasterTitle"));
					oDialog.setModel(this.getModel("detailView"));
					this.getView().byId("label").setText(nameField);
					this.getView().byId("input").bindProperty("value", {
						path: "detailView>/dialog/inputValue"
					});
					oDialog.open();

					this._oDialog = oDialog;
				});
		},
		onCloseDialog: function() {

			this.byId("createDialog").close();
		},

		onSelectionChange: function() {
			this.getModel("detailView").setProperty("/table/selectedItemsCount", this._oTable.getSelectedIndices().length);

		},
		onPressDeactivateDeleteButton: function(oEvent) {

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
								MessageToast.show(this.getResourceBundle().getText("StatusSuccessful"));
								this._oTable.clearSelection();
							}
						});
					}
				}
			});

		},
		onRefreshTable: function() {
			this._oSmartTable.rebindTable(true);
			MessageToast.show(this.getResourceBundle().getText("StatusSuccessful"));
		},
		onPressOnChangeSelectMode: function(oEvent) {

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

		onPressCancel: function(oEvent) {
			this._oDialog.destroy();
			this._oDialog = null;
		},
		_onUpdate: function(oEvent) {
			var sPath = this.getModel("detailView").getProperty("/dialog/updatePath");
			var nameField = this.getModel("detailView").getProperty("/dialog/nameField");
			var sI18nStatusAcionSuccess = this.getResourceBundle().getText("messageBoxUpdateSuccess")
			var sInputValue = this.getView().getModel("detailView").getProperty("/dialog/inputValue");
			this.getModel().setProperty(sPath + "/" + nameField, sInputValue)
			this.getModel().submitChanges({

				success: function(oData) {

					sap.m.MessageToast.show(sI18nStatusAcionSuccess);

				},

				error: function(oError) {}

			});
			this.onPressCancel();
		},
		PressdeleteRow: function(oEvent) {

			var index = this._oTable.getSelectedIndices();

			var a = [];
			var sMessageTosti18n = this.getView().getModel("i18n").getResourceBundle().getText("messageTostSelectError");
			var StatusSuccessful = this.getView().getModel("i18n").getResourceBundle().getText("StatusSuccessful");
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
					this._oTable.clearSelection();
					sap.m.MessageBox.show(StatusSuccessful, {
						icon: sap.m.MessageBox.Icon.SUCCESS,
						title: this.getResourceBundle().getText("statusSuccess")
					});
				}).catch(function() {
					sap.m.MessageBox.show(StatusSuccessful, {
						icon: sap.m.MessageBox.Icon.SUCCESS,
						title: this.getResourceBundle().getText("statusSuccess")
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

			var iOriginalViewBusyDelay = this.getView().getBusyIndicatorDelay(),
				oViewModel = this.getModel("detailView");

			oViewModel.setProperty("/delay", 0);

			oViewModel.setProperty("/busy", true);

			oViewModel.setProperty("/delay", iOriginalViewBusyDelay);
		}

	});

});