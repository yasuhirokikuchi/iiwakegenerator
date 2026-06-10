// index.html の <script> 部分のみ抜粋・修正
const generateBtn = document.getElementById("generate-btn");
const chatWindow = document.getElementById("chat-window");
const eventInput = document.getElementById("event");
const toneSelect = document.getElementById("tone"); // セレクトボックスを取得

generateBtn.addEventListener("click", async () => {
  const eventText = eventInput.value;
  if (!eventText) return;

  generateBtn.textContent = "生成中...";
  generateBtn.disabled = true;

  // 選択されたテイストのテキストを取得（例：「武士風」など）
  const tone = toneSelect.options[toneSelect.selectedIndex].text;

  try {
    // preload.jsを経由して裏側（main.js）に通信し、AIの返答を待つ
    const aiText = await window.api.generateExcuse({ eventText, tone });

    // 画面に追加
    addIncomingMessage(aiText);
  } catch (error) {
    addIncomingMessage(
      "エラーが発生しました。APIキーや通信状況を確認してください。",
    );
  } finally {
    generateBtn.textContent = "生成する";
    generateBtn.disabled = false;
    eventInput.value = "";
  }
});

function addIncomingMessage(text) {
  const messageDiv = document.createElement("div");
  messageDiv.className = "message incoming";

  const wrapper = document.createElement("div");
  wrapper.className = "bubble-wrapper";

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  text.split("\n").forEach((line, index) => {
    if (index > 0) bubble.appendChild(document.createElement("br"));
    bubble.appendChild(document.createTextNode(line));
  });

  const copyBtn = document.createElement("button");
  copyBtn.className = "copy-btn";
  copyBtn.type = "button";
  copyBtn.textContent = "📋 コピー";
  copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(text);
  });

  wrapper.appendChild(bubble);
  wrapper.appendChild(copyBtn);
  messageDiv.appendChild(wrapper);
  chatWindow.appendChild(messageDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}
