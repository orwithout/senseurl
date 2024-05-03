// src\helia\helia_control.js
import { LitElement, html, css } from 'lit';

class HeliaControl extends LitElement {


  render() {
    return html`
      <button @click="${this.registerServiceWorker}">Register Service Worker</button>
      <button @click="${this.startHeliaNode}">Start Helia Node</button>
      <button @click="${this.stopHeliaNode}">Stop Helia Node</button>
      <button @click="${this.unregisterServiceWorker}">Unregister Service Worker</button>
      <button @click="${this.checkStatus}">Check Node Status</button>
    `;
  }

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./service_worker.js', { type: 'module' })
        .then(() => {
          console.log('Service Worker registered');
        })
        .catch(err => console.error('Service Worker registration failed', err));
    }
  }

  startHeliaNode() {
    fetch('/src/helia/api/v0/start')
      .then(response => response.json())
      .then(data => console.log(data.status))
      .catch(err => console.error('Failed to start Helia Node', err));
  }

  stopHeliaNode() {
    fetch('/src/helia/api/v0/stop')
      .then(response => response.json())
      .then(data => console.log(data.status));
  }

  unregisterServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        for (let registration of registrations) {
          registration.unregister();
          console.log('Service Worker unregistered');
        }
      });
    }
  }

  checkStatus() {
    fetch('/src/helia/api/v0/status')
      .then(response => response.json())
      .then(data => console.log(data.status));
  }
}

customElements.define('helia-control', HeliaControl);
