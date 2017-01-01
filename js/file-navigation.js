/*global $, getData, changeType, initializePlotData, plotData, toggleLogPlot*/
'use strict';


// The gloabl variables for this applicaiton
var FILE_NAV =
    {
        // h5serv has an issue with full hostnames
        hdf5DataServer : window.location.protocol + '//' +
                         window.location.hostname.replace('.maxiv.lu.se', '') +
                         ':5000',
        jstreeDict : [],
        processEvent : true,
    };


// Settings used in all ajax requests
$.ajaxSetup({
    type:       'GET',
    dataType:   'json',
    async:      true,
    cache:      false,
    timeout:    2000
});


function communicateWithServer(url) {

    var debug = false;

    // Get the data
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
                        console.log(key + " -> " + response.hrefs[key].rel);
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
function getListOfItems(initialUrl, firstLevelKey, relValue) {

    var debug = true;

    return $.when(communicateWithServer(initialUrl)).then(
        function (response) {

            var key = '', titleList = {}, linkItem;

            if (debug) {
                console.log('response.length: ' + response.length);

                for (key in response) {
                    if (response.hasOwnProperty(key)) {
                        console.log(key + " -> " + response[key]);
                    }
                }

                if (response.hasOwnProperty(firstLevelKey)) {
                    for (key in response.links) {
                        if (response.links.hasOwnProperty(key)) {

                            linkItem = response.links[key];

                            console.log(key + " -> " + linkItem[relValue]);

                            titleList[linkItem[relValue]] =
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
                                };
                        }
                    }
                }
            }

            //if (debug) {
            //    console.log('topLevelUrl: ' + topLevelUrl);
            //}

            return titleList;
        }
    );
}


function addToTree(itemList, selectedId, createNewTree) {

    var i, keyTitle = '', type = '', icon = '', treeParent, treeId,
        doesNodeExist = false, needToRefresh = false;

    if (createNewTree) {
        FILE_NAV.jstreeDict = [];
    }

    for (keyTitle in itemList) {
        if (itemList.hasOwnProperty(keyTitle)) {
            console.log(keyTitle + " -> " + itemList[keyTitle].target);

            if (itemList[keyTitle].id) {
                if (itemList[keyTitle].collection === 'groups') {
                    treeId = itemList[keyTitle].id;
                    type = 'folder';
                    icon = 'glyphicon glyphicon-folder-close';
                }
                if (itemList[keyTitle].collection === 'datasets') {
                    treeId = itemList[keyTitle].id;
                    type = 'data';
                    icon = 'glyphicon glyphicon-qrcode';
                }
            }

            if (itemList[keyTitle].h5domain) {
                treeId = itemList[keyTitle].h5domain;
                type = 'file';
                icon = 'glyphicon glyphicon-copy';
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
            FILE_NAV.processEvent = false;
            $('#jstree_div').jstree(true).settings.core.data =
                FILE_NAV.jstreeDict;
            $('#jstree_div').jstree(true).refresh(selectedId);
        }
    }

    for (i = 0; i < FILE_NAV.jstreeDict.length; i += 1) {
        console.log(FILE_NAV.jstreeDict[i]);

        // for (itemElement in treeItem) {
        //     if (treeItem.hasOwnProperty(itemElement)) {
        //         console.log(itemElement);
        //     }
        // }
    }

    //$('#jstree_div').jstree({ 'core' : {
    //    'data' : [
    //        { "id" : "ajson1", "parent" : "#", "text" : "Simple root node" },
    //        { "id" : "ajson2", "parent" : "#", "text" : "Root node 2" },
    //        { "id" : "ajson3", "parent" : "ajson2", "text" : "Child 1" },
    //        { "id" : "ajson4", "parent" : "ajson2", "text" : "Child 2" },
    //    ]
    //} });

}


function displayData(inputUrl, selectedId) {

    var debug = true, valueUrl;

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
            toggleLogPlot();
            enablePlotControls();
        }
    );
}


function getFileContents(inputUrl, selectedId) {
// Get a list of items in a folder, then update the jstree object

    var debug = true;

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
                    $.when(getListOfItems(linksUrl, 'links', 'title')).then(
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
            $.when(getListOfItems(linksUrl, 'links', 'title')).then(
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

    var initialUrl = FILE_NAV.hdf5DataServer + '/groups';

    // Get the url which will gve info about the groups
    $.when(getTopLevelUrl(initialUrl, 'hrefs', 'root')).then(
        function (topLevelUrl) {

            console.log('topLevelUrl: ' + topLevelUrl);

            // Get the url to the links available
            $.when(getTopLevelUrl(topLevelUrl, 'hrefs', 'links')).then(
                function (linksUrl) {

                    console.log('linksUrl:  ' + linksUrl);

                    // From each link, get its title and target url
                    $.when(getListOfItems(linksUrl, 'links', 'title')).then(
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


$('#jstree_div').on("select_node.jstree", function (eventInfo, data) {
// When an item in the tree is clicked, do some stuff

    var debug = true, keyData, keyNode;

    $('#jstree_div').jstree(true).toggle_node(data.node.id);

    if (data.node.data.type === 'folder') {

        if (data.node.state.opened) {
            $('#jstree_div').jstree(true).set_icon(data.node.id,
                'glyphicon glyphicon-folder-open');
        } else {
            $('#jstree_div').jstree(true).set_icon(data.node.id,
                'glyphicon glyphicon-folder-close');
        }
    }

    if (data.node.data.type === 'file') {

        if (data.node.state.opened) {
            $('#jstree_div').jstree(true).set_icon(data.node.id,
                'glyphicon glyphicon-paste');
        } else {
            $('#jstree_div').jstree(true).set_icon(data.node.id,
                'glyphicon glyphicon-copy');
        }
    }

    if (debug) {
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
        if (data.node.data.type === 'folder') {
            getFolderContents(data.node.data.target, data.selected);
        }

        if (data.node.data.type === 'file') {
            getFileContents(data.node.data.target, data.selected);
        }

        if (data.node.data.type === 'data') {
            displayData(data.node.data.target, data.selected);
        }

    } else {
        FILE_NAV.processEvent = true;
    }

});


// This function fires when the page is loaded
$(document).ready(function () {

    console.log('document is ready');

    getRootDirectoryContents();
});
