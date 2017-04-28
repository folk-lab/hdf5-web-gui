/*global $*/
'use strict';


// External libraries
var SERVER_COMMUNICATION, AJAX_SPINNER, HANDLE_DATASET, DATA_DISPLAY,

    // Some gloabl variables
    FILE_NAV =
    {
        jstreeDict : [],
        processSelectNodeEvent : true,
        data : null,
        useDarkTheme : false,
        temp : false,

        // Get basic information contained in a list of 'links'
        getLinksInformation : function (linksUrl) {

            var debug = false;

            return $.when(SERVER_COMMUNICATION.ajaxRequest(linksUrl)).then(
                function (response) {

                    var key = '', titleList = {};

                    if (debug) {
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

                                if (debug) {
                                    console.log(key + " -> " +
                                        response.links[key].title);
                                }

                                // Save some of the information
                                titleList[response.links[key].title] =
                                    response.links[key];
                            }
                        }
                    }

                    return titleList;
                }
            );
        },


        // Recursively follow a file path - either through folders on disk,
        // or wihtin an HDF5 file
        followFilePath : function (topLevelUrl, filePathPieces, index) {

            var debug = false;

            if (debug) {
                console.log('topLevelUrl: ' + topLevelUrl);
            }

            // Get the url to the links available
            return $.when(FILE_NAV.getTopLevelUrl(topLevelUrl, 'hrefs',
                'links')).then(

                function (linksUrl) {

                    var returnValue = false;

                    if (debug) {
                        console.log('linksUrl:  ' + linksUrl);
                    }

                    // Get information about each link
                    return $.when(FILE_NAV.getLinksInformation(linksUrl)).then(
                        function (titleList) {

                            var newTopLevelUrl = '';

                            if (debug) {
                                console.log(filePathPieces[index]);
                                console.log(titleList);
                            }

                            // If a link title matches the piece of file path
                            // that we're looking for
                            if (titleList.hasOwnProperty(
                                    filePathPieces[index]
                                )) {

                                if (debug) {
                                    console.log('We got a hit!');
                                    console.log(
                                        titleList[filePathPieces[index]]
                                    );
                                }

                                newTopLevelUrl =
                                    titleList[filePathPieces[index]].target;

                                if (debug) {
                                    console.log(newTopLevelUrl);
                                }

                                if (filePathPieces.length > index + 1) {
                                    return FILE_NAV.followFilePath(
                                        newTopLevelUrl,
                                        filePathPieces,
                                        index + 1
                                    );
                                }

                                returnValue = newTopLevelUrl;

                            }

                            return returnValue;
                        }
                    );
                }
            );

        },


        // Given a file path, file name, and a ath within an HDF5 file,
        // get the target url of an object
        findH5ObjectUrl : function (filePath, h5Path) {

            var debug = false, filePathPieces = [], h5PathPieces,
                initialUrl = SERVER_COMMUNICATION.hdf5DataServer + '/groups';


            // Chop off the file name extension
            filePath = filePath.substr(0, filePath.lastIndexOf('.')) ||
                filePath;

            // Remove leading slah, if it exists
            h5Path = (h5Path.length && h5Path[0] === '/') ? h5Path.slice(1) :
                    h5Path;

            filePathPieces = filePath.split('/');
            h5PathPieces = h5Path.split('/');

            if (debug) {
                console.log('filePath: ' + filePath);
                console.log('  ' + filePathPieces);

                console.log('h5Path:     ' + h5Path);
                console.log('  ' + h5PathPieces);
            }

            // Get the url which will give info about the folder contents
            return $.when(FILE_NAV.getTopLevelUrl(initialUrl, 'hrefs',
                'root')).then(
                function (topLevelUrl) {

                    if (debug) {
                        console.log('topLevelUrl: ' + topLevelUrl);
                    }

                    // Get the contents of this folder
                    return $.when(FILE_NAV.followFilePath(topLevelUrl,
                        filePathPieces, 0)).then(

                        function (output) {

                            if (debug) {
                                console.log(output);
                            }

                            if (output) {
                                return FILE_NAV.findObjectInFile(output,
                                    h5PathPieces);
                            }
                        }
                    );

                }
            );

        },


        // Follow a file path to an object within an HDF5 file
        findObjectInFile : function (inputUrl, h5PathPieces) {

            var debug = false;

            if (debug) {
                console.log('inputUrl: ' + inputUrl);
            }

            // Get the url to the links available
            return $.when(FILE_NAV.getTopLevelUrl(inputUrl, 'hrefs',
                'root')).then(
                function (topLevelUrl) {

                    if (debug) {
                        console.log('topLevelUrl:  ' + topLevelUrl);
                    }

                    // Treat the contents of the file as one would a folder
                    return FILE_NAV.followFilePath(topLevelUrl,
                        h5PathPieces, 0);

                }
            );

        },


        // Given a filename, the path to it (relative to the root data folder),
        // and the path within the file, get a dataset value
        getH5PathObject : function (filePath, h5Path) {

            // Find the target url pointing to an object, given the file name,
            // path, and path within the file
            $.when(FILE_NAV.findH5ObjectUrl(filePath, h5Path)).then(

                function (targetUrl) {
                    var responses = [];

                    console.log(targetUrl);

                    // Get information about the dataset
                    $.when(FILE_NAV.getDatasetInfo('', targetUrl,
                        responses)).then(

                        function () {

                            var datasetInfo = responses[0];

                            console.log(datasetInfo);

                            switch (datasetInfo.dataType) {

                            case 'image-series':
                                AJAX_SPINNER.startLoadingData(10);
                                HANDLE_DATASET.displayImageSeriesInitial(
                                    targetUrl,
                                    datasetInfo.shapeDims,
                                    datasetInfo.id
                                );
                                break;

                            case 'image':
                                AJAX_SPINNER.startLoadingData(10);
                                HANDLE_DATASET.displayImage(targetUrl,
                                    datasetInfo.shapeDims, false,
                                    datasetInfo.id, true);
                                break;

                            case 'line':
                                AJAX_SPINNER.startLoadingData(10);
                                HANDLE_DATASET.displayLine(targetUrl,
                                    datasetInfo.id, datasetInfo.text);
                                break;

                            case 'number':
                                HANDLE_DATASET.displayText(targetUrl,
                                    datasetInfo.text, '#ad3a3a');
                                break;

                            case 'text':
                                HANDLE_DATASET.displayText(targetUrl,
                                    datasetInfo.text, '#3a74ad');
                                break;

                            default:
                                console.log('Is this a fucking dataset?');
                                DATA_DISPLAY.displayErrorMessage(targetUrl);
                            }

                        }

                    );


                }

            );

        },


        // Get information about the dataset object in a linked-to data file
        getH5ObjectLinkInfo : function (title, filePath, h5path, h5domain,
            responses) {

            var debug = false, fileName, dirName = '';

            dirName =  filePath.substring(0, filePath.lastIndexOf('/'));
            fileName = dirName + '/' + h5domain;

            if (debug) {
                console.log('filePath: ' + filePath);
                console.log('dirName:  ' + dirName);
                console.log('fileName: ' + fileName);
                console.log('h5path:   ' + h5path);
            }

            // Find the url pointing to the linked-to data file
            return $.when(FILE_NAV.findH5ObjectUrl(fileName, h5path)).then(
                function (targetUrl) {
                    if (debug) {
                        console.log(targetUrl);
                    }

                    FILE_NAV.temp = targetUrl;

                    // Get information about the dataset object in the
                    // linked-to data file
                    return FILE_NAV.getDatasetInfo(title, targetUrl,
                        responses);
                }
            );

        },

        // Get some information about a 'datasets' object - try and figure out
        // if it's an array, matrix, number, string, or somthing else,
        // then add it to the tree using the proper icon
        getDatasetInfo : function (title, targetUrl, responses) {

            var debug = false, dataType = 'none', shapeDims = false;

            return $.when(SERVER_COMMUNICATION.ajaxRequest(targetUrl)).then(
                function (response) {

                    var key = '';

                    if (debug) {

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
                        id : response.id,
                        target : targetUrl,
                    });
                }
            );

        },


        getTopLevelUrl : function (initialUrl, firstLevelKey, relValue) {

            var debug = false, topLevelUrl = '';

            return $.when(SERVER_COMMUNICATION.ajaxRequest(initialUrl,
                    false)).then(

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
                doesNodeExist = false, dotFile = false, needToRefresh = false,
                filePath = '', h5Path = '', parentTreeNode;

            if (createNewTree) {
                FILE_NAV.jstreeDict = [];
            }

            // Loop over the list of items
            for (keyTitle in itemList) {
                if (itemList.hasOwnProperty(keyTitle)) {

                    if (debug) {
                        console.log(keyTitle + " -> target:     " +
                            itemList[keyTitle].target);
                        console.log(keyTitle + " -> dataType:   " +
                            itemList[keyTitle].dataType);
                        console.log(keyTitle + " -> collection: " +
                            itemList[keyTitle].collection);
                        console.log(keyTitle + " -> readable: " +
                            itemList[keyTitle].readable);
                    }

                    doesNodeExist = false;
                    dotFile = false;

                    // Folders and datasets within HDF5 files have an 'id'
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

                    // HDF5 files have an 'h5domain'
                    if (itemList[keyTitle].h5domain &&
                            !itemList[keyTitle].dataType) {
                        treeId = itemList[keyTitle].h5domain;
                        type = 'file';
                        icon = '../images/hdf5-16px.png';

                        // Check for dot-files, which are probably the h5serv
                        // created files, and should not be presented by
                        // h5serv, yet here they are...
                        if (keyTitle.indexOf('.') === 0) {
                            dotFile = true;
                        }
                    }

                    // Record the file path on disk, and within the HDF5 file
                    filePath = '';
                    h5Path  = '';

                    if (!createNewTree) {
                        parentTreeNode =
                            $('#jstree_div').jstree(true).get_node(selectedId);

                        if (parentTreeNode) {
                            if (debug) {
                                console.log('parentTreeNode.data.filePath: ' +
                                    parentTreeNode.data.filePath);
                            }
                            filePath = parentTreeNode.data.filePath;
                        }

                        if (parentTreeNode.data.type !== 'file' &&
                                parentTreeNode.data.h5Path === '') {
                            filePath += '/' + keyTitle;
                        }

                        if (parentTreeNode.data.type === 'file') {
                            h5Path = keyTitle;
                        }

                        if (parentTreeNode.data.type !== 'file' &&
                                parentTreeNode.data.h5Path !== '') {
                            h5Path = parentTreeNode.data.h5Path;
                            h5Path += '/' + keyTitle;
                        }

                    } else {
                        filePath = keyTitle;
                    }

                    // Check if this id exists already
                    if (!createNewTree) {
                        doesNodeExist = $('#jstree_div').jstree(true).get_node(
                            treeId
                        );
                    }

                    // If this has not already been added to the tree, add it
                    // Do not add MXCube data files, they should be linked to
                    // from the master file
                    if (!doesNodeExist && !dotFile &&
                            !itemList[keyTitle].mxData &&
                            (itemList[keyTitle].readable ||
                             itemList[keyTitle].readable === undefined)) {

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
                                filePath : filePath,
                                h5Path : h5Path,
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


        // Given a 'links' url, make a list of all the links (files, folders,
        // datasets) saving some information about each one.
        getListOfLinks : function (linksUrl, selectedId, createNewTree) {

            var debug = false, parentTreeNode = false, filePath = false;

            return $.when(SERVER_COMMUNICATION.ajaxRequest(linksUrl)).then(
                function (response) {

                    var i, key = '', titleList = {}, linkItem, promises = [],
                        responses = [], mxMaster = false, mxData = false;

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

                                mxMaster = false;
                                mxData = false;

                                linkItem = response.links[key];

                                if (debug) {
                                    console.log(key + " -> " + linkItem.title);
                                }

                                // Try and guess if this is an MX-Cube dataset
                                // taken at MAXIV in a crappy way - this should
                                // really be done by adding attributes the HDF5
                                // file
                                if (linkItem.title.includes('_master')) {
                                    if (debug) {
                                        console.log('master:' +
                                            linkItem.title.includes('_master')
                                            );
                                    }

                                    mxMaster =
                                        linkItem.title.replace('_master', '');
                                }
                                if (linkItem.title.includes('_data_')) {
                                    if (debug) {
                                        console.log('data:  ' +
                                            linkItem.title.includes('_data_'));
                                    }

                                    mxData = linkItem.title.split('_data_');
                                    mxMaster = mxData[0];
                                    mxData = mxData[1];
                                }

                                // Save some of the information
                                titleList[linkItem.title] =
                                    {
                                        // All links items have these objects
                                        title: linkItem.title,
                                        class: linkItem.class,

                                        // Some link items have these objects,
                                        // some don't
                                        target: (
                                            linkItem.hasOwnProperty('target')
                                            ? linkItem.target : false
                                        ),
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
                                        readable: (
                                            linkItem.hasOwnProperty('readable')
                                            ? linkItem.readable : undefined
                                        ),
                                        collection: (
                                            linkItem.hasOwnProperty(
                                                'collection'
                                            ) ? linkItem.collection : false
                                        ),

                                        // This are new objects
                                        dataType : false,
                                        shapeDims : false,
                                        mxMaster : mxMaster,
                                        mxData : mxData,
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
                                            linkItem.target, responses)
                                    );
                                }

                                // For links to datasets, find out more info
                                if (titleList[linkItem.title].h5domain &&
                                        !titleList[linkItem.title].target) {

                                    if (debug) {
                                        console.log('link to datasets found!');
                                    }

                                    titleList[linkItem.title].id =
                                        titleList[linkItem.title].h5domain;
                                    titleList[linkItem.title].collection =
                                        'datasets';

                                    // Get the file path of the jstree parent
                                    // of this item - not such a pretty method
                                    parentTreeNode =
                                        $('#jstree_div').jstree(true).get_node(
                                            selectedId
                                        );

                                    if (parentTreeNode) {
                                        filePath =
                                            parentTreeNode.data.filePath;
                                    }

                                    // Make a list of the ajax processes that
                                    // will be run, the output of each is saved
                                    // to 'responses'
                                    promises.push(
                                        FILE_NAV.getH5ObjectLinkInfo(
                                            linkItem.title,
                                            filePath,
                                            linkItem.h5path,
                                            linkItem.h5domain,
                                            responses
                                        )
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

                        // Update each 'datasets' link item
                        for (i = 0; i < responses.length; i += 1) {

                            if (debug) {
                                console.log(responses[i]);
                            }

                            titleList[responses[i].title].dataType =
                                responses[i].dataType;
                            titleList[responses[i].title].shapeDims =
                                responses[i].shapeDims;

                            // Symbolic links to datasets will need a new
                            // target value
                            titleList[responses[i].title].target =
                                responses[i].target;
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
        getFolderContents : function (topLevelUrl, selectedId, createNewTree) {

            var debug = false, linksUrl;

            if (debug) {
                console.log('topLevelUrl: ' + topLevelUrl);
            }

            if (createNewTree) {
                linksUrl = topLevelUrl + '/links';

                if (debug) {
                    console.log('linksUrl:  ' + linksUrl);
                }

                // From each link, get its title and target url
                $.when(FILE_NAV.getListOfLinks(linksUrl, selectedId,
                    createNewTree)).then(
                    function (titleList) {

                        if (debug) {
                            console.log(titleList);
                        }

                    }
                );

            } else {
                // Get the url to the links available
                $.when(FILE_NAV.getTopLevelUrl(topLevelUrl, 'hrefs',
                    'links')).then(

                    function (linksUrl) {

                        if (debug) {
                            console.log('linksUrl:  ' + linksUrl);
                        }

                        // From each link, get its title and target url
                        $.when(FILE_NAV.getListOfLinks(linksUrl, selectedId,
                            createNewTree)).then(
                            function (titleList) {

                                if (debug) {
                                    console.log(titleList);
                                }

                            }
                        );
                    }
                );
            }

        },


        // Get a list of items in a file, then update the jstree object
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

                    // Treat the contents of the file as one would a folder
                    FILE_NAV.getFolderContents(topLevelUrl, selectedId, false);

                }
            );

        },


        // Get a list of items in the root directory, then create the jstree
        // object
        getRootDirectoryContents : function () {

            var debug = false,
                initialUrl = SERVER_COMMUNICATION.hdf5DataServer + '/groups';

            // Get the url which will give info about the folder contents
            $.when(FILE_NAV.getTopLevelUrl(initialUrl, 'hrefs', 'root')).then(
                function (topLevelUrl) {

                    if (debug) {
                        console.log('topLevelUrl: ' + topLevelUrl);
                    }

                    // Get the contents of this folder
                    FILE_NAV.getFolderContents(topLevelUrl, false, true);
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

    // Open or close the node
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
            FILE_NAV.getFolderContents(data.node.data.target, data.selected,
                false);
            break;

        case 'file':
            FILE_NAV.getFileContents(data.node.data.target, data.selected);
            break;

        case 'datasets':

            // Empty the plot canvas, get ready for some new stuff
            DATA_DISPLAY.purgePlotCanvas();

            // Remove plot controls
            DATA_DISPLAY.enableImagePlotControls(false, false);

            switch (data.node.data.dataType) {

            case 'image-series':
                AJAX_SPINNER.startLoadingData(10);
                HANDLE_DATASET.displayImageSeriesInitial(data.node.data.target,
                    data.node.data.shapeDims);
                break;

            case 'image':
                AJAX_SPINNER.startLoadingData(10);
                HANDLE_DATASET.displayImage(data.node.data.target,
                    data.node.data.shapeDims, false, data.selected, true);
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


// This function fires when the page is ready
$(document).ready(function () {

    var debug = true;

    if (debug) {
        console.log('document is ready');
        // $("#treeSectionDiv").addClass('debugGreen');
    }

    // Set the height of the div containing the file browsing tree
    FILE_NAV.setTreeDivHeight();

    ///////////////////////////////////////////////////////////////////////////
    // TESTING //
    /////////////
    // FILE_NAV.getH5PathObject('jie/tau1-tau_2_master.h5',
    //     'entry/instrument/detector/detectorSpecific/pixel_mask');
    // FILE_NAV.getH5PathObject('jie/tau1-tau_2_data_000002.h5',
    //     'entry/data/data');
    // $.when(FILE_NAV.findH5ObjectUrl('jie/tau1-tau_2_data_000002.h5',
    //     'entry/data/data')).then(
    //     function (targetUrl) {
    //         console.log(targetUrl);
    //         FILE_NAV.temp = targetUrl;
    //     }
    // );
    ///////////////////////////////////////////////////////////////////////////
});
