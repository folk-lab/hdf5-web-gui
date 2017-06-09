/*global $*/
'use strict';

// External libraries
var FILE_NAV, CAS_TICKET, AJAX_SPINNER, DATA_DISPLAY, Plotly,

    // The gloabl variables for this applicaiton
    THEME_TOGGLE = {

        useDarkTheme : false,

        toggleTheme : function (useDarkTheme) {

            var debug = false;

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

                // Image series buttons
                $("#startButton").addClass('btn-darkTheme');
                $("#endButton").addClass('btn-darkTheme');
                $("#plusButton").addClass('btn-darkTheme');
                $("#minusButton").addClass('btn-darkTheme');
                $("#inputNumberDiv").addClass('btn-darkTheme');

                // Side menu
                $("#sideNav").addClass('sidenav-darkTheme');

                // Nav bar
                $("#navbar").addClass('navbar-darkTheme');
                $("#data-storage-button").addClass('navbarbtn-darkTheme');
                $("#logout-btn").addClass('navbarbtn-darkTheme');
                $("#theme-toggle-btn").addClass('navbarbtn-darkTheme');

                // Plot control
                $("#plotControlColor").addClass('navbarbtn-darkTheme');
                $("#plotControlLog").addClass('navbarbtn-darkTheme');
                $("#plotControlType").addClass('navbarbtn-darkTheme');
                $("#plotControlReset").addClass('navbarbtn-darkTheme');
                $("#plotControlDownload").addClass('navbarbtn-darkTheme');
                $("#plot-type-list").addClass('dropdown-content-darkTheme');
                $("#color-scale-list").addClass('dropdown-content-darkTheme');

            } else {

                $("body").removeClass('darkTheme');

                // Image series buttons
                $("#startButton").removeClass('btn-darkTheme');
                $("#endButton").removeClass('btn-darkTheme');
                $("#plusButton").removeClass('btn-darkTheme');
                $("#minusButton").removeClass('btn-darkTheme');
                $("#inputNumberDiv").removeClass('btn-darkTheme');

                // Side menu
                $("#sideNav").removeClass('sidenav-darkTheme');

                // Nav bar
                $("#navbar").removeClass('navbar-darkTheme');
                $("#data-storage-button").removeClass('navbarbtn-darkTheme');
                $("#logout-btn").removeClass('navbarbtn-darkTheme');
                $("#theme-toggle-btn").removeClass('navbarbtn-darkTheme');

                // Plot control
                $("#plotControlColor").removeClass('navbarbtn-darkTheme');
                $("#plotControlLog").removeClass('navbarbtn-darkTheme');
                $("#plotControlType").removeClass('navbarbtn-darkTheme');
                $("#plotControlReset").removeClass('navbarbtn-darkTheme');
                $("#plotControlDownload").removeClass('navbarbtn-darkTheme');
                $("#plot-type-list").removeClass('dropdown-content-darkTheme');
                $("#color-scale-list").removeClass(
                    'dropdown-content-darkTheme'
                );

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

            // Changec color choice - 'Hot' looks nicer in a dark theme I think
            if (DATA_DISPLAY.useDarkTheme) {
                DATA_DISPLAY.changeColor('Hot');
            } else {
                DATA_DISPLAY.changeColor('Picnic');
            }

            // The easiest solution for images and lines seems to be just to
            // redraw everything - slower, but it avoids many issues..
            if (DATA_DISPLAY.displayType === 'image') {

                DATA_DISPLAY.showPlotCanvas();
                DATA_DISPLAY.calculatePlotSize();
                if (DATA_DISPLAY.plotDimension === 2) {
                    DATA_DISPLAY.draw2DPlot();
                } else {
                    DATA_DISPLAY.draw3DPlot();
                }
            // Lines
            } else if (DATA_DISPLAY.displayType === 'line') {

                DATA_DISPLAY.showPlotCanvas();
                DATA_DISPLAY.calculatePlotSize();
                DATA_DISPLAY.drawLine(DATA_DISPLAY.lineValues,
                    DATA_DISPLAY.lineTitle);
            // Text
            } else {

                if (DATA_DISPLAY.plotExists) {
                    Plotly.relayout(
                        DATA_DISPLAY.plotCanvasDiv,
                        {
                            // Plotting canvas colors
                            "paper_bgcolor" : (useDarkTheme === true ?
                                    "#181817" : "#ffffff"),
                            "plot_bgcolor" : (useDarkTheme === true ? "#181817"
                                : "#ffffff"),
                        }
                    );
                }

            }

        },


        // Trying to use retyle to change all the colors in image plots
        // without redrawing everything - so far unsuccessful
        plotThemeRestyle : function (useDarkTheme) {

            var debug = true;

            // Restyle the plot, if necessary
            if (DATA_DISPLAY.plotCanvasDiv.layout) {
                if (debug) {
                    console.log('calling Plotly.relayout');
                }

                Plotly.relayout(DATA_DISPLAY.plotCanvasDiv,
                    {
                        // Plotting canvas colors
                        "paper_bgcolor" : (useDarkTheme === true ? "#181817" :
                                "#ffffff"),
                        "plot_bgcolor" : (useDarkTheme === true ? "#181817" :
                                "#ffffff"),

                        // 2D plots
                        "xaxis" : {
                            "titlefont" : {
                                "color" : (DATA_DISPLAY.useDarkTheme === true ?
                                        "#999" : "#000000"),
                            },
                            "tickfont" : {
                                "color" : (DATA_DISPLAY.useDarkTheme === true ?
                                        "#999" : "#000000"),
                            },
                            // Strange: need to set ranges and domain when
                            // setting font colors...
                            "domain" : [0, 0.85],
                            "range" : [
                                DATA_DISPLAY.imageZoomSection[0] - 0.5,
                                DATA_DISPLAY.imageZoomSection[1] - 0.5],
                        },

                        "yaxis" : {
                            "titlefont" : {
                                "color" : (DATA_DISPLAY.useDarkTheme === true ?
                                        "#999" : "#000000"),
                            },
                            "tickfont" : {
                                "color" : (DATA_DISPLAY.useDarkTheme === true ?
                                        "#999" : "#000000"),
                            },
                            // Strange: need to set ranges and domain when
                            // setting font colors...
                            "domain" : [0, 0.85],
                            "range" : [
                                DATA_DISPLAY.imageZoomSection[2] - 0.5,
                                DATA_DISPLAY.imageZoomSection[3] - 0.5],
                        },
                        "xaxis2" : {
                            "titlefont" : {
                                "color" : (DATA_DISPLAY.useDarkTheme === true ?
                                        "#999" : "#000000"),
                            },
                            "tickfont" : {
                                "color" : (DATA_DISPLAY.useDarkTheme === true ?
                                        "#999" : "#000000"),
                            },
                            "domain" : [0.85, 1],
                        },

                        "yaxis2" : {
                            "titlefont" : {
                                "color" : (DATA_DISPLAY.useDarkTheme === true ?
                                        "#999" : "#000000"),
                            },
                            "tickfont" : {
                                "color" : (DATA_DISPLAY.useDarkTheme === true ?
                                        "#999" : "#000000"),
                            },
                            "domain" : [0.85, 1],
                        },

                        // 3D plots
                        /*
                        "scene" : {
                            "xaxis" : {
                                "title" : "x",
                                "titlefont" : {
                                    "color" : (DATA_DISPLAY.useDarkTheme ===
                                        true ?  "#999" : "#000000"),
                                },
                                "tickfont" : {
                                    "color" : (DATA_DISPLAY.useDarkTheme ===
                                        true ?  "#999" : "#000000"),
                                },
                            },
                            "yaxis" : {
                                "title" : "y",
                                "titlefont" : {
                                    "color" : (DATA_DISPLAY.useDarkTheme ===
                                        true ?  "#999" : "#000000"),
                                },
                                "tickfont" : {
                                    "color" : (DATA_DISPLAY.useDarkTheme ===
                                        true ?  "#999" : "#000000"),
                                },
                            },
                            "zaxis" : {
                                "title" : "z",
                                "titlefont" : {
                                    "color" : (DATA_DISPLAY.useDarkTheme ===
                                        true ?  "#999" : "#000000"),
                                },
                                "tickfont" : {
                                    "color" : (DATA_DISPLAY.useDarkTheme ===
                                        true ?  "#999" : "#000000"),
                                },
                                "type" : "linear",
                                "autorange" : true
                            }
                        },
                        */
                    }
                    );
            }

        }

    };
