/*global $, getData, enablePlotControls, initializePlotData, plotData*/
'use strict';


// Some gloabl variables
var FILE_NAV =
    {
        // h5serv has an issue with full hostnames
        hdf5DataServer : window.location.protocol + '//' +
                         window.location.hostname.replace('.maxiv.lu.se', '') +
                         ':5000',
        jstreeDict : [],
        processEvent : true,
        data : null,
    };


// Settings used in all ajax requests
$.ajaxSetup({
    type:       'GET',
    dataType:   'json',
    async:      true,
    cache:      false,
    timeout:    10000
});


function communicateWithServer(url) {

    var debug = false;

    // Get the data - the return value is the response
    return $.ajax({
        url: url,

        success: function (response) {

            var key = '';

            if (debug) {
                console.log("AJAX " + url + " request success: " +
                    response);
                console.log('response.length: ' + response.length);

                for (key in response) {
                    if (response.hasOwnProperty(key)) {
                        console.log(key + " -> " + response[key]);
                    }
                }
            }

        },

        error: function (response) {
            console.log('AJAX ' + url + ' error: ' + response);
        }

    });

}


function changeDatasetIcon(nodeId, targetUrl) {

    var debug = false;

    $.when(communicateWithServer(targetUrl)).then(
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

            if (response.hasOwnProperty('shape')) {
                console.log(response.shape.dims.length);
                console.log(response.shape.dims);

                if (response.shape.dims.length > 1) {
                    FILE_NAV.data.instance.set_icon(nodeId,
                        'glyphicon glyphicon-picture');
                    // $('#jstree_div').jstree(true).set_icon(nodeId,
                    //    'glyphicon glyphicon-picture');
                    FILE_NAV.processEvent = false;
                    $('#jstree_div').jstree(true).refresh();
                }
            }
        }
    );

}


function getTopLevelUrl(initialUrl, firstLevelKey, relValue) {

    var debug = false, topLevelUrl = '';

    return $.when(communicateWithServer(initialUrl)).then(
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
}


function getListOfLinks(linksUrl) {
// Given a 'links' url, make a list of all the links (files, folders, datasets)
// saving some information about each one.

    var debug = false;

    return $.when(communicateWithServer(linksUrl)).then(
        function (response) {

            var key = '', titleList = {}, linkItem;

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

                        titleList[linkItem.title] =
                            {
                                title: linkItem.title,
                                target: linkItem.target,
                                class: linkItem.class,
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
                                    linkItem.hasOwnProperty('collection')
                                    ? linkItem.collection : false
                                ),
                                dataType: false,
                            };

                    }
                }
            }

            return titleList;
        }
    );
}


