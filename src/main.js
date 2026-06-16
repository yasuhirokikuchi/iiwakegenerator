import "./style.css";

const excuseForm = document.getElementById("excuse-form");
const generateBtn = document.getElementById("generate-btn");
const chatWindow = document.getElementById("chat-window");
const chatEmptyState = document.getElementById("chat-empty-state");
const eventInput = document.getElementById("event");
const toneSelect = document.getElementById("tone");
const eventError = document.getElementById("event-error");

const DEFAULT_BTN_HTML = "生成する";

function showEventError(message) {
  eventError.textContent = message;
  eventError.hidden = false;
  eventInput.setAttribute("aria-invalid", "true");
  eventInput.focus();
}

function clearEventError() {
  eventError.textContent = "";
  eventError.hidden = true;
  eventInput.removeAttribute("aria-invalid");
}

eventInput.addEventListener("input", clearEventError);

function setLoading(isLoading) {
  generateBtn.disabled = isLoading;
  eventInput.disabled = isLoading;
  toneSelect.disabled = isLoading;
  generateBtn.classList.toggle("is-loading", isLoading);
  generateBtn.innerHTML = isLoading
    ? '<span class="btn-spinner" aria-hidden="true"></span><span>生成中...</span>'
    : DEFAULT_BTN_HTML;
}

function showTypingIndicator() {
  const messageDiv = document.createElement("div");
  messageDiv.className = "message incoming loading-message";
  messageDiv.setAttribute("role", "status");
  messageDiv.setAttribute("aria-live", "polite");
  messageDiv.setAttribute("aria-label", "言い訳を生成しています");

  const wrapper = document.createElement("div");
  wrapper.className = "bubble-wrapper";

  const bubble = document.createElement("div");
  bubble.className = "bubble typing-bubble";
  bubble.innerHTML =
    '<span class="typing-dots" aria-hidden="true"><span></span><span></span><span></span></span><span class="typing-label">考え中...</span>';

  wrapper.appendChild(bubble);
  messageDiv.appendChild(wrapper);
  chatWindow.appendChild(messageDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;

  return messageDiv;
}

function removeTypingIndicator(indicator) {
  indicator?.remove();
}

function hideEmptyState() {
  if (!chatEmptyState || chatEmptyState.hidden) return;
  chatEmptyState.hidden = true;
  chatEmptyState.setAttribute("aria-hidden", "true");
}

excuseForm.addEventListener("submit", (event) => {
  event.preventDefault();
  handleGenerate();
});

async function handleGenerate() {
  const eventText = eventInput.value.trim();
  if (!eventText) {
    showEventError("断りたい内容を入力してください。");
    return;
  }

  clearEventError();
  hideEmptyState();
  setLoading(true);
  const typingIndicator = showTypingIndicator();

  const tone = toneSelect.value;

  try {
    const response = await fetch("/api/generate-excuse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventText, tone }),
    });

    const rawBody = await response.text();
    let data = {};
    if (rawBody) {
      try {
        data = JSON.parse(rawBody);
      } catch {
        throw new Error(
          "サーバーから無効な応答が返されました。npm run dev:vercel で起動し、表示された URL（通常 http://localhost:3000）にアクセスしてください。",
        );
      }
    } else if (!response.ok) {
      throw new Error(
        "API に接続できませんでした。npm run dev:vercel で起動し、Vite の URL（:5173 など）ではなく Vercel の URL にアクセスしてください。",
      );
    }

    if (!response.ok) {
      throw new Error(data.error ?? "リクエストに失敗しました。");
    }

    removeTypingIndicator(typingIndicator);
    addIncomingMessage(data.text);
    eventInput.value = "";
  } catch (error) {
    removeTypingIndicator(typingIndicator);
    addIncomingMessage(
      error.message ||
        "エラーが発生しました。APIキーや通信状況を確認してください。",
      { isError: true },
    );
  } finally {
    setLoading(false);
  }
}

function addIncomingMessage(text, { isError = false } = {}) {
  const messageDiv = document.createElement("div");
  messageDiv.className = "message incoming";
  if (isError) {
    messageDiv.classList.add("error-message");
    messageDiv.setAttribute("role", "alert");
  }

  const wrapper = document.createElement("div");
  wrapper.className = "bubble-wrapper";

  const bubble = document.createElement("div");
  bubble.className = isError ? "bubble bubble-error" : "bubble";

  if (isError) {
    const prefix = document.createElement("span");
    prefix.className = "bubble-error-label";
    prefix.textContent = "エラー";
    bubble.appendChild(prefix);
    bubble.appendChild(document.createElement("br"));
  }

  text.split("\n").forEach((line, index) => {
    if (index > 0) bubble.appendChild(document.createElement("br"));
    bubble.appendChild(document.createTextNode(line));
  });

  wrapper.appendChild(bubble);

  if (!isError) {
    const copyBtn = document.createElement("button");
    copyBtn.className = "copy-btn";
    copyBtn.type = "button";
    copyBtn.textContent = "📋 コピー";
    copyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(text);
    });
    wrapper.appendChild(copyBtn);
  }

  messageDiv.appendChild(wrapper);
  chatWindow.appendChild(messageDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}
