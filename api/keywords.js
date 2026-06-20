import { checkUserRateLimit } from "./_supabase.js";
import { safeParse } from "./_rateLimit.js";

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

const PARTNER_SYSTEM_PROMPT = `You generate concept suggestions for an idea-fusion app's second slot. The user has already locked in a first concept. Your job is to suggest 8 DIFFERENT concepts that would create genuinely interesting, surprising, high-potential fusions when combined with their first pick — not synonyms, not the same category, not obvious pairings.

Favor pairings with real creative tension: a natural concept with a technical one, an ancient concept with a futuristic one, something tactile with something abstract.

Respond with ONLY valid JSON, no markdown, no commentary:
{
  "suggestions": [
    {"word": "concept", "category": "tech", "whyGood": "very short reason, max 6 words"}
  ]
}
Generate exactly 8 suggestions.`;

const SPARK_PAIRS = [
  { wordA: "mycelium network", wordB: "supply chain logistics" },
  { wordA: "gregorian chant", wordB: "noise-cancelling headphones" },
  { wordA: "tide pools", wordB: "venture capital" },
  { wordA: "origami", wordB: "emergency shelters" },
  { wordA: "beekeeping", wordB: "urban surveillance" },
  { wordA: "silk road", wordB: "API marketplaces" },
  { wordA: "glacier melt", wordB: "insurance actuarial models" },
  { wordA: "street food carts", wordB: "carbon credits" },
  { wordA: "lighthouse keepers", wordB: "remote work culture" },
  { wordA: "coral bleaching", wordB: "early warning systems" },
  { wordA: "vinyl records", wordB: "subscription fatigue" },
  { wordA: "monsoon patterns", wordB: "crop insurance" },
  { wordA: "graffiti", wordB: "civic engagement apps" },
  { wordA: "fermentation", wordB: "biodegradable packaging" },
  { wordA: "migratory birds", wordB: "flight booking algorithms" },
];

function getDailySpark() {
  const today = new Date();
  const dayIndex = Math.floor(today.getTime() / 86400000);
  return SPARK_PAIRS[dayIndex % SPARK_PAIRS.length];
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "METHOD_NOT_ALLOWED" });

  const { mode, seedWord, usedWords = [] } = req.body ?? {};

  // Daily spark doesn't call Groq at all — free, instant, same for everyone today
  if (mode === "spark") {
    return res.status(200).json({ spark: getDailySpark() });
  }

  const rateLimitResult = await checkUserRateLimit(req, "keyword", 50);
  if (!rateLimitResult.allowed) {
    return res.status(429).json({ error: "DAILY_LIMIT_REACHED", remaining: 0 });
  }

  const isPartnerMode = mode === "partner" && seedWord;
  const systemPrompt = isPartnerMode ? PARTNER_SYSTEM_PROMPT : KEYWORD_SYSTEM_PROMPT;
  const usedList = usedWords.length > 0 ? usedWords.join(", ") : "none yet";
  const userMsg = isPartnerMode
    ? `First concept already chosen: "${seedWord}". Already shown as partner suggestions (do not repeat): ${usedList}. Suggest 8 NEW concepts that would fuse well with "${seedWord}".`
    : `Already used words (do not repeat or closely paraphrase any of these): ${usedList}.\nSuggest 8 diverse, unexpected NEW concepts for idea fusion.`;

  try {
    const groqRes = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMsg },
        ],
        temperature: 1.15,
        max_tokens: 500,
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