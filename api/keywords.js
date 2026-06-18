import { checkRateLimit, safeParse } from "./_rateLimit.js";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

const KEYWORD_SYSTEM_PROMPT = `You generate interesting, specific, concrete nouns or short phrases (1-3 words) for an idea-fusion app. Avoid generic words like "thing" or "idea". Mix categories: nature, technology, art, science, culture, everyday objects, history.

You will be given a list of words ALREADY USED. You must never repeat any word from that list, and avoid close synonyms of them too.

Respond with ONLY valid JSON, no markdown, no commentary:
{
  "suggestions": [
    {"word": "mycelium network", "category": "nature"}
  ]
}
Generate exactly 8 NEW suggestions across at least 4 different categories.`;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "METHOD_NOT_ALLOWED" });

  const rateLimitResult = await checkRateLimit(req);
  if (!rateLimitResult.allowed) {
    return res.status(429).json({ error: "DAILY_LIMIT_REACHED", remaining: 0 });
  }

  const { seedWord, usedWords = [] } = req.body ?? {};
  const usedList = usedWords.length > 0 ? usedWords.join(", ") : "none yet";
  const userMsg = `Already used words (do not repeat or closely paraphrase any of these): ${usedList}.\n${
    seedWord
      ? `Suggest 8 diverse NEW concepts that would create interesting, unexpected fusions when combined with "${seedWord}".`
      : `Suggest 8 diverse, unexpected NEW concepts for idea fusion.`
  }`;

  try {
    const groqRes = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: KEYWORD_SYSTEM_PROMPT },
          { role: "user", content: userMsg },
        ],
        temperature: 1.15,
        max_tokens: 400,
        response_format: { type: "json_object" },
      }),
    });

    if (!groqRes.ok) {
      console.error("Groq error:", groqRes.status, await groqRes.text());
      return res.status(502).json({ error: "GROQ_ERROR" });
    }

    const data = await groqRes.json();
    const parsed = safeParse(data.choices?.[0]?.message?.content);
    const suggestions = parsed.suggestions ?? [];
    const usedLower = new Set(usedWords.map((w) => w.toLowerCase()));
    const filtered = suggestions.filter((s) => !usedLower.has((s.word ?? "").toLowerCase()));

    return res.status(200).json({ suggestions: filtered, remaining: rateLimitResult.remaining });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
}
