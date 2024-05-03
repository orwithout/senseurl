// src\helia\service_worker.js
import { instantiateHeliaNode } from './helia_instantiate.js';


self.addEventListener('activate', event => {
    // 使用clients.claim()让这个Service Worker立即开始控制所有clients
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
  
self.addEventListener('message', event => {
if (event.data.type === 'STOP') {
    if (self.helia) {
    self.helia.stop().then(() => {
        self.helia = null;
        console.log('Helia Node stopped');
    });
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
const status = self.helia ? self.helia.libp2p.status : 'Helia Node not initialized';
return new Response(JSON.stringify({ status }), {
    headers: { 'Content-Type': 'application/json' }
});
}
