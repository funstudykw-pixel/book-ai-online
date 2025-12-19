export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { text, title, author } = req.body || {};

    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Missing text" });
    }

    // ✅ لا نخليها تفشل بسبب title/author
    const safeTitle = (title || "غير محدد").toString().trim();
    const safeAuthor = (author || "غير محدد").toString().trim();

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Missing OPENAI_API_KEY in Vercel env" });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": Bearer ${apiKey}
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "أنت مساعد عربي متخصص في تلخيص النصوص التعليمية." },
          { role: "user", content: العنوان: ${safeTitle}\nالمؤلف: ${safeAuthor}\n\n${text} }
        ],
        temperature: 0.4,
        max_tokens: 220
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || "OpenAI request failed",
        details: data
      });
    }

    const summary = data?.choices?.[0]?.message?.content || "";
    return res.status(200).json({ summary: summary.trim() });

  } catch (error) {
    return res.status(500).json({
      error: "خطأ في التلخيص",
      details: error?.message || String(error)
    });
  }
}