/*global $, initializePlotData*/
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
    return $.ajax({
        url: dataValueUrl,

        success: function (response) {
            var debug = false;

            if (debug) {
                console.log("AJAX " + dataValueUrl + " request success");
                console.log(response);
            }

        },

        error: function (response) {
            console.log('AJAX ' + dataValueUrl + ' error: ' + response);
        }

    });

}


function readChunkedData(targetUrl, nodeId, shapeDims) {

    var debug = true, valueUrl, chunks, matrix, numChunks, numChunkRows,
        numChunkColumns, sliceStart, sliceWidth, sliceEnd,
        completeImage = [], imageRow, numImageRows, numImageColumns, i, j,
        numLayoutRows;


    if (debug) {
        console.log('shapeDims: ' + shapeDims);
    }

    // Set the number of chunks that are stiched together before starting a
    // new row in the image
    numLayoutRows = 3;

    // The slice width will end up being equal to the number of chunks
    sliceStart = 0;
    sliceWidth = numLayoutRows * numLayoutRows;
    sliceEnd = sliceStart + sliceWidth;
    // Create the url that gets the data from the server, slice and dice the
    // data
    valueUrl = targetUrl.replace(nodeId, nodeId + '/value') +
        '&select=[' + sliceStart + ':' + sliceEnd + ',:,:]';

    if (debug) {
        console.log('valueUrl: ' + valueUrl);
    }

    // Get the data (from data-retrieval.js), then plot it
    return $.when(getData(valueUrl)).then(
        function (response) {

            chunks = response.value;
            numChunks = chunks.length;

            if (debug) {
                console.log(chunks);
                console.log('num chunks: ' + numChunks);
            }

            // Loop over each chunk
            for (i = 0; i < numChunks; i += 1) {

                // Each chunk should be a matrix (2D array)
                matrix = chunks[i];
                numChunkRows = matrix.length;
                numChunkColumns = matrix[0].length;
                if (debug) {
                    console.log('i: ' + i);
                    console.log('numChunkRows:     ' + numChunkRows);
                    console.log('numChunkColumns : ' + numChunkColumns);
                }

                // Loop over each row in the matrix
                //
                // I have no idea how these should be stiched together, or if
                // they should be summed or something else - just gonna test
                // some shit out
                //
                for (j = 0; j < numChunkRows; j += 1) {


                    // Initialize new rows in the complete image
                    if (i % numLayoutRows === 0) {
                        completeImage[j +
                            (i / numLayoutRows) * numChunkRows] = [];
                    }

                    // Determine which row in the image to work with
                    imageRow = j + Math.floor(i / numLayoutRows) *
                        numChunkRows;
                    // console.log('imageRow: ' + imageRow);

                    // Add the chunk row to the complete image row
                    $.merge(completeImage[imageRow], matrix[j]);
                }


            }

            if (debug) {
                numImageRows = completeImage.length;
                console.log('numImageRows:    ' + numImageRows);
                numImageColumns = completeImage[0].length;
                console.log('numImageColumns: ' + numImageColumns);

                // for (j = 0; j < numImageRows; j += 1) {
                //     console.log('completeImage[' + j + '].length: ' +
                //         completeImage[j].length);
                // }
            }

            return completeImage;
        }
    );

}


// This function fires when the page is loaded
$(document).ready(function () {

    var debug = false;

    if (debug) {
        console.log('document is ready');
    }

    // getData(DATA_RET.hdf5DataServer + '/datasets/' +
    //     "c64df0ee-c6a6-11e6-b2af-080027343bb1/" +
    //     "value?host=AgBehenate_228.from-zdenek.maxiv.lu.se");

});
