// preload.js
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  // 画面側から裏側の 'generate-excuse' 処理を呼び出せるようにする
  generateExcuse: (data) => ipcRenderer.invoke("generate-excuse", data),
});
