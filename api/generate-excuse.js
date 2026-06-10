import { GoogleGenerativeAI } from "@google/generative-ai";

const MAX_EVENT_LENGTH = 500;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "APIキーが設定されていません。" });
  }

  const { eventText, tone } = req.body ?? {};

  if (!eventText || typeof eventText !== "string" || !eventText.trim()) {
    return res.status(400).json({ error: "断りたい内容を入力してください。" });
  }

  if (!tone || typeof tone !== "string") {
    return res.status(400).json({ error: "テイストを選択してください。" });
  }

  const trimmedEvent = eventText.trim().slice(0, MAX_EVENT_LENGTH);

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

    const prompt = `あなたは優秀なアシスタントです。以下の内容を断る文章を作成してください。
【断りたい内容】${trimmedEvent}
【テイスト】${tone}
【条件】相手を過度に怒らせない範囲で、指定したテイストになりきること。言い訳の本文のみを出力すること。`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return res.status(200).json({ text: response.text() });
  } catch (error) {
    console.error("APIエラー:", error);
    return res
      .status(500)
      .json({ error: "言い訳の生成中にエラーが発生しました。" });
  }
}
