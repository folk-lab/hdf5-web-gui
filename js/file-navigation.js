/*global $, displayData*/
'use strict';


// The gloabl variables for this applicaiton
var FILE_NAV =
    {
        // h5serv has an issue with full hostnames
        hdf5DataServer: window.location.protocol + '//' +
                        window.location.hostname.replace('.maxiv.lu.se', '') +
                        ':5000',
        jstreeDict: [],
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


function getLinkCount(topLevelUrl, firstLevelKey2) {

    var debug = true, linksUrl;

    return $.when(communicateWithServer(topLevelUrl)).then(
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

            if (response.hasOwnProperty(firstLevelKey2)) {
                linksUrl = response[firstLevelKey2];
            }

            // console.log('linkCount: ' + linkCount);
            linksUrl = FILE_NAV.hdf5DataServer + '/groups/' + linksUrl +
                '/links';
            // console.log('linksUrl:  ' + linksUrl);

            return linksUrl;
            // getLinkTitles(linksUrl, 'links', title);
        }
    );
}


function getTopLevelUrl(initialUrl, firstLevelKey, relValue) {

    var debug = true, topLevelUrl = '';

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


$('#jstree_div').on("changed.jstree", function (eventInfo, data) {

    var keyData, keyNode;

    console.log(eventInfo);
    console.log(data.selected);

    for (keyData in data) {
        if (data.hasOwnProperty(keyData)) {
            console.log(keyData + ' -> ' + data[keyData]);
        }
    }

    for (keyNode in data.node) {
        if (data.node.hasOwnProperty(keyNode)) {
            console.log(keyNode + ' -> ' + data.node[keyNode]);
        }
    }

    for (keyData in data.node.data) {
        if (data.node.data.hasOwnProperty(keyData)) {
            console.log(keyData + ' -> ' + data.node.data[keyData]);
        }
    }

    getFolderContents(data.node.data.target);

    // leaf = $('#jstree_div').jstree(true).get_node(),

    // console.log('FILE_NAV.jstreeDict.length: ' + FILE_NAV.jstreeDict.length);

    // for (i = 0; i < FILE_NAV.jstreeDict.length; i += 1) {
    //     console.log('[' + i + '] text: ' + FILE_NAV.jstreeDict[i].text);

    //     for (leaf in FILE_NAV.jstreeDict[i]) {
    //         if (FILE_NAV.jstreeDict[i].hasOwnProperty(leaf)) {
    //             console.log(leaf + ' -> ' + FILE_NAV.jstreeDict[i][leaf]);
    //         }
    //     }

    // }
});


function fillTree(itemList) {

    var keyTitle = '';

    for (keyTitle in itemList) {
        if (itemList.hasOwnProperty(keyTitle)) {
            console.log(keyTitle + " -> " + itemList[keyTitle].target);

            FILE_NAV.jstreeDict.push({
                // Teh key-value pairs needed by jstree
                id : itemList[keyTitle].id,
                parent : '#',
                text : keyTitle,

                // Save some additional information - is 'data' a good place to
                // have it?
                data : {
                    type: 'folder',
                    target: itemList[keyTitle].target
                }
            });
        }
    }

    $('#jstree_div').jstree({ 'core' : {
        'data' : FILE_NAV.jstreeDict
    } });

    //$('#jstree_div').jstree({ 'core' : {
    //    'data' : [
    //        { "id" : "ajson1", "parent" : "#", "text" : "Simple root node" },
    //        { "id" : "ajson2", "parent" : "#", "text" : "Root node 2" },
    //        { "id" : "ajson3", "parent" : "ajson2", "text" : "Child 1" },
    //        { "id" : "ajson4", "parent" : "ajson2", "text" : "Child 2" },
    //    ]
    //} });

}


function getFolderContents(topLevelUrl) {
// Get a list of items in the root directory, then fill the jstree

    console.log('topLevelUrl: ' + topLevelUrl);

    // Get the url to the links available
    $.when(getLinkCount(topLevelUrl, 'id')).then(
        function (linksUrl) {

            console.log('linksUrl:  ' + linksUrl);

            // From each link, get its title and target url
            $.when(getListOfItems(linksUrl, 'links', 'title')).then(
                function (titleList) {
                    console.log(titleList);
                    // Fill the jstree object
                    // fillTree(titleList);
                }
            );
        }
    );

}


function getRootDirectoryContents() {
// Get a list of items in the root directory, then fill the jstree

    var initialUrl = FILE_NAV.hdf5DataServer + '/groups';

    // Get the url which will gve info about the groups
    $.when(getTopLevelUrl(initialUrl, 'hrefs', 'root')).then(
        function (topLevelUrl) {

            console.log('topLevelUrl: ' + topLevelUrl);

            // Get the url to the links available
            $.when(getLinkCount(topLevelUrl, 'id')).then(
                function (linksUrl) {

                    console.log('linksUrl:  ' + linksUrl);

                    // From each link, get its title and target url
                    $.when(getListOfItems(linksUrl, 'links', 'title')).then(
                        function (titleList) {

                            // Fill the jstree object
                            fillTree(titleList);
                        }
                    );
                }
            );
        }
    );

}


// This function fires when the page is loaded
$(document).ready(function () {

    console.log('document is ready');

    getRootDirectoryContents();
});
