async function callApi(endpoint, body) {
  const res = await fetch(`/api/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (res.status === 429) {
    const err = new Error("DAILY_LIMIT_REACHED");
    err.remaining = 0;
    throw err;
  }
  if (!res.ok) {
    throw new Error("SERVER_ERROR");
  }

  return res.json();
}

export async function fuseIdeas(wordA, wordB, lineage = {}) {
  const result = await callApi("fuse", { wordA, wordB });
  return {
    idea: {
      id: crypto.randomUUID(),
      wordA,
      wordB,
      title: result.title,
      tagline: result.tagline,
      description: result.description,
      feasibility: result.feasibility,
      impact: result.impact,
      novelty: result.novelty,
      prototypeSteps: result.prototypeSteps,
      tags: result.tags,
      rejectedAngles: result.rejectedAngles,
      createdAt: Date.now(),
      parentId: lineage.parentId ?? null,
      generation: lineage.generation ?? 0,
      gauntlet: null,
    },
    remaining: result.remaining,
  };
}

export async function runGauntlet(idea) {
  const result = await callApi("gauntlet", { idea });
  return {
    gauntlet: {
      skepticAttack: result.skepticAttack,
      builderResponse: result.builderResponse,
      verdict: result.verdict,
      verdictReason: result.verdictReason,
      confidence: result.confidence,
    },
    remaining: result.remaining,
  };
}

export async function suggestKeywords(usedWords = []) {
  const result = await callApi("keywords", { mode: "initial", usedWords });
  return { suggestions: result.suggestions ?? [], remaining: result.remaining };
}

export async function suggestPartnerKeywords(seedWord, usedWords = []) {
  const result = await callApi("keywords", { mode: "partner", seedWord, usedWords });
  return { suggestions: result.suggestions ?? [], remaining: result.remaining };
}

export async function getDailySpark() {
  const result = await callApi("keywords", { mode: "spark" });
  return result.spark;
}

export async function remixKeyword(fixedWord, replacingWord) {
  const result = await callApi("remix", { fixedWord, replacingWord });
  return { word: result.word, remaining: result.remaining };
}