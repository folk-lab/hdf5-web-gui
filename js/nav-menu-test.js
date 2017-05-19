/*global $*/
'use strict';


// The global variables for this applicaiton
var NAV_MENU_TEST = {

        sideNavWidth : "350px",
        menuIsPinned : false,
        menuIsOpen : false,

        openNav : function () {
            document.getElementById("sideNav").style.width =
                NAV_MENU_TEST.sideNavWidth;

            if (NAV_MENU_TEST.menuIsPinned) {

                // Slide page content out so that it is not hidden my the menu
                document.getElementById("main").style.marginLeft =
                    NAV_MENU_TEST.sideNavWidth;

            }

            NAV_MENU_TEST.menuIsOpen = true;
        },

        closeNav : function () {

            // Hide the menu
            document.getElementById("sideNav").style.width = "0";

            // Set page content to the left
            document.getElementById("main").style.marginLeft = "0px";

            NAV_MENU_TEST.menuIsOpen = false;
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
                document.getElementById("main").style.marginLeft =
                    NAV_MENU_TEST.sideNavWidth;

            } else {

                document.getElementById("main").style.marginLeft = "0px";
                // NAV_MENU_TEST.closeNav();

            }

            console.log('pinMenu: ' + pinMenu);
        },

    };
