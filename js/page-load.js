/*global $*/
'use strict';

// External libraries
var FILE_NAV, CAS_TICKET, AJAX_SPINNER,

    // The gloabl variables for this applicaiton
    PAGE_LOAD = {


        // This function is to be called when the page is loaded
        //  - assumes the url has already been checked for a CAS ticket
        //  - load the data tree or display a message
        //  - display a welcome message
        //  - show hidden items
        //  - load additional css and js in the background
        initialPageLoad : function () {

            var debug = false;

            // Get data directory contents
            $.when(FILE_NAV.getRootDirectoryContents()).then(
                function (returnValue) {

                    if (debug) {
                        console.log('getRootDirectoryContents: ' +
                            returnValue);
                    }

                    // Welcome!
                    PAGE_LOAD.displayWelcomeMessage();

                    // Load bootstrap css a bit later than the other css files,
                    // as it seems to mess with my oh so pretty loading icon
                    PAGE_LOAD.loadCSSFiles(1);

                    // Best to wait until DOM items are in place before doing a
                    // few things
                    $(document).ready(function () {

                        // Show or hide various items
                        PAGE_LOAD.toggleLoginItems();

                        // Load the plotly libraries after all the hard stuff
                        // is done - it takes a while and is not needed
                        // immediately. Also add an extra time delay to account
                        // for the fancy loading animation.
                        setTimeout(function () {
                            PAGE_LOAD.loadJavaScriptScripts(2);
                        }, 550);
                    });
                }
            );

            // While the data directory contents are being fetched, get the
            // rest of the javascript and css files
            PAGE_LOAD.loadJavaScriptScripts(1);
            PAGE_LOAD.loadCSSFiles(0);

        },


        // Get the body contents from a separate file - might save a little
        // time? → Not much as it turns out.
        fillBody : function () {
            $.ajax({
                url: "../html/body.html",
                success: function (data) {
                    $('body').append(data);
                    $.holdReady(false);
                },
                dataType: 'html',
            });
        },


        // Load javascript files on-demand
        loadJavaScriptScripts : function (group) {

            var debug = false, promises = [], scripts = [],
                version = '?v=201705091026';

            if (group === 0) {
                scripts = [
                    "../js/file-navigation.js",
                    "../js/page-load.js",
                ];
            }

            if (group === 1) {
                scripts = [
                    "../lib/js/bootstrap/3.3.7/js/bootstrap.min.js",
                    "../lib/js/bootstrap-slider/9.7.0/bootstrap-slider.min.js",
                    "../lib/js/jstree/3.2.1/jstree.min.js",
                    "../lib/js/jasny-bootstrap/3.1.3/jasny-bootstrap.min.js",
                    "../js/cas-login-logout.js",
                    "../js/data-display.js",
                    "../js/handle-dataset.js",
                ];
            }

            if (group === 2) {
                scripts = ["../lib/js/plotly/1.26.1/plotly.min.js"];
            }

            scripts.forEach(function (script) {
                promises.push($.getScript(script + version));
            });

            return $.when.apply(null, promises).done(function () {
                if (debug) {
                    console.log('All done loading javascript!');
                }

                // Allow the loader to be shown again after having hidden it
                // during the background loading of plotly
                if (group === 2) {
                    AJAX_SPINNER.hideLoader = false;
                }

                return true;
            });

        },


        // Load a css file by appending it the html header
        getCSS : function (cssFileUrl) {
            $('<link>').appendTo('head').attr({
                type: 'text/css',
                rel: 'stylesheet',
                href: cssFileUrl,
            });
        },


        // Load a bunch of css files
        loadCSSFiles : function (group) {

            var cssFiles, version = '?v=201705091026';

            if (group === 0) {
                cssFiles = [
                    '../lib/css/jstree/3.2.1/themes/default/style.min.css',
                    '../lib/css/jasny-bootstrap/3.1.3/jasny-bootstrap.min.css',
                    '../lib/css/bootstrap-slider/9.7.0/' +
                        'bootstrap-slider.min.css',
                    '../css/index.css',
                    '../css/navmenu.css',
                ];
            }

            if (group === 1) {
                cssFiles = [
                    '../lib/css/bootstrap/3.3.7/css/bootstrap.min.css',
                ];
            }

            cssFiles.forEach(function (file) {
                PAGE_LOAD.getCSS(file + version);
            });

        },


        // Say hello!
        displayWelcomeMessage : function () {

            var messageRow1, messageRow2;

            // Stop the loader
            AJAX_SPINNER.doneLoadingData();

            // Keep the loader from being displayed while more javascript is
            // being secretly downloaded inthe background - sshh!
            AJAX_SPINNER.hideLoader = true;

            // Create the welcome message, which depends upon login status
            if (CAS_TICKET.isLoggedIn) {
                messageRow1 = 'Welcome ' + CAS_TICKET.displayName + '!';
                messageRow2 = '(click stuff on the left)';
            } else {
                messageRow1 = 'Welcome!';
                messageRow2 = '(Login to view data)';

                console.log('Not logged in?');
            }

            // Un-hide the welcome message
            document.getElementById("welcomeDiv1").innerHTML = messageRow1;
            document.getElementById("welcomeDiv2").innerHTML = messageRow2;
            document.getElementById("welcomeRow").style.display = "block";

        },


        // Depending on login status, show the login or logout buttons and
        // some other items
        toggleLoginItems : function () {

            var i, debug = false, alwaysShow = ['#navMenu', '#navMenuMobile'],
                whenLoggedInShow = ['#logoutButton', '#logoutButtonMobile',
                    '#treeSectionDiv', '#plotContainer'],
                whenLoggedOutShow = ['#loginButton', '#loginButtonMobile'];

            if (debug) {
                console.log('CAS_TICKET.isLoggedIn: ' + CAS_TICKET.isLoggedIn);
            }

            // Some thigs are initially hidden, as they look ugly without the
            // proper js and css loaded, but they should be shown
            for (i = 0; i < alwaysShow.length; i += 1) {
                $(alwaysShow[i]).show();
            }

            // Show or hide the login & logout related items
            for (i = 0; i < whenLoggedInShow.length; i += 1) {
                if (CAS_TICKET.isLoggedIn) {
                    $(whenLoggedInShow[i]).show();
                } else {
                    $(whenLoggedInShow[i]).hide();
                }
            }

            for (i = 0; i < whenLoggedOutShow.length; i += 1) {
                if (!CAS_TICKET.isLoggedIn) {
                    $(whenLoggedOutShow[i]).show();
                } else {
                    $(whenLoggedOutShow[i]).hide();
                }
            }

        },
    };