/*global $*/
'use strict';

// External libraries
var SERVER_COMMUNICATION, FILE_NAV, DATA_DISPLAY, PAGE_LOAD, Cookies,

    // The gloabl variables for this applicaiton
    CAS_TICKET =
    {
        displayName : null,
        isLoggedIn : false,
        casServer : 'https://cas.maxiv.lu.se/cas',
        serviceUrl : window.location.protocol + '//' + window.location.hostname
            + '/hdf5-web-gui/html/app.html',


        // Send a CAS server ticket to the HDF5 server, which will then
        // verify the ticket and create a cookie containing CAS information
        ticketCheckServer : function (casTicket) {

            var debug = true, ticketCheckUrl =
                SERVER_COMMUNICATION.hdf5DataServer + '/ticketcheck' +
                '?ticket=' + casTicket;

            if (debug) {
                console.log('ticketCheckUrl: ' + ticketCheckUrl);
            }

            return SERVER_COMMUNICATION.ajaxRequest(ticketCheckUrl, true);
        },


        // Check the current url for ticket information and save it, then
        // remove that information from the url
        checkUrlForTicket : function () {

            var debug = true, url, queryString, queryParams = {}, param,
                params, i, ticketFound = false, casTicket;

            // Get the full url
            url = window.location.href;

            if (debug) {
                console.log('url: ' + url);
            }

            // Check if it contains CAS ticket information
            if (url.indexOf("ticket=ST") > -1) {

                if (debug) {
                    console.log('CAS ticket found?');
                }

                // Get the ticket information
                queryString = window.location.search.substring(1);
                if (debug) {
                    console.log('queryString: ' + queryString);
                }

                // Look for any parameters, save them
                params = queryString.split("&");
                for (i = 0; i < params.length; i += 1) {
                    param = params[i].split('=');
                    queryParams[param[0]] = param[1];
                }
                if (debug) {
                    console.log(queryParams);
                }

                // Create a cookie containing the ticket value
                if (queryParams.hasOwnProperty('ticket')) {
                    casTicket = queryParams.ticket;
                    ticketFound = true;
                }

                // Clean the url - get rid of eveything after the last /
                window.history.pushState({}, document.title,
                    '/hdf5-web-gui/html/');
            }

            if (ticketFound) {

                // Sending the ticket to the HDF5 server and having it
                // verified can be slow, so at the same time laod some
                // javascript.
                return $.when(
                    CAS_TICKET.ticketCheckServer(casTicket),
                    CAS_TICKET.loadJavaScriptScripts(),
                ).then(
                    function (response) {

                        // For multiple function in $.when, the responses
                        // are saved into an array - take the right one!
                        var ticektCheckResponse = response[0];

                        // Save the login name
                        if (ticektCheckResponse.hasOwnProperty('displayName')) {
                            CAS_TICKET.displayName =
                                ticektCheckResponse.displayName;
                        }

                        // Save the login status
                        if (ticektCheckResponse.hasOwnProperty('displayName')) {
                            CAS_TICKET.isLoggedIn = ticektCheckResponse.message;
                        }

                        if (debug) {
                            console.log('CAS_TICKET.isLoggedIn:  ' +
                                CAS_TICKET.isLoggedIn);
                            console.log('First name: ' +
                                CAS_TICKET.displayName);
                        }

                        // Continue with loading the rest of the page
                        if (CAS_TICKET.isLoggedIn) {
                            PAGE_LOAD.initialPageLoad2(true);
                            CAS_TICKET.loadCSSFiles();
                        }

                        return CAS_TICKET.isLoggedIn;
                    }
                );

            }

            if (debug) {
                console.log('No CAS ticket found in url');
            }

            return undefined;
        },


        // Load javascript files on-demand
        loadJavaScriptScripts : function () {

            var debug = false, promises = [], scripts = [];

            scripts = [
                "../lib/js/bootstrap/3.3.7/js/bootstrap.min.js",
                "../lib/js/bootstrap-slider/9.7.0/bootstrap-slider.min.js",
                "../lib/js/jstree/3.2.1/jstree.min.js",
                "../lib/js/jasny-bootstrap/3.1.3/jasny-bootstrap.min.js",
                "../js/file-navigation.js",
                "../js/data-display.js",
                "../js/ajax-spinner.js",
                "../js/cas-authentication.js",
                "../js/page-load.js",
                "../js/handle-dataset.js",
            ];

            scripts.forEach(function (script) {
                promises.push($.getScript(script));
            });

            return $.when.apply(null, promises).done(function () {
                if (debug) {
                    console.log('All done loading javascript!');
                }

                // Allow the loader to be shown again
                // AJAX_SPINNER.hideLoader = false;

                return true;
            });

        },

        loadCSS : function (cssFileUrl) {
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
                '../css/navmenu.css'
            ];

            cssFiles.forEach(function (file) {
                CAS_TICKET.loadCSS(file);
            });

        },

        //
        // Depending on login status, show the login or logout buttons and
        // the file browsing menu
        toggleLoginButton : function () {

            var i, debug = false, alwaysShow = ['#navMenu', '#navMenuMobile'],
                whenLoggedInShow = ['#logoutButton', '#logoutButtonMobile',
                '#treeSectionDiv', '#plotContainer'],
                whenLoggedOutShow = ['#loginButton', '#loginButtonMobile'];

            if (debug) {
                console.log('CAS_TICKET.isLoggedIn: ' + CAS_TICKET.isLoggedIn);
            }


            // Some thigs are initially hidden, as they look ugly without
            // the proper js and css loaded, but they should be shown
            for (i = 0; i < alwaysShow.length; i += 1) {
                $(alwaysShow[i]).show();
            }

            // Show or hide the login & logout related items
            if (CAS_TICKET.isLoggedIn) {
                for (i = 0; i < whenLoggedInShow.length; i += 1) {
                    $(whenLoggedInShow[i]).show();
                }
                for (i = 0; i < whenLoggedOutShow.length; i += 1) {
                    $(whenLoggedOutShow[i]).hide();
                }
            } else {
                for (i = 0; i < whenLoggedInShow.length; i += 1) {
                    $(whenLoggedInShow[i]).hide();
                }
                for (i = 0; i < whenLoggedOutShow.length; i += 1) {
                    $(whenLoggedOutShow[i]).show();
                }
            }

        },

    };

CAS_TICKET.checkUrlForTicket();
