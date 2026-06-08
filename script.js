const generateBtn = document.getElementById("generate-btn");
const chatWindow = document.getElementById("chat-window");
const eventInput = document.getElementById("event");

generateBtn.addEventListener("click", () => {
  if (!eventInput.value) return;

  generateBtn.textContent = "生成中...";
  generateBtn.disabled = true;

  // 1秒後にAIから言い訳が飛んでくるダミー処理
  setTimeout(() => {
    const aiText = `「大変恐縮ですが、その日は先約の儀がござりまして、参陣かなわぬ次第でござる。無念。」`;
    addIncomingMessage(aiText);

    generateBtn.textContent = "生成する";
    generateBtn.disabled = false;
    eventInput.value = "";
  }, 1000);
});

// メッセージを追加する関数（アイコンなし）
function addIncomingMessage(text) {
  const messageDiv = document.createElement("div");
  messageDiv.className = "message incoming";

  messageDiv.innerHTML = `
        <div class="bubble-wrapper">
          <div class="bubble">${text.replace(/\n/g, "<br>")}</div>
          <button class="copy-btn" onclick="navigator.clipboard.writeText('${text}')">📋 コピー</button>
        </div>
      `;

  chatWindow.appendChild(messageDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}
