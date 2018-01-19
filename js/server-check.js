/* ping the h5 server to make sure it is there */
'use strict';

// the ping package checks that ..../favicon.ico can be loaded
// that file should exist on pretty much every website
// this gets around a problem that javascript cannot ping in a traditional way
var Ping, SERVER_COMMUNICATION,

    // global variables for application
    SERV_CHECK = {

        // /views serves any file from /static in the h5serv directory
        // I should be able to get favicon.ico to load from the server directory
        // however, there seems to be a problem with getting tornado to serve it
        // this may just be a problem with testing only on my local machine
        // i really have no idea
        
        // use /views for now and come back to this problem later
        h5staticURL : SERVER_COMMUNICATION.hdf5DataServer + '/views',
        
        // this is also going to change in the deployed version
        redirectURL : window.location.protocol + '//' + window.location.hostname
            + ':8080/html/app.html',


        // mostly to test syntax
        printURL : function () {
            document.getElementById("loadMsg").innerHTML = SERV_CHECK.h5staticURL
        },
        
        // function to ping server
        pingServer : function () {
            
            var debug = false, pingH5serv = new Ping();
            document.getElementById("loadMsg").innerHTML = 'Testing h5 server...'
            
            pingH5serv.ping(SERV_CHECK.h5staticURL, function (err, data) {

                // Display error if err is returned.
                if (err) {
                    console.error("error loading HDF5 server favicon.ico at: " + 
                        SERV_CHECK.h5staticURL+'/favicon.ico');
                    document.getElementById("loadMsg").innerHTML +=
                        '<span style="color:red">failed</span>';
                        
                    document.getElementById("errMsg").innerHTML +=
                        'The HDF5 server (h5serv) on qdot-server is not running.';
                } else {
                    document.getElementById("loadMsg").innerHTML +=
                        'HDF5 server responded in: ' + data + 'ms';
                        
                    document.getElementById("errMsg").innerHTML = 
                        'Now opening the HDF5 viewer...';

                    // Redirect to the CAS server
                    console.log(SERV_CHECK.redirectURL);
                    window.location = SERV_CHECK.redirectURL;

                }
            });
        },
    };

SERV_CHECK.pingServer();
