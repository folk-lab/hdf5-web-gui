/*global $*/
'use strict';

// The gloabl variables for this applicaiton
var SERVER_COMMUNICATION, Ping,

    // The gloabl variables for this applicaiton
    CAS_IMMEDIATE = {

        // The CAS authentication server - e.g. https://cas.maxiv.lu.se/cas
        casServer : '',

        // The url to which CAS will redirect the upon successful login
        serviceUrl : window.location.protocol + '//' + window.location.hostname
            + '/hdf5-web-gui/html/app.html',


        // Log into the CAS server
        loginCAS : function () {

            var debug = true, loginUrl, pingH5serv = new Ping(), url;

            document.getElementById("loadMsg").innerHTML =
                'Attempting to contact HDF5 server... ';

            // See if the CAS server is reachable
            url = SERVER_COMMUNICATION.hdf5DataServerBase;
            pingH5serv.ping(url, function (err, data) {

                // Display error if err is returned.
                if (err) {

                    console.log("error loading HDF5 server: " +
                        SERVER_COMMUNICATION.hdf5DataServerBase);
                    document.getElementById("loadMsg"
                        ).innerHTML +=
                        '<span style="color:red">failed</span>';

                    document.getElementById("errMsg"
                        ).innerHTML = 'Apparently the HDF5 ' +
                        'server is not reachable.</br>' +
                        'Better find someone who can fix this.';
                } else {

                    console.log('HDF5 server reached ' + data);
                    document.getElementById("loadMsg").innerHTML +=
                        '<span style="color:green">success</span>';
                    document.getElementById("loadMsg").innerHTML +=
                        '</br>Checking if authentication is required... ';

                    // Check with the HDF5 server to see if CAS authentication
                    // is being used
                    $.when(CAS_IMMEDIATE.getCASServerUrl()).then(
                        function (response) {

                            CAS_IMMEDIATE.casServer = response;
                            console.log('cas server: ' +
                                CAS_IMMEDIATE.casServer);

                            // If the CAS url given is a valid url
                            if (CAS_IMMEDIATE.isValidURL(
                                    CAS_IMMEDIATE.casServer
                                )) {

                                var pingCAS = new Ping();

                                document.getElementById("loadMsg").innerHTML +=
                                    '<span style="color:blue">yes</span>';
                                document.getElementById("loadMsg").innerHTML +=
                                    '</br>Attempting to contact ' +
                                    'authentication server... ';

                                // See if the CAS server is reachable
                                url = CAS_IMMEDIATE.casServer;
                                pingCAS.ping(url, function (err, data) {

                                    // Display error if err is returned.
                                    if (err) {

                                        console.log("error loading CAS " +
                                            "server" +
                                            CAS_IMMEDIATE.casServer);
                                        document.getElementById("loadMsg"
                                            ).innerHTML +=
                                            '<span style="color:red">' +
                                            'failed</span>';

                                        document.getElementById("errMsg"
                                            ).innerHTML = 'Apparently ' +
                                            'the HDF5 server requires ' +
                                            'authentication, </br>' +
                                            'but the authentication ' +
                                            'server is not reachable.' +
                                            '</br>Better find someone' +
                                            ' who can fix this.';
                                    } else {

                                        console.log('CAS server reached ' +
                                            data);
                                        document.getElementById("loadMsg"
                                            ).innerHTML +=
                                            '<span style="color:green">' +
                                            'success</span>';

                                        // Construct the login url which
                                        // contains the service url to
                                        // which the browser will be
                                        // redirected after successfully
                                        // logging in
                                        loginUrl =
                                            CAS_IMMEDIATE.casServer +
                                            '/login?service=' +
                                            encodeURIComponent(
                                                CAS_IMMEDIATE.serviceUrl
                                            );

                                        if (debug) {
                                            console.log('loginUrl: ' +
                                                loginUrl);
                                            console.log('Redirecting to ' +
                                                'CAS server');
                                        }

                                        document.getElementById("errMsg"
                                            ).innerHTML = 'Redirecting to ' +
                                                CAS_IMMEDIATE.casServer;

                                        // Redirect to the CAS server
                                        window.location = loginUrl;

                                    }
                                });

                            } else {

                                console.log('Invalid CAS url given, ' +
                                    'assumming no CAS' +
                                    ' authentication is required');
                                document.getElementById("loadMsg").innerHTML +=
                                    '<span style="color:blue">no</span>';

                                document.getElementById("errMsg"
                                    ).innerHTML = 'Now opening the HDF5 ' +
                                    'viewer...';

                                // Redirect to the CAS server
                                window.location = CAS_IMMEDIATE.serviceUrl;
                            }
                        }
                    );
                }
            });
        },


        // Check with the HDF5 server to see if CAS use is configured
        getCASServerUrl : function () {

            var debug = true, casCheckUrl =
                SERVER_COMMUNICATION.hdf5DataServer + '/usecas';

            if (debug) {
                console.log('casCheckUrl: ' + casCheckUrl);
            }

            return SERVER_COMMUNICATION.ajaxRequest(casCheckUrl, false);
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

            if (str === 'None') {
                str = '';
            }

            return pattern.test(str);
        },

    };

CAS_IMMEDIATE.loginCAS();