function addToTree(itemList, selectedId, createNewTree) {
// Add new item to the file browser tree

    var debug = false, i, keyTitle = '', type = '', icon = '', treeParent,
        treeId, doesNodeExist = false, needToRefresh = false;

    if (createNewTree) {
        FILE_NAV.jstreeDict = [];
    }

    for (keyTitle in itemList) {
        if (itemList.hasOwnProperty(keyTitle)) {
            if (debug) {
                console.log(keyTitle + " -> " + itemList[keyTitle].target);
            }

            if (itemList[keyTitle].id) {
                if (itemList[keyTitle].collection === 'groups') {
                    treeId = itemList[keyTitle].id;
                    type = 'folder';
                    icon = 'glyphicon glyphicon-folder-close';
                }
                if (itemList[keyTitle].collection === 'datasets') {
                    treeId = itemList[keyTitle].id;
                    type = 'datasets';
                    icon = 'glyphicon glyphicon-qrcode';
                }
            }

            if (itemList[keyTitle].h5domain) {
                treeId = itemList[keyTitle].h5domain;
                type = 'file';
                // icon = 'glyphicon glyphicon-copy';
                icon = '../images/hdf5-16px.png';
            }

            if (selectedId) {
                treeParent = selectedId;
            } else {
                treeParent = '#';
            }

            // Check if this id exists already
            if (!createNewTree) {
                doesNodeExist = $('#jstree_div').jstree(true).get_node(treeId);
            }

            // If this has not already been added to the tree, add it
            if (!doesNodeExist) {
                FILE_NAV.jstreeDict.push({

                    // The key-value pairs needed by jstree
                    id : treeId,
                    parent : treeParent,
                    text : keyTitle,
                    icon : icon,

                    // Save some additional information - is this a good place
                    // to put it?
                    data : {
                        type: type,
                        target: itemList[keyTitle].target,
                        h5path: itemList[keyTitle].h5path,
                        h5domain: itemList[keyTitle].h5domain,
                    }
                });

                needToRefresh = true;
            }
        }
    }

    if (createNewTree) {
        $('#jstree_div').jstree(
            {
                'core' : {
                    'data' : FILE_NAV.jstreeDict
                }
            }
        );
    } else {
        if (needToRefresh) {
            // FILE_NAV.processEvent = false;
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

    // After filling the tree, go back and check if the nodes added were of the
    // dataset type, and if so, set a different icon depending on some more
    // information

    // for (keyTitle in itemList) {
    //     if (itemList.hasOwnProperty(keyTitle)) {
    //         if (itemList[keyTitle].id) {
    //             if (itemList[keyTitle].collection === 'datasets') {
    //                 console.log('found a dataset');

    //                 changeDatasetIcon(itemList[keyTitle].id,
    //                     itemList[keyTitle].target);
    //             }
    //         }
    //     }
    // }

}


function displayData(inputUrl, selectedId) {
// When a dataset is selected, plot the data
// → this needs to be improved so that it works for more than just images!

    var debug = false, valueUrl;

    if (debug) {
        console.log('inputUrl: ' + inputUrl);
    }

    // The url that get the data from the server
    valueUrl = inputUrl.replace(selectedId, selectedId + '/value');

    if (debug) {
        console.log('valueUrl: ' + valueUrl);
    }


    $.when(getData(valueUrl)).then(
        function (response) {
            initializePlotData(response.value);
            plotData();
            enablePlotControls();
        }
    );
}


function getFileContents(inputUrl, selectedId) {
// Get a list of items in a folder, then update the jstree object

    var debug = false;

    if (debug) {
        console.log('inputUrl: ' + inputUrl);
    }

    // Get the url to the links available
    $.when(getTopLevelUrl(inputUrl, 'hrefs', 'root')).then(
        function (topLevelUrl) {

            if (debug) {
                console.log('topLevelUrl:  ' + topLevelUrl);
            }

            // Get the url to the links available
            $.when(getTopLevelUrl(topLevelUrl, 'hrefs', 'links')).then(
                function (linksUrl) {

                    if (debug) {
                        console.log('linksUrl:  ' + linksUrl);
                    }

                    // From each link, get its title and target url
                    $.when(getListOfLinks(linksUrl)).then(
                        function (titleList) {
                            if (debug) {
                                console.log(titleList);
                            }

                            // Update the jstree object
                            addToTree(titleList, selectedId, false);
                        }
                    );
                }
            );
        }
    );

}


function getFolderContents(topLevelUrl, selectedId) {
// Get a list of items in a folder, then update the jstree object

    var debug = false;

    if (debug) {
        console.log('topLevelUrl: ' + topLevelUrl);
    }

    // Get the url to the links available
    $.when(getTopLevelUrl(topLevelUrl, 'hrefs', 'links')).then(
        function (linksUrl) {

            if (debug) {
                console.log('linksUrl:  ' + linksUrl);
            }

            // From each link, get its title and target url
            $.when(getListOfLinks(linksUrl)).then(
                function (titleList) {
                    if (debug) {
                        console.log(titleList);
                    }

                    // Update the jstree object
                    addToTree(titleList, selectedId, false);
                }
            );
        }
    );

}


function getRootDirectoryContents() {
// Get a list of items in the root directory, then create the jstree object

    var debug = false, initialUrl = FILE_NAV.hdf5DataServer + '/groups';

    // Get the url which will gve info about the groups
    $.when(getTopLevelUrl(initialUrl, 'hrefs', 'root')).then(
        function (topLevelUrl) {

            if (debug) {
                console.log('topLevelUrl: ' + topLevelUrl);
            }

            // Get the url to the links available
            $.when(getTopLevelUrl(topLevelUrl, 'hrefs', 'links')).then(
                function (linksUrl) {

                    if (debug) {
                        console.log('linksUrl:  ' + linksUrl);
                    }

                    // From each link, get its title and target url
                    $.when(getListOfLinks(linksUrl)).then(
                        function (titleList) {

                            // Fill the jstree object
                            addToTree(titleList, false, true);
                        }
                    );
                }
            );
        }
    );

}


$("#jstree_div").on('open_node.jstree', function (eventInfo, data) {
// Change the icon when a folder is opened

    var debug = false;

    if (debug) {
        console.log(eventInfo);
    }

    if (data.node.data.type === 'folder') {
        data.instance.set_icon(data.node, 'glyphicon glyphicon-folder-open');
    }

}).on('close_node.jstree', function (eventInfo, data) {
    var debug = false;

    if (debug) {
        console.log(eventInfo);
    }

    if (data.node.data.type === 'folder') {
        data.instance.set_icon(data.node, 'glyphicon glyphicon-folder-close');
    }
});


$('#jstree_div').on("select_node.jstree", function (eventInfo, data) {
// When an item in the tree is clicked, do some stuff

    var debug = false, keyData, keyNode;

    // Open or close the node
    data.instance.toggle_node(data.node);

    FILE_NAV.data = data;

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
    }

    if (FILE_NAV.processEvent) {
        FILE_NAV.processEvent = false;

        // Do different things depending on what type of item has been clicked

        if (data.node.data.type === 'folder') {
            getFolderContents(data.node.data.target, data.selected);
        }

        if (data.node.data.type === 'file') {
            getFileContents(data.node.data.target, data.selected);
        }

        if (data.node.data.type === 'datasets') {
            displayData(data.node.data.target, data.selected);
        }

    } else {
        FILE_NAV.processEvent = true;
    }

});


$(document).ready(function () {
// This function fires when the page is loaded

    var debug = false;

    if (debug) {
        console.log('document is ready');
    }

    // Fill the uppermost level of the file tree
    getRootDirectoryContents();
});
