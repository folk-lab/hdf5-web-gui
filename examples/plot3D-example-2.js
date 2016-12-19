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
            renderTo: 'container',
            margin: 100,
            type: 'scatter',
            options3d: {
                enabled: true,
                alpha: 20,
                beta: 20,
                depth: 250,
                viewDistance: 25,

                frame: {
                    bottom: {
                        size: 1,
                        color: 'rgba(0,0,0,0.02)'
                    },
                    back: {
                        size: 1,
                        color: 'rgba(0,0,0,0.04)'
                    },
                    side: {
                        size: 1,
                        color: 'rgba(0,0,0,0.06)'
                    }
                }
            }
        },
        yAxis: {
            min: 0
        },
        xAxis: {
            min: -3,
            max: 23
        },
        title: {
            text: 'Draggable box'
        },
        subtitle: {
            text: 'Click and drag the plot area to rotate in space'
        },
        plotOptions: {
            polygon: {
                enableMouseTracking: false,
                width: 10,
                height: 10,
                depth: 10
            }
        },
        legend: {
            enabled: false
        },
        series: [
            {
                name: 'top left',
                type: 'polygon',
                data: [
                    [0, 10, 10],
                    [5, 12, 50],
                    [10, 20, 200],
                    [5, 12, 200],
                    [0, 10, 200]
                ]
            },
            {
                name: 'top front',
                type: 'polygon',
                data: [
                    [0, 10, 10],
                    [20, 10, 10],
                    [20, 10, 200],
                    [15, 12, 200],
                    [10, 20, 200],
                    [5, 12, 50]
                ]
            },
            {
                name: 'bottom front',
                type: 'polygon',
                data: [
                    [0, 0, 10],
                    [20, 0, 10],
                    [20, 10, 10],
                    [0, 10, 10]
                ]
            },
            {
                name: 'bottom side',
                type: 'polygon',
                data: [
                    [20, 0, 10],
                    [20, 10, 10],
                    [20, 10, 200],
                    [20, 0, 200]
                ]
            }
        ]
    };

}


// Create the chart, destroying it first if needed
function createChart() {

    // Create a new chart - do I need to destroy the old one first? - probably
    if (RING_APP.chart !== undefined && RING_APP.chart !== null) {
        RING_APP.chart.destroy();
    }

    RING_APP.chart = new Highcharts.Chart(RING_APP.chartOptions);
}


function setupMouseEventsRotation() {

    // Add mouse events for rotation
    $(RING_APP.chart.container).bind('mousedown.hc touchstart.hc',
        function (e) {
            e = RING_APP.chart.pointer.normalize(e);

            var posX = e.pageX,
                posY = e.pageY,
                alpha = RING_APP.chart.options.chart.options3d.alpha,
                beta = RING_APP.chart.options.chart.options3d.beta,
                newAlpha,
                newBeta,
                sensitivity = 5; // lower is more sensitive

            $(document).bind({
                'mousemove.hc touchdrag.hc': function (e) {
                    // Run beta
                    newBeta = beta + (posX - e.pageX) / sensitivity;
                    newBeta = Math.min(100, Math.max(-100, newBeta));
                    RING_APP.chart.options.chart.options3d.beta = newBeta;

                    // Run alpha
                    newAlpha = alpha + (e.pageY - posY) / sensitivity;
                    newAlpha = Math.min(100, Math.max(-100, newAlpha));
                    RING_APP.chart.options.chart.options3d.alpha = newAlpha;

                    RING_APP.chart.redraw(false);
                },
                'mouseup touchend': function () {
                    $(document).unbind('.hc');
                }
            });
        }
        );

}


// This function fires when the page is loaded The chart is setup, and the
// first call to the data request function is made
$(document).ready(function () {

    console.log('document is ready');

    setChartOptions();

    createChart();

    setupMouseEventsRotation();
});
