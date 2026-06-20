import { supabase } from "./supabaseClient";

export async function logFusion(idea) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("fusion_history").insert({
    user_id: user.id,
    word_a: idea.wordA,
    word_b: idea.wordB,
    title: idea.title,
    tagline: idea.tagline,
    description: idea.description,
    feasibility: idea.feasibility,
    impact: idea.impact,
    novelty: idea.novelty,
    prototype_steps: idea.prototypeSteps,
    tags: idea.tags,
  });
}

export async function getHistory() {
  const { data, error } = await supabase
    .from("fusion_history")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) { console.error(error); return []; }
  return (data ?? []).map((row) => ({
    id: row.id,
    wordA: row.word_a,
    wordB: row.word_b,
    title: row.title,
    tagline: row.tagline,
    description: row.description,
    feasibility: row.feasibility,
    impact: row.impact,
    novelty: row.novelty,
    prototypeSteps: row.prototype_steps ?? [],
    tags: row.tags ?? [],
    createdAt: new Date(row.created_at).getTime(),
  }));
}