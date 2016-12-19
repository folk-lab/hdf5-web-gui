/*global Plotly*/
'use strict';


// Create some data, plot it
function drawVisualization() {

    var z1, data, layout;

    // Initial Data
    z1 = [
        [8.83, 8.89, 8.81, 8.87, 8.9, 8.87],
        [8.89, 8.94, 8.85, 8.94, 8.96, 8.92],
        [8.84, 8.9, 8.82, 8.92, 8.93, 8.91],
        [8.79, 8.85, 8.79, 8.9, 8.94, 8.92],
        [8.79, 8.88, 8.81, 8.9, 8.95, 8.92],
        [8.8, 8.82, 8.78, 8.91, 8.94, 8.92],
        [8.75, 8.78, 8.77, 8.91, 8.95, 8.92],
        [8.8, 8.8, 8.77, 8.91, 8.95, 8.94],
        [8.74, 8.81, 8.76, 8.93, 8.98, 8.99],
        [8.89, 8.99, 8.92, 9.1, 9.13, 9.11],
        [8.97, 8.97, 8.91, 9.09, 9.11, 9.11],
        [9.04, 9.08, 9.05, 9.25, 9.28, 9.27],
        [9, 9.01, 9, 9.2, 9.23, 9.2],
        [8.99, 8.99, 8.98, 9.18, 9.2, 9.19],
        [8.93, 8.97, 8.97, 9.18, 9.2, 9.18]
    ];

    // creating data objects..
    data = [
        {
            z: z1,
            type: 'surface'
        }
    ];

    layout = {
        title: 'Mt Bruno Elevation',
        autosize: false,
        width: 1000,
        height: 800,
        margin: {
            l: 65,
            r: 50,
            b: 65,
            t: 90,
        }
    };

    // Plotting the surfaces..
    Plotly.newPlot('myDiv', data, layout);


}

// This function fires when the page is loaded
document.addEventListener('DOMContentLoaded', function () {

    console.log('document is ready');

    drawVisualization();

}, false);
