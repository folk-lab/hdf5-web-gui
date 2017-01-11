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


// Settings used in all ajax requests
$.ajaxSetup({
    type:       'GET',
    dataType:   'json',
    async:      true,
    cache:      false,
    timeout:    2000
});


function showLoadingSpinner(showSpinner, timeDelay) {

    AJAX_SPINNER.debug = false;

    if (timeDelay === undefined) {
        timeDelay = 100;
    }

    if (AJAX_SPINNER.debug) {
        console.log('showSpinner: ' + showSpinner);
        console.log('timeDelay:   ' + timeDelay);
        console.log('AJAX_SPINNER.loaderVisible:   ' +
            AJAX_SPINNER.loaderVisible);
        console.log('AJAX_SPINNER.loadingData:     ' +
            AJAX_SPINNER.loadingData);
    }

    if (showSpinner) {
        if (!AJAX_SPINNER.loaderVisible) {

            AJAX_SPINNER.loaderVisible = true;

            if (AJAX_SPINNER.debug) {
                console.log('* starting loader in ' + timeDelay + ' ms');
            }

            AJAX_SPINNER.ajaxLoaderTimeOut = setTimeout(function () {
                document.getElementById("loader").style.display = "block";
                AJAX_SPINNER.loaderVisible = true;

                if (AJAX_SPINNER.debug) {
                    console.log('* loader started');
                }
            }, timeDelay);
        }

    } else {
        if (AJAX_SPINNER.loaderVisible && !AJAX_SPINNER.loadingData) {
        // if (!AJAX_SPINNER.loadingData) {

            // Cancels if request finished before timeout set in ajaxStart()
            clearTimeout(AJAX_SPINNER.ajaxLoaderTimeOut);
            AJAX_SPINNER.loaderVisible = false;

            if (AJAX_SPINNER.debug) {
                console.log('~ stopping loader in ' + timeDelay + ' ms');
            }

            // Turn off the loader
            setTimeout(function () {
                document.getElementById("loader").style.display = "none";
                AJAX_SPINNER.loaderVisible = false;

                if (AJAX_SPINNER.debug) {
                    console.log('~ loader stopped');
                }
            }, timeDelay);
        }
    }

}


function loadingData(areWeLoadingData, timeDelay) {
    if (AJAX_SPINNER.debug) {
        console.log('loadingData: ' + areWeLoadingData);
    }
    AJAX_SPINNER.loadingData = areWeLoadingData;
    showLoadingSpinner(areWeLoadingData, timeDelay);
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
