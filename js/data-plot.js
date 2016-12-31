/*global $*/
'use strict';

// Global variables
var DATA_PLOT = {

    plotCanvasDiv : document.getElementById('plotCanvasDiv'),
    colorScale : 'Portland',
    plotLogValues : false,
    plotType : 'heatmap',
    initialDataValues : [],
    logOfDataValues : [],
    dataValues : [],

},

    // External libraries
    Plotly;


function draw3DPlot() {

    var data, layout;

    // data = [
    //     {
    //         z: DATA_PLOT.dataValues,
    //         type: plotType,
    //         colorscale: [
    //             [0, 'rgb(250, 250, 250)'],
    //             [1.0 / 10000, 'rgb(200, 200, 200)'],
    //             [1.0 / 1000, 'rgb(150, 150, 150)'],
    //             [1.0 / 100, 'rgb(100, 100, 100)'],
    //             [1.0 / 10, 'rgb(50, 50, 50)'],
    //             [1.0, 'rgb(0, 0, 0)'],
    //         ],
    //         colorbar: {
    //             tick0: 0,
    //             tickmode: 'array',
    //             tickvals: [0, 1000, 10000, 100000]
    //         }
    //     }
    // ];

    // Create data object
    data = [
        {
            z: DATA_PLOT.dataValues,
            type: DATA_PLOT.plotType,
            colorscale: DATA_PLOT.colorScale,
        }
    ];

    // And the layout
    layout = {
        title: 'AgBehenate_228',
        autosize: false,
        width: 550,
        height: 550,
        margin: {
            l: 65,
            r: 50,
            b: 65,
            t: 90,
        },
        scene: {
            xaxis: {
                title: 'x',
            },
            // zaxis: {
            //     title: 'z blah',
            //     type: 'log',
            //     autorange: true
            // }
        }
    };

    // Present them
    Plotly.newPlot(DATA_PLOT.plotCanvasDiv, data, layout);

}


function fillProfileHistograms(useFillLimitsX, xMin, xMax,
    useFillLimitsY, yMin, yMax) {

    var debug = true, i, j, useFillLimits = false, histValuesX1 = [],
        histValuesY1 = [], histValuesX2 = [], histValuesY2 = [];

    if (debug) {
        console.log('useFillLimitsX: ' + useFillLimitsX);
        console.log('xMin:           ' + xMin);
        console.log('xMax:           ' + xMax);
        console.log('useFillLimitsY: ' + useFillLimitsY);
        console.log('yMin:           ' + yMin);
        console.log('yMax:           ' + yMax);
    }

    if (useFillLimitsY || useFillLimitsX) {
        useFillLimits = true;
    }

    if (!useFillLimitsX) {
        xMin = 0;
        xMax = DATA_PLOT.dataValues[0].length;
    }

    if (!useFillLimitsY) {
        yMin = 0;
        yMax = DATA_PLOT.dataValues.length;
    }

    // Fill profile histograms
    for (i = 0; i < DATA_PLOT.dataValues.length; i += 1) {

        // The y-profile values
        histValuesX1[i] = i;
        histValuesY1[i] = 0;

        for (j = 0; j < DATA_PLOT.dataValues[i].length; j += 1) {

            if (i === 0) {
                // The x-profile values
                histValuesX2[j] = j;
                histValuesY2[j] = 0;
            }

            // If zooming, fill only relevant data
            if (!useFillLimits || (useFillLimits &&
                    i >= yMin && i < yMax && j >= xMin && j < xMax)) {
                histValuesY1[i] += DATA_PLOT.dataValues[i][j];
                histValuesY2[j] += DATA_PLOT.dataValues[i][j];
            }
        }
    }

    if (debug) {
        console.log('histValuesX1.length: ' + histValuesX1.length);
        console.log('histValuesY1.length: ' + histValuesY1.length);
        console.log('histValuesY1[' + yMin + ']:     ' + histValuesY1[yMin]);
        console.log('histValuesX2.length: ' + histValuesX2.length);
        console.log('histValuesY2.length: ' + histValuesY2.length);
        console.log('histValuesY2[' + xMin + ']:     ' + histValuesY2[xMin]);
    }

    return {
        histValuesX1 : histValuesX1,
        histValuesY1 : histValuesY1,
        histValuesX2 : histValuesX2,
        histValuesY2 : histValuesY2,
    };

}


