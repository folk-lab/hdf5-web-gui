/*global $*/
'use strict';

// External libraries
var SERVER_COMMUNICATION, FILE_NAV, DATA_DISPLAY, CAS_AUTH, AJAX_SPINNER,

    // The gloabl variables for this applicaiton
    PAGE_LOAD =
    {

        // This function is to be called when the page is loaded
        //  - check the url for CAS tickets
        //  - redirect to the CAS server to check login status
        //  - look for a cookie created by the HDF5 server
        //  - load the data tree or display a message
        initialPageLoad : function (automaticLogin) {

            // Check for a CAS ticket in the url
            $.when(CAS_AUTH.checkUrlForTicket()).then(
                function (isLoggedInTicket) {

                    console.log('automaticLogin:   ', automaticLogin);
                    console.log('isLoggedInTicket: ', isLoggedInTicket);

                    if (automaticLogin && !isLoggedInTicket) {

                        // Redirect to CAS server
                        //   - If not logged into CAS, login form presented
                        //   - If logged in, immediate redirect back to
                        //     service with a ticket in the url
                        CAS_AUTH.loginCAS();

                    } else {
                        // Check if a CAS cookie created by the HDF5 server
                        // exists
                        $.when(CAS_AUTH.cookieCheckServer()).then(
                            function (isLoggedInCookie) {

                                console.log('isLoggedInCookie: ',
                                    isLoggedInCookie);

                                // Save login information
                                CAS_AUTH.isLoggedIn = isLoggedInCookie;

                                PAGE_LOAD.fillBody();


                                $(document).ready(function () {

                                    // Show or hide various items
                                    CAS_AUTH.toggleLoginButton();

                                    if (isLoggedInCookie) {

                                        // Communicate with the server, filling
                                        // the uppermost level of the file tree
                                        FILE_NAV.getRootDirectoryContents();
                                    }

                                    PAGE_LOAD.displayWelcomeMessage();

                                    AJAX_SPINNER.showLoadingSpinner(false, 50);
                                });
                            }
                        );
                    }
                }
            );

        },


        fillBody : function () {
            $.ajax({
                url: "../html/body.html",
                success: function (data) {
                    $('body').append(data);

                    $.holdReady(false);
                },
                dataType: 'html'
            });
        },

        loadPlotlyJS : function () {
            return $.getScript(
                "../lib/js/plotly/plotly-latest.min.js?v=201701010000"
            );
        },


        displayWelcomeMessage : function () {
            $.when(CAS_AUTH.loadPlotlyJS()).then(
                function () {

                    var messageRow1, messageRow2,
                        color = '#3a74ad';

                    if (CAS_AUTH.isLoggedIn) {

                        messageRow1 = 'Welcome ' +
                            CAS_AUTH.displayName + '!';
                        messageRow2 = '(click stuff ' +
                            'on the left)';

                    } else {

                        messageRow1 = 'Welcome!';
                        messageRow2 = '(Login to ' +
                            'view data)';

                        // This will presumably never
                        // be shown if the automatic
                        // login is being used and is
                        // working properly
                        console.log('No CAS cookie');
                    }

                    DATA_DISPLAY.drawText(messageRow1,
                        messageRow2, color);
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

        hello : function () {
            console.log('hey there sailor');
        },
    };


// This function fires when the page is ready
$(document).ready(function () {

    var debug = true;

    if (debug) {
        console.log('document is ready');
    }

    // CAS_AUTH.initialPageLoad(true);
});

$.holdReady(true);
PAGE_LOAD.hello();
PAGE_LOAD.initialPageLoad(true);
