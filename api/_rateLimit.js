// /api/_rateLimit.js — shared helper, not a route itself (underscore prefix = Vercel ignores it as an endpoint)

const DAILY_LIMIT = 8;

export async function checkRateLimit(req) {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    return { allowed: true, remaining: DAILY_LIMIT };
  }

  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ??
    req.socket?.remoteAddress ??
    "unknown";
  const today = new Date().toISOString().slice(0, 10);
  const key = `ratelimit:${ip}:${today}`;

  try {
    const incrRes = await fetch(`${url}/incr/${key}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const { result: count } = await incrRes.json();

    if (count === 1) {
      await fetch(`${url}/expire/${key}/86400`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }

    return {
      allowed: count <= DAILY_LIMIT,
      remaining: Math.max(0, DAILY_LIMIT - count),
    };
  } catch (err) {
    console.error("Rate limit check failed, allowing request:", err);
    return { allowed: true, remaining: DAILY_LIMIT };
  }
}

export function safeParse(raw) {
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    try {
      return JSON.parse(raw.replace(/```json|```/g, "").trim());
    } catch {
      return {};
    }
  }
}

export function clamp(n) {
  const num = Number(n);
  if (Number.isNaN(num)) return 50;
  return Math.min(100, Math.max(1, Math.round(num)));
}
