/*global $, initializeData*/
'use strict';


// The gloabl variables for this applicaiton
var DATA_RET =
    {
        // h5serv has an issue with full hostnames
        hdf5DataServer: window.location.protocol + '//' +
                        window.location.hostname.replace('.maxiv.lu.se', '') +
                        ':5000',
    };


// Settings used in all ajax requests
$.ajaxSetup({
    type:       'GET',
    dataType:   'json',
    async:      true,
    cache:      false,
    timeout:    2000
});


function getData(dataValueUrl) {

    // Get the data
    $.ajax({
        url: dataValueUrl,

        success: function (response) {
            var debug = false;

            if (debug) {
                console.log("AJAX " + dataValueUrl + " request success");
            }

            if (response.hasOwnProperty('value')) {
                initializeData(response.value);
            }
        },

        error: function (response) {
            console.log('AJAX ' + dataValueUrl + ' error: ' + response);
        }

    });

}


// This function fires when the page is loaded
$(document).ready(function () {

    var debug = false;

    if (debug) {
        console.log('document is ready');
    }

    getData(DATA_RET.hdf5DataServer + '/datasets/' +
        "c64df0ee-c6a6-11e6-b2af-080027343bb1/" +
        "value?host=AgBehenate_228.from-zdenek.maxiv.lu.se");

});
