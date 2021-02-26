/*global QUnit*/

jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

// We cannot provide stable mock data out of the template.
// If you introduce mock data, by adding .json files in your webapp/localService/mockdata folder you have to provide the following minimum data:
// * At least 3 zjblessons_base_Groups in the list

sap.ui.require([
	"sap/ui/test/Opa5",
	"MySecondProject/MySecondProject/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"MySecondProject/MySecondProject/test/integration/pages/App",
	"MySecondProject/MySecondProject/test/integration/pages/Browser",
	"MySecondProject/MySecondProject/test/integration/pages/Master",
	"MySecondProject/MySecondProject/test/integration/pages/Detail",
	"MySecondProject/MySecondProject/test/integration/pages/NotFound"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "MySecondProject.MySecondProject.view."
	});

	sap.ui.require([
		"MySecondProject/MySecondProject/test/integration/MasterJourney",
		"MySecondProject/MySecondProject/test/integration/NavigationJourney",
		"MySecondProject/MySecondProject/test/integration/NotFoundJourney",
		"MySecondProject/MySecondProject/test/integration/BusyJourney"
	], function () {
		QUnit.start();
	});
});