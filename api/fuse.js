import { checkRateLimit, safeParse, clamp } from "./_rateLimit.js";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

const FUSION_SYSTEM_PROMPT = `You are a ruthless startup mentor and product strategist. You fuse two concepts into a project idea that a sharp founder would actually take seriously.

You will generate 3 DIFFERENT candidate fusions, then pick the single strongest one.

A candidate is WEAK and must be rejected if it:
- Could apply to almost any two random words (too generic)
- Has no real mechanism — just says "an app that combines X and Y" with no specifics
- Has no identifiable target user who would pay or care
- Is something that already obviously exists with a different name

A candidate is STRONG if it:
- Names a specific mechanism (how it actually technically works)
- Names a specific user/customer and why they'd want it
- Has a believable monetization or adoption path
- Uses BOTH concepts in a way that is structural to the idea, not decorative

Respond with ONLY valid JSON, no markdown, no commentary. Shape exactly:
{
  "title": "Short punchy name for the winning idea (max 8 words)",
  "tagline": "One sentence pitch a founder would say out loud (max 20 words)",
  "description": "3-4 sentences: the specific mechanism, the specific user, and why now (max 90 words)",
  "feasibility": <integer 1-100>,
  "impact": <integer 1-100>,
  "novelty": <integer 1-100>,
  "prototypeSteps": ["step 1", "step 2", "step 3", "step 4"],
  "tags": ["tag1", "tag2", "tag3"],
  "rejectedAngles": ["one-line summary of a weaker candidate you rejected and why"]
}
Score honestly. If the fusion is genuinely hard to make feasible, feasibility should be low (below 40) — do not inflate scores to look impressive.`;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "METHOD_NOT_ALLOWED" });

  const rateLimitResult = await checkRateLimit(req);
  if (!rateLimitResult.allowed) {
    return res.status(429).json({ error: "DAILY_LIMIT_REACHED", remaining: 0 });
  }

  const { wordA, wordB } = req.body ?? {};
  if (!wordA || !wordB) return res.status(400).json({ error: "MISSING_WORDS" });

  try {
    const groqRes = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: FUSION_SYSTEM_PROMPT },
          { role: "user", content: `Concept A: "${wordA}". Concept B: "${wordB}". Internally generate 3 distinct candidate fusions, reject the weak ones, and output only your strongest pick in the required JSON shape.` },
        ],
        temperature: 0.85,
        max_tokens: 900,
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
      title: parsed.title ?? `${wordA} × ${wordB}`,
      tagline: parsed.tagline ?? "",
      description: parsed.description ?? "",
      feasibility: clamp(parsed.feasibility),
      impact: clamp(parsed.impact),
      novelty: clamp(parsed.novelty),
      prototypeSteps: parsed.prototypeSteps ?? [],
      tags: parsed.tags ?? [],
      rejectedAngles: parsed.rejectedAngles ?? [],
      remaining: rateLimitResult.remaining,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
}
