import jQuery from 'jquery';
import 'jstree';
import 'jstree/dist/themes/default/style.min.css';
import { getDocsEasyIo } from '../../apis/rxdb/collections_easy_io.js';

window.$ = window.jQuery = jQuery;

$(async function() {
  try {
    const docsEasyIo = await getDocsEasyIo('collection_full');







    $('#jstree').jstree({
        "core" : {
          "check_callback" : true,
          "data" : function (node, cb) {
            console.log('Loading node:', node.id);
            docsEasyIo.getJsTreeNodes(node.id === "#" ? "/" : node.id).then(data => {
              console.log('Node data:', data);
              cb(data);
            }).catch(err => console.error('Error loading nodes:', err));
          }
        },
        "plugins" : ["dnd", "contextmenu", "wholerow", "types"],
        "types" : {
          "default" : {
            "icon" : "jstree-file"
          },
          "folder" : {
            "icon" : "jstree-folder"
          }
        }
      }).on('ready.jstree', function() {
        console.log('jsTree ready');
        $('#jstree').jstree('open_node', '#');
      }).on('open_node.jstree', function(e, data) {
        console.log('Node opened:', data.node.id);
      });










    $('#save').on('click', function() {
      var flatData = $('#jstree').jstree(true).get_json('#', {flat: true});
      $('#flat-output').text(JSON.stringify(flatData, null, 2));

      var treeData = $('#jstree').jstree(true).get_json('#');
      $('#tree-output').text(JSON.stringify(treeData, null, 2));
    });











    $('#show-rxdb-data').on('click', async function() {
      const allDocs = await docsEasyIo.collection.find().exec();
      const rxdbData = allDocs.map(doc => doc.toJSON());
      $('#rxdb-output').text(JSON.stringify(rxdbData, null, 2));
    });

  } catch (error) {
    console.error('Error initializing DocsEasyIo:', error);
  }
});