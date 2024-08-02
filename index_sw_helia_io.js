// index_sw_helia_io.js
import { instantiateHeliaNode } from '/src/apis/helia/sw_instantiate.js';

self.addEventListener('activate', event => {
    event.waitUntil(
      clients.claim().then(() => {
        console.log('Service Worker now controls the clients immediately.');
      })
    );
});





self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  if (url.origin === self.location.origin) {
    if (url.pathname === '/index_sw_helia_io/v0/start') {
      event.respondWith(handleStart());
    } else if (url.pathname === '/index_sw_helia_io/v0/stop') {
      event.respondWith(handleStop());
    } else if (url.pathname === '/index_sw_helia_io/v0/status') {
      event.respondWith(handleStatus());
    } else if (url.pathname === '/index_sw_helia_io/v0/add-file') {
      event.respondWith(handleAddFile(event.request));
    } else if (url.pathname === '/index_sw_helia_io/v0/get-file') {
      event.respondWith(handleGetFile(event.request));
    } else if (url.pathname === '/index_sw_helia_io/v0/file-info') {
      event.respondWith(handleGetFileInfo(event.request));
    } else if (url.pathname === '/index_sw_helia_io/v0/list-files') {
      event.respondWith(handleListFiles(event.request));
    }
  }
});





async function handleStart() {
  if (!self.helia) {
      self.helia = await instantiateHeliaNode();
  }
  return new Response(JSON.stringify({ status: 'Helia Node started' }), {
      headers: { 'Content-Type': 'application/json' }
  });
}





async function handleStop() {
  console.log('Stop request received'); // 调试输出
  if (self.helia) {
      await self.helia.stop();
      self.helia = null;
  }
  return new Response(JSON.stringify({ status: 'Helia Node stopped' }), {
      headers: { 'Content-Type': 'application/json' }
  });
}





async function handleStatus() {
  // Check if the Helia node is initialized
  const status = self.helia ? self.helia.libp2p.status : 'Helia Node not initialized';
  // Retrieve all peers from the peerStore
  const peers = await self.helia.libp2p.peerStore.all();
  // Build the response object with detailed node status
  const responseContent = {
      nodeStatus: status,  // Node initialization status
      totalPeers: peers.length,  // Total number of peers in the store
      connectedPeers: self.helia.libp2p.getPeers().length  // Number of currently connected peers
  };
  // Return the response with detailed information in JSON format
  return new Response(JSON.stringify(responseContent), {
      headers: { 'Content-Type': 'application/json' }
  });
}




async function handleAddFile(request) {
  if (!self.helia) {
    return new Response(JSON.stringify({ error: 'Helia 节点未初始化' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    if (!file) {
      return new Response(JSON.stringify({ error: '未提供文件' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    console.log('接收到文件:', file.name, '大小:', file.size);
    const content = await file.arrayBuffer();
    console.log('文件已转换为ArrayBuffer');
    
    // 使用 unixfs.addBytes 来添加文件
    const cid = await self.helia.unixfs.addBytes(new Uint8Array(content), {
      rawLeaves: true
    });
    
    console.log('文件已添加到Helia:', cid.toString());
    
    // 固定（pin）添加的文件
    for await (const pinnedCid of self.helia.pins.add(cid)) {
      console.log('文件已固定:', pinnedCid.toString());
    }
    
    return new Response(JSON.stringify({
      cid: cid.toString(),
      size: file.size
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('handleAddFile中的错误:', error);
    return new Response(JSON.stringify({ error: '添加文件时出错', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}


// 处理文件获取请求
async function handleGetFile(request) {
  if (!self.helia) {
    return new Response(JSON.stringify({ error: 'Helia 节点未初始化' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  const url = new URL(request.url);
  const cid = url.searchParams.get('cid');
  if (!cid) {
    return new Response(JSON.stringify({ error: '未提供 CID' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  try {
    const chunks = [];
    for await (const chunk of self.helia.unixfs.cat(cid)) {
      chunks.push(chunk);
    }
    const content = new Uint8Array(chunks.reduce((acc, val) => acc.concat(Array.from(val)), []));
    return new Response(content, {
      headers: { 'Content-Type': 'application/octet-stream' }
    });
  } catch (error) {
    console.error('Error in handleGetFile:', error);
    return new Response(JSON.stringify({ error: '获取文件时出错', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}





// 处理文件元信息获取请求
async function handleGetFileInfo(request) {
  if (!self.helia) {
    console.error('Helia 节点未初始化');
    return new Response(JSON.stringify({ error: 'Helia 节点未初始化' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  const url = new URL(request.url);
  const cidString = url.searchParams.get('cid');
  if (!cidString) {
    console.error('未提供 CID');
    return new Response(JSON.stringify({ error: '未提供 CID' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  try {
    console.log('Attempting to get file info for CID:', cidString);
    
    // 使用 unixfs.cat 方法读取文件内容
    let content = new Uint8Array(0);
    for await (const chunk of self.helia.unixfs.cat(cidString)) {
      const newContent = new Uint8Array(content.length + chunk.length);
      newContent.set(content);
      newContent.set(chunk, content.length);
      content = newContent;
    }

    console.log('File content read, size:', content.length);

    // 尝试获取更多信息
    let additionalInfo = {};
    if (self.helia.dag && typeof self.helia.dag.get === 'function') {
      try {
        const dagNode = await self.helia.dag.get(cidString);
        additionalInfo.links = dagNode.Links ? dagNode.Links.length : 0;
        additionalInfo.data = dagNode.Data ? 'present' : 'not present';
      } catch (dagError) {
        console.warn('Error getting DAG info:', dagError);
      }
    } else {
      console.warn('self.helia.dag.get is not available');
    }

    return new Response(JSON.stringify({
      cid: cidString,
      size: content.length,
      ...additionalInfo
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in handleGetFileInfo:', error);
    return new Response(JSON.stringify({ error: '获取文件信息时出错', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}



async function handleListFiles(request) {
  if (!self.helia) {
    console.error('Helia节点未初始化');
    return new Response(JSON.stringify({ error: 'Helia节点未初始化' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit')) || 50;

    console.log('尝试列出文件，限制数量:', limit);
    console.log('Helia对象:', self.helia);

    const files = [];
    let isEmpty = true;

    // 使用 pins.ls 来获取所有固定的文件
    for await (const pin of self.helia.pins.ls()) {
      isEmpty = false;
      try {
        console.log('找到固定的CID:', pin.cid.toString());
        
        // 使用 unixfs.stat 获取文件信息
        const stat = await self.helia.unixfs.stat(pin.cid);
        console.log('文件信息:', stat);
        
        files.push({
          cid: pin.cid.toString(),
          size: stat.size,
          type: stat.type
        });

        if (files.length >= limit) break;
      } catch (error) {
        console.warn('获取文件信息时出错:', pin.cid.toString(), error);
      }
    }

    if (isEmpty) {
      console.log('没有找到固定的文件');
      return new Response(JSON.stringify({ message: '没有找到文件' }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('文件列表成功:', files);
    return new Response(JSON.stringify(files), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('handleListFiles中的错误:', error);
    return new Response(JSON.stringify({ error: '列出文件时出错', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}