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

                        // Save login information
                        CAS_AUTH.isLoggedIn = isLoggedInTicket;

                        // Get data directory contents
                        FILE_NAV.getRootDirectoryContents();

                        // Wait until DOM items are in place before doing a few
                        // things
                        $(document).ready(function () {

                            // Show or hide various items
                            CAS_AUTH.toggleLoginButton();

                            // Welcome!
                            PAGE_LOAD.displayWelcomeMessage();
                        });
                    }
                }
            );

        },


        // Get the body contents from a separate file - might save a little
        // time?
        fillBody : function () {
            $.ajax({
                url: "../html/body.html",
                success: function (data) {
                    $('body').append(data);
                    $.holdReady(false);
                },
                dataType: 'html',
            });
        },


        loadCSS : function (cssFileUrl) {
            // $.ajax({
            //     url: "../css/index.css",
            //     success: function (data) {
            //         $("head").append("<style>" + data + "</style>");
            //     },
            //     dataType: "script",
            //     async: true,
            // });
            $('<link>').appendTo('head').attr({
                type: 'text/css',
                rel: 'stylesheet',
                href: cssFileUrl,
            });
        },

        loadCSSFiles : function () {

            var cssFiles = [
                '../lib/css/bootstrap/3.3.7/css/bootstrap.min.css',
                '../lib/css/jstree/3.2.1/themes/default/style.min.css',
                '../lib/css/bootstrap-slider/9.7.0/bootstrap-slider.min.css',
                '../lib/css/jasny-bootstrap/3.1.3/jasny-bootstrap.min.css',
                '../css/index.css',
                '../css/navmenu.css'];

            cssFiles.forEach(function (file) {
                PAGE_LOAD.loadCSS(file);
            });

        },



        loadJavaScriptScripts : function (group) {
            var promises = [], scripts = [];

            if (group === 1) {
                scripts = [
                    "../js/file-navigation.js",
                ];
            }
            if (group === 2) {
                scripts = [
                    "../lib/js/plotly/plotly-latest.min.js",
                ];
            }
            if (group === 3) {
                scripts = [
                    "../lib/js/bootstrap/3.3.7/js/bootstrap.min.js",
                    "../lib/js/jstree/3.2.1/jstree.min.js",
                    "../lib/js/jasny-bootstrap/3.1.3/jasny-bootstrap.min.js",
                    "../lib/js/bootstrap-slider/9.7.0/bootstrap-slider.min.js",
                ];
            }
            if (group === 4) {
                scripts = [
                    "../js/ajax-spinner.js",
                    "../js/data-display.js",
                    "../js/handle-dataset.js",
                ];
            }

            scripts.forEach(function (script) {
                promises.push($.getScript(script));
            });

            return $.when.apply(null, promises).done(function () {
                console.log('All Done!');
                return true;
            });

        },


        displayWelcomeMessage : function () {

            var messageRow1, messageRow2,
                color = '#3a74ad';

            if (CAS_AUTH.isLoggedIn) {

                messageRow1 = 'Welcome ' + CAS_AUTH.displayName + '!';
                messageRow2 = '(click stuff on the left)';

            } else {
                // This will presumably never be shown if the automatic login
                // is being used and is working properly
                messageRow1 = 'Welcome!';
                messageRow2 = '(Login to view data)';

                console.log('No CAS cookie');
            }

            DATA_DISPLAY.drawText(messageRow1,
                messageRow2, color);

            AJAX_SPINNER.showLoadingSpinner(false, 50);
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
});

$.holdReady(true);
PAGE_LOAD.hello();
PAGE_LOAD.initialPageLoad(true);
