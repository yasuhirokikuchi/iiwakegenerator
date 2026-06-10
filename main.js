// main.js
require("dotenv").config(); // .envファイルを読み込む
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Gemini APIのセットアップ
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function getAppIcon() {
  if (process.platform === "win32") {
    return path.join(__dirname, "assets", "icon.ico");
  }
  return path.join(__dirname, "assets", "icon.png");
}

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    icon: getAppIcon(),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"), // 画面と裏側を繋ぐ橋渡し
      contextIsolation: true,
    },
  });
  win.loadFile("index.html");
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// 画面側から「言い訳を作って！」というリクエストを受け取る処理
ipcMain.handle("generate-excuse", async (event, { eventText, tone }) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

    // AIへの指示（プロンプト）を組み立てる
    const prompt = `あなたは優秀なアシスタントです。以下の内容を断る文章を作成してください。
    【断りたい内容】${eventText}
    【テイスト】${tone}
    【条件】相手を過度に怒らせない範囲で、指定したテイストになりきること。言い訳の本文のみを出力すること。`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("APIエラー:", error);
    return "申し訳ありません、言い訳の生成中にエラーが発生しました。";
  }
});
