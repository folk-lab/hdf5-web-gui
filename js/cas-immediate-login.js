/*global $*/
'use strict';

// The gloabl variables for this applicaiton
var SERVER_COMMUNICATION, Ping,

    // The gloabl variables for this applicaiton
    CAS_IMMEDIATE = {

        // The CAS authentication server
        // casServer : 'https://cas.maxiv.lu.se/cas',
        casServer : '',
        usingCAS : undefined,
        casServerReachable : undefined,

        // The url to which CAS will redirect the upon successful login
        serviceUrl : window.location.protocol + '//' + window.location.hostname
            + '/hdf5-web-gui/html/app.html',


        // Log into the CAS server
        loginCAS : function () {

            var debug = true, loginUrl;

            // Check with the HDF5 server to see if CAS authentication is being
            // used
            $.when(
                CAS_IMMEDIATE.usingCASAuthentication()
            ).then(
                function (response) {

                    CAS_IMMEDIATE.casServer = response;
                    console.log('cas server:' + CAS_IMMEDIATE.casServer);

                    // If this is a valid url
                    if (CAS_IMMEDIATE.isValidURL(CAS_IMMEDIATE.casServer)) {
                        var p = new Ping();

                        CAS_IMMEDIATE.usingCAS = true;

                        // See if this server is reachable
                        p.ping(CAS_IMMEDIATE.casServer, function (err, data) {

                            // Display error if err is returned.
                            if (err) {
                                console.log("error loading CAS server" +
                                    CAS_IMMEDIATE.casServer);
                                CAS_IMMEDIATE.casServerReachable = false;
                            } else {
                                console.log('CAS server reached ' + data);
                                CAS_IMMEDIATE.casServerReachable = true;

                                // Construct the login url which contains the
                                // service url to which the browser will be
                                // redirected after successfully logging in
                                loginUrl = CAS_IMMEDIATE.casServer +
                                    '/login?service=' +
                                    encodeURIComponent(
                                        CAS_IMMEDIATE.serviceUrl
                                    );

                                if (debug) {
                                    console.log('loginUrl: ' + loginUrl);
                                    console.log('Redirecting to CAS server');
                                }

                                // Redirect to the CAS server
                                window.location = loginUrl;
                            }
                        });
                    } else {
                        console.log('Invalid CAS url given, assume no CAS');
                        CAS_IMMEDIATE.usingCAS = false;
                    }

                }
            );
        },


        // Check with the HDF5 server to see if CAS use is configured
        usingCASAuthentication : function () {

            var debug = true, casCheckUrl =
                SERVER_COMMUNICATION.hdf5DataServer + '/usecas';

            if (debug) {
                console.log('casCheckUrl: ' + casCheckUrl);
            }

            return SERVER_COMMUNICATION.ajaxRequest(casCheckUrl, false);
        },


        isServerReachable : function (url) {

            var debug = true, p = new Ping();

            if (debug) {
                console.log('Checking server availablity');
            }

            return $.when(p.ping(url, function (err, data) {

                // Also display error if err is returned.
                if (err) {
                    console.log("error loading resource");
                    data = data + " " + err;
                    return false;
                }

                console.log(data);
                return true;
            })
                );
        },


        // Check if a given string is a valid url
        isValidURL : function (str) {
            var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
                // domain name
                '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' +
                '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
                '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
                '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
                '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
            return pattern.test(str);
        },

    };

CAS_IMMEDIATE.loginCAS();
