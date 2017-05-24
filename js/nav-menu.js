/*global $*/
'use strict';


// The global variables for this applicaiton
var DATA_DISPLAY,
    NAV_MENU_TEST = {

        sideNavWidth : "350px",
        // menuIsPinned : false,
        menuIsPinned : true,
        menuIsOpen : false,

        menuButton : function () {

            if (NAV_MENU_TEST.menuIsOpen) {
                NAV_MENU_TEST.closeNav();
            } else {
                NAV_MENU_TEST.openNav();
            }
        },


        openNav : function () {
            document.getElementById("sideNav").style.width =
                NAV_MENU_TEST.sideNavWidth;

            if (NAV_MENU_TEST.menuIsPinned) {

                // Slide page content out so that it is not hidden my the menu
                document.getElementById(
                    "applicationContainer"
                ).style.marginLeft = NAV_MENU_TEST.sideNavWidth;
            }

            NAV_MENU_TEST.menuIsOpen = true;

            DATA_DISPLAY.redrawPlotCanvas(300);
        },

        closeNav : function () {

            // Hide the menu
            document.getElementById("sideNav").style.width = "0";

            // Set page content to the left
            document.getElementById(
                "applicationContainer"
            ).style.marginLeft = "0px";

            NAV_MENU_TEST.menuIsOpen = false;

            DATA_DISPLAY.redrawPlotCanvas(300);
        },

        pinNav : function () {

            var pinMenu;

            console.log('NAV_MENU_TEST.menuIsPinned: ' +
                NAV_MENU_TEST.menuIsPinned);

            // If not pinned, pin it.
            pinMenu = !NAV_MENU_TEST.menuIsPinned;

            /// Change the state of the pin
            NAV_MENU_TEST.menuIsPinned = !NAV_MENU_TEST.menuIsPinned;
            $('#pinBtn').toggleClass("down");

            if (pinMenu) {

                // Slide page content out so that it is not hidden my the menu
                document.getElementById(
                    "applicationContainer"
                ).style.marginLeft = NAV_MENU_TEST.sideNavWidth;

            } else {

                document.getElementById(
                    "applicationContainer"
                ).style.marginLeft = "0px";

            }

            console.log('pinMenu: ' + pinMenu);
        },

    };
