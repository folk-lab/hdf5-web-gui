/*global Plotly*/
'use strict';

function drawVisualization(value, divName, plotType) {

    var data, layout;

    // Create data objects
    data = [
        {
            z: value,
            type: plotType,
            colorscale: 'Hot',
            reversescale: true,
        }
    ];

    // And the layout
    layout = {
        title: 'AgBehenate_228',
        autosize: false,
        width: 600,
        height: 500,
        margin: {
            l: 65,
            r: 50,
            b: 65,
            t: 90,
        },
    };

    // Present them
    Plotly.newPlot(divName, data, layout);

}


function drawFancyShit(value, divName, plotType) {

    var i, j, x1, y1, x2, y2,
        xProfilePlot, yProfilePlot, data, layout, mainDataPlot;

    x1 = [];
    y1 = [];
    x2 = [];
    y2 = [];

    console.log('value.length: ' + value.length);
    for (i = 0; i < value.length; i += 1) {

        x1[i] = i;
        y1[i] = 0;

        for (j = 0; j < value[i].length; j += 1) {

            if (i === 0) {
                x2[j] = j;
                y2[j] = 0;
            }

            y1[i] += value[i][j];
            y2[j] += value[i][j];
        }
    }

    console.log('x1.length: ' + x1.length);
    console.log('y1.length: ' + y1.length);
    console.log('x1[0] ' + x1[0]);

    // The x-profile of the plot, displayed as a bar chart / histogram
    xProfilePlot = {
        x: x2,
        y: y2,
        name: 'x profile',
        marker: {color: 'rgb(102,0,0)'},
        yaxis: 'y2',
        type: 'bar'
    };

    // The y-profile, also displayed as a bar chart / histogram, oriented
    // horizontally
    yProfilePlot = {
        x: y1,
        y: x1,
        name: 'y profile',
        marker: {color: 'rgb(102,0,0)'},
        xaxis: 'x2',
        type: 'bar',
        orientation: 'h'
    };

    // The primary, 2-dimensional plot of the data - works best as a 'contour'
    // plot me thinks
    mainDataPlot = {
        z: value,
        type: plotType,
        colorscale: 'Hot',
        reversescale: true,
    };

    // All the data that is to be plotted
    data = [mainDataPlot, xProfilePlot, yProfilePlot];

    // The layout of the plotting canvas and axes. Note that the amount of
    // space each plot takes up is a range from 0 to 1, and follows the keyword
    // 'domain'
    layout = {
        title: 'AgBehenate_228',
        showlegend: false,
        autosize: false,
        width: 600,
        height: 500,
        hovermode: 'closest',
        bargap: 0,

        xaxis: {
            domain: [0, 0.85],
            showgrid: false,
            zeroline: false
        },

        yaxis: {
            domain: [0, 0.85],
            showgrid: false,
            zeroline: false
        },

        xaxis2: {
            domain: [0.85, 1],
            showgrid: false,
            zeroline: false
        },

        yaxis2: {
            domain: [0.85, 1],
            showgrid: false,
            zeroline: false
        }
    };

    Plotly.newPlot(divName, data, layout);

}


function displayData(value) {
    drawVisualization(value, 'myDiv1', 'surface');
    drawFancyShit(value, 'myDiv2', 'contour');
}
