/*global QUnit*/

jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

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
		"MySecondProject/MySecondProject/test/integration/NavigationJourneyPhone",
		"MySecondProject/MySecondProject/test/integration/NotFoundJourneyPhone",
		"MySecondProject/MySecondProject/test/integration/BusyJourneyPhone"
	], function () {
		QUnit.start();
	});
});