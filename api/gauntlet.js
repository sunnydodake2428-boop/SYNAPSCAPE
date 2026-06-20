import { checkRateLimit, safeParse, clamp } from "./_rateLimit.js";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

const GAUNTLET_SYSTEM_PROMPT = `You run "The Gauntlet" — a brutal idea-validation exercise. Given a project idea, you produce THREE perspectives in sequence:

1. THE SKEPTIC: a sharp, experienced critic who attacks this idea with the single hardest, most realistic objection (market, technical, or business). Specific, not generic ("nobody wants this" is not allowed — say exactly WHY, citing a concrete failure mode).
2. THE BUILDER: someone who takes the skeptic's objection seriously and either (a) explains a concrete way to address it, or (b) admits the objection is fatal and says so plainly.
3. THE VERDICT: a final honest ruling — "BUILD IT", "BUILD A SMALLER VERSION FIRST", or "DON'T BUILD THIS" — with one sentence why, plus a confidence score 1-100 for whether this survives contact with real users.

Be willing to give a harsh verdict. Do not be encouraging by default — only rule "BUILD IT" if it would genuinely survive scrutiny.

Respond with ONLY valid JSON, no markdown, no commentary:
{
  "skepticAttack": "...",
  "builderResponse": "...",
  "verdict": "BUILD IT" | "BUILD A SMALLER VERSION FIRST" | "DON'T BUILD THIS",
  "verdictReason": "one sentence",
  "confidence": <integer 1-100>
}`;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "METHOD_NOT_ALLOWED" });

  const rateLimitResult = await checkUserRateLimit(req, "fusion", 5);
  if (!rateLimitResult.allowed) {
    return res.status(429).json({ error: "DAILY_LIMIT_REACHED", remaining: 0 });
  }

  const { idea } = req.body ?? {};
  if (!idea?.title) return res.status(400).json({ error: "MISSING_IDEA" });

  try {
    const groqRes = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: GAUNTLET_SYSTEM_PROMPT },
          { role: "user", content: `Idea: "${idea.title}". Pitch: ${idea.tagline}. Details: ${idea.description}. Run the Gauntlet on this.` },
        ],
        temperature: 0.8,
        max_tokens: 600,
        response_format: { type: "json_object" },
      }),
    });

    if (!groqRes.ok) {
      console.error("Groq error:", groqRes.status, await groqRes.text());
      return res.status(502).json({ error: "GROQ_ERROR" });
    }

    const data = await groqRes.json();
    const parsed = safeParse(data.choices?.[0]?.message?.content);

    return res.status(200).json({
      skepticAttack: parsed.skepticAttack ?? "",
      builderResponse: parsed.builderResponse ?? "",
      verdict: parsed.verdict ?? "BUILD A SMALLER VERSION FIRST",
      verdictReason: parsed.verdictReason ?? "",
      confidence: clamp(parsed.confidence),
      remaining: rateLimitResult.remaining,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
}
