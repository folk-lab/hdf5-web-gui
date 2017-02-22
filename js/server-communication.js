/*global $*/
'use strict';


// External libraries
var AJAX_SPINNER, DATA_DISPLAY,

    // The global variables for this applicaiton
    SERVER_COMMUNICATION =
    {
        // h5serv has an issue with full hostnames - dumb fix
        hdf5DataServer: window.location.protocol + '//' +
                        window.location.hostname.replace('.maxiv.lu.se',
                        '') + ':5000',

        // Send a request to the HDF5 REST server
        ajaxRequest : function (url) {

            // Send an ajax request to the server - the return value is the
            // response
            return $.ajax({

                url: url,

                success: function (response) {

                    var debug = false, key = '';

                    if (debug) {
                        console.log("AJAX " + url + " request success");
                        console.log(response);

                        for (key in response) {
                            if (response.hasOwnProperty(key)) {
                                console.log(key + " -> " + response[key]);
                            }
                        }
                    }

                },

                error: function (response) {

                    var debug = false, key = '';

                    AJAX_SPINNER.doneLoadingData();
                    DATA_DISPLAY.displayErrorMessage(url);

                    console.log('AJAX ' + url + ' error: ' + response);

                    if (debug) {
                        for (key in response) {
                            if (response.hasOwnProperty(key)) {
                                console.log("** " + key + " -> " +
                                    response[key]);
                            }
                        }
                    }
                },

                // Settings used in all ajax requests
                type:       'GET',
                dataType:   'json',
                async:      true,
                cache:      false,
                timeout:    20000
            });

        }

    };


// This function fires when the page is loaded
$(document).ready(function () {

    var debug = false;

    if (debug) {
        console.log('document is ready');
    }

});
