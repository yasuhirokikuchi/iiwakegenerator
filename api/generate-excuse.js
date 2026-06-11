import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  SYSTEM_INSTRUCTION,
  buildUserMessage,
  detectInjectionAttempt,
  sanitizeEventText,
  validateTone,
} from "../lib/prompt-safety.js";
import { checkRateLimit, getClientIp } from "../lib/rate-limit.js";

const MAX_EVENT_LENGTH = 500;
const MAX_BODY_BYTES = 2048;
const MAX_GEMINI_ATTEMPTS = 3;
const RETRY_DELAYS_MS = [500, 1500];

const RETRYABLE_HTTP_STATUSES = new Set([429, 500, 502, 503, 504]);
const RETRYABLE_MESSAGE_PATTERNS = [
  "resource_exhausted",
  "unavailable",
  "deadline_exceeded",
  "internal",
  "too many requests",
  "temporarily unavailable",
  "econnreset",
  "etimedout",
  "econnrefused",
  "fetch failed",
  "network",
  "socket hang up",
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableGeminiError(error) {
  const status = error?.status ?? error?.statusCode;
  if (typeof status === "number" && RETRYABLE_HTTP_STATUSES.has(status)) {
    return true;
  }

  const message = String(error?.message ?? error).toLowerCase();
  return RETRYABLE_MESSAGE_PATTERNS.some((pattern) =>
    message.includes(pattern),
  );
}

async function generateExcuseText(model, userMessage) {
  let lastError;

  for (let attempt = 0; attempt < MAX_GEMINI_ATTEMPTS; attempt++) {
    try {
      const result = await model.generateContent(userMessage);
      const response = await result.response;
      return response.text();
    } catch (error) {
      lastError = error;
      const hasRetriesLeft = attempt < MAX_GEMINI_ATTEMPTS - 1;

      if (!hasRetriesLeft || !isRetryableGeminiError(error)) {
        throw error;
      }

      const delay = RETRY_DELAYS_MS[attempt] ?? RETRY_DELAYS_MS.at(-1);
      console.warn(
        `Gemini API 一時エラーのためリトライ (${attempt + 1}/${MAX_GEMINI_ATTEMPTS - 1}):`,
        error?.message ?? error,
      );
      await sleep(delay);
    }
  }

  throw lastError;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const contentType = req.headers["content-type"] ?? "";
  if (!contentType.includes("application/json")) {
    return res.status(415).json({ error: "Content-Type は application/json である必要があります。" });
  }

  const contentLength = Number(req.headers["content-length"] ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return res.status(413).json({ error: "リクエストが大きすぎます。" });
  }

  const clientIp = getClientIp(req);
  const rateLimit = await checkRateLimit(clientIp);
  res.setHeader("X-RateLimit-Remaining", String(rateLimit.remaining));

  if (!rateLimit.success) {
    return res.status(429).json({
      error: "リクエストが多すぎます。しばらく待ってから再度お試しください。",
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "APIキーが設定されていません。" });
  }

  const { eventText, tone } = req.body ?? {};

  if (!eventText || typeof eventText !== "string" || !eventText.trim()) {
    return res.status(400).json({ error: "断りたい内容を入力してください。" });
  }

  const toneLabel = validateTone(tone);
  if (!toneLabel) {
    return res.status(400).json({ error: "テイストを選択してください。" });
  }

  const trimmedEvent = sanitizeEventText(eventText).slice(0, MAX_EVENT_LENGTH);
  if (!trimmedEvent) {
    return res.status(400).json({ error: "断りたい内容を入力してください。" });
  }

  if (detectInjectionAttempt(trimmedEvent)) {
    return res.status(400).json({
      error: "入力内容を処理できません。断りたい内容のみを入力してください。",
    });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash",
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    const text = await generateExcuseText(
      model,
      buildUserMessage(trimmedEvent, toneLabel),
    );
    return res.status(200).json({ text });
  } catch (error) {
    console.error("APIエラー:", error);
    return res
      .status(500)
      .json({ error: "言い訳の生成中にエラーが発生しました。" });
  }
}
