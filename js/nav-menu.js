/*global $*/
'use strict';


// The global variables for this applicaiton
var DATA_DISPLAY,

    NAV_MENU = {

        "sideNavWidth" : "350px",
        "displayOffsetWidth" : "355px",
        "loaderOffsetWidth" : "55px",
        "menuIsPinned" : true,
        "menuIsOpen" : false,
        "displayContainer" : "displayContainer",
        "loaderContainer" : "loader",
        "sideNavMenu" : "sideNav",
        "mobileView" : undefined,


        // If the menu button is pressed
        menuButton : function () {

            if (NAV_MENU.menuIsOpen) {
                NAV_MENU.closeNav();
            } else {
                NAV_MENU.openNav();
            }
        },


        // Open the side menu
        openNav : function () {

            // Slide the menu out
            document.getElementById(NAV_MENU.sideNavMenu).style.width =
                NAV_MENU.sideNavWidth;

            NAV_MENU.mobileView = window.mobilecheck();

            if (NAV_MENU.menuIsPinned) {
                if (!NAV_MENU.mobileView) {

                    // Slide page content out so that it is not hidden by the
                    // menu
                    document.getElementById(NAV_MENU.displayContainer
                        ).style.marginLeft = NAV_MENU.displayOffsetWidth;
                    document.getElementById(NAV_MENU.loaderContainer
                        ).style.marginLeft = NAV_MENU.loaderOffsetWidth;

                    // Redraw the plot, waiting a bit for nav menu animation
                    DATA_DISPLAY.redrawPlotCanvas(300);

                }
            }

            NAV_MENU.menuIsOpen = true;
        },


        // Close the side menu
        closeNav : function () {

            // Hide the menu
            document.getElementById(NAV_MENU.sideNavMenu).style.width = "0";

            // Set page content to the left
            document.getElementById(NAV_MENU.displayContainer
                ).style.marginLeft = "0px";
            document.getElementById(NAV_MENU.loaderContainer
                ).style.marginLeft = "-75px";

            NAV_MENU.mobileView = window.mobilecheck();

            if (NAV_MENU.menuIsPinned) {
                if (!NAV_MENU.mobileView) {

                    // Redraw the plot, waiting a bit for nav menu animation
                    DATA_DISPLAY.redrawPlotCanvas(300);

                }
            }

            NAV_MENU.menuIsOpen = false;
        },


        // This is not being used at the moment, and it is not setup for mobile
        // use
        pinNav : function () {

            var pinMenu;

            console.log('NAV_MENU.menuIsPinned: ' + NAV_MENU.menuIsPinned);

            // If not pinned, pin it.
            pinMenu = !NAV_MENU.menuIsPinned;

            /// Change the state of the pin
            NAV_MENU.menuIsPinned = !NAV_MENU.menuIsPinned;
            $('#pinBtn').toggleClass("down");

            if (pinMenu) {

                // Slide page content out so that it is not hidden by the menu
                document.getElementById(NAV_MENU.displayContainer
                    ).style.marginLeft = NAV_MENU.displayOffsetWidth;
                document.getElementById(NAV_MENU.loaderContainer
                    ).style.marginLeft = NAV_MENU.loaderOffsetWidth;

            } else {

                // Set page content to the left
                document.getElementById(NAV_MENU.displayContainer
                    ).style.marginLeft = "0px";
                document.getElementById(NAV_MENU.loaderContainer
                    ).style.marginLeft = "-75px";

            }

            console.log('pinMenu: ' + pinMenu);
        },


        windowResizeEvent : function () {

            NAV_MENU.mobileView = window.mobilecheck();

            // Make sure the margins are set all the way to the left if in a
            // mobile view, otherwise errors may occur
            if (NAV_MENU.mobileView) {
                document.getElementById(NAV_MENU.displayContainer
                    ).style.marginLeft = "0px";
                document.getElementById(NAV_MENU.loaderContainer
                    ).style.marginLeft = "-75px";
            }
        }

    };


// This function fires when the browser window is resized
$(window).resize(function () {
    NAV_MENU.windowResizeEvent();
});
