/*global $*/
'use strict';

// External libraries
var SERVER_COMMUNICATION, PAGE_LOAD,

    // The gloabl variables for this applicaiton
    CAS_TICKET = {

        displayName : null,
        isLoggedIn : false,


        // Send a CAS server ticket to the HDF5 server, which will then
        // verify the ticket and create a cookie containing CAS information
        ticketCheckServer : function (casTicket) {

            var debug = false, ticketCheckUrl =
                SERVER_COMMUNICATION.hdf5DataServer + '/ticketcheck' +
                '?ticket=' + casTicket;

            if (debug) {
                console.log('ticketCheckUrl: ' + ticketCheckUrl);
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
                        if (ticketCheck.hasOwnProperty('displayName')) {
                            CAS_TICKET.displayName = ticketCheck.displayName;
                        }
                        if (ticketCheck.hasOwnProperty('message')) {
                            CAS_TICKET.isLoggedIn = ticketCheck.message;
                        }

                        if (debug) {
                            console.log('CAS_TICKET.isLoggedIn:  ' +
                                CAS_TICKET.isLoggedIn);
                            console.log('First name: ' +
                                CAS_TICKET.displayName);
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
                console.log('No CAS ticket found in url');
            }

            return undefined;
        },


        // Load javascript files on-demand
        loadJavaScriptScripts : function (group) {

            var debug = false, promises = [], scripts = [],
                version = '?v=201705161440';

            if (group === 0) {
                scripts = [
                    "../js/file-navigation.js",
                    "../js/page-load.js",
                ];
            }

            scripts.forEach(function (script) {
                promises.push($.getScript(script + version));
            });

            return $.when.apply(null, promises).done(function () {
                if (debug) {
                    console.log('All done loading javascript!');
                }

                return true;
            });

        },

    };

CAS_TICKET.checkUrlForTicket();
