/*global $*/
'use strict';


// The global variables for this applicaiton
var AJAX_SPINNER =
    {
        debug : false,
        loadingData : false,
        loaderVisible : true,
        ajaxLoaderTimeOut : null,
    };


function showLoadingSpinner(showSpinner, timeout) {

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

    if (showSpinner) {

        if (!AJAX_SPINNER.loaderVisible) {

            AJAX_SPINNER.loaderVisible = true;

            if (AJAX_SPINNER.debug) {
                console.log('* starting loader in ' + timeout + ' ms');
            }

            AJAX_SPINNER.ajaxLoaderTimeOut = setTimeout(function () {
                document.getElementById("loader").style.display = "block";
                AJAX_SPINNER.loaderVisible = true;

                if (AJAX_SPINNER.debug) {
                    console.log('* loader started');
                }
            }, timeout);
        }

    } else {

        if (!AJAX_SPINNER.loadingData) {

            // Cancels if request finished before timeout set in ajaxStart()
            clearTimeout(AJAX_SPINNER.ajaxLoaderTimeOut);
            AJAX_SPINNER.loaderVisible = false;

            if (AJAX_SPINNER.debug) {
                console.log('~ stopping loader in ' + timeout + ' ms');
            }

            // Turn off the loader
            setTimeout(function () {
                document.getElementById("loader").style.display = "none";
                AJAX_SPINNER.loaderVisible = false;

                if (AJAX_SPINNER.debug) {
                    console.log('~ loader stopped');
                }
            }, timeout);
        }
    }

}


function startLoadingData(timeout) {

    if (AJAX_SPINNER.debug) {
        console.log('loadingData');
    }

    AJAX_SPINNER.loadingData = true;

    showLoadingSpinner(true, timeout);
}


function doneLoadingData() {

    if (AJAX_SPINNER.debug) {
        console.log('doneLoadingData');
    }

    AJAX_SPINNER.loadingData = false;

    showLoadingSpinner(false, 50);
}


$(document).ajaxStart(function () {
    if (AJAX_SPINNER.debug) {
        console.log('ajaxStart');
    }
    showLoadingSpinner(true);
});


$(document).ajaxStop(function () {
    if (AJAX_SPINNER.debug) {
        console.log('ajaxStop');
    }
    showLoadingSpinner(false);
});