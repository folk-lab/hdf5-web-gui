/*global $*/
'use strict';

// External libraries
var SERVER_COMMUNICATION, DATA_PLOT, FILE_NAV,

    // The gloabl variables for this applicaiton
    HANDLE_DATASET =
    {
        // h5serv has an issue with full hostnames - dumb fix
        hdf5DataServer: window.location.protocol + '//' +
                        window.location.hostname.replace('.maxiv.lu.se',
                        '') + ':5000',


        // When a dataset is selected, plot the data
        displayImage : function (inputUrl, selectedId) {

            var debug = false, valueUrl;

            if (debug) {
                console.log('inputUrl: ' + inputUrl);
            }

            // Create the url that gets the data from the server
            valueUrl = inputUrl.replace(selectedId, selectedId + '/value');

            if (debug) {
                console.log('valueUrl: ' + valueUrl);
            }


            // Get the data
            $.when(SERVER_COMMUNICATION.ajaxRequest(valueUrl)).then(
                function (response) {

                    // Enable some plot controls
                    DATA_PLOT.displayingImageSeries(false);
                    DATA_PLOT.enableImagePlotControls(true, false);

                    // Plot the data
                    DATA_PLOT.initializeImageData(response.value);
                    DATA_PLOT.plotData();
                }
            );
        },


        // Get a single image from a stack of images, which are typically
        // saved as 3 dimensional arrays, with the first dimension being
        // the image number
        readImageSeries : function (targetUrl, nodeId, shapeDims,
            imageIndex) {

            var debug = true, valueUrl, chunks, matrix, numChunkRows,
                numChunkColumns, imageIndexStart, imageIndexStop,
                imageXDim, imageYDim, isBigImage = false,
                imageSliceParameters = '',
                sliceX = [], sliceY = [], stepX = 1, stepY = 1;

            if (debug) {
                console.log('shapeDims: ' + shapeDims);
            }

            imageXDim = shapeDims[1];
            imageYDim = shapeDims[2];

            if (imageXDim * imageYDim > 1.0e6) {
                isBigImage = true;
            }

            if (debug) {
                console.log('imageXDim:  ' + imageXDim);
                console.log('imageYDim:  ' + imageYDim);
                console.log('isBigImage: ' + isBigImage);
            }


            // The selected image in the stack is just a single slice of a
            // python array
            imageIndexStart = Number(imageIndex);
            imageIndexStop = Number(imageIndexStart + 1);

            // If it's a big image, do something - not what is done here,
            // something better!
            if (isBigImage) {
                sliceX[0] = Math.floor(imageXDim / 2) - 250;
                sliceX[1] = Math.floor(imageXDim / 2) + 250;
                sliceY[0] = Math.floor(imageYDim / 2) - 250;
                sliceY[1] = Math.floor(imageYDim / 2) + 250;
                stepX = Math.floor(imageXDim / 800);
                stepY = Math.floor(imageYDim / 800);
                imageSliceParameters = '::' + stepX + ',::' + stepY;
            } else {
                imageSliceParameters = ':,:';
            }

            // Create the url that gets the data from the server, slice and
            // dice the data
            valueUrl = targetUrl.replace(nodeId, nodeId + '/value') +
                '&select=[' + imageIndexStart + ':' + imageIndexStop + ','
                + imageSliceParameters  + ']';

            if (debug) {
                console.log('valueUrl: ' + valueUrl);
            }

            // Get the data (from data-retrieval.js), then plot it
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


        // Deal with an image series
        setupImageSeries : function (targetUrl, nodeId) {

            var debug = false;

            // Get some information about this dataset
            $.when(SERVER_COMMUNICATION.ajaxRequest(targetUrl)).then(
                function (response) {

                    var key = '', shapeDims = false, layout = false,
                        layoutDims = false;

                    if (debug) {
                        console.log('nodeId: ' + nodeId);

                        for (key in response) {
                            if (response.hasOwnProperty(key)) {
                                console.log(key + " -> " + response[key]);
                            }
                        }
                    }

                    if (response.hasOwnProperty('shape')) {
                        if (response.shape.hasOwnProperty('dims')) {

                            shapeDims = response.shape.dims;

                            if (debug) {
                                console.log(shapeDims.length);
                                console.log(shapeDims);
                            }

                        }
                    }

                    if (response.hasOwnProperty('creationProperties')) {
                        if (response.creationProperties.hasOwnProperty(
                                'layout'
                            )) {

                            layout = response.creationProperties.layout;

                            if (layout.hasOwnProperty('dims')) {

                                layoutDims = layout.dims;

                                if (debug) {
                                    console.log(layoutDims.length);
                                    console.log(layoutDims);
                                }

                            }
                        }
                    }

                    // Save some information about the image series
                    DATA_PLOT.saveImageSeriesInfo(targetUrl, nodeId,
                        shapeDims);

                    // Get the first image in the series and display it
                    $.when(HANDLE_DATASET.readImageSeries(targetUrl,
                        nodeId, shapeDims, 0)).then(

                        function (completeImage) {

                            // Enable some plot controls
                            DATA_PLOT.displayingImageSeries(true);
                            DATA_PLOT.enableImagePlotControls(true, true);

                            // Plot the data
                            DATA_PLOT.initializeImageData(completeImage);
                            DATA_PLOT.plotData();

                        }
                    );
                }
            );
        },


        // Get some information about a 'datasets' object
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
                            DATA_PLOT.displayingImageSeries(false);
                            DATA_PLOT.enableImagePlotControls(false, false);
                            DATA_PLOT.drawText(inputText, value, fontColor);
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

                    // Plotting functions from data-plot.js
                    DATA_PLOT.displayingImageSeries(false);
                    DATA_PLOT.enableImagePlotControls(false, false);
                    DATA_PLOT.plotLine(response.value, nodeTitle);
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
