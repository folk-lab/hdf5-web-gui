/*global $*/
'use strict';

// External libraries
var FILE_NAV, CAS_TICKET, AJAX_SPINNER, DATA_DISPLAY,

    // The gloabl variables for this applicaiton
    THEME_TOGGLE = {

        useDarkTheme : false,

        toggleTheme : function (useDarkTheme) {
            document.body.className = "darkTheme";

            var debug = true;

            if (debug) {
                console.log('useDarkTheme: ' + useDarkTheme);
            }

            if (useDarkTheme === undefined) {
                THEME_TOGGLE.useDarkTheme = !THEME_TOGGLE.useDarkTheme;
            } else {
                THEME_TOGGLE.useDarkTheme = useDarkTheme;
            }

            DATA_DISPLAY.useDarkTheme = THEME_TOGGLE.useDarkTheme;
            FILE_NAV.useDarkTheme = THEME_TOGGLE.useDarkTheme;

            if (debug) {
                console.log('THEME_TOGGLE.useDarkTheme: ' +
                    THEME_TOGGLE.useDarkTheme);
            }

            if (THEME_TOGGLE.useDarkTheme) {
                if (debug) {
                    console.log('Dark Theme!');
                }

                // $("#themeToggleButton").html('Light Theme');
                $("body").addClass('darkTheme');

            } else {
                if (debug) {
                    console.log('Light Theme!');
                }

                // $("#themeToggleButton").html('Dark Theme');
                $("body").removeClass('darkTheme');

            }
        },
    };
