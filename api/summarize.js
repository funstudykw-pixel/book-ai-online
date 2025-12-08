export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "Missing OPENAI_API_KEY on server" });
    return;
  }

  const { title, author, type } = req.body || {};

  if (!title || !author) {
    res.status(400).json({ error: "Missing title or author" });
    return;
  }

  const prompt = `
أنت أمين مكتبة للمرحلة الثانوية.
العنوان: ${title}
المؤلف: ${author}
النوع: ${type || "غير محدد"}

اكتب تلخيصًا مبسطًا للطالبات في ٣–٤ جمل فقط وبأسلوب عربي سهل.
`.trim();

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + apiKey,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [
          { role: "system", content: "أنت مساعد لغوي تكتب بلغة بسيطة." },
          { role: "user", content: prompt },
        ],
        temperature: 0.4,
        max_tokens: 200,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI error:", data);
      res.status(500).json({ error: "OpenAI API error" });
      return;
    }

    const text = (data.choices?.[0]?.message?.content || "").trim();
    res.status(200).json({ summary: text });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Server error" });
  }
}
