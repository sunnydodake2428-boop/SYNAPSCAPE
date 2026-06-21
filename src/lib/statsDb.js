import { supabase } from "./supabaseClient";

export async function getStats() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ count: totalFused }, { count: totalSaved }, { data: gauntletRows }] = await Promise.all([
    supabase.from("fusion_history").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("ideas").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("ideas").select("gauntlet").eq("user_id", user.id).not("gauntlet", "is", null),
  ]);

  const verdicts = { "BUILD IT": 0, "BUILD A SMALLER VERSION FIRST": 0, "DON'T BUILD THIS": 0 };
  (gauntletRows ?? []).forEach((row) => {
    const v = row.gauntlet?.verdict;
    if (v && verdicts[v] !== undefined) verdicts[v] += 1;
  });

  const gauntletTotal = (gauntletRows ?? []).length;
  const survivalRate = gauntletTotal > 0
    ? Math.round(((verdicts["BUILD IT"] + verdicts["BUILD A SMALLER VERSION FIRST"]) / gauntletTotal) * 100)
    : null;

  return {
    totalFused: totalFused ?? 0,
    totalSaved: totalSaved ?? 0,
    gauntletTotal,
    survivalRate,
    verdicts,
  };
}