// src\helia\service_worker.js
import { instantiateHeliaNode } from './service_worker_helia_instantiate.js';


self.addEventListener('activate', event => {
    event.waitUntil(
      clients.claim().then(() => {
        console.log('Service Worker now controls the clients immediately.');
      })
    );
});

self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
  
    // 只处理特定API请求
    if (url.origin === self.location.origin) {
      if (url.pathname === '/src/helia/api/v0/start') {
        event.respondWith(handleStart());
      } else if (url.pathname === '/src/helia/api/v0/stop') {
        event.respondWith(handleStop());
      } else if (url.pathname === '/src/helia/api/v0/status') {
        event.respondWith(handleStatus());
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
