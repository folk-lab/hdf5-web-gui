/*global $*/
'use strict';

// External libraries
var SERVER_COMMUNICATION, DATA_DISPLAY, FILE_NAV, AJAX_SPINNER,

    // The gloabl variables for this applicaiton
    HANDLE_DATASET =
    {
        // h5serv has an issue with full hostnames - dumb fix
        hdf5DataServer: window.location.protocol + '//' +
                        window.location.hostname.replace('.maxiv.lu.se',
                        '') + ':5000',


        // Return a dataset value
        getDatasetValue : function (inputUrl, nodeId) {

            var debug = false, valueUrl;


            if (debug) {
                console.log('inputUrl: ' + inputUrl);
            }

            valueUrl = inputUrl.replace(nodeId, nodeId + '/value');

            if (debug) {
                console.log('valueUrl: ' + valueUrl);
            }


            // Get the data
            return $.when(SERVER_COMMUNICATION.ajaxRequest(valueUrl)).then(
                function (response) {
                    return response.value;
                }
            );
        },


        // When an image is selected, get it and plot it
        displayImage : function (inputUrl, shapeDims, section, nodeId,
            newImage) {

            // Get the data
            return $.when(HANDLE_DATASET.getImage(inputUrl, section,
                nodeId)).then(

                function (value) {

                    // Save some information about the image
                    DATA_DISPLAY.saveImageInfo(inputUrl, nodeId, shapeDims,
                        newImage, section);

                    DATA_DISPLAY.initializeImageData(value, false);

                    // For zooming in large downsampled image, this should
                    // be false
                    if (newImage) {
                        // Enable plot controls
                        DATA_DISPLAY.enableImagePlotControls(true, false);

                        // Plot the data
                        DATA_DISPLAY.plotData();
                    }
                }
            );
        },


        // When a dataset is selected, plot the data
        getImage : function (inputUrl, section, nodeId) {

            var debug = true, valueUrl;


            if (debug) {
                console.log('inputUrl: ' + inputUrl);
            }

            valueUrl = inputUrl.replace(nodeId, nodeId + '/value');

            if (section) {
                valueUrl += '&select=[' + section[2] + ':' + section[3] + ','
                    + section[0] + ':' + section[1] + ']';
            }

            if (debug) {
                console.log('valueUrl: ' + valueUrl);
                console.log('section:  ' + section);
            }

            // Get the data
            return $.when(SERVER_COMMUNICATION.ajaxRequest(valueUrl)).then(
                function (response) {

                    console.log('response');
                    console.log(response);

                    return response.value;
                }
            );
        },


        // Get a single image from a stack of images, which are typically
        // saved as 3 dimensional arrays, with the first dimension being
        // the image number
        readImageFromSeries : function (targetUrl, nodeId, imageIndex,
            section) {

            var debug = true, valueUrl, chunks, matrix, numChunkRows,
                numChunkColumns, imageIndexStart, imageIndexStop;

            // The selected image in the stack is just a single slice of a
            // python array
            imageIndexStart = Number(imageIndex);
            imageIndexStop = Number(imageIndexStart + 1);

            if (debug) {
                console.log('targetUrl: ' + targetUrl);
            }

            valueUrl = targetUrl.replace(nodeId, nodeId + '/value') +
                '&select=[' + imageIndexStart + ':' + imageIndexStop + ',';

            if (section) {
                valueUrl += section[2] + ':' + section[3] + ','
                    + section[0] + ':' + section[1] + ']';
            } else {
                valueUrl += ':,:]';
            }

            if (debug) {
                console.log('valueUrl: ' + valueUrl);
            }

            // Get the image data - actually a 3D array
            return $.when(SERVER_COMMUNICATION.ajaxRequest(valueUrl)).then(
                function (response) {

                    // This should be a 3D array
                    chunks = response.value;

                    // Each chunk should be a matrix (2D array)
                    matrix = chunks[0];

                    if (debug) {
                        numChunkRows = matrix.length;
                        numChunkColumns = matrix[0].length;
                        console.log('numChunkRows:     ' + numChunkRows);
                        console.log('numChunkColumns : ' +
                            numChunkColumns);
                    }

                    // Return the 2D array === image
                    return matrix;
                }
            );

        },


        // Handle input from image series control buttons
        // This assumes that displayImageSeriesInitial() has at some point
        // already been called
        imageSeriesInput : function (imageIndex, section, newImage,
            zoomEvent) {

            var debug = true, min = 0,
                max = DATA_DISPLAY.imageSeriesRange - 1;

            if (debug) {
                console.log('imageSeriesInput: ' + imageIndex);
                console.log('section: ');
                console.log(section);
                console.log('min: ' + min);
                console.log('max: ' + max);
            }

            if (DATA_DISPLAY.isNumeric(imageIndex)) {

                // Start the spinner
                AJAX_SPINNER.startLoadingData(100);

                // Check for out of range values
                if (imageIndex < min) {
                    imageIndex = min;
                }

                if (imageIndex > max) {
                    imageIndex = max;
                }

                // Set image series entry field value
                $("#inputNumberDiv").val(imageIndex);

                // Set the slider value
                $("#slider").slider({
                    'data-value': imageIndex,
                    'value': imageIndex,
                });
                $("#slider").slider('refresh');

                DATA_DISPLAY.saveImageInfo(false, false, false, true, section);

                // Get an image from the series and display it
                return $.when(
                    HANDLE_DATASET.readImageFromSeries(
                        DATA_DISPLAY.imageTargetUrl,
                        DATA_DISPLAY.imageNodeId,
                        imageIndex,
                        DATA_DISPLAY.imageZoomSection
                    )
                ).then(

                    function (image) {
                        // Change the data being displayed
                        DATA_DISPLAY.initializeImageData(image, imageIndex);

                        if (!zoomEvent) {
                            DATA_DISPLAY.updatePlotZData(
                                DATA_DISPLAY.imageZoomSection,
                                newImage,
                                true
                            );
                        }
                    }

                );
            }

            HANDLE_DATASET.imageSeriesInput(0, false, true, false);
        },


        // Setup an image series
        displayImageSeriesInitial : function (targetUrl, shapeDims) {

            var debug = true, nodeId;

            // Extract the id from the target url
            nodeId = targetUrl.match(new RegExp('datasets/' + "(.*)" +
                '\\?host'))[1];

            if (debug) {
                console.log('nodeId: ' + nodeId);
                console.log(shapeDims.length);
                console.log(shapeDims);
            }

            // Save some information about the image series
            DATA_DISPLAY.saveImageInfo(targetUrl, nodeId, shapeDims, true,
                false);

            // Get the first image in the series and display it
            $.when(HANDLE_DATASET.readImageFromSeries(targetUrl,
                nodeId, 0, false)).then(

                function (completeImage) {

                    // Enable some plot controls
                    DATA_DISPLAY.enableImagePlotControls(true, true);

                    // Plot the data
                    DATA_DISPLAY.initializeImageData(completeImage, 0);
                    DATA_DISPLAY.plotData();

                }
            );
        },


        // Get a simple data value - text or a number
        getDataValue : function (dataUrl, getItem) {

            var debug = false, returnValue = '';

            return $.when(SERVER_COMMUNICATION.ajaxRequest(dataUrl)).then(
                function (response) {

                    var key = '';

                    if (debug) {
                        for (key in response) {
                            if (response.hasOwnProperty(key)) {
                                console.log(key + " -> " + response[key]);
                            }
                        }
                    }

                    if (response.hasOwnProperty(getItem)) {
                        returnValue = response[getItem];
                    }

                    return returnValue;
                }
            );

        },


        // When a dataset is selected, display whatever text there is
        displayText : function (inputUrl, inputText, fontColor) {

            var debug = false;

            if (debug) {
                console.log('inputUrl: ' + inputUrl);
            }

            // Get the link to the data
            $.when(FILE_NAV.getTopLevelUrl(inputUrl, 'hrefs', 'data')).then(
                function (dataUrl) {

                    if (debug) {
                        console.log('dataUrl:  ' + dataUrl);
                    }

                    // Get the data
                    $.when(HANDLE_DATASET.getDataValue(dataUrl, 'value')).then(
                        function (value) {

                            if (debug) {
                                console.log('value:  ' + value);
                            }

                            // Display the data
                            DATA_DISPLAY.drawText(inputText, value, fontColor);
                        }
                    );

                }
            );
        },

        displayLine : function (inputUrl, selectedId, nodeTitle) {

            var debug = false, valueUrl;

            if (debug) {
                console.log('inputUrl: ' + inputUrl);
            }

            // Create the url that gets the data from the server
            valueUrl = inputUrl.replace(selectedId, selectedId + '/value');

            if (debug) {
                console.log('valueUrl: ' + valueUrl);
            }

            // Get the data (from data-retrieval.js), then plot it
            $.when(SERVER_COMMUNICATION.ajaxRequest(valueUrl)).then(
                function (response) {

                    if (debug) {
                        console.log(response.value);
                    }

                    // Display the data
                    DATA_DISPLAY.plotLine(response.value, nodeTitle);
                }
            );

        },



    };


// Settings used in all ajax requests
$.ajaxSetup({
    type:       'GET',
    dataType:   'json',
    async:      true,
    cache:      false,
    timeout:    2000
});


// This function fires when the page is loaded
$(document).ready(function () {

    var debug = false;

    if (debug) {
        console.log('document is ready');
    }

});
