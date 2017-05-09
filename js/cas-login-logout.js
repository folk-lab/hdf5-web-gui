/*global $*/
'use strict';

// External libraries
var SERVER_COMMUNICATION,

    // The gloabl variables for this applicaiton
    CAS_LOGIN_LOGOUT = {

        displayName : null,
        // The CAS authentication server
        casServer : 'https://cas.maxiv.lu.se/cas',
        // The url to which CAS will redirect the browser upon successful
        // login
        serviceUrl : window.location.protocol + '//' + window.location.hostname
            + '/hdf5-web-gui/html/app.html',


        // Check if there is a cookie created by the HDF5 server that contains
        // CAS information. If so, this should mean that the user has logged
        // in.  Return true or false.
        cookieCheckServer : function () {

            var debug = false, cookieCheckUrl =
                SERVER_COMMUNICATION.hdf5DataServer + '/cookiecheck';

            if (debug) {
                console.log('cookieCheckUrl: ' + cookieCheckUrl);
            }

            return SERVER_COMMUNICATION.ajaxRequest(cookieCheckUrl);
        },


        // Removes the cookie created by the HDF5 server
        logoutServer : function () {

            var debug = false, logoutUrl =
                SERVER_COMMUNICATION.hdf5DataServer + '/logout';

            if (debug) {
                console.log('logoutUrl: ' + logoutUrl);
            }

            return SERVER_COMMUNICATION.ajaxRequest(logoutUrl);
        },


        // Log into the CAS server
        loginCAS : function () {

            var loginUrl;

            console.log('Redirecting to CAS server');

            // Construct the login url which contains the service url to which
            // the browser will be redirected after successfully logging in
            loginUrl = CAS_LOGIN_LOGOUT.casServer + '/login?service=' +
                encodeURIComponent(CAS_LOGIN_LOGOUT.serviceUrl);

            console.log('loginUrl: ' + loginUrl);

            // Redirect to the CAS server
            window.location = loginUrl;
        },


        // Log out of CAS session
        logoutCAS : function () {

            var logoutUrl;

            // Logout from CAS
            logoutUrl = CAS_LOGIN_LOGOUT.casServer + '/logout?service=' +
                encodeURIComponent(CAS_LOGIN_LOGOUT.serviceUrl);

            console.log('logoutUrl: ' + logoutUrl);

            window.location = logoutUrl;

        },


        // The function called by the Login button, checks if a cookie created
        // by the HDF5 server exists, and if not, redirects to the CAS login
        // page
        login : function () {

            var debug = false, isLoggedIn;

            // Check if a CAS cookie created by the HDF5 server exists
            $.when(CAS_LOGIN_LOGOUT.cookieCheckServer()).then(
                function (response) {

                    if (response.hasOwnProperty('displayName')) {
                        CAS_LOGIN_LOGOUT.displayName = response.displayName;
                        if (debug) {
                            console.log('First name: ' +
                                CAS_LOGIN_LOGOUT.displayName);
                        }
                    }

                    isLoggedIn = response.message;

                    if (!isLoggedIn) {

                        console.log('No CAS cookie from HDF5 server');

                        // Redirect to CAS server and log in
                        CAS_LOGIN_LOGOUT.loginCAS();
                    } else {
                        console.log('Found CAS cookie from HDF5 server');
                    }
                }
            );

        },


        // The function called by the Logout button, logs out from the CAS
        // server and removes the cookie created by the HDF5 server
        logout : function () {

            var debug = false;

            // Remove the cookie created by the HDF5 server
            $.when(CAS_LOGIN_LOGOUT.logoutServer()).then(
                function (response) {

                    if (debug) {
                        console.log('logout:  ' + response);
                    }

                    // Logout of CAS
                    CAS_LOGIN_LOGOUT.logoutCAS();
                }
            );
        },

    };
