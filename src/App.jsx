import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Sparkles, Archive } from "lucide-react";
import FusionInput from "./components/FusionInput";
import IdeaCard from "./components/IdeaCard";
import Vault from "./components/Vault";
import KeywordSuggester from "./components/KeywordSuggester";
import UsageBadge from "./components/UsageBadge";
import { fuseIdeas, suggestKeywords, remixKeyword, runGauntlet } from "./lib/groqClient";
import { getVault, saveToVault, removeFromVault } from "./lib/vault";
import "./App.css";

export default function App() {
  const [view, setView] = useState("fuse");
  const [wordA, setWordA] = useState("");
  const [wordB, setWordB] = useState("");
  const [currentIdea, setCurrentIdea] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRemixing, setIsRemixing] = useState(null);
  const [error, setError] = useState(null);
  const [vault, setVaultState] = useState([]);
  const [keywordSuggestions, setKeywordSuggestions] = useState([]);
  const [keywordsLoading, setKeywordsLoading] = useState(false);
  const [usedKeywords, setUsedKeywords] = useState([]);
  const [gauntletResult, setGauntletResult] = useState(null);
  const [gauntletLoading, setGauntletLoading] = useState(false);
  const [remaining, setRemaining] = useState(null);

  useEffect(() => {
    setVaultState(getVault());
  }, []);

  function handleApiError(err) {
    if (err.message === "DAILY_LIMIT_REACHED") {
      setRemaining(0);
      setError("You've hit today's free limit — come back tomorrow for more fusions.");
    } else {
      setError("Something went wrong. Try again.");
    }
  }

  async function handleFuse(a, b, lineage = {}) {
    setIsLoading(true);
    setError(null);
    setCurrentIdea(null);
    setGauntletResult(null);

    try {
      const { idea, remaining: rem } = await fuseIdeas(a, b, lineage);
      setCurrentIdea(idea);
      setRemaining(rem);
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsLoading(false);
      setIsRemixing(null);
    }
  }

  async function handleRequestKeywords() {
    setKeywordsLoading(true);
    try {
      const seed = wordA.trim() || wordB.trim() || null;
      const { suggestions, remaining: rem } = await suggestKeywords(seed, usedKeywords);
      setKeywordSuggestions(suggestions);
      setUsedKeywords((prev) => [...prev, ...suggestions.map((s) => s.word)]);
      setRemaining(rem);
    } catch (err) {
      handleApiError(err);
    } finally {
      setKeywordsLoading(false);
    }
  }

  function handlePickKeyword(word) {
    if (!wordA.trim()) setWordA(word);
    else setWordB(word);
  }

  async function handleRemix(idea, side) {
    setIsRemixing(side);
    setError(null);
    try {
      const fixed = side === "A" ? idea.wordA : idea.wordB;
      const replacing = side === "A" ? idea.wordB : idea.wordA;
      const { word: newWord, remaining: rem } = await remixKeyword(fixed, replacing);
      setRemaining(rem);

      const nextA = side === "A" ? fixed : newWord;
      const nextB = side === "A" ? newWord : fixed;
      setWordA(nextA);
      setWordB(nextB);

      await handleFuse(nextA, nextB, { parentId: idea.id, generation: (idea.generation ?? 0) + 1 });
    } catch (err) {
      handleApiError(err);
      setIsRemixing(null);
    }
  }

  async function handleRunGauntlet(idea) {
    setGauntletLoading(true);
    try {
      const { gauntlet, remaining: rem } = await runGauntlet(idea);
      setGauntletResult(gauntlet);
      setRemaining(rem);
    } catch (err) {
      handleApiError(err);
    } finally {
      setGauntletLoading(false);
    }
  }

  function handleSave(idea) {
    const ideaWithGauntlet = gauntletResult ? { ...idea, gauntlet: gauntletResult } : idea;
    setVaultState(saveToVault(ideaWithGauntlet));
    setCurrentIdea(null);
    setGauntletResult(null);
  }

  function handleDiscard() {
    setCurrentIdea(null);
    setGauntletResult(null);
  }

  function handleRemove(id) { setVaultState(removeFromVault(id)); }

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <div className="brand-mark"><Sparkles size={16} /></div>
          <span>SynapseScape</span>
        </div>
        <nav className="app-nav">
          <button className={view === "fuse" ? "active" : ""} onClick={() => setView("fuse")}>Fuse</button>
          <button className={view === "vault" ? "active" : ""} onClick={() => setView("vault")}>
            <Archive size={14} /> Vault {vault.length > 0 && <span className="vault-count">{vault.length}</span>}
          </button>
        </nav>
      </header>

      <main className="app-main">
        {view === "fuse" ? (
          <div className="fuse-view">
            <div className="fuse-intro">
              <h1>Collide two ideas. See what survives.</h1>
              <p>Two concepts go in. The engine generates multiple fusions internally, rejects the weak ones, and shows you only the strongest — then you can put it through the Gauntlet before you trust it.</p>
            </div>

            <UsageBadge remaining={remaining} />

            <FusionInput
              wordA={wordA}
              wordB={wordB}
              onWordAChange={setWordA}
              onWordBChange={setWordB}
              onFuse={(a, b) => handleFuse(a, b)}
              isLoading={isLoading}
              error={error}
            />

            <KeywordSuggester
              suggestions={keywordSuggestions}
              isLoading={keywordsLoading}
              onRequestSuggestions={handleRequestKeywords}
              onPick={handlePickKeyword}
            />

            <div className="card-stage">
              <AnimatePresence>
                {currentIdea && (
                  <IdeaCard
                    idea={currentIdea}
                    onSave={handleSave}
                    onDiscard={handleDiscard}
                    onRemix={(side) => handleRemix(currentIdea, side)}
                    isRemixing={isRemixing}
                    onRunGauntlet={handleRunGauntlet}
                    gauntletResult={gauntletResult}
                    gauntletLoading={gauntletLoading}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <div className="vault-view">
            <h1>Idea Vault</h1>
            <Vault ideas={vault} onRemove={handleRemove} />
          </div>
        )}
      </main>
    </div>
  );
}