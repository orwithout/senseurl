2024年6月7日

用户输入 url -> 载入 index.html -> 初始化RxDB -> 将index.html 和 /src/** 全部原封不动载入 rxdb -> 跳转到 src/index.html



webTorrent
https://wormhole.app/

peerJS: webRTC 更容易使用
peerJS server

https://github.com/orbitdb/orbitdb/tree/main/docs

https://github.com/ipfs-examples/helia-101#blockstore


https://github.com/orbitdb/orbitdb/blob/main/docs/DATABASES.md

2024年4月21日
添加了vite.config.js：
npm install events
----------------------------------------------------------
// vite.config.js
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      'events': path.resolve(__dirname, 'node_modules/events/events.js')
    }
  }
});
----------------------------------------------------------

为了处理浏览器执行：
import { createOrbitDB } from '@orbitdb/core';
报错 :
This error typically occurs when a Node.js module (like events) that is not natively supported in browsers is being used in client-side code




在线代码平台：https://codesandbox.io/

libp2p webRTC
https://github.com/libp2p/js-libp2p/tree/main/packages/transport-webrtc

libp2p配置：
https://github.com/libp2p/js-libp2p/blob/main/doc/CONFIGURATION.md#configuring-connection-manager


如果配置了 services ,节点发现能力会失效：
const heliaInstance = await createHelia({
    libp2p: {
      services: {
        pubsub: gossipsub({
          allowPublishToZeroPeers: true // necessary to run a single peer
        }),
        identify: identify()
      }
    },
    keychain: {
      pass: 'very-strong-password',
      dek: {
        hash: 'sha2-512',
        salt: 'at-least-16-char-long-random-salt',
        iterationCount: 2000,
        keyLength: 64
      }
    },
    DEFAULT_SESSION_MAX_PROVIDERS: 10,

    datastore: datastore,
    blockstore: blockstore
  });


  https://github.com/ipfs/helia/discussions/529

  手动限制内存使用 peerStore :
  https://github.com/ChainSafe/lodestar/blob/8c55820d888d097946e677e78b10f12a1046c7a3/packages/beacon-node/src/network/peers/datastore.ts#L71