/*global $*/
'use strict';


// External libraries
var SERVER_COMMUNICATION, AJAX_SPINNER, HANDLE_DATASET, DATA_DISPLAY,

    // Some gloabl variables
    FILE_NAV =
    {
        // h5serv has an issue with full hostnames
        hdf5DataServer : window.location.protocol + '//' +
                         window.location.hostname.replace('.maxiv.lu.se', '') +
                         ':5000',
        jstreeDict : [],
        processSelectNodeEvent : true,
        data : null,
        useDarkTheme : false,

        // Get some information about a 'datasets' object - try and figure out
        // if it's an array, matrix, number, string, or somthing else,
        // then add it to the tree using the proper icon
        getDatasetInfo : function (title, nodeId, targetUrl, responses) {

            var debug = true, dataType = 'none', shapeDims = false;

            return $.when(SERVER_COMMUNICATION.ajaxRequest(targetUrl)).then(
                function (response) {

                    var key = '';

                    if (debug) {
                        console.log('nodeId: ' + nodeId);

                        for (key in response) {
                            if (response.hasOwnProperty(key)) {
                                console.log(key + " -> " + response[key]);
                            }
                        }
                    }

                    // Check for images and lines
                    if (response.hasOwnProperty('shape')) {
                        if (response.shape.hasOwnProperty('dims')) {

                            shapeDims = response.shape.dims;

                            if (debug) {
                                console.log(response.shape.dims.length);
                                console.log(response.shape.dims);
                            }

                            // These conditions are not correct, need to
                            // differentiate between arrays, images, and single
                            // values
                            if (response.shape.dims.length === 3) {
                                dataType = 'image-series';
                            }

                            if (response.shape.dims.length === 2) {
                                dataType = 'image';
                            }

                            if (response.shape.dims.length === 1) {
                                if (response.shape.dims[0] > 1) {
                                    dataType = 'line';
                                }
                            }

                            if (debug) {
                                console.log('dataType: ' + dataType);
                            }
                        }
                    }

                    // Check for numbers and strings
                    if (dataType === 'none') {
                        if (response.hasOwnProperty('type')) {
                            if (response.type.hasOwnProperty('class')) {
                                if (debug) {
                                    console.log(response.type.class);
                                }

                                if (response.type.class === 'H5T_STRING') {
                                    dataType = 'text';
                                }

                                if (response.type.class === 'H5T_FLOAT' ||
                                        response.type.class === 'H5T_INTEGER'
                                        ) {
                                    dataType = 'number';
                                }
                            }
                        }
                    }

                    responses.push({
                        title : title,
                        dataType : dataType,
                        shapeDims : shapeDims,
                    });
                }
            );

        },


        getTopLevelUrl : function (initialUrl, firstLevelKey, relValue) {

            var debug = false, topLevelUrl = '';

            return $.when(SERVER_COMMUNICATION.ajaxRequest(initialUrl)).then(
                function (response) {

                    var key = '';

                    if (debug) {
                        console.log('response.length: ' + response.length);

                        for (key in response) {
                            if (response.hasOwnProperty(key)) {
                                console.log(key + " -> " + response[key]);
                            }
                        }
                    }

                    if (response.hasOwnProperty(firstLevelKey)) {
                        for (key in response.hrefs) {
                            if (response.hrefs.hasOwnProperty(key)) {
                                if (debug) {
                                    console.log(key + " -> " +
                                        response.hrefs[key].rel);
                                }

                                if (response.hrefs[key].rel === relValue) {
                                    topLevelUrl = response.hrefs[key].href;
                                }
                            }
                        }
                    }

                    if (debug) {
                        console.log('topLevelUrl: ' + topLevelUrl);
                    }

                    return topLevelUrl;
                }
            );
        },


        // Add new item to the file browser tree
        addToTree : function (itemList, selectedId, createNewTree) {

            var debug = false, i, keyTitle = '', type = '', icon = '', treeId,
                doesNodeExist = false, dotFile = false, needToRefresh = false;

            if (createNewTree) {
                FILE_NAV.jstreeDict = [];
            }

            for (keyTitle in itemList) {
                if (itemList.hasOwnProperty(keyTitle)) {
                    if (debug) {
                        console.log(keyTitle + " -> " +
                            itemList[keyTitle].target);
                        console.log(keyTitle + " -> " +
                            itemList[keyTitle].dataType);
                    }

                    doesNodeExist = false;
                    dotFile = false;

                    // Folders and datasets within HDF5 files
                    if (itemList[keyTitle].id) {

                        treeId = itemList[keyTitle].id;

                        if (itemList[keyTitle].collection === 'groups') {
                            type = 'folder';
                            icon = 'glyphicon glyphicon-folder-close';
                        }

                        if (itemList[keyTitle].collection === 'datasets') {
                            type = 'datasets';

                            if (itemList[keyTitle].dataType) {
                                switch (itemList[keyTitle].dataType) {
                                case 'image-series':
                                    icon = 'glyphicon glyphicon-certificate';
                                    break;
                                case 'image':
                                    icon = 'glyphicon glyphicon-picture';
                                    break;
                                case 'line':
                                    icon = 'glyphicon glyphicon-signal';
                                    break;
                                case 'number':
                                    icon = 'glyphicon glyphicon-barcode';
                                    break;
                                case 'text':
                                    icon = 'glyphicon glyphicon-list';
                                    break;
                                default:
                                    icon = 'glyphicon glyphicon-question-sign';
                                }
                            } else {
                                icon = 'glyphicon glyphicon-remove-sign';
                            }
                        }
                    }

                    // HDF5 files
                    if (itemList[keyTitle].h5domain) {
                        treeId = itemList[keyTitle].h5domain;
                        type = 'file';
                        icon = '../images/hdf5-16px.png';

                        // Check for dot-files, which are proabably the h5serv
                        // created files, and should not be presented by
                        // h5serv, yet here they are...
                        if (keyTitle.indexOf('.') === 0) {
                            dotFile = true;
                        }
                    }

                    // Check if this id exists already
                    if (!createNewTree) {
                        doesNodeExist = $('#jstree_div').jstree(true).get_node(
                            treeId
                        );
                    }

                    // If this has not already been added to the tree, add it
                    if (!doesNodeExist && !dotFile) {
                        FILE_NAV.jstreeDict.push({

                            // The key-value pairs needed by jstree
                            id : treeId,
                            parent : (selectedId === false ? '#' : selectedId),
                            text : keyTitle,
                            icon : icon,

                            // Save some additional information - is this a
                            // good place to put it?
                            data : {
                                type : type,
                                target : itemList[keyTitle].target,
                                h5path : itemList[keyTitle].h5path,
                                h5domain : itemList[keyTitle].h5domain,
                                dataType : itemList[keyTitle].dataType,
                                shapeDims : itemList[keyTitle].shapeDims,
                            },

                            state : {
                                checkbox_disabled : true
                            },
                        });

                        needToRefresh = true;
                    }
                }
            }

            // Create or add to the jstree object
            if (createNewTree) {
                $('#jstree_div').jstree(
                    {
                        'core' : {
                            'data' : FILE_NAV.jstreeDict,
                            "themes": {
                                name : (FILE_NAV.useDarkTheme === true ?
                                        'default-dark' : 'default'),
                                "dots": true,
                                "icons": true
                            },
                        },
                        // "plugins": ["checkbox"],
                        // "plugins": ["themes", "html_data", "checkbox",
                        //                         "ui", "crrm", "hotkeys"]
                    }
                );
            } else {
                if (needToRefresh) {
                    FILE_NAV.processSelectNodeEvent = false;
                    $('#jstree_div').jstree(true).settings.core.data =
                        FILE_NAV.jstreeDict;
                    $('#jstree_div').jstree(true).refresh(selectedId);
                }
            }

            if (debug) {
                for (i = 0; i < FILE_NAV.jstreeDict.length; i += 1) {
                    console.log(FILE_NAV.jstreeDict[i]);
                }
            }

        },


        getListOfLinks : function (linksUrl, selectedId, createNewTree) {
        // Given a 'links' url, make a list of all the links (files, folders,
        // datasets) saving some information about each one.

            var debug = false;

            return $.when(SERVER_COMMUNICATION.ajaxRequest(linksUrl)).then(
                function (response) {

                    var i, key = '', titleList = {}, linkItem, promises = [],
                        responses = [];

                    if (debug) {
                        console.log('response.length: ' + response.length);

                        for (key in response) {
                            if (response.hasOwnProperty(key)) {
                                console.log(key + " -> " + response[key]);
                            }
                        }
                    }

                    // Look for the 'links' section
                    if (response.hasOwnProperty('links')) {

                        // Loop over each 'link' === folder, file, or dataset
                        for (key in response.links) {
                            if (response.links.hasOwnProperty(key)) {

                                linkItem = response.links[key];

                                if (debug) {
                                    console.log(key + " -> " + linkItem.title);
                                }

                                // Save some of the information
                                titleList[linkItem.title] =
                                    {
                                        // All links items have these objects
                                        title: linkItem.title,
                                        target: linkItem.target,
                                        class: linkItem.class,

                                        // Some link items have these objects,
                                        // some don't
                                        id: (
                                            linkItem.hasOwnProperty('id')
                                            ? linkItem.id : false
                                        ),
                                        h5path: (
                                            linkItem.hasOwnProperty('h5path')
                                            ? linkItem.h5path : false
                                        ),
                                        h5domain: (
                                            linkItem.hasOwnProperty('h5domain')
                                            ? linkItem.h5domain : false
                                        ),
                                        collection: (
                                            linkItem.hasOwnProperty(
                                                'collection'
                                            ) ? linkItem.collection : false
                                        ),

                                        // This are new objects
                                        dataType : false,
                                        shapeDims : false,
                                    };

                                // For datasets, find out some more information
                                if (titleList[linkItem.title].collection ===
                                        'datasets') {

                                    if (debug) {
                                        console.log('datasets found!');
                                    }

                                    // Make a list of the ajax processes that
                                    // will be run, the output of each is saved
                                    // to 'responses'
                                    promises.push(
                                        FILE_NAV.getDatasetInfo(linkItem.title,
                                            titleList[linkItem.title].id,
                                            linkItem.target, responses)
                                    );
                                }
                            }
                        }
                    }

                    // Wait until the extra information about all the datasets
                    // has been aquired, then add to the jstree object - should
                    // proabaly add some timeouts to this
                    $.when.apply(null, promises).done(function () {

                        if (debug) {
                            console.log('All Done!');
                        }

                        // Update each 'dataset' link item
                        for (i = 0; i < responses.length; i += 1) {

                            if (debug) {
                                console.log(responses[i]);
                            }

                            titleList[responses[i].title].dataType =
                                responses[i].dataType;
                            titleList[responses[i].title].shapeDims =
                                responses[i].shapeDims;
                        }

                        // Update the jstree object
                        FILE_NAV.addToTree(titleList, selectedId,
                            createNewTree);
                    });

                    return titleList;
                }
            );
        },


        // Get a list of items in a folder, then update the jstree object
        getFileContents : function (inputUrl, selectedId) {

            var debug = false;

            if (debug) {
                console.log('inputUrl: ' + inputUrl);
            }

            // Get the url to the links available
            $.when(FILE_NAV.getTopLevelUrl(inputUrl, 'hrefs', 'root')).then(
                function (topLevelUrl) {

                    if (debug) {
                        console.log('topLevelUrl:  ' + topLevelUrl);
                    }

                    // Get the url to the links available
                    $.when(FILE_NAV.getTopLevelUrl(topLevelUrl, 'hrefs',
                        'links')).then(

                        function (linksUrl) {

                            if (debug) {
                                console.log('linksUrl:  ' + linksUrl);
                            }

                            // From each link, get its title and target url,
                            // the first level of the directory tree will be
                            // filled with this information
                            $.when(FILE_NAV.getListOfLinks(linksUrl,
                                selectedId, false)).then(

                                function (titleList) {
                                    if (debug) {
                                        console.log(titleList);
                                    }
                                }
                            );
                        }
                    );
                }
            );

        },


        // Get a list of items in a folder, then update the jstree object
        getFolderContents : function (topLevelUrl, selectedId) {

            var debug = false;

            if (debug) {
                console.log('topLevelUrl: ' + topLevelUrl);
            }

            // Get the url to the links available
            $.when(FILE_NAV.getTopLevelUrl(topLevelUrl, 'hrefs',
                'links')).then(

                function (linksUrl) {

                    if (debug) {
                        console.log('linksUrl:  ' + linksUrl);
                    }

                    // From each link, get its title and target url
                    $.when(FILE_NAV.getListOfLinks(linksUrl, selectedId,
                        false)).then(

                        function (titleList) {
                            if (debug) {
                                console.log(titleList);
                            }
                        }
                    );
                }
            );

        },


        // Get a list of items in the root directory, then create the jstree
        // object
        getRootDirectoryContents : function () {

            var debug = false,
                initialUrl = FILE_NAV.hdf5DataServer + '/groups';

            // Get the url which will gve info about the groups
            $.when(FILE_NAV.getTopLevelUrl(initialUrl, 'hrefs', 'root')).then(
                function (topLevelUrl) {

                    if (debug) {
                        console.log('topLevelUrl: ' + topLevelUrl);
                    }

                    // Get the url to the links available
                    $.when(FILE_NAV.getTopLevelUrl(topLevelUrl, 'hrefs',
                        'links')).then(

                        function (linksUrl) {

                            if (debug) {
                                console.log('linksUrl:  ' + linksUrl);
                            }

                            // From each link, get its title and target url
                            $.when(FILE_NAV.getListOfLinks(linksUrl, false,
                                true)).then(

                                function (titleList) {
                                    if (debug) {
                                        console.log(titleList);
                                    }

                                    // Display welcome message
                                    DATA_DISPLAY.drawText('Welcome!',
                                        '(click stuff on the left)',
                                        '#3a74ad');
                                }
                            );
                        }
                    );
                }
            );

        },


        // Set the height of the div containing the file browsing tree
        setTreeDivHeight : function () {

            var window_height = $(window).height(),
                content_height = window_height - 80;

            $('#treeSectionDiv').height(content_height);

        },


    };


