/*global $*/
'use strict';

// External libraries
var SERVER_COMMUNICATION, FILE_NAV, DATA_DISPLAY,

    // The gloabl variables for this applicaiton
    CAS_AUTH =
    {
        userName : null,
        isLoggedIn : false,

        executeServerFunction : function (serverUrl) {

            return $.when(SERVER_COMMUNICATION.ajaxRequest(serverUrl)).then(
                function (response) {

                    var debug = true, key = '';

                    if (debug) {
                        for (key in response) {
                            if (response.hasOwnProperty(key)) {
                                console.log(key + " -> ");
                                console.log(response[key]);
                            }
                        }
                    }

                    if (response.hasOwnProperty('attributes')) {
                        CAS_AUTH.userName = response.attributes.displayName;
                        console.log('First name: ' + CAS_AUTH.userName);
                    }

                    return response.message;
                }
            );
        },

        // Check if there is a cookie created by the HDF5 server that contains
        // CAS information. If so, this should mean that the user has logged
        // in.  Return true or false.
        cookieCheckServer : function () {

            var debug = true, cookieCheckUrl =
                SERVER_COMMUNICATION.hdf5DataServer + '/cookiecheck';

            if (debug) {
                console.log('cookieCheckUrl: ' + cookieCheckUrl);
            }

            return CAS_AUTH.executeServerFunction(cookieCheckUrl);
        },


        // Send a CAS server ticket to the HDF5 server, which will then
        // verify the ticket and create a cookie containing CAS information
        ticketCheckServer : function (queryString) {

            var debug = true, loginUrl =
                SERVER_COMMUNICATION.hdf5DataServer + '/ticketcheck' +
                '?' + queryString;

            if (debug) {
                console.log('loginUrl: ' + loginUrl);
            }

            return CAS_AUTH.executeServerFunction(loginUrl);
        },


        // Removes the cookie created by the HDF5 server
        logoutServer : function () {

            var debug = true, logoutUrl =
                SERVER_COMMUNICATION.hdf5DataServer + '/logout';

            if (debug) {
                console.log('logoutUrl: ' + logoutUrl);
            }

            return CAS_AUTH.executeServerFunction(logoutUrl);
        },


        // Log into the CAS server
        loginCAS : function () {

            var service_url, loginUrl;

            console.log('Redirecting to CAS server');

            service_url = 'https://w-jasbru-pc-0' +
                '.maxiv.lu.se/hdf5-web-gui/html/';
            loginUrl = 'https://cas.maxiv.lu.se/cas/login?service=' +
                encodeURIComponent(service_url);

            console.log('loginUrl: ' + loginUrl);

            window.location = loginUrl;
        },


        // Log out of CAS session
        logoutCAS : function () {

            var service_url, logoutUrl;

            // Logout from CAS
            service_url = 'https://w-jasbru-pc-0' +
                '.maxiv.lu.se/hdf5-web-gui/html/';
            logoutUrl = 'https://cas.maxiv.lu.se/cas/logout?service=' +
                encodeURIComponent(service_url);

            console.log('logoutUrl: ' + logoutUrl);

            window.location = logoutUrl;

        },


        // The function called by the Login button, checks if a cookie created
        // by the HDF5 server exists, and if not, redirects to the CAS login
        // page
        login : function () {

            // Check if a CAS cookie created by the HDF5 server exists
            $.when(CAS_AUTH.cookieCheckServer()).then(
                function (isLoggedIn) {

                    if (!isLoggedIn) {

                        console.log('No CAS cookie from HDF5 server');

                        // Redirect to CAS server and log in
                        CAS_AUTH.loginCAS();
                    } else {
                        console.log('Found CAS cookie from HDF5 server');
                    }
                }
            );

        },


        // The function called by the Logout button, logs out from the CAS
        // server and removes the cookie created by the HDF5 server
        logout : function () {

            // Remove the cookie created by the HDF5 server
            $.when(CAS_AUTH.logoutServer()).then(
                function (response) {

                    console.log('logout:  ' + response);

                    // Logout of CAS
                    CAS_AUTH.logoutCAS();
                }
            );
        },


        // Check the current url for ticket information and save it, then
        // remove that information from the url
        checkUrlForTicket : function () {

            var url, queryString, queryParams = {}, param, params, i;

            // Get the full url
            url = window.location.href;
            console.log('url: ' + url);

            // Check if it contains CAS ticket information
            if (url.indexOf("?ticket=ST") > -1) {

                console.log('CAS ticket found');

                // Get the ticket information
                queryString = window.location.search.substring(1);
                console.log('queryString: ' + queryString);

                // Look for any parameters, save them
                params = queryString.split("&");
                for (i = 0; i < params.length; i += 1) {
                    param = params[i].split('=');
                    queryParams[param[0]] = param[1];
                }
                console.log(queryParams);

                // Clean the url - get rid of eveything after the last /
                window.history.pushState({}, document.title,
                    window.location.pathname);

                // Send the ticket to the HDF5 server
                return $.when(CAS_AUTH.ticketCheckServer(queryString)).then(
                    function (isLoggedIn) {
                        console.log('isLoggedIn:  ' + isLoggedIn);
                        return isLoggedIn;
                    }
                );

            }

            console.log('No CAS ticket found in url');
            return undefined;
        },


        // This function is to be called when the page is loaded - it checks
        // the url for CAS tickets, looks for a cookie created by the HDF5
        // server, then loads the data tree or displays a message
        initialPageLoad : function () {

            // Check for a CAS ticket in the url
            $.when(CAS_AUTH.checkUrlForTicket()).then(
                function (isLoggedInTicket) {

                    console.log('isLoggedInTicket: ', isLoggedInTicket);

                    // Check if a CAS cookie created by the HDF5 server exists
                    $.when(CAS_AUTH.cookieCheckServer()).then(
                        function (isLoggedInCookie) {

                            console.log('isLoggedInCookie: ',
                                isLoggedInCookie);

                            // Save login information
                            CAS_AUTH.isLoggedIn = isLoggedInCookie;

                            if (isLoggedInCookie) {

                                // Communicate with the server, filling the
                                // uppermost level of the file tree
                                FILE_NAV.getRootDirectoryContents();

                                // Display a message
                                DATA_DISPLAY.drawText('Welcome ' +
                                    CAS_AUTH.userName + '!',
                                    '(click stuff on the left)',
                                    '#3a74ad');

                            } else {

                                // Display a message
                                console.log('No CAS cookie from HDF5 server');
                                DATA_DISPLAY.drawText('Welcome!',
                                    '(Login to view data)', '#3a74ad');

                            }

                            // Show or hide various items
                            CAS_AUTH.toggleLoginButton();
                        }
                    );
                }
            );

        },


        // Depending on login status, show the login or logout buttons and
        // the file browsing menu
        toggleLoginButton : function () {

            var i, debug = true, whenLoggedInShow = ['#logoutButton',
                '#logoutButtonMobile', '#treeSectionDiv'],
                whenLoggedOutShow = ['#loginButton', '#loginButtonMobile'];

            if (debug) {
                console.log('CAS_AUTH.isLoggedIn: ' + CAS_AUTH.isLoggedIn);
            }


            // Show or hide the login & logout related items
            if (CAS_AUTH.isLoggedIn) {
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


// This function fires when the page is loaded
$(document).ready(function () {

    var debug = true, x;

    if (debug) {
        console.log('document is ready');
    }

    CAS_AUTH.initialPageLoad();

    x = document.cookie;
    console.log('cookies: ');
    console.log(x);

});
