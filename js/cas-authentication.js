/*global $*/
'use strict';

// External libraries
var SERVER_COMMUNICATION, Cookies,

    // The gloabl variables for this applicaiton
    CAS_AUTH =
    {

        logincheckServer : function () {

            var debug = true, loginUrl =
                SERVER_COMMUNICATION.hdf5DataServer + '/logincheck';

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

        // When a dataset is selected, display whatever text there is
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


        // When a dataset is selected, display whatever text there is
        login : function () {

            var userName, cookieSetup, cookieParams, cookieKey, cookieValue,
                service_url, loginUrl;

            cookieSetup = CAS_AUTH.cookieSetup();
            cookieParams = cookieSetup.cookieParams;
            cookieKey = cookieSetup.cookieKey;
            cookieValue = 'jerk';

            userName = CAS_AUTH.loginCheck();

            if (!userName) {

                console.log('Need to log in, redirecting to CAS server');

                service_url = 'https://w-jasbru-pc-0' +
                    '.maxiv.lu.se/hdf5-web-gui/html/';
                loginUrl = 'https://cas.maxiv.lu.se/cas/login?' +
                    'service=' + encodeURIComponent(service_url);

                window.location = loginUrl;

                // Create/overwrite the cookie
                Cookies.set(cookieKey, cookieValue, cookieParams);
            } else {
                console.log('Found CAS cookie');
            }

        },

        // When a dataset is selected, display whatever text there is
        logout : function () {

            var userName, cookieSetup, cookieParams, cookieKey, service_url,
                logoutUrl;

            // For cookie removal, the same parameters used in it's creation
            // are needed
            cookieSetup = CAS_AUTH.cookieSetup();
            cookieParams = cookieSetup.cookieParams;
            cookieKey = cookieSetup.cookieKey;

            userName = CAS_AUTH.loginCheck();

            if (userName) {

                // Remove the cookie
                Cookies.remove(cookieKey, cookieParams);

                console.log('Need to log out, redirecting to CAS server');

                // Logout from CAS
                service_url = 'https://w-jasbru-pc-0' +
                    '.maxiv.lu.se/hdf5-web-gui/html/';
                logoutUrl = 'https://cas.maxiv.lu.se/cas/logout?' +
                    'service=' + encodeURIComponent(service_url);

                console.log('logoutUrl: ' + logoutUrl);

                window.location = logoutUrl;

                // The inclusion of the 'service' parameter in the logout url
                // ought to result in a riderect from the CAS server back
                // to the specified url according to:
                //    https://apereo.github.io/cas/4.2.x/protocol/
                //      CAS-Protocol-Specification.html#231-parameters
                // but, alas, it does not appear to work.  Oh well.

            } else {
                console.log('No CAS cookie found');
            }

        },


        // Check the current url for ticket information and save it, then
        // remove that information from the url
        checkUrlForTicket : function () {

            var url, queryString, queryParams = {}, param, params, i;

            // Get the full url
            url = window.location.href;
            console.log('url: ' + url);

            // Check if it contains CAS ticket information
            if (window.location.href.indexOf("?ticket=ST") > -1) {

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

            } else {
                console.log('No CAS ticket found');
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
