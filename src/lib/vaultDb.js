import { supabase } from "./supabaseClient";

function toDbRow(idea, userId) {
  return {
    id: idea.id,
    user_id: userId,
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
    rejected_angles: idea.rejectedAngles,
    gauntlet: idea.gauntlet,
    parent_id: idea.parentId,
    generation: idea.generation,
  };
}

function fromDbRow(row) {
  return {
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
    rejectedAngles: row.rejected_angles ?? [],
    gauntlet: row.gauntlet ?? null,
    parentId: row.parent_id,
    generation: row.generation ?? 0,
    createdAt: new Date(row.created_at).getTime(),
  };
}

export async function getVault() {
  const { data, error } = await supabase.from("ideas").select("*").order("created_at", { ascending: false });
  if (error) { console.error(error); return []; }
  return (data ?? []).map(fromDbRow);
}

export async function saveToVault(idea) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return getVault();
  const { error } = await supabase.from("ideas").insert(toDbRow(idea, user.id));
  if (error) console.error(error);
  return getVault();
}

export async function removeFromVault(id) {
  const { error } = await supabase.from("ideas").delete().eq("id", id);
  if (error) console.error(error);
  return getVault();
}