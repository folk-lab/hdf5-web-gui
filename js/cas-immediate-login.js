'use strict';

// The gloabl variables for this applicaiton
var CAS_IMMEDIATE = {

        // The CAS authentication server
        casServer : 'https://cas.maxiv.lu.se/cas',
        // The url to which CAS will redirect the browser upon successful
        // login
        serviceUrl : window.location.protocol + '//' + window.location.hostname
            + '/hdf5-web-gui/html/app.html',

        // Log into the CAS server
        loginCAS : function () {

            var debug = false, loginUrl;

            if (debug) {
                console.log('Redirecting to CAS server');
            }

            // Construct the login url which contains the service url to which
            // the browser will be redirected after successfully logging in
            loginUrl = CAS_IMMEDIATE.casServer + '/login?service=' +
                encodeURIComponent(CAS_IMMEDIATE.serviceUrl);

            if (debug) {
                console.log('loginUrl: ' + loginUrl);
            }

            // Redirect to the CAS server
            window.location = loginUrl;
        },

    };

CAS_IMMEDIATE.loginCAS();
