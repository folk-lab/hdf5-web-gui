/*global $*/
'use strict';


// The global variables for this applicaiton
var AJAX_SPINNER =
    {
        loaderVisible : true,
        ajaxLoaderTimeOut : null,
        loadingData : false,
    };


// Settings used in all ajax requests
$.ajaxSetup({
    type:       'GET',
    dataType:   'json',
    async:      true,
    cache:      false,
    timeout:    2000
});


function showLoadingSpinner(showSpinner) {

    console.log('showSpinner: ' + showSpinner);
    console.log('AJAX_SPINNER.loaderVisible:   ' + AJAX_SPINNER.loaderVisible);
    console.log('AJAX_SPINNER.loadingData:     ' + AJAX_SPINNER.loadingData);

    if (showSpinner) {
        if (!AJAX_SPINNER.loaderVisible) {

            AJAX_SPINNER.loaderVisible = true;

            console.log('starting loader in 100 ms');

            AJAX_SPINNER.ajaxLoaderTimeOut = setTimeout(function () {
                document.getElementById("loader").style.display = "block";
                AJAX_SPINNER.loaderVisible = true;
                console.log('loader stopped');
            }, 100);
        }

    } else {
        // if (AJAX_SPINNER.loaderVisible && !AJAX_SPINNER.loadingData) {
        if (!AJAX_SPINNER.loadingData) {

            // Cancels if request finished before timeout set in ajaxStart()
            clearTimeout(AJAX_SPINNER.ajaxLoaderTimeOut);
            AJAX_SPINNER.loaderVisible = false;

            console.log('stopping loader in 100 ms');

            // Turn off the loader
            setTimeout(function () {
                document.getElementById("loader").style.display = "none";
                AJAX_SPINNER.loaderVisible = false;
                console.log('loader stopped');
            }, 100);
        }
    }

}


function loadingData(areWeLoadingData) {
    console.log('loadingData: ' + areWeLoadingData);
    AJAX_SPINNER.loadingData = areWeLoadingData;
    showLoadingSpinner(areWeLoadingData);
}


// A method for display a loading icon when ajax does something and then
// gets a little stuck
$(document).ajaxStart(function () {
    console.log('ajaxStart');
    showLoadingSpinner(true);
});


$(document).ajaxStop(function () {
    console.log('ajaxStop');
    showLoadingSpinner(false);
});
