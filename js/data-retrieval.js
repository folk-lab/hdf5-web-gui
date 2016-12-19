/*global $, displayData*/
'use strict';


// The gloabl variables for this applicaiton
var DATA_RET =
    {
        hdf5DataServer : 'http://localhost:5000/datasets/',
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

    // Get the species data then update the table
    $.ajax({
        url: dataValueUrl,

        success: function (response) {
            console.log("AJAX " + dataValueUrl + " request success");

            if (response.hasOwnProperty('value')) {
                displayData(response.value);
            }
        },

        error: function (response) {
            console.log('AJAX ' + dataValueUrl + ' error: ' + response);
        }

    });

}


// This function fires when the page is loaded
$(document).ready(function () {

    console.log('document is ready');

    // getData("http://localhost:5000/datasets/" +
    //     "809a7a4c-a4f2-11e6-9d2c-080027343bb1/" +
    //     "value?host=p1m_mask_mandelbrot-s02.from-zdenek.hdfgroup.org");

    // getData("http://localhost:5000/datasets/" +
    //     "f9fa1489-baec-11e6-8791-080027343bb1/" +
    //     "value?host=tall.public.hdfgroup.org");

    getData(DATA_RET.hdf5DataServer +
        "4b01d1b0-a4f2-11e6-9d2c-080027343bb1/" +
        "value?host=AgBehenate_228.from-zdenek.hdfgroup.org");

});
