'use strict';

// The gloabl variables for this applicaiton
var CAS_IMMEDIATE =
    {
        // Log into the CAS server
        loginCAS : function () {

            var debug = false, service_url, loginUrl;

            if (debug) {
                console.log('Redirecting to CAS server');
            }

            // Construct the login url which contains the service url to which
            // the browser will be redirected after successfully logging in
            service_url = 'https://w-jasbru-pc-0' +
                '.maxiv.lu.se/hdf5-web-gui/html/app.html';
            loginUrl = 'https://cas.maxiv.lu.se/cas/login?service=' +
                encodeURIComponent(service_url);

            if (debug) {
                console.log('loginUrl: ' + loginUrl);
            }

            // Redirect to the CAS server
            window.location = loginUrl;
        },

    };

CAS_IMMEDIATE.loginCAS();
