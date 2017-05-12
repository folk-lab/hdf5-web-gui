/*global $*/
'use strict';

// External libraries
var FILE_NAV, CAS_TICKET, AJAX_SPINNER, DATA_DISPLAY, Plotly,

    // The gloabl variables for this applicaiton
    THEME_TOGGLE = {

        useDarkTheme : false,

        toggleTheme : function (useDarkTheme) {
            document.body.className = "darkTheme";

            var debug = true;

            // See if this is a toggle or if a particular theme has been
            // selected
            if (useDarkTheme === undefined) {
                THEME_TOGGLE.useDarkTheme = !THEME_TOGGLE.useDarkTheme;
            } else {
                THEME_TOGGLE.useDarkTheme = useDarkTheme;
            }

            if (debug) {
                console.log('useDarkTheme: ' + useDarkTheme);
                console.log('THEME_TOGGLE.useDarkTheme: ' +
                    THEME_TOGGLE.useDarkTheme);
            }

            // Toggle the theme for various parts of the application
            THEME_TOGGLE.pageElementsThemeToggle(THEME_TOGGLE.useDarkTheme);
            THEME_TOGGLE.fileTreeThemeToggle(THEME_TOGGLE.useDarkTheme);
            THEME_TOGGLE.plottingThemeToggle(THEME_TOGGLE.useDarkTheme);

        },


        pageElementsThemeToggle : function (useDarkTheme) {

            var debug = true;

            if (debug) {
                console.log('useDarkTheme: ', useDarkTheme);
            }

            // Set theme for html elements
            if (useDarkTheme) {

                $("body").addClass('darkTheme');

                $("#logPlotButton").addClass('btn-darkTheme');
                $("#selectColorScheme").addClass('btn-darkTheme');
                $("#selectPlotType").addClass('btn-darkTheme');

                $("#navMenu").addClass('navmenu-inverse');
                $("#navMenu").removeClass('navmenu-default');

            } else {

                $("body").removeClass('darkTheme');

                $("#logPlotButton").removeClass('btn-darkTheme');
                $("#selectColorScheme").removeClass('btn-darkTheme');
                $("#selectPlotType").removeClass('btn-darkTheme');

                $("#navMenu").removeClass('navmenu-inverse');
                $("#navMenu").addClass('navmenu-default');

            }
        },


        fileTreeThemeToggle : function (useDarkTheme) {

            var debug = true, currentTheme;

            if (debug) {
                console.log('useDarkTheme: ', useDarkTheme);
            }

            // Set theme for file tree
            FILE_NAV.useDarkTheme = useDarkTheme;

            $('#jstree_div').jstree(true).set_theme(
                FILE_NAV.useDarkTheme === true ? "default-dark" : "default"
            );

            if (debug) {
                currentTheme = $('#jstree_div').jstree(true).get_theme();
                console.log('currentTheme: ' + currentTheme);
            }

        },


        plottingThemeToggle : function (useDarkTheme) {

            var debug = true;

            if (debug) {
                console.log('useDarkTheme: ', useDarkTheme);
            }

            // Set theme for plotting canvases
            DATA_DISPLAY.useDarkTheme = useDarkTheme;

            // Restyle the plot, if necessary

            if (DATA_DISPLAY.plotCanvasDiv.layout) {
                if (debug) {
                    console.log('calling Plotly.relayout');
                }

                Plotly.relayout(DATA_DISPLAY.plotCanvasDiv, {
                    "paper_bgcolor" : (useDarkTheme === true ? "#181817" :
                            "#ffffff"),
                    "plot_bgcolor" : (useDarkTheme === true ? "#181817" :
                            "#ffffff"),
                });
            }

        }

    };
