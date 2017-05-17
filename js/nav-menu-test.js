/*global $*/
'use strict';


// The global variables for this applicaiton
var NAV_MENU_TEST = {

        menuIsPinned : false,

        openNav : function () {
            document.getElementById("mySidenav").style.width = "250px";
        },

        closeNav : function () {
            document.getElementById("mySidenav").style.width = "0";

            if (NAV_MENU_TEST.menuIsPinned) {
                document.getElementById("main").style.marginLeft = "0px";
                NAV_MENU_TEST.menuIsPinned = !NAV_MENU_TEST.menuIsPinned;
            }
        },

        pinNav : function () {
            document.getElementById("main").style.marginLeft = "250px";

            if (NAV_MENU_TEST.menuIsPinned) {
                NAV_MENU_TEST.closeNav();
                document.getElementById("main").style.marginLeft = "0px";
            }

            NAV_MENU_TEST.menuIsPinned = !NAV_MENU_TEST.menuIsPinned;

        },

    };