// Change the icon when a folder is opened
$("#jstree_div").on('open_node.jstree', function (eventInfo, data) {

    var debug = false;

    if (debug) {
        console.log(eventInfo);
    }

    if (data.node.data.type === 'folder') {
        data.instance.set_icon(data.node, 'glyphicon glyphicon-folder-open');
    }

// Change the icon when a folder is closed
}).on('close_node.jstree', function (eventInfo, data) {
    var debug = false;

    if (debug) {
        console.log(eventInfo);
    }

    if (data.node.data.type === 'folder') {
        data.instance.set_icon(data.node, 'glyphicon glyphicon-folder-close');
    }
});


// When an item in the tree is clicked, do some stuff
$('#jstree_div').on("select_node.jstree", function (eventInfo, data) {

    var debug = false, keyData, keyNode;

    // // Open or close the node
    // data.instance.toggle_node(data.node);
    $('#jstree_div').jstree(true).toggle_node(data.node.id);

    if (debug) {

        console.log('');
        console.log('select_node.jstree ' + data.node.id);
        console.log(eventInfo);
        console.log(data.selected);

        console.log('');
        console.log('*** data ***');
        for (keyData in data) {
            if (data.hasOwnProperty(keyData)) {
                console.log(keyData + ' -> ' + data[keyData]);
            }
        }

        console.log('');
        console.log('*** data.node ***');
        for (keyNode in data.node) {
            if (data.node.hasOwnProperty(keyNode)) {
                console.log(keyNode + ' -> ' + data.node[keyNode]);
            }
        }

        console.log('');
        console.log('*** data.node.state ***');
        for (keyData in data.node.state) {
            if (data.node.state.hasOwnProperty(keyData)) {
                console.log(keyData + ' -> ' + data.node.state[keyData]);
            }
        }

        console.log('');
        console.log('*** data.node.data ***');
        for (keyData in data.node.data) {
            if (data.node.data.hasOwnProperty(keyData)) {
                console.log(keyData + ' -> ' + data.node.data[keyData]);
            }
        }

        console.log('FILE_NAV.processSelectNodeEvent: ' +
            FILE_NAV.processSelectNodeEvent);
    }


    if (FILE_NAV.processSelectNodeEvent) {

        // Do different things depending on what type of item has been clicked

        switch (data.node.data.type) {

        case 'folder':
            FILE_NAV.getFolderContents(data.node.data.target, data.selected);
            break;

        case 'file':
            FILE_NAV.getFileContents(data.node.data.target, data.selected);
            break;

        case 'datasets':

            // Empty the plot canvas, get ready for some new stuff
            DATA_DISPLAY.purgePlotCanvas();

            switch (data.node.data.dataType) {

            case 'image-series':
                AJAX_SPINNER.startLoadingData(10);
                HANDLE_DATASET.setupImageSeries(data.node.data.target,
                    data.selected);
                break;

            case 'image':
                AJAX_SPINNER.startLoadingData(10);
                HANDLE_DATASET.displayImage(data.node.data.target,
                    data.selected, data.node.data.shapeDims);
                break;

            case 'line':
                AJAX_SPINNER.startLoadingData(10);
                HANDLE_DATASET.displayLine(data.node.data.target,
                    data.selected, data.node.text);
                break;

            case 'number':
                HANDLE_DATASET.displayText(data.node.data.target,
                    data.node.text, '#ad3a3a');
                break;

            case 'text':
                HANDLE_DATASET.displayText(data.node.data.target,
                    data.node.text, '#3a74ad');
                break;

            default:
                console.log('Is this a fucking dataset? Me thinks not matey!');
                DATA_DISPLAY.displayErrorMessage(data.node.data.target);
            }

            break;

        default:
            console.log('What the fuck do you want me to do with this shit?');
            DATA_DISPLAY.displayErrorMessage(data.node.data.target);
        }

    } else {
        FILE_NAV.processSelectNodeEvent = true;
    }

});


// This function fires when the browser window is resized
$(window).resize(function () {
    FILE_NAV.setTreeDivHeight();
});


// This function fires when the page is loaded
$(document).ready(function () {

    var debug = false;

    if (debug) {
        console.log('document is ready');
        $("#treeSectionDiv").addClass('debugGreen');
    }

    // Set the height of the div containing the file browsing tree
    FILE_NAV.setTreeDivHeight();

    // Fill the uppermost level of the file tree
    FILE_NAV.getRootDirectoryContents();

});
