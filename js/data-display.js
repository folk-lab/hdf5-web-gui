/*global $*/
'use strict';


// External libraries
var AJAX_SPINNER, Plotly, HANDLE_DATASET,

    // Global variables
    DATA_DISPLAY =
    {
        plotCanvasDiv : document.getElementById('plotCanvasDiv'),
        colorScale : 'Jet',
        plotLogValues : false,
        plotType : 'heatmap',
        displayType : '',
        initialDataValues : [],
        logOfDataValues : [],
        dataValues : [],
        resizeTimer : undefined,
        plotWidth : 550,
        plotHeight : 550,
        useDarkTheme : false,
        mobileDisplay : false,

        imageSeries : false,
        imageSeriesRange : 0,
        imageNodeId : undefined,
        imageTargetUrl : undefined,
        imageShapeDims : undefined,
        imageIsDownsampled : false,
        imageZoomSection : false,
        usingOriginalImage : true,

        imageRange : undefined,
        imageRangeSize : [0, 0],
        imageSize : undefined,

        // Clear the plotting canvas along with whatever objects were there
        purgePlotCanvas : function () {
            Plotly.purge(DATA_DISPLAY.plotCanvasDiv);
        },


        // Enable or disable various image and image series controls
        enableImagePlotControls : function (enableImageControls,
            enableSeriesControls) {

            var i, debug = false,
                classNames = 'hidden-xs hidden-sm hidden-md hidden-lg',
                imageControlDiv = ['#plotControls'],
                seriesControlDiv = ['#imageSeriesControl'], seriesMax = 0,
                endButtonWidth = '50px';

            // General plotting controls - show, hide
            for (i = 0; i < imageControlDiv.length; i += 1) {
                if (enableImageControls) {
                    $(imageControlDiv[i]).removeClass(classNames);
                } else {
                    $(imageControlDiv[i]).addClass(classNames);
                }
            }

            // Image series controls - show, hide
            for (i = 0; i < seriesControlDiv.length; i += 1) {
                if (enableSeriesControls) {
                    $(seriesControlDiv[i]).removeClass(classNames);
                } else {
                    $(seriesControlDiv[i]).addClass(classNames);
                }
            }

            DATA_DISPLAY.imageSeries = enableSeriesControls;

            if (enableSeriesControls) {

                seriesMax = DATA_DISPLAY.imageSeriesRange - 1;

                // Reset the value and limits of the input field
                $("#inputNumberDiv").val("0");
                $('#inputNumberDiv').attr({
                    'min' : 0,
                    'max' : seriesMax,
                });

                // Set the limits of the slider
                $("#slider").slider({
                    'data-value': 0,
                    'value': 0,
                    'min': 0,
                    'max': seriesMax,
                });
                $("#slider").slider('refresh');

                // Set the text of the start and end buttons
                $('#startButtonValue').text(0);
                $('#endButtonValue').text(seriesMax);

                // Set the width of the end button, depending on text size
                endButtonWidth = seriesMax.toString().length * 10 + 40;
                endButtonWidth = parseInt(endButtonWidth, 10) + 'px';

                if (debug) {
                    console.log('endButtonWidth: ' + endButtonWidth);
                }

                $('#endButton').css("width", endButtonWidth);
            }
        },


        // Draw an empty plot when there is no data yet selected
        drawText : function (itemTitle, itemValue, fontColor) {

            DATA_DISPLAY.enableImagePlotControls(false, false);

            var debug = false, data, layout, options, mainDataPlot, string1,
                string2;

            DATA_DISPLAY.displayType = 'text';

            // Convert to strings, remove bad, bad things
            string1 = String(itemTitle);
            string2 = String(itemValue);
            string1 = string1.replace(/\$/g, '');
            string2 = string2.replace(/\$/g, '');

            // Check for empty values
            if (string2 === '') {
                string2 = '<empty value>';
            }

            if (debug) {
                console.log(itemTitle + ' --> ' + itemValue);
                console.log(string1 + ' --> ' + string2);
            }

            // Check for color choice
            fontColor = (fontColor === false ? '#ad3a3a' : fontColor);

            // Setup the empty data
            mainDataPlot = {
                z: [],
                type: 'heatmap',
                colorscale: DATA_DISPLAY.colorScale,
            };

            // All the data that is to be plotted
            data = [mainDataPlot];

            // The layout of the plotting canvas and axes.
            layout = {
                title: '',
                showlegend: false,
                autosize: false,
                width: DATA_DISPLAY.plotWidth,
                height: 300,
                paper_bgcolor : (DATA_DISPLAY.useDarkTheme === true ?
                        '#333333' : '#ffffff'),
                plot_bgcolor : (DATA_DISPLAY.useDarkTheme === true ?
                        '#333333' : '#ffffff'),

                xaxis: {
                    title: '',
                    showgrid: false,
                    zeroline: false,
                    showticklabels : false,
                    ticks : '',
                },

                yaxis: {
                    title: '',
                    showgrid: false,
                    zeroline: false,
                    showticklabels : false,
                    ticks : '',
                },

                // More annotation examples here:
                //  https://plot.ly/javascript/text-and-annotations/
                annotations: [
                    {
                        x: 0,
                        y: 0,
                        xref: 'x',
                        yref: 'y',
                        text: '<b>' + string1 + '</b>' + '<br>' + string2,
                        showarrow: false,
                        font: {
                            family: 'Courier New, monospace',
                            size: 16,
                            color: fontColor,
                        },
                        align: 'center',
                        bordercolor: fontColor,
                        borderwidth: 3,
                        borderpad: 4,
                        bgcolor: 'rgba(255, 255, 255, 0.9)',
                        opacity: 0.8
                    }
                ],
            };

            options = {
                staticPlot: true,
                showLink: false,
                displaylogo: false,
                modeBarButtonsToRemove: [
                    'sendDataToCloud', 'hoverCompareCartesian',
                    'hoverClosestCartesian', 'resetScale2d', 'hoverClosest3d',
                    'resetCameraLastSave3d', 'orbitRotation', 'zoomIn2d',
                    'zoomOut2d'],
                displayModeBar: false,
                showTips: false,
            };

            DATA_DISPLAY.purgePlotCanvas();
            Plotly.newPlot(DATA_DISPLAY.plotCanvasDiv, data, layout, options
                ).then(
                AJAX_SPINNER.doneLoadingData()
            );

        },


        displayErrorMessage : function (inputUrl) {
            DATA_DISPLAY.enableImagePlotControls(false, false);
            DATA_DISPLAY.drawText('I don\'t know how to handle this yet!',
                'Sorry for the inconvenience :(',
                '#ad3a74');
            console.log('inputUrl: ' + inputUrl);
        },


        drawLine : function (value, nodeTitle) {

            var data, layout, options;

            // Create data object
            data = [
                {
                    y: value,
                    mode: 'lines',
                    type: 'scatter'
                }
            ];

            // And the layout
            layout = {
                showlegend: false,
                title: nodeTitle,
                autosize: false,
                width: DATA_DISPLAY.plotWidth,
                height: DATA_DISPLAY.plotHeight,
                hovermode: 'closest',
                bargap: 0,
                paper_bgcolor : (DATA_DISPLAY.useDarkTheme === true ?
                        '#333333' : '#ffffff'),
                plot_bgcolor : (DATA_DISPLAY.useDarkTheme === true ?
                        '#333333' : '#ffffff'),
                margin: {
                    l: 65,
                    r: 50,
                    b: 65,
                    t: 90,
                },
                xaxis: {
                    title: 'array index',
                },
                yaxis: {
                    title: 'values',
                }
            };

            options = {
                staticPlot: false,
                showLink: false,
                displaylogo: false,
                modeBarButtonsToRemove: [
                    'sendDataToCloud', 'hoverCompareCartesian',
                    'hoverClosestCartesian', 'resetScale2d', 'hoverClosest3d',
                    'resetCameraLastSave3d', 'orbitRotation', 'zoomIn2d',
                    'zoomOut2d'],
                displayModeBar: true,
                showTips: false,
                scrollZoom: true,
            };
            // All options are here:
            //  https://github.com/plotly/plotly.js/blob/master/src/plot_api/
            //      plot_config.js
            //  https://github.com/plotly/plotly.js/blob/master/src/components/
            //      modebar/buttons.js

            // Present them
            DATA_DISPLAY.purgePlotCanvas();
            Plotly.newPlot(DATA_DISPLAY.plotCanvasDiv, data, layout,
                options).then(AJAX_SPINNER.doneLoadingData()
                );

        },


        draw3DPlot : function () {

            var data, layout, options, plotMargins;

            // Create data object
            data = [
                {
                    z: DATA_DISPLAY.dataValues,
                    type: DATA_DISPLAY.plotType,
                    colorscale: DATA_DISPLAY.colorScale,
                    showscale : !DATA_DISPLAY.mobileDisplay,

                    // opacity: 0.999,
                    // autocolorscale : false,
                    // colorscale : [[0, 'rgb(0,0,255)', 1, 'rgb(255,0,0)']],
                    // cauto: false,
                    // contours : {
                    //     x : {
                    //         show : true,
                    //     },
                    //     y : {
                    //         show : true,
                    //     },
                    //     z : {
                    //         show : true,
                    //     },
                    // },

                }
            ];

            plotMargins =  { l: 65, r: 50, b: 65, t: 90, };
            if (DATA_DISPLAY.mobileDisplay) {
                plotMargins =  { l: 30, r: 20, b: 30, t: 20, };
            }

            // And the layout
            layout = {
                showlegend: false,
                title : (DATA_DISPLAY.mobileDisplay === true ?
                        '' : 'Title goes here'),
                autosize: false,
                width: DATA_DISPLAY.plotWidth,
                height: DATA_DISPLAY.plotHeight,
                hovermode: 'closest',
                bargap: 0,
                paper_bgcolor : (DATA_DISPLAY.useDarkTheme === true ?
                        '#333333' : '#ffffff'),
                plot_bgcolor : (DATA_DISPLAY.useDarkTheme === true ?
                        '#333333' : '#ffffff'),
                margin: plotMargins,
                scene: {
                    xaxis: {
                        title: 'x',
                    },
                    zaxis: {
                        title: 'z blah',
                        type: 'linear',
                        // type: 'log',
                        autorange: true
                    }
                }
            };

            options = {
                staticPlot: false,
                showLink: false,
                displaylogo: false,
                modeBarButtonsToRemove: [
                    'sendDataToCloud', 'hoverCompareCartesian',
                    'hoverClosestCartesian', 'resetScale2d', 'hoverClosest3d',
                    'resetCameraLastSave3d', 'orbitRotation', 'zoomIn2d',
                    'zoomOut2d'],
                displayModeBar: true,
                showTips: false,
                scrollZoom: true,
            };
            // All options are here:
            //  https://github.com/plotly/plotly.js/blob/master/src/plot_api/
            //      plot_config.js
            //  https://github.com/plotly/plotly.js/blob/master/src/components/
            //      modebar/buttons.js

            // Present them
            DATA_DISPLAY.purgePlotCanvas();
            Plotly.newPlot(DATA_DISPLAY.plotCanvasDiv, data, layout,
                options).then(
                AJAX_SPINNER.doneLoadingData()
            );

        },


        // Fill x and y profile histograms, given the image and the dimensions
        // of the section of the image being viewed
        fillProfileHistograms : function (ranges) {

            var debug = true, i, j, histValuesX1 = [], histValuesY1 = [],
                histValuesX2 = [], histValuesY2 = [], xFactor = 1, yFactor = 1,
                zMin = 1e100, zMax = -1e100, xMin = ranges[0],
                xMax = ranges[1], yMin = ranges[2], yMax = ranges[3],
                xCoordinate, yCoordinate;

            if (debug) {
                console.log('xMin:           ' + xMin);
                console.log('xMax:           ' + xMax);
                console.log('yMin:           ' + yMin);
                console.log('yMax:           ' + yMax);
            }

            // Check if this is a downsampled image - if so, change the axes
            // ranges
            if (DATA_DISPLAY.imageIsDownsampled) {
                xFactor = (xMax - xMin) / DATA_DISPLAY.dataValues[0].length;
                console.log('xFactor: ' + xFactor);

                yFactor = (yMax - yMin) / DATA_DISPLAY.dataValues.length;
                console.log('yFactor: ' + yFactor);
            }

            if (debug) {
                console.log('xMin:           ' + xMin);
                console.log('xMax:           ' + xMax);
                console.log('yMin:           ' + yMin);
                console.log('yMax:           ' + yMax);
                console.log('xFactor:        ' + xFactor);
                console.log('yFactor:        ' + yFactor);
                console.log('DATA_DISPLAY.dataValues.length: ' +
                    DATA_DISPLAY.dataValues.length);
                console.log('DATA_DISPLAY.dataValues[i].length: ' +
                    DATA_DISPLAY.dataValues[0].length);
            }

            // Fill profile histograms
            for (i = 0; i < DATA_DISPLAY.dataValues.length; i += 1) {

                // The y-profile values
                yCoordinate = DATA_DISPLAY.imageRange[2] + yFactor * i;
                histValuesX1[i] = yCoordinate;
                histValuesY1[i] = 0;

                for (j = 0; j < DATA_DISPLAY.dataValues[i].length; j += 1) {

                    xCoordinate = DATA_DISPLAY.imageRange[0] + j * xFactor;

                    if (i === 0) {
                        // The x-profile values
                        histValuesX2[j] = xCoordinate;
                        histValuesY2[j] = 0;
                    }

                    // If zooming, fill only relevant data
                    if (yCoordinate >= yMin && yCoordinate < yMax &&
                            xCoordinate >= xMin && xCoordinate < xMax) {

                        histValuesY1[i] += DATA_DISPLAY.dataValues[i][j];
                        histValuesY2[j] += DATA_DISPLAY.dataValues[i][j];

                        // Find the max and min values - used for setting
                        // colorscale range
                        if (DATA_DISPLAY.dataValues[i][j] < zMin) {
                            zMin = DATA_DISPLAY.dataValues[i][j];
                        }
                        if (DATA_DISPLAY.dataValues[i][j] > zMax) {
                            zMax = DATA_DISPLAY.dataValues[i][j];
                        }

                    }
                }
            }

            if (debug) {
                console.log('histValuesX1.length: ' + histValuesX1.length);
                console.log('histValuesY1.length: ' + histValuesY1.length);
                console.log('histValuesX2.length: ' + histValuesX2.length);
                console.log('histValuesY2.length: ' + histValuesY2.length);
                console.log('zMin: ' + zMin);
                console.log('zMax: ' + zMax);
            }

            return {
                histValuesX1 : histValuesX1,
                histValuesY1 : histValuesY1,
                histValuesX2 : histValuesX2,
                histValuesY2 : histValuesY2,
                zMin : zMin,
                zMax : zMax,
            };

        },


        handle2DZoom : function (eventdata) {

            var debug = true, i = 0, ranges = [-1, -1, -1, -1],
                zoomEvent = false, profiles, plotLayout, promises = [],
                rangeKeys = ['xaxis.range[0]', 'xaxis.range[1]',
                    'yaxis.range[0]', 'yaxis.range[1]'],
                autoKeys = ['xaxis.autorange', 'yaxis.autorange'],
                newImageFetched = false, resetZoomEvent = false;

            if (debug) {
                console.log('DATA_DISPLAY.plotCanvasDiv' +
                    'plotly_relayout ' + DATA_DISPLAY.plotType);
                console.log(JSON.stringify(eventdata));
            }

            // Zoom events return json objects containing keys like
            // 'xaxis.range' or 'xaxis.autorange', other events have
            // other keywords - ignore those
            for (i = 0; i < rangeKeys.length; i += 1) {
                if (eventdata.hasOwnProperty(rangeKeys[i])) {
                    zoomEvent = true;
                }
            }

            for (i = 0; i < autoKeys.length; i += 1) {
                if (eventdata.hasOwnProperty(autoKeys[i])) {
                    zoomEvent = true;
                }
            }

            if (!zoomEvent) {

                if (debug) {
                    console.log('Does not Look like a zoom event, exiting');
                }

                return;
            }

            if (debug) {
                console.log('Looks like a plot zoom event,' +
                    ' carry on!');
                console.log(ranges);

                // Get the present layout range
                plotLayout = DATA_DISPLAY.plotCanvasDiv.layout;
                console.log('plotLayout: ');
                console.log(plotLayout);

                console.log('x-axis start: ' + ranges[0]);
                console.log('x-axis end:   ' + ranges[1]);
                console.log('y-axis start: ' + ranges[2]);
                console.log('y-axis end:   ' + ranges[3]);
            }

            // Look at the 'range' keys, set ranges
            for (i = 0; i < rangeKeys.length; i += 1) {
                if (eventdata.hasOwnProperty(rangeKeys[i])) {

                    ranges[i] = eventdata[rangeKeys[i]];

                    if (debug) {
                        console.log(rangeKeys[i]);
                        console.log(eventdata[rangeKeys[i]]);
                    }

                }
            }

            for (i = 0; i < ranges.length; i += 1) {
                // If any new min or max has not yet been set, then
                // use the present values
                if (ranges[i] === -1) {
                    ranges[i] = DATA_DISPLAY.imageRange[i];
                }

                // Round to the nearest integer
                ranges[i] = Math.round(ranges[i]);

                // Need to add 1 to end of ranges
                if (!DATA_DISPLAY.isEven(i)) {
                    console.log('ranges[' + i + ']: ' + ranges[i]);
                    ranges[i] += 1;
                }
            }

            // Make sure we haven't gone too far
            if (ranges[1] >= DATA_DISPLAY.imageShapeDims[1]) {
                ranges[1] = DATA_DISPLAY.imageShapeDims[1];
            }
            if (ranges[3] >= DATA_DISPLAY.imageShapeDims[0]) {
                ranges[3] = DATA_DISPLAY.imageShapeDims[0];
            }
            if (ranges[0] < 0) {
                ranges[0] = 0;
            }
            if (ranges[1] < 0) {
                ranges[1] = 0;
            }


            // Check for reset-zoom events
            if (eventdata.hasOwnProperty('xaxis.autorange')) {
                ranges[0] = 0;
                ranges[1] = DATA_DISPLAY.imageShapeDims[1];
                resetZoomEvent = true;
            }
            if (eventdata.hasOwnProperty('yaxis.autorange')) {
                ranges[2] = 0;
                ranges[3] = DATA_DISPLAY.imageShapeDims[0];
                resetZoomEvent = true;
            }

            if (debug) {
                console.log('x-axis start: ' + ranges[0]);
                console.log('x-axis end:   ' + ranges[1]);
                console.log('y-axis start: ' + ranges[2]);
                console.log('y-axis end:   ' + ranges[3]);
            }

            AJAX_SPINNER.startLoadingData(1);

            console.log('DATA_DISPLAY.imageIsDownsampled: ' +
                DATA_DISPLAY.imageIsDownsampled);
            console.log('DATA_DISPLAY.usingOriginalImage: ' +
                DATA_DISPLAY.usingOriginalImage);
            console.log('resetZoomEvent: ' + resetZoomEvent);

            // If the original image was downsampled, fetch a new
            // image from the server when zooming
            if (DATA_DISPLAY.imageIsDownsampled ||
                    (!DATA_DISPLAY.usingOriginalImage && resetZoomEvent)) {

                if (DATA_DISPLAY.imageSeries) {
                    promises.push(
                        HANDLE_DATASET.imageSeriesInput(0, ranges, false)
                    );
                } else {
                    promises.push(
                        HANDLE_DATASET.displayImage(
                            DATA_DISPLAY.imageTargetUrl,
                            DATA_DISPLAY.imageShapeDims,
                            ranges,
                            DATA_DISPLAY.imageNodeId,
                            false
                        )
                    );
                }

                newImageFetched = true;
            }

            console.log('newImageFetched: ' + newImageFetched);

            $.when.apply(null, promises).done(

                function () {

                    var xLength, yLength;

                    if (debug) {
                        console.log('refilling histograms');
                    }

                    // Refill the profile histograms
                    profiles = DATA_DISPLAY.fillProfileHistograms(ranges);

                    console.log('profiles:');
                    console.log(profiles);

                    console.log('starting restyling');
                    if (newImageFetched) {
                        // Refill the 2D plot
                        Plotly.restyle(DATA_DISPLAY.plotCanvasDiv, {
                            z: [DATA_DISPLAY.dataValues],
                            x: [profiles.histValuesX2],
                            y: [profiles.histValuesX1],
                            zmin: [profiles.zMin],
                            zmax: [profiles.zMax],
                        }, [0]);

                        // Set the ranges of the 2D plot properly - otherwise
                        // empty bands will appears when not centered on data
                        ranges[0] = profiles.histValuesX2[0] - 0.5;
                        xLength = profiles.histValuesX2.length - 1;
                        ranges[1] = profiles.histValuesX2[xLength] + 0.5;
                        ranges[2] = profiles.histValuesX1[0] - 0.5;
                        yLength = profiles.histValuesX1.length - 1;
                        ranges[3] = profiles.histValuesX1[yLength] + 0.5;

                        if (debug) {
                            console.log('x-axis start: ' + ranges[0]);
                            console.log('x-axis end:   ' + ranges[1]);
                            console.log('y-axis start: ' + ranges[2]);
                            console.log('y-axis end:   ' + ranges[3]);
                        }

                        Plotly.relayout(DATA_DISPLAY.plotCanvasDiv, {
                            xaxis: {range : [ ranges[0], ranges[1]],
                                domain : [0, 0.85]},

                            yaxis: {range : [ ranges[2], ranges[3]],
                                domain : [0, 0.85]},
                        });


                    } else {
                        // Set the min and max so the color bar range updates
                        Plotly.restyle(DATA_DISPLAY.plotCanvasDiv, {
                            zmin: [profiles.zMin],
                            zmax: [profiles.zMax],
                        }, [0]);
                    }
                    console.log('done restyling');

                    // Update the profile histograms in the plot
                    Plotly.restyle(DATA_DISPLAY.plotCanvasDiv, {
                        x: [profiles.histValuesX2],
                        y: [profiles.histValuesY2],
                    }, [1]);
                    console.log('done restyling x profile');

                    Plotly.restyle(DATA_DISPLAY.plotCanvasDiv, {
                        x: [profiles.histValuesY1],
                        y: [profiles.histValuesX1],
                    }, [2]);
                    console.log('done restyling y profile');

                    AJAX_SPINNER.doneLoadingData();

                    if (debug) {
                        // Get the present layout range
                        plotLayout = DATA_DISPLAY.plotCanvasDiv.layout;
                        console.log('plotLayout: ');
                        console.log(plotLayout);
                    }

                }
            );
        },


        // Plot the image as a 2D heatmap along with x and y profile histograms
        // that update when zooming
        draw2DPlot : function () {

            var debug = true, profiles, xProfilePlot, yProfilePlot, data,
                layout, options, mainDataPlot, plotMargins = {};

            if (debug) {
                console.log('DATA_DISPLAY.imageShapeDims[0]' +
                    DATA_DISPLAY.imageShapeDims[0]);
                console.log('DATA_DISPLAY.imageShapeDims[1]' +
                    DATA_DISPLAY.imageShapeDims[1]);
            }

            profiles = DATA_DISPLAY.fillProfileHistograms(
                [0, DATA_DISPLAY.imageShapeDims[1],
                    0, DATA_DISPLAY.imageShapeDims[0]]
            );

            // The primary, 2-dimensional plot of the data - works best as a
            // 'heatmap' plot me thinks
            mainDataPlot = {
                z: DATA_DISPLAY.dataValues,
                zmin: [profiles.zMin],
                zmax: [profiles.zMax],
                x: profiles.histValuesX2,
                y: profiles.histValuesX1,
                zsmooth: false,
                type: DATA_DISPLAY.plotType,
                colorscale: DATA_DISPLAY.colorScale,
                showscale : !DATA_DISPLAY.mobileDisplay,
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

            // The y-profile, also displayed as a bar chart / histogram,
            // oriented horizontally
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

            // Padding around the plotting canvas - less for mobile devices
            plotMargins =  { l: 65, r: 50, b: 65, t: 90, };
            if (DATA_DISPLAY.mobileDisplay) {
                plotMargins =  { l: 30, r: 20, b: 30, t: 20, };
            }

            // The layout of the plotting canvas and axes. Note that the amount
            // of space each plot takes up is a range from 0 to 1, and follows
            // the keyword 'domain'
            layout = {
                title : (DATA_DISPLAY.mobileDisplay === true ?
                        '' : 'Title goes here'),
                showlegend : false,
                autosize : false,

                width: DATA_DISPLAY.plotWidth,
                height: DATA_DISPLAY.plotHeight,
                margin: plotMargins,

                hovermode: 'closest',
                bargap: 0,
                paper_bgcolor : (DATA_DISPLAY.useDarkTheme === true ?
                        '#333333' : '#ffffff'),
                plot_bgcolor : (DATA_DISPLAY.useDarkTheme === true ?
                        '#333333' : '#ffffff'),

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
                    // autorange : "reversed",
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

            options = {
                staticPlot: false,
                showLink: false,
                displaylogo: false,
                modeBarButtonsToRemove: [
                    'sendDataToCloud', 'hoverCompareCartesian',
                    'hoverClosestCartesian', 'resetScale2d', 'hoverClosest3d',
                    'resetCameraLastSave3d', 'orbitRotation', 'zoomIn2d',
                    'zoomOut2d'],
                displayModeBar: true,
                showTips: false,
                scrollZoom: true,
            };
            // All options are here:
            //  https://github.com/plotly/plotly.js/blob/master/src/plot_api/
            //      plot_config.js
            //  https://github.com/plotly/plotly.js/blob/master/src/components/
            //      modebar/buttons.js

            DATA_DISPLAY.purgePlotCanvas();
            Plotly.newPlot(DATA_DISPLAY.plotCanvasDiv, data, layout,
                options).then(
                AJAX_SPINNER.doneLoadingData()
            );

            // Refill the profile histograms when a zoom event occurs
            // Why isn't this properly done already in the plotly library?!
            DATA_DISPLAY.plotCanvasDiv.on('plotly_relayout',
                function (eventdata) {
                    DATA_DISPLAY.handle2DZoom(eventdata);
                });
        },


        // Calculate the plot size - needs to be improved for small screens
        calculatePlotSize : function () {

            var debug = false, newPlotDivHeight, newPlotDivWidth,
                windowWidth = $(window).width(),
                windowHeight = $(window).height(),
                appWidth = $('#applicationContainer').width(),
                appHeight = $('#applicationContainer').height(),
                containerWidth = $('#plotContainer').width(),
                containerHeight = $('#plotContainer').height(),
                divWidth = $('#plotCanvasDiv').width(),
                divHeight = $('#plotCanvasDiv').height();

            newPlotDivHeight = windowHeight - 80;
            if (DATA_DISPLAY.imageSeries) {
                newPlotDivHeight -= 35;
            }

            // For smaller screens, fuck padding
            if (windowWidth > 978) {
                DATA_DISPLAY.mobileDisplay = false;
            } else {
                DATA_DISPLAY.mobileDisplay = true;
            }

            newPlotDivWidth = containerWidth;
            if (!DATA_DISPLAY.mobileDisplay) {
                newPlotDivWidth -= 40;
            }

            if (DATA_DISPLAY.imageSeries && DATA_DISPLAY.mobileDisplay) {
                newPlotDivHeight -= 50;
            }

            if (debug) {
                console.log('DATA_DISPLAY.imageSeries: ' +
                    DATA_DISPLAY.imageSeries);
                console.log('DATA_DISPLAY.mobileDisplay: ' +
                    DATA_DISPLAY.mobileDisplay);
                console.log('appWidth:     ' + appWidth);
                console.log('appHeight:    ' + appHeight);
                console.log('windowWidth:  ' + windowWidth);
                console.log('windowHeight: ' + windowHeight);
                console.log('divWidth:     ' + divWidth);
                console.log('divHeight:    ' + divHeight);
                console.log('containerWidth:   ' + containerWidth);
                console.log('containerHeight:  ' + containerHeight);
                console.log('newPlotDivHeight: ' + newPlotDivHeight);
                console.log('newPlotDivWidth:  ' + newPlotDivWidth);
            }

            $('#plotCanvasDiv').height(newPlotDivHeight);
            DATA_DISPLAY.plotWidth = newPlotDivWidth;
            DATA_DISPLAY.plotHeight = newPlotDivHeight;
        },


        // Plot the data!
        plotLine : function (value, nodeTitle) {

            DATA_DISPLAY.displayType = 'line';

            DATA_DISPLAY.calculatePlotSize();

            DATA_DISPLAY.drawLine(value, nodeTitle);

        },


        // Plot the data! This redraws everything
        plotData : function () {

            DATA_DISPLAY.displayType = 'image';

            DATA_DISPLAY.calculatePlotSize();

            if (DATA_DISPLAY.plotType === 'heatmap') {
                DATA_DISPLAY.draw2DPlot();
            } else {
                DATA_DISPLAY.draw3DPlot();
            }

        },


        // Change the data used in the plot without redrawing everything
        updatePlotZData : function () {

            Plotly.restyle(DATA_DISPLAY.plotCanvasDiv, {
                z: [DATA_DISPLAY.dataValues],
            }, [0]).then(
                AJAX_SPINNER.doneLoadingData()
            );
        },


        // Change the plot type - not all work well for large numbers of
        // points, I think that 'surface' and 'heatmap' seem to work best and
        // are useful
        changeType : function (type) {

            ///////////////////////////////////////////////////////////////////
            // Should use restyle instead of redrawing the entire plot:
            //   https://plot.ly/javascript/plotlyjs-function-reference/
            //      #plotly-restyle
            //
            // This doesn't work so well currently, but maybe if I fix things
            // up a bit?
            // Plotly.restyle(DATA_DISPLAY.plotCanvasDiv, {
            //     type: [type],
            // }, [0]);
            ///////////////////////////////////////////////////////////////////

            if (type !== '') {
                DATA_DISPLAY.purgePlotCanvas();
                AJAX_SPINNER.startLoadingData(1);
                DATA_DISPLAY.plotType = type;
                setTimeout(function () {
                    DATA_DISPLAY.plotData();
                }, 10);
            }

        },


        // Change the color map
        changeColor : function (colorscale) {

            if (colorscale !== '') {

                DATA_DISPLAY.colorScale = colorscale;

                Plotly.restyle(DATA_DISPLAY.plotCanvasDiv, {
                    colorscale: DATA_DISPLAY.colorScale
                }, [0]);
            }
        },


        // Switch between the use of log and non-log values
        toggleLogPlot : function (useLog) {

            var debug = false, useRestyle = false, type = 'linear';

            if (debug) {
                console.log('useLog: ' + useLog);
            }

            // Clear the plot and start the laoder, as this can take some time
            // when the plot has many points
            if (!useRestyle) {
                DATA_DISPLAY.purgePlotCanvas();
            }
            AJAX_SPINNER.startLoadingData(1);

            if (useLog === undefined) {
                DATA_DISPLAY.plotLogValues = !DATA_DISPLAY.plotLogValues;
            } else {
                DATA_DISPLAY.plotLogValues = useLog;
            }

            if (DATA_DISPLAY.plotLogValues) {
                if (debug) {
                    console.log('Log Plot!');
                }
                $("#logPlotButton").html('Log Plot!');
                $("#logPlotButton").addClass('btn-success');

                if (useRestyle) {
                    type = 'log';
                } else {
                    DATA_DISPLAY.dataValues = DATA_DISPLAY.logOfDataValues;
                }
            } else {
                if (debug) {
                    console.log('Log Plot?');
                }
                $("#logPlotButton").html('Log Plot?');
                $("#logPlotButton").removeClass('btn-success');

                if (useRestyle) {
                    type = 'linear';
                } else {
                    DATA_DISPLAY.dataValues = DATA_DISPLAY.initialDataValues;
                }
            }

            // I can't get this restyle command to work quite right yet with
            // log scales & colorscheme... the scale of the colorbar is all off
            // :(
            setTimeout(function () {

                if (useRestyle) {

                    // Plotly.restyle(DATA_DISPLAY.plotCanvasDiv, {
                    //     z: [DATA_DISPLAY.dataValues],
                    // }, [0]).then(
                    //     AJAX_SPINNER.doneLoadingData()
                    // );

                    Plotly.relayout(DATA_DISPLAY.plotCanvasDiv, {
                        scene: {
                            zaxis: {
                                type: type
                            }
                        }
                    }, [0]).then(
                        AJAX_SPINNER.doneLoadingData()
                    );
                } else {
                    DATA_DISPLAY.plotData();
                }
            }, 10);

        },


        // Save the image data and the log of the image data to global
        // variables
        initializeImageData : function (value, newImage) {

            var i, j, logOfValue = [];

            DATA_DISPLAY.initialDataValues = value;

            // Take the log of the points, save for future use - is there a
            // better way??
            for (i = 0; i < value.length; i += 1) {
                logOfValue[i] = [];
                for (j = 0; j < value[i].length; j += 1) {
                    if (value[i][j] > 0) {
                        // Interesting - log10() is much slow than log()
                        //
                        // Also, this is slow:
                        //    value[i][j] = Math.log(value[i][j]) / Math.LN10;
                        // And just dividing by a number that equals
                        // Math.log(10) makes using the array slow...:
                        //    value[i][j] = Math.log(value[i][j]) / mathLog10;

                        // This seems to be the fastest - especially with
                        // contour plots Maybe don't use contour plots??
                        // logOfValue[i][j] = Math.log(value[i][j]);
                        // But maybe log10 makes more sense to use?
                        logOfValue[i][j] = Math.log(value[i][j]) / Math.LN10;
                    } else {
                        logOfValue[i][j] = 0;
                    }
                }
            }

            // Save the log values
            DATA_DISPLAY.logOfDataValues = logOfValue;

            // Set the default data to use for plotting - raw values or the
            // log
            if (DATA_DISPLAY.plotLogValues) {
                DATA_DISPLAY.dataValues = DATA_DISPLAY.logOfDataValues;
            } else {
                DATA_DISPLAY.dataValues = DATA_DISPLAY.initialDataValues;
            }


            ////////////////////////////
            ////////////////////////////

            // The range of the image
            DATA_DISPLAY.imageRange = [0, DATA_DISPLAY.imageShapeDims[1], 0,
                DATA_DISPLAY.imageShapeDims[0]];
            // The size (in pixels) of the image
            DATA_DISPLAY.imageSize = [DATA_DISPLAY.dataValues[0].length,
                DATA_DISPLAY.dataValues.length];

            // If we are zoomed in, set the proper range
            if (DATA_DISPLAY.imageZoomSection) {
                DATA_DISPLAY.imageRange = DATA_DISPLAY.imageZoomSection;
            }

            // The size of the image range
            DATA_DISPLAY.imageRangeSize[0] = DATA_DISPLAY.imageRange[1] -
                DATA_DISPLAY.imageRange[0];
            DATA_DISPLAY.imageRangeSize[1] = DATA_DISPLAY.imageRange[3] -
                DATA_DISPLAY.imageRange[2];

            // Check if the image has been downsampled
            DATA_DISPLAY.imageIsDownsampled = false;
            if (DATA_DISPLAY.imageRangeSize[0] !== DATA_DISPLAY.imageSize[0] ||
                    DATA_DISPLAY.imageRangeSize[1] !==
                    DATA_DISPLAY.imageSize[1]) {

                DATA_DISPLAY.imageIsDownsampled = true;
            }

            DATA_DISPLAY.usingOriginalImage = newImage;

            console.log('DATA_DISPLAY.imageSize: ' +
                DATA_DISPLAY.imageSize);
            console.log('DATA_DISPLAY.imageRange: ' +
                DATA_DISPLAY.imageRange);
            console.log('DATA_DISPLAY.imageRangeSize: ' +
                DATA_DISPLAY.imageRangeSize);
            console.log('DATA_DISPLAY.imageZoomSection:   ' +
                DATA_DISPLAY.imageZoomSection);
            console.log('DATA_DISPLAY.imageIsDownsampled: ' +
                DATA_DISPLAY.imageIsDownsampled);
            console.log('DATA_DISPLAY.usingOriginalImage: ' +
                DATA_DISPLAY.usingOriginalImage);

        },


        // Check if the object is a number
        isNumeric : function (n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
        },

        // Check if odd or even
        isEven : function (n) {

            var result = (n % 2 === 0) ? true : false;
            return result;
        },

        // Save some information about an image
        saveImageInfo : function (targetUrl, nodeId, shapeDims, section) {
            DATA_DISPLAY.imageNodeId = nodeId;
            DATA_DISPLAY.imageTargetUrl = targetUrl;
            DATA_DISPLAY.imageShapeDims = shapeDims;
            if (shapeDims.length === 3) {
                DATA_DISPLAY.imageSeriesRange = shapeDims[0];
                DATA_DISPLAY.imageShapeDims = [shapeDims[1], shapeDims[2]];
            }
            DATA_DISPLAY.imageZoomSection = section;
        },


    };


// Handle image series slider events
$('#slider').slider().on('slideStop', function (slideEvt) {

    // Get an image from the series
    HANDLE_DATASET.imageSeriesInput(slideEvt.value, false, true);
});


// Handle images series button click events
$('.btn-number').click(function (e) {

    var fieldName, type, input, currentVal;

    e.preventDefault();

    fieldName = $(this).attr('data-field');
    type = $(this).attr('data-type');
    input = $("input[name='" + fieldName + "']");
    currentVal = parseInt(input.val(), 10);

    if (!isNaN(currentVal)) {
        if (type === 'minus') {

            if (currentVal > input.attr('min')) {
                input.val(currentVal - 1).change();
            }
            if (currentVal === input.attr('min')) {
                $(this).attr('disabled', true);
            }

        } else if (type === 'plus') {

            if (currentVal < input.attr('max')) {
                input.val(currentVal + 1).change();
            }
            if (currentVal === input.attr('max')) {
                $(this).attr('disabled', true);
            }

        }

    } else {
        input.val(0);
    }

});


// This function fires when the browser window is resized
$(window).resize(function () {

    var debug = false, plotHeight = DATA_DISPLAY.plotHeight;

    if (debug) {
        console.log('wait for it...');
    }

    // During a window resize event, the resize function will be called several
    // times per second, on the order of 15! Best to wait a bit try to just
    // resize once, as it's a bit costly for plotly to execute relyout
    clearTimeout(DATA_DISPLAY.resizeTimer);

    DATA_DISPLAY.resizeTimer = setTimeout(function () {

        if (debug) {
            console.log('about to run Plotly.relayout');
        }

        // Calculate the plot dimensions and save them
        DATA_DISPLAY.calculatePlotSize();

        // Use smaller canvas when displaying text instead of images
        if (DATA_DISPLAY.displayType === 'text') {
            plotHeight = 300;
        } else {
            plotHeight = DATA_DISPLAY.plotHeight;
        }

        Plotly.relayout(DATA_DISPLAY.plotCanvasDiv, {
            width: DATA_DISPLAY.plotWidth,
            height: plotHeight,
        });

    }, 200);
});


// This function fires when the page is loaded
$(document).ready(function () {

    var debug = false;

    if (debug) {
        console.log('document is ready');
        $("#plotCanvasDiv").addClass('debugRed');
        $("#plotControls").addClass('debugBlue');
    }

    // Calculate the plot dimensions and save them
    DATA_DISPLAY.calculatePlotSize();

    // Un-hide the plotting canvas
    document.getElementById("plotCanvasDiv").style.display = "block";
});
