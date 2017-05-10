/*global $*/
'use strict';

// External libraries
var FILE_NAV, CAS_TICKET, AJAX_SPINNER, DATA_DISPLAY,

    // The gloabl variables for this applicaiton
    THEME_TOGGLE = {

        useDarkTheme : false,

        toggleTheme : function (useDarkTheme) {
            document.body.className = "darkTheme";

            var debug = true, currentTheme;

            // See if this is a toggle or if a particular theme has been
            // selected
            if (debug) {
                console.log('useDarkTheme: ' + useDarkTheme);
            }

            if (useDarkTheme === undefined) {
                THEME_TOGGLE.useDarkTheme = !THEME_TOGGLE.useDarkTheme;
            } else {
                THEME_TOGGLE.useDarkTheme = useDarkTheme;
            }

            // Set theme for plotting canvases
            DATA_DISPLAY.useDarkTheme = THEME_TOGGLE.useDarkTheme;

            // Set theme for file tree
            FILE_NAV.useDarkTheme = THEME_TOGGLE.useDarkTheme;

            currentTheme = $('#jstree_div').jstree(true).get_theme();
            console.log('currentTheme: ' + currentTheme);

            $('#jstree_div').jstree(true).set_theme(
                FILE_NAV.useDarkTheme === true ? 'default-dark' : 'default'
            );

            if (debug) {
                console.log('THEME_TOGGLE.useDarkTheme: ' +
                    THEME_TOGGLE.useDarkTheme);
            }

            // Set theme for html elements
            if (THEME_TOGGLE.useDarkTheme) {

                if (debug) {
                    console.log('Dark Theme!');
                }

                $("body").addClass('darkTheme');

            } else {

                if (debug) {
                    console.log('Light Theme!');
                }

                $("body").removeClass('darkTheme');

            }
        },
    };
