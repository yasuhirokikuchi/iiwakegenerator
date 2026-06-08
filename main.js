// モジュールのインポート
const { app, BrowserWindow } = require("electron");

// ウインドウを作成する再使用可能な関数
const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
  });

  win.maximize(); // ウィンドウフルスクリーン
  win.loadFile("index.html");

  // 開発時にDevToolsを開く
  // win.webContents.openDevTools();
};

// アプリの準備ができたら関数を呼び出す
app.whenReady().then(() => {
  createWindow();
});
