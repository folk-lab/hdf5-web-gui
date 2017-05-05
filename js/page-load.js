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

            var debug = false;

            // Check for a CAS ticket in the url
            $.when(CAS_AUTH.checkUrlForTicket()).then(
                function (isLoggedInTicket) {

                    if (debug) {
                        console.log('automaticLogin:   ', automaticLogin);
                        console.log('isLoggedInTicket: ', isLoggedInTicket);
                    }

                    if (automaticLogin && !isLoggedInTicket) {

                        // Redirect to CAS server
                        //   - If not logged into CAS, login form presented
                        //   - If logged in, immediate redirect back to
                        //     service with a ticket in the url
                        CAS_AUTH.loginCAS();

                    } else {

                        // Save login status
                        CAS_AUTH.isLoggedIn = isLoggedInTicket;

                        // Get data directory contents
                        FILE_NAV.getRootDirectoryContents();

                        // Best tot wait until DOM items are in place before
                        // doing a few things
                        $(document).ready(function () {

                            // Show or hide various items
                            CAS_AUTH.toggleLoginButton();

                            // Welcome!
                            PAGE_LOAD.displayWelcomeMessage();
                        });
                    }
                }
            );

        },

        // Say hello!
        displayWelcomeMessage : function () {

            var messageRow1, messageRow2,
                color = '#3a74ad';

            if (CAS_AUTH.isLoggedIn) {
                messageRow1 = 'Welcome ' + CAS_AUTH.displayName + '!';
                messageRow2 = '(click stuff on the left)';
            } else {
                messageRow1 = 'Welcome!';
                messageRow2 = '(Login to view data)';

                console.log('Not logged in?');
            }

            // // Un-hide the plotting canvas, write a welcome message
            // document.getElementById("plotCanvasDiv").style.display = "block";
            // DATA_DISPLAY.drawText(messageRow1, messageRow2, color);

            // document.getElementById("welcomeDiv").style.display = "block";
            // document.getElementById("test").style.display = "block";
            document.getElementById("welcomeDiv1").innerHTML = messageRow1;
            document.getElementById("welcomeDiv2").innerHTML = messageRow2;
            $("#welcomeRow").addClass('row');

            AJAX_SPINNER.showLoadingSpinner(false, 50);
        },
    };

PAGE_LOAD.initialPageLoad(true);
