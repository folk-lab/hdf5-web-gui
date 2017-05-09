/*global $*/
'use strict';


// The global variables for this applicaiton
var AJAX_SPINNER = {

        debug : false,
        loadingData : false,
        loaderVisible : false,
        ajaxLoaderTimeOut : null,
        hideLoader : false,


        // show or hide the spinner.  Use timeouts and other tricks to try
        // and avoid jerkiness or quick flashes of the loader
        showLoadingSpinner : function (showSpinner, timeout) {

            if (timeout === undefined) {
                timeout = 100;
            }

            if (AJAX_SPINNER.debug) {
                console.log('showSpinner: ' + showSpinner);
                console.log('timeout:   ' + timeout);
                console.log('AJAX_SPINNER.loaderVisible:   ' +
                    AJAX_SPINNER.loaderVisible);
                console.log('AJAX_SPINNER.loadingData:     ' +
                    AJAX_SPINNER.loadingData);
            }

            // Start the loading spinner
            if (showSpinner && !AJAX_SPINNER.hideLoader) {

                if (!AJAX_SPINNER.loaderVisible) {

                    AJAX_SPINNER.loaderVisible = true;

                    if (AJAX_SPINNER.debug) {
                        console.log('* starting loader in ' + timeout + ' ms');
                    }

                    // Wait a bit to start the spinner, do this incase the
                    // request is a very short one
                    AJAX_SPINNER.ajaxLoaderTimeOut = setTimeout(function () {
                        document.getElementById("loader").style.display =
                            "block";

                        AJAX_SPINNER.loaderVisible = true;

                        if (AJAX_SPINNER.debug) {
                            console.log('* loader started');
                        }
                    }, timeout);
                }

            // Stop the loading spinner
            } else {

                if (!AJAX_SPINNER.loadingData) {

                    // Cancels the laoding of the spinner, if the ajax request
                    // finished before the timeout set in ajaxStart()
                    clearTimeout(AJAX_SPINNER.ajaxLoaderTimeOut);
                    AJAX_SPINNER.loaderVisible = false;

                    if (AJAX_SPINNER.debug) {
                        console.log('~ stopping loader in ' + timeout + ' ms');
                    }

                    // Wait a bit to stop the loader, do this to try and avoid
                    // just flashing the spinner for too short of time, could
                    // be annoying
                    setTimeout(function () {
                        document.getElementById("loader").style.display =
                            "none";

                        AJAX_SPINNER.loaderVisible = false;

                        if (AJAX_SPINNER.debug) {
                            console.log('~ loader stopped');
                        }
                    }, timeout);
                }
            }

        },


        // Make note that data is being loaded, then the spinner will stay
        // visible even while other ajax requests start and finish
        startLoadingData : function (timeout) {

            if (AJAX_SPINNER.debug) {
                console.log('loadingData');
            }

            AJAX_SPINNER.loadingData = true;

            AJAX_SPINNER.showLoadingSpinner(true, timeout);
        },


        // When data is doen being lodaded, turn off the spinner
        doneLoadingData : function () {

            if (AJAX_SPINNER.debug) {
                console.log('doneLoadingData');
            }

            AJAX_SPINNER.loadingData = false;

            AJAX_SPINNER.showLoadingSpinner(false, 0);
        },


    };


// Start and stop the loading spinner when doing ajax stuff
$(document).ajaxStart(function () {

    if (AJAX_SPINNER.debug) {
        console.log('ajaxStart');
    }

    AJAX_SPINNER.showLoadingSpinner(true);

}).ajaxStop(function () {

    if (AJAX_SPINNER.debug) {
        console.log('ajaxStop');
    }

    AJAX_SPINNER.showLoadingSpinner(false);

});


// Start the spinner immediately when this file is loaded
AJAX_SPINNER.startLoadingData();
