/*global $*/
'use strict';

// External libraries
var SERVER_COMMUNICATION, PAGE_LOAD, CAS_LOGIN_LOGOUT,

    // The gloabl variables for this applicaiton
    CAS_TICKET = {

        firstName : '',
        loginNeeded : true,
        isLoggedIn : false,


        // Send a CAS server ticket to the HDF5 server, which will then
        // verify the ticket and create a cookie containing CAS information
        ticketCheckServer : function (casTicket) {

            var debug = false, ticketCheckUrl =
                SERVER_COMMUNICATION.hdf5DataServer + '/ticketcheck' +
                '?ticket=' + casTicket;

            if (debug) {
                console.debug('ticketCheckUrl: ' + ticketCheckUrl);
            }

            return SERVER_COMMUNICATION.ajaxRequest(ticketCheckUrl, false);
        },


        // Check the current url for ticket information and save it, then
        // remove that information from the url
        checkUrlForTicket : function () {

            var debug = false, url, queryString, queryParams = {}, param,
                params, i, ticketFound = false, casTicket;

            // Get the full url
            url = window.location.href;

            if (debug) {
                console.debug('url: ' + url);
            }

            // Check if it contains CAS ticket information
            if (url.indexOf("ticket=ST") > -1) {

                if (debug) {
                    console.debug('CAS ticket found?');
                }

                // Get the ticket information
                queryString = window.location.search.substring(1);
                if (debug) {
                    console.debug('queryString: ' + queryString);
                }

                // Look for any parameters, save them
                params = queryString.split("&");
                for (i = 0; i < params.length; i += 1) {
                    param = params[i].split('=');
                    queryParams[param[0]] = param[1];
                }
                if (debug) {
                    console.debug(queryParams);
                }

                // If there is a ticket key, save the value
                if (queryParams.hasOwnProperty('ticket')) {
                    casTicket = queryParams.ticket;
                    ticketFound = true;
                }

            }

            // Clean the url - get rid of eveything after the last /
            window.history.pushState({}, document.title,
                '/hdf5-web-gui/html/');

            if (ticketFound) {

                CAS_TICKET.loginNeeded = true;

                // Sending the ticket to the HDF5 server and having it verified
                // can be slow, so at the same time load some javascript that
                // will be used in the next step.
                return $.when(
                    CAS_TICKET.ticketCheckServer(casTicket),
                    CAS_TICKET.loadJavaScriptScripts(0)
                ).then(
                    function (response) {

                        // For multiple function in $.when(), the responses
                        // are saved into an array - take the right one!
                        var ticketCheck = response[0];

                        // Save the login name and status
                        if (ticketCheck.hasOwnProperty('firstName')) {
                            CAS_TICKET.firstName = ticketCheck.firstName;
                        }
                        if (ticketCheck.hasOwnProperty('message')) {
                            CAS_TICKET.isLoggedIn = ticketCheck.message;
                        }

                        if (debug) {
                            console.debug('CAS_TICKET.isLoggedIn:  ' +
                                CAS_TICKET.isLoggedIn);
                            console.debug('First name: ' +
                                CAS_TICKET.firstName);
                        }

                        // Continue with loading the rest of the page
                        if (CAS_TICKET.isLoggedIn) {
                            PAGE_LOAD.initialPageLoad(true);
                        }

                        return CAS_TICKET.isLoggedIn;
                    }
                );

            }

            if (debug) {
                console.debug('No CAS ticket found in url');
            }

            // If no ticket found, assume this was a redirect from
            // cas-immediate-login.js and that no CAS authentication is
            // required by the HDF5 server - this assumption will be verifed
            // prior to data being loaded
            CAS_TICKET.loginNeeded = false;

            // Load some javascript and make sure to remove any leftover
            // cookies
            return $.when(
                CAS_TICKET.loadJavaScriptScripts(0),
                CAS_LOGIN_LOGOUT.logoutServer()
            ).then(
                function () {

                    // Continue with loading the rest of the page
                    PAGE_LOAD.initialPageLoad(true);

                    return true;
                }
            );

        },


        // Load javascript files on-demand
        loadJavaScriptScripts : function (group) {

            var debug = false, promises = [], scripts = [],
                version = '?v=201708211613';

            if (group === 0) {
                scripts = [
                    "../lib/js/jstree/3.2.1/jstree.min.js",
                    "../lib/js/mobile-check/mobile-check.js",
                    "../js/file-navigation.js",
                    "../js/page-load.js",
                ];
            }

            scripts.forEach(function (script) {
                promises.push($.getScript(script + version));
            });

            return $.when.apply(null, promises).done(function () {
                if (debug) {
                    console.debug('All done loading javascript!');
                }

                return true;
            });

        },

    };

CAS_TICKET.checkUrlForTicket();
