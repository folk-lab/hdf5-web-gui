/*global $*/
'use strict';


// The global variables for this applicaiton
var AJAX_SPINNER =
    {
        ajaxLoader          : null,
        ajaxLoaderTimeOut   : null,
    },

    // Objects from external javascript libraries
    AjaxLoader;

function turnOffLoadingIcon(doItFast) {

    if (doItFast) {
        // Hide the modal which is displaying the loading icon
        $('body').removeClass('loading');
        AJAX_SPINNER.ajaxLoader.hide();
    } else {
        setTimeout(function () {
            // If there is no mysql data, maybe better to show just most
            // recent minute as new data comes in? Click some time span
            // buttons, but wait a little first
            // console.log('Not much mysql data found, crap.');
            $('#timeSpanOption5').click();

            // Hide the modal which is displaying the loading icon
            $('.modal').fadeOut(500);

            setTimeout(function () {
                $('body').removeClass('loading');
                AJAX_SPINNER.ajaxLoader.hide();
            }, 500);

        }, 100);
    }
}


// Turn on the loading animation using a nice looking javscript loading icon
// from: http://musicvano.github.io/ajaxloader/
function createLoadingIcon() {

    // Display the loading icon in a modal
    $('body').addClass('loading');

    // Set options
    var opts = {
        size:       64,         // Width and height of the spinner
        factor:     0.25,       // Factor of thickness, density, etc.
        color:      '#009cf7',  // Color #rgb or #rrggbb
        speed:      1.0,        // Number of turns per second
        clockwise:  true        // Direction of rotation
    };

    // Turn it on
    AJAX_SPINNER.ajaxLoader = new AjaxLoader('spinner', opts);
    AJAX_SPINNER.ajaxLoader.show();
}


// Settings used in all ajax requests
$.ajaxSetup({
type:       'GET',
dataType:   'json',
async:      true,
cache:      false,
timeout:    700
});


// A method for display a loading icon when ajax does something and then
// gets a little stuck
$(document).ajaxStart(function () {

// console.log('ajaxStart');

// If the mysql server is in the middle of being reached (it can have
// problems) then keep displaying the loading icon, and don't create a new
// one.
if (!AJAX_SPINNER.mysqlDataLoading) {

// Turn on the loading icon, but fade in the modal - looks nicer when
// ajax is just having small hiccups (less than 900 ms)
AJAX_SPINNER.ajaxLoader.show();
AJAX_SPINNER.ajaxLoaderTimeOut = setTimeout(function () {
$('.modal').fadeIn();
}, 800); // Waits before fading .modal in
}
});

$(document).ajaxStop(function () {

// console.log('ajaxStop');

// If the mysql server is in the middle of being reached (it can have
// problems) then keep displaying the loading icon.
if (!AJAX_SPINNER.mysqlDataLoading) {

// Cancels if request finished < .5 seconds
clearTimeout(AJAX_SPINNER.ajaxLoaderTimeOut);
$('.modal').fadeOut();

// Turn off the loading icon
setTimeout(function () {
AJAX_SPINNER.ajaxLoader.hide();
}, 500);
}
});


$(document).ready(function () {
    createLoadingIcon();
}
