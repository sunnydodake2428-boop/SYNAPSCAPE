import { checkRateLimit, safeParse } from "./_rateLimit.js";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

const REMIX_SYSTEM_PROMPT = `You generate a single replacement concept for an idea-fusion app's "remix" feature. The user is keeping one concept fixed and wants a fresh partner concept that creates a genuinely different, interesting fusion — not a synonym or close variant of the one being replaced.

Respond with ONLY valid JSON, no markdown, no commentary:
{"word": "the new concept"}`;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "METHOD_NOT_ALLOWED" });

  const rateLimitResult = await checkUserRateLimit(req, "fusion", 5);
  if (!rateLimitResult.allowed) {
    return res.status(429).json({ error: "DAILY_LIMIT_REACHED", remaining: 0 });
  }

  const { fixedWord, replacingWord } = req.body ?? {};
  if (!fixedWord || !replacingWord) return res.status(400).json({ error: "MISSING_WORDS" });

  try {
    const groqRes = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: REMIX_SYSTEM_PROMPT },
          { role: "user", content: `Fixed concept: "${fixedWord}". Currently paired with: "${replacingWord}". Suggest a new, different concept to pair with "${fixedWord}" instead.` },
        ],
        temperature: 1.2,
        max_tokens: 100,
        response_format: { type: "json_object" },
      }),
    });

    if (!groqRes.ok) {
      console.error("Groq error:", groqRes.status, await groqRes.text());
      return res.status(502).json({ error: "GROQ_ERROR" });
    }

    const data = await groqRes.json();
    const parsed = safeParse(data.choices?.[0]?.message?.content);

    return res.status(200).json({ word: parsed.word ?? "mystery", remaining: rateLimitResult.remaining });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
}
