const generateBtn = document.getElementById("generate-btn");
const chatWindow = document.getElementById("chat-window");
const eventInput = document.getElementById("event");
const toneSelect = document.getElementById("tone");

generateBtn.addEventListener("click", async () => {
  const eventText = eventInput.value.trim();
  if (!eventText) return;

  generateBtn.textContent = "生成中...";
  generateBtn.disabled = true;

  const tone = toneSelect.options[toneSelect.selectedIndex].text;

  try {
    const response = await fetch("/api/generate-excuse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventText, tone }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error ?? "リクエストに失敗しました。");
    }

    addIncomingMessage(data.text);
  } catch (error) {
    addIncomingMessage(
      error.message ||
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
