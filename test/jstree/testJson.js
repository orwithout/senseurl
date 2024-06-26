import jQuery from 'jquery';
import 'jstree';
import 'jstree/dist/themes/default/style.min.css';

window.$ = window.jQuery = jQuery;

$(function() {
    var flatData = [
        { "id" : "1", "parent" : "#", "text" : "根节点" },
        { "id" : "2", "parent" : "1", "text" : "子节点 1" },
        { "id" : "3", "parent" : "1", "text" : "子节点 2" },
        { "id" : "4", "parent" : "2", "text" : "子节点 1.1" },
        { "id" : "5", "parent" : "2", "text" : "子节点 1.2" },
        { "id" : "6", "parent" : "3", "text" : "子节点 2.1" }
    ];

    $('#jstree').jstree({
        "core" : {
            "check_callback" : true,
            "data" : flatData
        },
        "plugins" : ["dnd", "contextmenu", "wholerow"]
    });

    $('#save').on('click', function() {
        var jsonData = $('#jstree').jstree(true).get_json('#', {flat:true});
        $('#json-output').text(JSON.stringify(jsonData, null, 2));
    });
});