// index_sw_helia_control.js
import { LitElement, html, css } from 'lit';

class HeliaControl extends LitElement {
  static styles = css`
    button {
      margin: 5px;
      padding: 10px;
    }
    input[type="file"] {
      margin: 5px;
    }
  `;

  render() {
    return html`
      <button @click="${this.registerServiceWorker}">注册服务工作线程</button>
      <button @click="${this.startHeliaNode}">启动 Helia 节点</button>
      <button @click="${this.stopHeliaNode}">停止 Helia 节点</button>
      <button @click="${this.unregisterServiceWorker}">注销服务工作线程</button>
      <button @click="${this.checkStatus}">检查节点状态</button>
      <br>
      <input type="file" @change="${this.handleFileSelect}">
      <button @click="${this.addFile}">添加文件</button>
      <br>
      <input type="text" placeholder="输入 CID" id="cidInput">
      <button @click="${this.getFile}">获取文件</button>
      <button @click="${this.getFileInfo}">获取文件信息</button>
      <button @click="${this.listFiles}">列出文件</button>
    `;
  }

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./index_sw_helia_io.js', { type: 'module' })
        .then(() => {
          console.log('服务工作线程已注册');
        })
        .catch(err => console.error('服务工作线程注册失败', err));
    }
  }

  startHeliaNode() {
    fetch('/index_sw_helia_io/v0/start')
      .then(response => response.json())
      .then(data => console.log(data.status))
      .catch(err => console.error('启动 Helia 节点失败', err));
  }

  stopHeliaNode() {
    fetch('/index_sw_helia_io/v0/stop')
      .then(response => response.json())
      .then(data => console.log(data.status))
      .catch(err => console.error('停止 Helia 节点失败', err));
  }

  unregisterServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        for (let registration of registrations) {
          registration.unregister();
          console.log('服务工作线程已注销');
        }
      });
    }
  }

  checkStatus() {
    fetch('/index_sw_helia_io/v0/status')
      .then(response => response.json())
      .then(data => {
        console.log("节点状态:", data.nodeStatus);
        console.log("存储中的总对等点:", data.totalPeers);
        console.log("已连接的对等点:", data.connectedPeers);
      })
      .catch(error => console.error('获取状态时出错:', error));
  }

  handleFileSelect(event) {
    this.selectedFile = event.target.files[0];
  }

  addFile() {
    if (!this.selectedFile) {
      console.error('请先选择一个文件');
      return;
    }
  
    const formData = new FormData();
    formData.append('file', this.selectedFile);
  
    fetch('/index_sw_helia_io/v0/add-file', {
      method: 'POST',
      body: formData
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('文件已添加:', data);
      })
      .catch(err => {
        console.error('添加文件失败', err);
      });
  }

  getFile() {
    const cid = this.shadowRoot.querySelector('#cidInput').value;
    if (!cid) {
      console.error('请输入 CID');
      return;
    }
  
    fetch(`/index_sw_helia_io/v0/get-file?cid=${cid}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.blob();
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `file_${cid}`; // 使用 CID 作为文件名的一部分
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        console.log('文件下载已开始');
      })
      .catch(err => {
        console.error('获取文件失败', err);
      });
  }

  getFileInfo() {
    const cid = this.shadowRoot.querySelector('#cidInput').value;
    if (!cid) {
      console.error('请输入 CID');
      return;
    }
  
    fetch(`/index_sw_helia_io/v0/file-info?cid=${cid}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('文件信息响应:', data);
        if (data.error) {
          throw new Error(data.error);
        }
      })
      .catch(err => {
        console.error('获取文件信息失败', err);
      });
  }

  listFiles() {
    const limit = 50; // 你可以让这个值可配置
  
    fetch(`/index_sw_helia_io/v0/list-files?limit=${limit}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('文件列表:', data);
        if (data.message === '根目录为空') {
          console.log('根目录为空，没有文件可以列出。');
        } else if (Array.isArray(data)) {
          let fileList = data.map(file => 
            `CID: ${file.cid}, 名称: ${file.name}, 大小: ${file.size} 字节, 类型: ${file.type}`
          ).join('\n');
          console.log('文件列表:\n' + fileList);
        } else {
          console.log('获取文件列表失败: 意外的响应格式');
        }
      })
      .catch(err => {
        console.error('获取文件列表失败', err);
      });
  }
}

customElements.define('helia-control', HeliaControl);