function draw2DPlot() {

    var profiles, xProfilePlot, yProfilePlot, data, layout, mainDataPlot;

    console.log('DATA_PLOT.dataValues.length: ' + DATA_PLOT.dataValues.length);

    profiles = fillProfileHistograms(false, 0, 0, false, 0, 0);

    // The primary, 2-dimensional plot of the data - works best as a 'contour'
    // plot me thinks
    mainDataPlot = {
        z: DATA_PLOT.dataValues,
        // zmin: 2,
        // zmax: 4,
        zsmooth: 'best',
        type: DATA_PLOT.plotType,
        // line: {
        //     smoothing: 0.5
        // },
        colorscale: DATA_PLOT.colorScale,
    };

    // The x-profile of the plot, displayed as a bar chart / histogram
    xProfilePlot = {
        x: profiles.histValuesX2,
        y: profiles.histValuesY2,
        name: 'x profile',
        marker: {color: 'rgb(102,0,0)'},
        yaxis: 'y2',
        type: 'bar'
    };

    // The y-profile, also displayed as a bar chart / histogram, oriented
    // horizontally
    yProfilePlot = {
        x: profiles.histValuesY1,
        y: profiles.histValuesX1,
        name: 'y profile',
        marker: {color: 'rgb(102,0,0)'},
        xaxis: 'x2',
        type: 'bar',
        orientation: 'h'
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
        width: 550,
        height: 550,
        hovermode: 'closest',
        bargap: 0,

        xaxis: {
            title: 'x',
            domain: [0, 0.85],
            showgrid: false,
            zeroline: false
        },

        yaxis: {
            title: 'y',
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
        },
    };

    Plotly.newPlot(DATA_PLOT.plotCanvasDiv, data, layout);


    // Refill the profile histograms when a zoom event occurs
    // Why isn't this done already in the plotly library?!
    DATA_PLOT.plotCanvasDiv.on('plotly_relayout', function (eventdata) {

        var useFillLimitsX = false, xMin = 0, xMax = 0,
            useFillLimitsY = false, yMin = 0, yMax = 0;

        console.log('plotly_relayout ' + DATA_PLOT.plotType);

        console.log(JSON.stringify(eventdata));

        if (eventdata.hasOwnProperty('xaxis.range[0]') &&
                eventdata.hasOwnProperty('xaxis.range[1]')) {
            xMin = Math.floor(eventdata['xaxis.range[0]']);
            xMax = Math.ceil(eventdata['xaxis.range[1]']);
            useFillLimitsX = true;
        }
        if (eventdata.hasOwnProperty('yaxis.range[0]') &&
                eventdata.hasOwnProperty('yaxis.range[1]')) {
            yMin = Math.floor(eventdata['yaxis.range[0]']);
            yMax = Math.ceil(eventdata['yaxis.range[1]']);
            useFillLimitsY = true;
        }

        console.log('x-axis start: ' + xMin);
        console.log('x-axis end:   ' + xMax);
        console.log('y-axis start: ' + yMin);
        console.log('y-axis end:   ' + xMax);

        profiles = fillProfileHistograms(useFillLimitsX, xMin, xMax,
            useFillLimitsY, yMin, yMax);

        Plotly.restyle(DATA_PLOT.plotCanvasDiv, {
            x: [profiles.histValuesX2],
            y: [profiles.histValuesY2],
        }, [1]);

        Plotly.restyle(DATA_PLOT.plotCanvasDiv, {
            x: [profiles.histValuesY1],
            y: [profiles.histValuesX1],
        }, [2]);
    });
}


function plotData() {

    if (DATA_PLOT.plotType === 'surface') {
        draw3DPlot(DATA_PLOT.plotType);
    } else {
        draw2DPlot(DATA_PLOT.plotType);
    }
}


function changeType(type) {

    ///////////////////////////////////////////////////////////////////////////
    // Should use restyle instead of redrawing the entire plot:
    //   https://plot.ly/javascript/plotlyjs-function-reference/#plotly-restyle
    //
    // This doesn't work so well currently, but maybe if I fix things up a bit?
    // Plotly.restyle(DATA_PLOT.plotCanvasDiv, {
    //     type: [type],
    // }, [0]);
    ///////////////////////////////////////////////////////////////////////////

    if (type !== '') {
        DATA_PLOT.plotType = type;
        plotData();
    }

}


function changeColor(colorscale) {

    if (colorscale !== '') {
        DATA_PLOT.colorScale = colorscale;

        Plotly.restyle(DATA_PLOT.plotCanvasDiv, {
            colorscale: DATA_PLOT.colorScale
        }, [0]);
    }
}


function toggleLogPlot() {

    DATA_PLOT.plotLogValues = !DATA_PLOT.plotLogValues;

    if (DATA_PLOT.plotLogValues) {
        $("#logPlotButton").html('Log Plot!');
        $("#logPlotButton").addClass('btn-success');

        DATA_PLOT.dataValues = DATA_PLOT.logOfDataValues;
    } else {
        $("#logPlotButton").html('Log Plot?');
        $("#logPlotButton").removeClass('btn-success');

        DATA_PLOT.dataValues = DATA_PLOT.initialDataValues;
    }

    // I can't get this restyle command to work quite right yet with log scales
    // & colorscheme... the scale of the colorbar is all off :(
    // Plotly.restyle(DATA_PLOT.plotCanvasDiv, {
    //     z: [DATA_PLOT.dataValues],
    // }, [0]);

    plotData();
}


function initializeData(value) {
    // Example for switching between different plotting types:
    //  https://plot.ly/python/custom-buttons/

    var i, j, logOfValue = [];

    DATA_PLOT.initialDataValues = value;

    // Take the log of the points, save for future use - is there a better
    // way??
    for (i = 0; i < value.length; i += 1) {
        logOfValue[i] = [];
        for (j = 0; j < value[i].length; j += 1) {
            if (value[i][j] > 0) {
                // Interesting - log10() is much slow than log()
                //
                // Also, this is slow:
                //    value[i][j] = Math.log(value[i][j]) / Math.LN10;
                // And just dividing by a number that equals Math.log(10) makes
                // using the array slow...:
                //    value[i][j] = Math.log(value[i][j]) / mathLog10;

                // This seems to be the fastest - especially with contour plots
                // Maybe don't use contour plots??
                // logOfValue[i][j] = Math.log(value[i][j]);
                // But maybe log10 makes more sense to use?
                logOfValue[i][j] = Math.log(value[i][j]) / Math.LN10;
            } else {
                logOfValue[i][j] = 0;
            }
        }
    }

    // Save the log values
    DATA_PLOT.logOfDataValues = logOfValue;

    // Set the default data to use for plotting - raw values or thei log
    if (DATA_PLOT.plotLogValues) {
        DATA_PLOT.dataValues = DATA_PLOT.logOfDataValues;
    } else {
        DATA_PLOT.dataValues = DATA_PLOT.initialDataValues;
    }
}
