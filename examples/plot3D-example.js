/*global $*/
'use strict';


// The global variables for this applicaiton
var RING_APP =
    {
        // Set the addresses for the SSE server used in this script
        sseLocation:      '/stream',
        historyLocation:  '/history',

        eventsource : null,
        reDrawPending : false,
        dataLoaded : [false, false, false, false, false, false, false,
            false],

        // Create the chart and other global variables.
        chart               : null,

        currentServerTime   : null,
        mostRecentServerTime: null,
        timeSpan            : 720,

        // 3 === 3 Gev ring, 1 == 1.5 Gev ring
        ringChoice          : 3,
        numRings            : 2,
        numAttrs            : 4,

        lifeTimeChoice      : 1,
        yRangeChoice        : 1,

        ajaxLoader          : null,
        ajaxLoaderTimeOut   : null,
        mysqlDataLoading    : false,

        liveUpdates         : true,

        triggerValue        : [null, null],

        // Two dimensional arrays used in plotting and to fill the tables
        mostRecentData      : [],

        historicalData      : [],
        goodHistoricalData  : [],
        allGoodHistoricalData: false
    },

    // Objects from external javascript libraries
    EventSource,
    AjaxLoader,
    Highcharts;

function saveTriggerStatus(ringNum, value) {

    if (ringNum === 3) {
        RING_APP.triggerValue[0] = value;
    } else {
        RING_APP.triggerValue[1] = value;
    }

}

// Set both left and right y-axes ranges to be either static or automatically
// fit to the data.
function setYAxesRanges(newYRangeChoice) {

    if (newYRangeChoice !== 0) {
        RING_APP.yRangeChoice = newYRangeChoice;
    }

}


