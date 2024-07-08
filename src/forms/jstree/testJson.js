// src\forms\jstree\testJson.js
import jQuery from 'jquery';
import 'jstree';
import 'jstree/dist/themes/default/style.min.css';
import { getDocsEasyIo } from '../../apis/rxdb/collections_easy_io.js';

window.$ = window.jQuery = jQuery;

$(async function() {
  try {
    const docsEasyIo = await getDocsEasyIo('collection_full');

    // Fetch initial data
    const initialData = await docsEasyIo.getJsTreeNodes('#');
    console.log('Initial data:', initialData);

    if (initialData.length === 0) {
      console.warn('No initial data found. jsTree might appear empty.');
    }

    $('#jstree').jstree({
      core: {
        data: function (node, cb) {
          docsEasyIo.getJsTreeNodes(node.id).then(data => {
            cb(data);
          }).catch(err => {
            console.error('Error loading nodes:', err);
            cb([]);
          });
        }
      },
      types: {
        default: { icon: "jstree-file" },
        folder: { icon: "jstree-folder" }
      },
      plugins: ["types", "wholerow"]
    }).on('ready.jstree', function() {
      console.log('jsTree ready');
    }).on('open_node.jstree', function(e, data) {
      console.log('Node opened:', data.node.id);
    });

    $('#refresh-tree').on('click', function() {
      
      // $('#jstree').jstree(true).refresh_node('node_id'); 
      $('#jstree').jstree(true).refresh(); // 刷新整个树
    });

    $('#jstree').on('loaded.jstree', function() {
      console.log('Tree structure:', $('#jstree').jstree(true).get_json('#', {flat: true}));
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