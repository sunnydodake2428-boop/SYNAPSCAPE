import { createClient } from "@supabase/supabase-js";

export async function checkUserRateLimit(req, bucket, limit) {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  if (!token) return { allowed: false, remaining: 0 };

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { allowed: false, remaining: 0 };

  const today = new Date().toISOString().slice(0, 10);
  const { data: existing } = await supabase
    .from("usage_counts")
    .select("count")
    .eq("user_id", user.id)
    .eq("bucket", bucket)
    .eq("usage_date", today)
    .maybeSingle();

  const current = existing?.count ?? 0;
  if (current >= limit) return { allowed: false, remaining: 0 };

  const next = current + 1;
  await supabase
    .from("usage_counts")
    .upsert({ user_id: user.id, bucket, usage_date: today, count: next }, { onConflict: "user_id,bucket,usage_date" });

  return { allowed: true, remaining: Math.max(0, limit - next) };
}