// Set how many minutes into the past the x-axis will display when displaying
// historical data
function setHistoryRange(minTimeHours, maxTimeHours) {

    var debug = false, timeStart, timeStop;

    if (debug) {
        console.log('input minTimeHours: ' + minTimeHours);
        console.log('input maxTimeHours: ' + maxTimeHours);
    }

    if (RING_APP.mostRecentServerTime !== undefined &&
            RING_APP.mostRecentServerTime !== null) {

        // Set the time span in milliseconds - use the time taken from the
        // tango REST server.
        timeStart = RING_APP.mostRecentServerTime +
            minTimeHours * 60 * 60 * 1000;

        timeStop = RING_APP.mostRecentServerTime +
            maxTimeHours * 60 * 60 * 1000;

        if (debug) {
            console.log('** RING_APP.mostRecentServerTime:' +
                Highcharts.dateFormat('%Y-%m-%d %H:%M:%S',
                                     RING_APP.mostRecentServerTime));
            console.log('* timeStart:' +
                Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', timeStart));
            console.log('* timeStop:' +
                Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', timeStop));
        }

        RING_APP.chart.xAxis[0].setExtremes(timeStart, timeStop, false, false);
    }
}


// Set how many minutes into the past the x-axis will display when displaying
// new data from tango devices
function setTimeSpan(newTimeSpanMinutes) {

    var timeStart, series;

    // Set the time span for the plot
    if (newTimeSpanMinutes > 0) {
        RING_APP.timeSpan = newTimeSpanMinutes;
    }

    // Get the most recent time from one of the data points
    series = RING_APP.chart.series[0];
    RING_APP.mostRecentServerTime = series.xData[series.xData.length - 1];

    if (RING_APP.mostRecentServerTime !== undefined &&
            RING_APP.mostRecentServerTime !== null) {

        // Set the time span in milliseconds - use the time taken from the
        // tango REST server.
        timeStart = RING_APP.mostRecentServerTime -
            RING_APP.timeSpan * 60 * 1000;

        // Using 'null' for the upper limit of the time axis results in the
        // limit being set to whatever is the maximum value in the data
        RING_APP.chart.xAxis[0].setExtremes(timeStart, null, false, false);
    }
}


function toggleLiveUpdate(allowLiveUpdate) {
// Turn on or off the updating of the chart. Data is still added to the plot
// series, but the plot will just not be redrawn

    var i_class, i_div, hiddenDivs, visibleDivs,
        hiddenClasses   = ['hidden-xs', 'hidden-sm', 'hidden-md', 'hidden-lg'],
        historyDivs     = ['historyTextDiv'],
        liveDivs        = ['timeSpanDiv'];

    RING_APP.liveUpdates = allowLiveUpdate;

    if (allowLiveUpdate) {
        // Monkey around with the chart
        setTimeSpan(0);

        // Note which divs will be visible or not
        visibleDivs = liveDivs;
        hiddenDivs  = historyDivs;
    } else {
        // Monkey around with the chart
        setHistoryRange(-12, 0);

        // Note which divs will be visible or not
        visibleDivs = historyDivs;
        hiddenDivs  = liveDivs;
    }

    // Always hide the 'reset zoom' button initially
    hiddenDivs.push('resetZoomButton');

    // Monkey around with the chart
    setYAxesRanges(0);
    RING_APP.chart.redraw();

    // Show & hide various buttons and things
    for (i_class = 0; i_class < hiddenClasses.length; i_class += 1) {

        // Un-hide specified divs
        for (i_div = 0; i_div < visibleDivs.length; i_div += 1) {
            document.getElementById(visibleDivs[i_div]).classList.remove(
                hiddenClasses[i_class]
            );
        }

        // Hide specified divs
        for (i_div = 0; i_div < hiddenDivs.length; i_div += 1) {
            document.getElementById(hiddenDivs[i_div]).classList.add(
                hiddenClasses[i_class]
            );
        }
    }
}


// Show the most recent data in the chart title
function setChartTitle(seriesNum) {

    var titleHTML, displayValue = 0, i_ring, i_attr, i_current,
        thisSeries = RING_APP.chart.series[seriesNum], latesttime = null,
        ringName = ['3 GeV Ring ', '1.5 GeV Ring'],
        dataUnit = ['mA', 'h', 'mA·h', 'mA/min'],
        dataValue;

    // Stuff
    if (RING_APP.ringChoice === 3) {
        i_ring = 0;
        i_current = 0;
    } else {
        i_ring = 1;
        i_current = 4;
    }

    // Make a table in which to place information in the title - done in a
    // bootstrappy way
    titleHTML = '<div class="row">';
    titleHTML += '<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12" ' +
        'style="text-align:center">' + ringName[i_ring] + ' - ';

    // Get the date and time
    if (thisSeries !== undefined) {
        if (thisSeries.xData.length > 0) {
            latesttime = thisSeries.xData[thisSeries.xData.length - 1];
        }
    }

    if (latesttime !== undefined && latesttime !== null) {
        titleHTML += Highcharts.dateFormat('%Y-%m-%d %H:%M:%S',
            latesttime) + '</div>';
    } else {
        titleHTML += '??? </div>';
    }

    // Loop over the four attributes - current, lifetime, current*lifetime, and
    // injection rate
    for (i_attr = i_current; i_attr < i_current + 4; i_attr += 1) {

        thisSeries = RING_APP.chart.series[i_attr];
        dataValue = thisSeries.yData[thisSeries.yData.length - 1];

        // Round the number to be displayed, checking first that the data is
        // sensible.
        if (dataValue !== undefined && dataValue !== null) {
            try {
                displayValue = dataValue.toFixed(2) + ' ' +
                    dataUnit[i_attr % 4];
            } catch (err) {
                console.log(err.message);
                console.log('dataValue: ' + dataValue);
            }
        } else {
            displayValue = '???';
        }

        // Create new table cells of differing sizes depending on the
        // display size
        titleHTML += '<div class="col-xs-6 col-sm-4 col-lg-4">';

        // Add two cells inside the above cell, and place information in them
        titleHTML += '<div class="col-xs-6 titletrtitle" ' +
                'style="color:' +
                RING_APP.chart.series[i_attr].color + '"> ' +
                RING_APP.chart.series[i_attr].name +
                '</div><div class="col-xs-6 titletrdata">' +
                displayValue + ' </div></div>';
    }

    // Add the beam state to the html output, along with some color.
    titleHTML += '<div class="col-xs-6 col-sm-4">' +
        '<div class="col-xs-6 titletrtitle" style="color:' +
        Highcharts.getOptions().colors[8] + '">Beam State</div>' +
        '<div class="col-xs-6 titletrdata">' + RING_APP.triggerValue[i_ring] +
        '</div></div>';

    // Finish the table
    titleHTML += '</div>';

    // Finally set the title with the html madness assembled.
    RING_APP.chart.setTitle({text: titleHTML }, {}, false);
}


// Choose which ring data to display, and whether to plot the lifetime or
// current x lifetime on the right y-axis
function selectChartsToShow(newRingChoice, newLifetimeChoice) {

    var i_series, i_ring, i_left, i_right;

    if (newRingChoice !== 0) {
        RING_APP.ringChoice = newRingChoice;
    }

    if (newLifetimeChoice !== 0) {
        RING_APP.lifeTimeChoice = newLifetimeChoice;
    }

    i_ring = RING_APP.ringChoice;

    if (i_ring === 3) {
        i_left = 0;
    } else {
        i_left = 4;
    }

    i_right = RING_APP.lifeTimeChoice + i_left;

    // The highstock libraries complain if all charts are hidden, and then
    // shown - so first I show all that need to be shown, and then hide all
    // that need to be hidden.
    RING_APP.chart.series[i_left].show();
    RING_APP.chart.series[i_right].show();

    for (i_series = 0; i_series < RING_APP.numAttrs * RING_APP.numRings;
            i_series += 1) {
        if (i_series !== i_left && i_series !== i_right) {
            RING_APP.chart.series[i_series].hide();
        }
    }

}


// Set some chart options
function setChartOptions() {

    Highcharts.setOptions({
        global : {
            useUTC :    false
        }
    });

    // Create the chart
    RING_APP.chartOptions = {
        chart: {
            renderTo :      'containerChart',

            zoomType:       'x',
            panning:        true,
            panKey:         'shift',
            pinchType:      'x',

            type:           'line',
            animation:      false,      // if true, weird point jumping occurs

            marginLeft:     85,
            marginRight:    95,
            spacingTop:     0,
            spacingBottom:  0,
            spacingLeft:    0,
            spacingRight:   0,

            alignTicks:     false,

            // Turn off the default 'reset zoom' button
            resetZoomButton: {
                theme: {
                    display: 'none'
                }
            },

            events: {

                selection: function (event) {

                    var i_class, hiddenClasses = ['hidden-xs', 'hidden-sm',
                        'hidden-md', 'hidden-lg'];

                    if (event.xAxis) {

                        if (!RING_APP.liveUpdates) {
                            // Explicitly set the y-axes ranges when zooming
                            // into or out of historical data - it seems to
                            // default to auto-zoom otherwise
                            setYAxesRanges(0);
                        } else {

                            // Turn off live updating if zooming
                            toggleLiveUpdate(false);

                            // Highlight the correct button
                            document.getElementById("historyButton"
                                ).classList.add("active");

                            document.getElementById("liveButton"
                                ).classList.remove("active");

                        }

                        // Un-hide the 'reset zoom' button
                        for (i_class = 0; i_class < hiddenClasses.length;
                                i_class += 1) {
                            document.getElementById('resetZoomButton'
                                ).classList.remove(hiddenClasses[i_class]);
                        }

                    }
                }
            }

        },

        title: {
            text:       'MAX IV Rings',
            useHTML:    true
        },

        rangeSelector: {
            enabled:    false
        },

        scrollbar: {
            enabled:    false
        },

        navigator: {
            enabled:    false
        },

        exporting: {
            enabled:    false
        },

        xAxis: {
            type:               'datetime',
            ordinal:            false,
            tickPixelInterval:  80
        },

        tooltip: {
            enabled: true,
            useHTML: true,
            shared:  true,
            backgroundColor: '#bdbdbd',
            borderColor: '#000000',

            crosshairs: [{
                width:      1,
                color:      'red',
                dashStyle:  'shortdot'
            }, {
                width:      1,
                color:      'red',
                dashStyle:  'shortdot'
            }],

            hideDelay:  500,

            formatter: function () {
                var p = '<b>' +
                        Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) +
                        '</b><br/>';
                $.each(this.points, function () {
                    p += '<span style="color:' + this.series.color + '">' +
                        this.series.name + '</span>: ' +
                        Highcharts.numberFormat(this.y, 2) + '<br/>';
                });

                return p;
            },

            // positioner: function () {
            //     return { x: 100, y: 100 };
            // }


            positioner: function () {
                var tooltipX, tooltipY,
                    axisX, extremesX, maxX;

                axisX = RING_APP.chart.xAxis[0];
                extremesX = axisX.getExtremes();

                maxX = axisX.toPixels(extremesX.max);
                // minX = axisX.toPixels(extremesX.min);
                // midX = (maxX - minX) / 2 + minX;


                // console.log('');
                // console.log('midX:                    ' + midX);
                // console.log('axisX.toPixels(point.x): ' +
                //     point.x);

                tooltipX = maxX - 150;

                // Cannot seem to get a proper return value from 'point.x' ...
                // if (axisX.toPixels(point.x) < midX) {
                //     tooltipX = 150;
                // } else {
                //     tooltipX = maxX - 150;
                // }

                tooltipY = 100;

                return {
                    x: tooltipX,
                    y: tooltipY
                };
            }

        },

        legend: {enabled: false},

        // Multiple y-axes
        yAxis: [
            {
                minPadding:     0,
                maxPadding:     0,
                startOnTick:    false,
                endOnTick:      false,
                opposite:       false,
                title: {
                    enabled:    true,
                    text:       'Current (mA)',
                    style:      { color: Highcharts.getOptions().colors[0]},
                    useHTML:    true
                },
                labels: {
                    format:     '{value}',
                    align:      'right',
                    x:          -10,
                    y:          0,
                    style:      { color: Highcharts.getOptions().colors[0]}
                }
            },
            {
                minPadding:     0,
                maxPadding:     0,
                startOnTick:    false,
                endOnTick:      false,
                title: {
                    enabled:    true,
                    text:       'LifeTime (hours)',
                    style:      { color: Highcharts.getOptions().colors[1]},
                    useHTML:    true
                },
                labels: {
                    format:     '{value}',
                    align:      'left',
                    x:          20,
                    y:          0,
                    style:      { color: Highcharts.getOptions().colors[1]}
                }
            }
        ],

        plotOptions: {
            series: {
                borderWidth:            0,
                enableMouseTracking:    true,
                shadow:                 false,
                animation:              false,
                turboThreshold:         0,

                marker: {
                    radius: 0,
                    lineColor: null, // inherit from series
                    symbol: 'circle',

                    states: {
                        hover: {
                            lineWidth: null,
                            fillColor: 'white',
                            lineColor: null,
                            radius: 3
                        }
                    }
                },

                // This is downsampling
                dataGrouping: {
                    enabled: true,
                    groupPixelWidth: 4
                },

            }
        },

        // Setup the data series (groups of data points)
        series: [
            // R3
            // 0
            {
                name:    'Current',
                //type:    'area',
                yAxis:   0,
                data:    [],
                visible: true,
                showInLegend: true,
            },
            // 1
            {
                name:    'LifeTime',
                yAxis:   1,
                data:    [],
                visible: true,
                showInLegend: true,
            },
            // 2
            {
                name:    'Current · LifeTime',
                yAxis:   1,
                data:    [],
                visible: false,
                showInLegend: false,
            },
            // 3
            {
                name:    'Injection Rate',
                yAxis:   1,
                data:    [],
                visible: false,
                showInLegend: false,
            },

            // R1
            // 4
            {
                name:    'Current',
                //type:    'area',
                yAxis:   0,
                data:    [],
                visible: false,
                showInLegend: false,
            },
            // 5
            {
                name:    'LifeTime',
                yAxis:   1,
                data:    [],
                visible: false,
                showInLegend: false,
            },
            // 6
            {
                name:    'Current · LifeTime',
                yAxis:   1,
                data:    [],
                visible: false,
                showInLegend: false,
            },
            // 7
            {
                name:    'Injection Rate',
                yAxis:   1,
                data:    [],
                visible: false,
                showInLegend: false,
            }
        ]
    };

}


// Change the label of the right y-axis when the value being plotted is changed
function changeRightAxisLabel() {

    var labelColor =
        Highcharts.getOptions().colors[RING_APP.lifeTimeChoice],
        axisLabel = ['LifeTime (hours)', 'Current · LifeTime (mA · hours)',
                     '&Delta;I / &Delta;t (mA / min)'];

    RING_APP.chart.yAxis[1].update({
        title: {
            enabled:    true,
            text:       axisLabel[RING_APP.lifeTimeChoice - 1],
            style:      { color: labelColor},
            useHTML:    true
        },
        labels: {
            format:     '{value}',
            align:      'left',
            x:          20,
            y:          0,
            style:      { color: labelColor}
        }
    }, false);
}


// Choose a light or dark theme
function setChartThemeOptions(isButtonClick) {

    var i, themeBackgroundColor, yAxesTitles, useDarkTheme = true;

    setChartOptions();

    if (useDarkTheme) {
        // DARK THEME
        // console.log('Chose dark theme');

        RING_APP.chartOptions.colors =
            ['#2b908f', '#f45b5b', '#dc7eee', '#90ee7e',
                '#2b908f', '#f45b5b', '#dc7eee', '#90ee7e', '#5169e8'];

        RING_APP.chartOptions.title.style = {
            color: '#E0E0E3',
            font:   'bold 16px "Trebuchet MS", Verdana, sans-serif'
        };

        RING_APP.chartOptions.xAxis.labels = {
            style: {
                color: '#E0E0E3',
                font: '11px Trebuchet MS, Verdana, sans-serif'
            }
        };

        RING_APP.chartOptions.xAxis.tickColor = '#505053';
        themeBackgroundColor = '#2a2a2b';
    } else {
        // LIGHT THEME
        // console.log('Chose light theme');


        RING_APP.chartOptions.colors =
            ['#C80000', '#0000FF', '#468250', '#C80000',
                   '#0000FF', '#468250', '#FF4500'];

        RING_APP.chartOptions.title.style = {
            color: '#000',
            font:   'bold 16px "Trebuchet MS", Verdana, sans-serif'
        };

        RING_APP.chartOptions.xAxis.labels = {
            style: {
                color: '#000',
                font: '11px Trebuchet MS, Verdana, sans-serif'
            }
        };

        RING_APP.chartOptions.xAxis.tickColor = '#000';
        themeBackgroundColor = '#FFFFFF';
    }

    // The background color
    document.body.style.background          = themeBackgroundColor;
    RING_APP.chartOptions.chart.plotBackgroundColor  = themeBackgroundColor;
    RING_APP.chartOptions.chart.backgroundColor      = themeBackgroundColor;

    // Do not start more daq processes in the background
    if (isButtonClick) {
        RING_APP.chartOptions.chart.events  = null;
    }

    yAxesTitles = ['Current (mA)', 'LifeTime (hours)',
                   'Current · LifeTime (mA·h)'];
    for (i = 0; i < 2; i += 1) {
        RING_APP.chartOptions.yAxis[i].gridLineColor         = '#707073';
        RING_APP.chartOptions.yAxis[i].lineColor             = '#707073';
        RING_APP.chartOptions.yAxis[i].tickInterval          = null;
        RING_APP.chartOptions.yAxis[i].alternateGridColor    = null;
        RING_APP.chartOptions.yAxis[i].minorTickInterval     = null;
        RING_APP.chartOptions.yAxis[i].minorGridLineColor    = '#505053';
        RING_APP.chartOptions.yAxis[i].lineWidth             = 1;
        RING_APP.chartOptions.yAxis[i].tickWidth             = 1;
        RING_APP.chartOptions.yAxis[i].tickColor             = '#505053';

        if (i === 0 || RING_APP.lifeTimeChoice === 1) {
            RING_APP.chartOptions.yAxis[i].title.style =
                { color: RING_APP.chartOptions.colors[i]};
            RING_APP.chartOptions.yAxis[i].title.text = yAxesTitles[i];
            RING_APP.chartOptions.yAxis[i].labels.style =
                { color: RING_APP.chartOptions.colors[i]};
        } else {
            RING_APP.chartOptions.yAxis[i].title.style =
                { color: RING_APP.chartOptions.colors[i + 1]};
            RING_APP.chartOptions.yAxis[i].title.text = yAxesTitles[i + 1];
            RING_APP.chartOptions.yAxis[i].labels.style =
                { color: RING_APP.chartOptions.colors[i + 1]};
        }
    }
}


// Create the chart, destroying it first if needed
function createChart() {

    // Create a new chart - do I need to destroy the old one first? - probably
    if (RING_APP.chart !== undefined && RING_APP.chart !== null) {
        RING_APP.chart.destroy();
    }

    RING_APP.chart = new Highcharts.StockChart(RING_APP.chartOptions);
}


function turnOffLoadingIcon(doItFast) {

    if (doItFast) {
        // Hide the modal which is displaying the loading icon
        $('body').removeClass('loading');
        RING_APP.ajaxLoader.hide();
    } else {
        setTimeout(function () {
            // If there is no mysql data, maybe better to show just most
            // recent minute as new data comes in? Click some time span
            // buttons, but wait a little first
            // console.log('Not much mysql data found, crap.');
            $('#timeSpanOption5').click();

            // Hide the modal which is displaying the loading icon
            $('.modal').fadeOut(500);

            setTimeout(function () {
                $('body').removeClass('loading');
                RING_APP.ajaxLoader.hide();
            }, 500);

        }, 100);
    }
}


function calculateIL(current, lifetime) {

    var iL = 0;

    if (current !== undefined && current !== null &&
            lifetime !== undefined && lifetime !== null) {

        iL = current * lifetime;

    } else {
        console.log(' ');
        console.log('current:  ' + current);
        console.log('lifetime: ' + lifetime);
    }

    return iL;
}


function calculatedIdT(i0, i1, l0, l1) {

    var dCurrent, dTime, dIdT = 0;


    if (i0 !== undefined && i0 !== null &&
            i1 !== undefined && i1 !== null) {

        // change in currrent in mA
        dCurrent = i0 - i1;

        // dt in seconds
        dTime = (l0 - l1) / 1000;

        // dI/dt in mA / min
        dIdT = 60 * dCurrent / dTime;
    }

    return dIdT;
}


function calculateStuff(seriesNum1, seriesNum2, seriesNum3, seriesNum4) {
//////////////////////////////
// Calculate: I·L and dI/dt //
//////////////////////////////

    var debug = false, num_points = [], arr = [], presentTime = [], iL, i_data,
        series = [], dIdT, arr2 = [];

    if (debug) {
        console.log('calculateStuff(' + seriesNum1 + ', ' + seriesNum2 + ', ' +
            seriesNum3 + ' , ' + seriesNum4 + ') called');
    }

    series[0] = RING_APP.chart.series[seriesNum1];
    series[1] = RING_APP.chart.series[seriesNum2];
    series[2] = RING_APP.chart.series[seriesNum3];
    series[3] = RING_APP.chart.series[seriesNum4];

    num_points[0] = series[0].xData.length;
    num_points[1] = series[1].xData.length;

    if (debug) {
        console.log('num_points_0: ' + num_points[0]);
        console.log('num_points_1: ' + num_points[1]);
    }

    // Loop over all of the data points
    for (i_data = 0; i_data < num_points[0]; i_data += 1) {

        dIdT = 0;
        iL = 0;

        // I·L calculation
        if (num_points[1] > i_data) {

            // I·L
            iL = calculateIL(series[0].yData[i_data], series[1].yData[i_data]);

            // Use the lifetime time value - not quite correct to do...
            presentTime[1] = series[1].xData[i_data];

            // Save I·L
            arr.push([presentTime[1], iL]);
        }

        // dI/dt calculation
        if (i_data > 0) {

            // dI/dT
            dIdT = calculatedIdT(series[0].yData[i_data],
                series[0].yData[i_data - 1], series[0].xData[i_data],
                series[0].xData[i_data - 1]);

            // The time to assign to this point
            presentTime[0] = series[0].xData[i_data];

            // Save dI/dt
            arr2.push([presentTime[0], dIdT]);

        }

    }

    // Add the data to the chart
    series[2].setData(arr, false, false, false);
    series[3].setData(arr2, false, false, false);

    num_points[2] = series[2].xData.length;
    num_points[3] = series[3].xData.length;

    if (debug) {
        console.log('num_points_2: ' + num_points[2]);
        console.log('num_points_3: ' + num_points[3]);
    }

}


function setAxisMaxima(axis) {
// This functions finds the maximum in the plotted data, which is different
// than raw data due to down sampling

    var debug = false, ring = 3, extremes, j, maximum, possiblemaximum = [],
        plotmaximum;

    // There are 3 different choices for the y-axes ranges
    switch (RING_APP.yRangeChoice) {

    // This option uses several predefined y-maxima ranges and has an upper
    // limit on how large of a value that can be displayed
    case 1:

        // Get the maximum in the data arrays associated with this axis
        extremes = RING_APP.chart.yAxis[axis].getExtremes();
        maximum = extremes.dataMax;

        if (debug) {
            console.log('extremes.dataMax: ' + maximum);
        }

        // The axes ranges - randomly chosen by Jason
        if (ring === 3) {
            possiblemaximum[0] = [400, 300, 200, 100, 50, 10, 5];
            possiblemaximum[1] = [400, 200, 100, 72, 36, 24, 12, 6, 3, 1];
        } else {
            possiblemaximum[0] = [300, 200, 100, 50, 10, 5];
            possiblemaximum[1] = [300, 200, 100, 72, 36, 24, 12, 6, 3, 1];
        }

        // See if the maximum found is off the charts
        if (maximum > possiblemaximum[axis][0]) {
            plotmaximum = possiblemaximum[axis][0];
        }

        // Determine the axis maximum to use
        for (j = 0; j < possiblemaximum[axis].length; j += 1) {
            if (maximum < possiblemaximum[axis][j]) {
                plotmaximum = possiblemaximum[axis][j];
            }
        }

        if (debug) {
            console.log('ring: ' + ring + ', axis: ' + axis +
                ', plotmaximum: ' + plotmaximum);
        }

        // Set the range for this axis
        RING_APP.chart.yAxis[axis].setExtremes(0, plotmaximum, false, true);

        break;

    // This option sets the y-axis maximum to be whatever the largest data
    // point is, and set the minimum to zero
    case 2:
        RING_APP.chart.yAxis[axis].setExtremes(0, null, false, false);
        break;

    // This option shows all the data, no matter how large or small
    case 3:
        RING_APP.chart.yAxis[axis].setExtremes(null, null, false, false);
        break;
    }
}


function removeOldPoints(series) {
    // Compare timestamp of oldest and newest point
    // Remove from back until the difference is matched
    var latesttime = series.xData[series.xData.length - 1];

    // Keep just 12 hours worth of data
    while (latesttime - series.xData[0] > 12 * 60 * 60 * 1000) {
        series.removePoint(0, false, false);
    }

}


// When data has been updated request a redraw
function reDrawPlot(timeSpan) {

    // console.log('reDrawPlot(' + timeSpan + ') called');
    // console.log('RING_APP.reDrawPending: ' + RING_APP.reDrawPending);

    // Update the minimum along the time axis - best to do this prior to
    // calling setAxisMaxima()
    if (RING_APP.liveUpdates) {
        setTimeSpan(timeSpan);
    }

    if (!RING_APP.reDrawPending) {

        RING_APP.reDrawPending = true;

        setTimeout(function () {

            var axis;

            // Re-draw the chart in order to get the latest values that have
            // been added to the plot, prior to calling setAxisMaxima()
            RING_APP.chart.redraw();
            // console.log('** RING_APP.chart.redraw() called');

            // Maybe it's good to call these two functions for both axes, even
            // though data may have only been updated for one of them
            for (axis = 0; axis < 2; axis += 1) {
                removeOldPoints(RING_APP.chart.series[axis]);
                setAxisMaxima(axis);
            }

            // Redraw the plot now after all changes have been made
            RING_APP.chart.redraw();
            // console.log('** RING_APP.chart.redraw() called');

            RING_APP.reDrawPending = false;

        }, 20);

    }
}


function adddIdLPoint(seriesNum, x, y) {

    var dIdT, thisSeries = RING_APP.chart.series[seriesNum],
        dIdLSeries, yPrev, xPrev;

    dIdLSeries = RING_APP.chart.series[seriesNum + 3];
    yPrev = thisSeries.yData[thisSeries.yData.length - 1];
    xPrev = thisSeries.xData[thisSeries.xData.length - 1];

    dIdT = calculatedIdT(y, yPrev, x * 1000, xPrev);

    dIdLSeries.addPoint([x * 1000, dIdT], false, false);
}


function addiLPoint(seriesNum, x, y) {

    var iL, iLSeries, iSeries, iPrev;

    iLSeries = RING_APP.chart.series[seriesNum + 1];
    iSeries = RING_APP.chart.series[seriesNum - 1];
    iPrev = iSeries.yData[RING_APP.chart.series[seriesNum -
        1].yData.length - 1];

    iL = calculateIL(iPrev, y);

    iLSeries.addPoint([x * 1000, iL], false, false);

}


// Add new data
function addData(ringNum, seriesNum, x, y) {

    var debug = false, thisSeries = RING_APP.chart.series[seriesNum];

    // Check a bit for bad data
    if (x !== null && x !== undefined && y !== null && y !== undefined) {

        // If this is current data, calculate dI/dL and add it to the chart
        if (seriesNum === 4 || seriesNum === 0) {
            adddIdLPoint(seriesNum, x, y);
        }

        // If this is lifetime data, calculate i*L and add it to the chart
        if (seriesNum === 5 || seriesNum === 1) {
            addiLPoint(seriesNum, x, y);
        }

        // Add data to the chart
        thisSeries.addPoint([x * 1000, y], false, false);

        // Place information in the chart title
        setChartTitle(seriesNum);

    }

    if (debug || x === null || x === undefined || y === null ||
            y === undefined) {
        console.log(' ');
        console.log('addData(' + ringNum + ', ' + seriesNum + ', ' + x + ', ' +
            y + ')');
    }

    // Draw the chart
    reDrawPlot(0);
}


// Set historical data
function sethistoricdata(data, ringNum, factor, seriesNum) {

    var arr = [], row, x, y, series = RING_APP.chart.series[seriesNum];

    // Collect the data into an array, convert to the proper units
    for (row in data) {
        if (data.hasOwnProperty(row)) {

            x = data[row].timestamp * 1000;
            y = data[row].value * factor;

            arr.push([x, y]);
        }
    }

    // Add the data to the chart
    series.setData(arr, false, false, false);

    // Draw the chart
    reDrawPlot(0);

    // note that data has been loaded
    RING_APP.dataLoaded[seriesNum] = true;

    // Calculate various quantities for each ring
    if (ringNum === 1 && RING_APP.dataLoaded[4] && RING_APP.dataLoaded[5]) {
        calculateStuff(4, 5, 6, 7);
    }

    if (ringNum === 3 && RING_APP.dataLoaded[0] && RING_APP.dataLoaded[1]) {
        calculateStuff(0, 1, 2, 3);
    }
}


// Turn on the loading animation using a nice looking javscript loading icon
// from: http://musicvano.github.io/ajaxloader/
function createLoadingIcon() {

    // Display the loading icon in a modal
    $('body').addClass('loading');

    // Set options
    var opts = {
        size:       64,         // Width and height of the spinner
        factor:     0.25,       // Factor of thickness, density, etc.
        color:      '#009cf7',  // Color #rgb or #rrggbb
        speed:      1.0,        // Number of turns per second
        clockwise:  true        // Direction of rotation
    };

    // Turn it on
    RING_APP.ajaxLoader = new AjaxLoader('spinner', opts);
    RING_APP.ajaxLoader.show();
}


// Settings used in all ajax requests
$.ajaxSetup({
    type:       'GET',
    dataType:   'json',
    async:      true,
    cache:      false,
    timeout:    700
});


// A method for display a loading icon when ajax does something and then
// gets a little stuck
$(document).ajaxStart(function () {

    // console.log('ajaxStart');

    // If the mysql server is in the middle of being reached (it can have
    // problems) then keep displaying the loading icon, and don't create a new
    // one.
    if (!RING_APP.mysqlDataLoading) {

        // Turn on the loading icon, but fade in the modal - looks nicer when
        // ajax is just having small hiccups (less than 900 ms)
        RING_APP.ajaxLoader.show();
        RING_APP.ajaxLoaderTimeOut = setTimeout(function () {
            $('.modal').fadeIn();
        }, 800); // Waits before fading .modal in
    }
});

$(document).ajaxStop(function () {

    // console.log('ajaxStop');

    // If the mysql server is in the middle of being reached (it can have
    // problems) then keep displaying the loading icon.
    if (!RING_APP.mysqlDataLoading) {

        // Cancels if request finished < .5 seconds
        clearTimeout(RING_APP.ajaxLoaderTimeOut);
        $('.modal').fadeOut();

        // Turn off the loading icon
        setTimeout(function () {
            RING_APP.ajaxLoader.hide();
        }, 500);
    }
});


function plot3DExample () {

}

// This function fires when the page is loaded The chart is setup, and the
// first call to the data request function is made
$(document).ready(function () {

    console.log('document is ready');


    // // A way to display the nice looking boostrap button tooltips.
    // $('.showTooltip').tooltip();

    // // Create and turn on the loading animation - sometimes contact with the
    // // mysql database can be a little slow
    // // createLoadingIcon();

    // // Set the chart theme options
    // setChartThemeOptions(false);

    // // Initialize the chart
    // createChart();

    // // Show the default graphs, hide the others
    // selectChartsToShow(0, 0);

    // // Set the initial right y-axis label
    // changeRightAxisLabel();

    // // Draw the initially empty chart
    // setChartTitle(0);

    // // Call the window resize function, which sets the chart size.
    // $(window).resize();

    // RING_APP.chart.redraw();
});


// Need to resize the chart depending on the window size - highcharts and
// bootstrap have issues...
$(window).resize(function () {

    var debug = true, appWidth, newChartWidth, windowWidth, windowHeight,
        chartHeightOffset = 170, viewingDeviceSize = 'xs',
        newChartHeight, chartHeightMin = 150;

    // $(document) refers to the document size
    // $(window) refers to the browser size
    // screen gives screen size info - might be good to check that I am not
    // outside this size

    // Calculate the new chart width
    appWidth = document.getElementById('applicationContainer').offsetWidth;

    newChartWidth = appWidth - 4;

    if (debug) {
        console.log('');
        console.log('appWidth:'         + appWidth);
        console.log('newChartWidth:'    + newChartWidth);
    }

    // Try to figure out what kind of device (phone, desktop, etc.) is being
    // used.
    windowWidth = $(window).width();
    windowHeight = $(window).height();

    if (windowWidth > 1200) {
        viewingDeviceSize = 'lg';
    } else if (windowWidth <= 1200 && windowWidth > 992) {
        viewingDeviceSize = 'md';
    } else if (windowWidth <= 992 && windowWidth > 768) {
        viewingDeviceSize = 'sm';
    } else if (windowWidth <= 768) {
        viewingDeviceSize = 'xs';
    }

    if (debug) {
        console.log('viewingDeviceSize: ' + viewingDeviceSize);
    }

    // Calcuate the new chart height - or try to anyways...
    // if (viewingDeviceSize === 'xs') {
    //     chartHeightOffset = 130;
    // }
    if (windowWidth < 500) {
        chartHeightOffset = 130;
    }
    newChartHeight = windowHeight - chartHeightOffset;

    // Make sure the new chart height is not too small
    if (newChartHeight < chartHeightMin) {
        newChartHeight = chartHeightMin;
    }

    if (debug) {
        console.log('window width:  ' + windowWidth);
        console.log('window inner width:  ' + $(window).innerWidth());
        console.log('window height: ' + windowHeight);
        console.log('newChartHeight:' + newChartHeight);
    }

    // Set the height and width
    RING_APP.chart.setSize(newChartWidth, newChartHeight, false);
});


// Reload the page
function reloadPage() {
    location.reload();
}
