/*global $*/
'use strict';

// External libraries
var SERVER_COMMUNICATION, Cookies,

    // The gloabl variables for this applicaiton
    CAS_AUTH =
    {

        cookieCheckServer : function () {

            var debug = true, loginUrl =
                SERVER_COMMUNICATION.hdf5DataServer + '/cookiecheck';

            console.log('loginUrl: ' + loginUrl);

            return $.when(SERVER_COMMUNICATION.ajaxRequest(loginUrl)).then(
                function (response) {

                    var key = '';

                    if (debug) {
                        for (key in response) {
                            if (response.hasOwnProperty(key)) {
                                console.log(key + " -> " + response[key]);
                            }
                        }
                    }

                    return response.message;
                }
            );

        },

        ticketcheckServer : function (queryString) {

            var debug = true, loginUrl =
                SERVER_COMMUNICATION.hdf5DataServer + '/ticketcheck' +
                '?' + queryString;

            console.log('loginUrl: ' + loginUrl);

            return $.when(SERVER_COMMUNICATION.ajaxRequest(loginUrl)).then(
                function (response) {

                    var key = '';

                    if (debug) {
                        for (key in response) {
                            if (response.hasOwnProperty(key)) {
                                console.log(key + " -> " + response[key]);
                            }
                        }
                    }

                    return response.message;
                }
            );

        },


        logoutServer : function () {

            var debug = true, logoutUrl =
                SERVER_COMMUNICATION.hdf5DataServer + '/logout';

            console.log('logoutUrl: ' + logoutUrl);

            return $.when(SERVER_COMMUNICATION.ajaxRequest(logoutUrl)).then(
                function (response) {

                    var key = '';

                    if (debug) {
                        for (key in response) {
                            if (response.hasOwnProperty(key)) {
                                console.log(key + " -> " + response[key]);
                            }
                        }
                    }

                    return response.message;
                }
            );

        },

        loginServer : function () {

            var debug = true, loginUrl, service_url;

            $.when(CAS_AUTH.logincheckServer()).then(
                function (isLoggedIn) {

                    if (debug) {
                        console.log('isLoggedIn:  ' + isLoggedIn);
                    }


                    if (!isLoggedIn) {
                        // loginUrl = 'https://cas.maxiv.lu.se/cas//login?'
                        // + 'service=https%3A%2F%2Fw-jasbru-pc-0' +
                        // '%3A6050%2Flogin';
                        service_url = 'https://w-jasbru-pc-0' +
                            '.maxiv.lu.se/hdf5-web-gui/html/';
                        loginUrl = 'https://cas.maxiv.lu.se/cas/login?' +
                            'service=' + encodeURIComponent(service_url);
                        // loginUrl = SERVER_COMMUNICATION.hdf5DataServer +
                        //     '/login';


                        window.location = loginUrl;

                        // return $.when(SERVER_COMMUNICATION.ajaxRequest(
                        //     loginUrl
                        // )).then(
                        //     function (response) {
                        //         var key = '';
                        //         if (debug) {
                        //             for (key in response) {
                        //                 if (response.hasOwnProperty(key)) {
                        //                     console.log(key + " -> " +
                        //                         response[key]);
                        //                 }
                        //             }
                        //         }
                        //         return response.message;
                        //     }
                        // );
                    }
                }
            );
        },

        loginCheck : function () {

            var userName = false, cookieSetup, cookieKey, readCookies;

            cookieSetup = CAS_AUTH.cookieSetup();
            cookieKey = cookieSetup.cookieKey;

            readCookies = Cookies.get();
            console.log('readCookies: ');
            console.log(readCookies);

            if (readCookies.hasOwnProperty(cookieKey)) {
                console.log('Found ' + cookieKey + ' in the cookies');
                userName = readCookies[cookieKey];
                console.log('userName: ' + userName);
            } else {
                console.log('No ' + cookieKey + ' in the cookies');
            }

            return userName;
        },

        cookieSetup : function () {

            var cookieParams, cookieKey;

            cookieParams = {
                secure: true,
                // domain: 'w-jasbru-pc-0',
                // domain: 'w-jasbru-pc-0.maxiv.lu.se',
            };
            cookieKey = 'casUserName';

            return {
                cookieParams: cookieParams,
                cookieKey: cookieKey,
            };
        },


        login : function () {

            var service_url, loginUrl;

            // Check if a CAS cookie created by the HDF5 server exists
            $.when(CAS_AUTH.cookieCheckServer()).then(
                function (isLoggedIn) {

                    if (!isLoggedIn) {

                        // If no cookie has been found, redirect to CAS
                        // server and log in

                        console.log('No CAS cookie from HDF5 server');
                        console.log('Redirecting to CAS server');

                        service_url = 'https://w-jasbru-pc-0' +
                            '.maxiv.lu.se/hdf5-web-gui/html/';
                        loginUrl = 'https://cas.maxiv.lu.se/cas/login?' +
                            'service=' + encodeURIComponent(service_url);

                        window.location = loginUrl;
                    } else {
                        console.log('Found CAS cookie from HDF5 server');
                    }
                }
            );

        },

        logout : function () {

            var service_url, logoutUrl;

            // Remove the cookie created by the HDF5 server
            $.when(CAS_AUTH.logoutServer()).then(
                function (response) {
                    console.log('logout:  ' + response);
                }
            );

            // Logout from CAS
            service_url = 'https://w-jasbru-pc-0' +
                '.maxiv.lu.se/hdf5-web-gui/html/';
            logoutUrl = 'https://cas.maxiv.lu.se/cas/logout?service=' +
                encodeURIComponent(service_url);

            console.log('logoutUrl: ' + logoutUrl);

            window.location = logoutUrl;
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

                $.when(CAS_AUTH.ticketcheckServer(queryString)).then(
                    function (isLoggedIn) {
                        console.log('isLoggedIn:  ' + isLoggedIn);
                    }
                );

            } else {
                console.log('No CAS ticket found in url');
            }

        }

    };


// This function fires when the page is loaded
$(document).ready(function () {

    var debug = false;

    if (debug) {
        console.log('document is ready');
    }

    CAS_AUTH.checkUrlForTicket();
});
