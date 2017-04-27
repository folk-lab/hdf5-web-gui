/*global $*/
'use strict';

// External libraries
var SERVER_COMMUNICATION, FILE_NAV, DATA_DISPLAY, CAS_AUTH, AJAX_SPINNER,

    // The gloabl variables for this applicaiton
    PAGE_LOAD =
    {

        // This function is to be called when the page is loaded
        //  - check the url for CAS tickets
        //  - redirect to the CAS server to check login status
        //  - look for a cookie created by the HDF5 server
        //  - load the data tree or display a message
        initialPageLoad : function (automaticLogin) {

            // Check for a CAS ticket in the url
            $.when(CAS_AUTH.checkUrlForTicket()).then(
                function (isLoggedInTicket) {

                    console.log('automaticLogin:   ', automaticLogin);
                    console.log('isLoggedInTicket: ', isLoggedInTicket);

                    if (automaticLogin && !isLoggedInTicket) {

                        // Redirect to CAS server
                        //   - If not logged into CAS, login form presented
                        //   - If logged in, immediate redirect back to
                        //     service with a ticket in the url
                        CAS_AUTH.loginCAS();

                    } else {
                        // Check if a CAS cookie created by the HDF5 server
                        // exists
                        $.when(CAS_AUTH.cookieCheckServer()).then(
                            function (isLoggedInCookie) {

                                console.log('isLoggedInCookie: ',
                                    isLoggedInCookie);

                                // Save login information
                                CAS_AUTH.isLoggedIn = isLoggedInCookie;

                                PAGE_LOAD.fillBody();

                                if (isLoggedInCookie) {
                                    FILE_NAV.getRootDirectoryContents();
                                }

                                $(document).ready(function () {

                                    // Show or hide various items
                                    CAS_AUTH.toggleLoginButton();

                                    // Welcome!
                                    PAGE_LOAD.displayWelcomeMessage();
                                });
                            }
                        );
                    }
                }
            );

        },


        fillBody : function () {
            $.ajax({
                url: "../html/body.html",
                success: function (data) {
                    $('body').append(data);
                    $.holdReady(false);
                },
                dataType: 'html'
            });
        },

        loadPlotlyJS : function () {
            return $.getScript(
                "../lib/js/plotly/plotly-latest.min.js?v=201701010000"
            );
        },


        loadJavaScriptScripts : function () {
            var promises = [],
                scripts = [
                    "../lib/js/plotly/plotly-latest.min.js",
                    "../lib/js/bootstrap/3.3.7/js/bootstrap.min.js",
                    "../lib/js/jstree/3.2.1/jstree.min.js",
                    "../lib/js/jasny-bootstrap/3.1.3/jasny-bootstrap.min.js",
                    "../lib/js/bootstrap-slider/9.7.0/bootstrap-slider.min.js",
                    "../lib/js/js-cookie/js.cookie.js",
                    "../js/ajax-spinner.js",
                    "../js/file-navigation.js",
                    "../js/data-display.js",
                    "../js/handle-dataset.js",
                ];

            scripts.forEach(function (script) {
                promises.push($.getScript(script));
            });

            return $.when.apply(null, promises).done(function () {
                console.log('All Done!');
            });

        },


        displayWelcomeMessage : function () {

            // PAGE_LOAD.loadJavaScriptScripts();

            // $.when(CAS_AUTH.loadPlotlyJS()).then(
            $.when(PAGE_LOAD.loadJavaScriptScripts()).then(
                function () {

                    var messageRow1, messageRow2,
                        color = '#3a74ad';

                    if (CAS_AUTH.isLoggedIn) {

                        messageRow1 = 'Welcome ' + CAS_AUTH.displayName + '!';
                        messageRow2 = '(click stuff on the left)';

                        // FILE_NAV.getRootDirectoryContents();

                        AJAX_SPINNER.showLoadingSpinner(false, 50);
                    } else {
                        // This will presumably never be shown if the automatic
                        // login is being used and is working properly
                        messageRow1 = 'Welcome!';
                        messageRow2 = '(Login to view data)';

                        console.log('No CAS cookie');
                    }

                    DATA_DISPLAY.drawText(messageRow1,
                        messageRow2, color);
                }
            );
        },


        hello : function () {
            console.log('hey there sailor');
        },
    };


// This function fires when the page is ready
$(document).ready(function () {

    var debug = true;

    if (debug) {
        console.log('document is ready');
    }

    // CAS_AUTH.initialPageLoad(true);
});

$.holdReady(true);
PAGE_LOAD.hello();
PAGE_LOAD.initialPageLoad(true);
