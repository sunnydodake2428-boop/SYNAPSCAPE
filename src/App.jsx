import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { applyStoredTheme, setTheme } from "./lib/theme";
import FusionInput from "./components/FusionInput";
import IdeaCard from "./components/IdeaCard";
import Vault from "./components/Vault";
import KeywordSuggester from "./components/KeywordSuggester";
import UsageBadge from "./components/UsageBadge";
import DailySpark from "./components/DailySpark";
import { fuseIdeas, suggestKeywords, suggestPartnerKeywords, remixKeyword, runGauntlet } from "./lib/groqClient";
import { getVault, saveToVault, removeFromVault } from "./lib/vaultDb";
import "./App.css";
import SettingsModal from "./components/SettingsModal";
import { Sparkles, Archive, Settings } from "lucide-react";
import Login from "./components/Login";
import { supabase } from "./lib/supabaseClient";

import { History } from "lucide-react";
import HistoryDrawer from "./components/HistoryDrawer";
import { logFusion, getHistory } from "./lib/historyDb";

export default function App() {

  const [theme, setThemeState] = useState("dark");
  
  const [showHistory, setShowHistory] = useState(false);
const [history, setHistory] = useState([]);

const [session, setSession] = useState(undefined);
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
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
  const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
    setSession(session);
  });
  return () => listener.subscription.unsubscribe();
}, []);

useEffect(() => {
  setThemeState(applyStoredTheme());
}, []);

function handleToggleTheme() {
  const next = theme === "dark" ? "light" : "dark";
  setTheme(next);
  setThemeState(next);
}

function handleLogout() { supabase.auth.signOut(); }

  useEffect(() => {
    if (session) {
      getVault().then(setVaultState);
    }
  }, [session]);

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
      logFusion(idea);

    } catch (err) {
      handleApiError(err);
    } finally {
      setIsLoading(false);
      setIsRemixing(null);
    }
  }

  async function handleOpenHistory() {
  setShowHistory(true);
  const data = await getHistory();
  setHistory(data);
}

function handleSelectHistory(item) {
  setWordA(item.wordA);
  setWordB(item.wordB);
  setCurrentIdea(item);
  setShowHistory(false);
}


  async function handleRequestInitial() {
    setKeywordsLoading(true);
    try {
      const { suggestions, remaining: rem } = await suggestKeywords(usedKeywords);
      setKeywordSuggestions(suggestions);
      setUsedKeywords((prev) => [...prev, ...suggestions.map((s) => s.word)]);
      
    } catch (err) {
      handleApiError(err);
    } finally {
      setKeywordsLoading(false);
    }
  }

  async function handleRequestPartner(seedWord) {
    setKeywordsLoading(true);
    try {
      const { suggestions, remaining: rem } = await suggestPartnerKeywords(seedWord, usedKeywords);
      setKeywordSuggestions(suggestions);
      setUsedKeywords((prev) => [...prev, ...suggestions.map((s) => s.word)]);
      
    } catch (err) {
      handleApiError(err);
    } finally {
      setKeywordsLoading(false);
    }
  }

  function handlePickKeyword(word) {
    if (!wordA.trim()) {
      setWordA(word);
      setKeywordSuggestions([]);
    } else {
      setWordB(word);
      setKeywordSuggestions([]);
    }
  }

  function handleUseSpark(a, b) {
    setWordA(a);
    setWordB(b);
    setKeywordSuggestions([]);
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

  async function handleSave(idea) {
    const ideaWithGauntlet = gauntletResult ? { ...idea, gauntlet: gauntletResult } : idea;
    const updated = await saveToVault(ideaWithGauntlet);
    setVaultState(updated);
    setCurrentIdea(null);
    setGauntletResult(null);
  }

  function handleDiscard() {
    setCurrentIdea(null);
    setGauntletResult(null);
  }

  async function handleRemove(id) {
    const updated = await removeFromVault(id);
    setVaultState(updated);
  }
if (session === undefined) {
    return <div className="app-loading" />;
  }

  if (session === null) {
    return <Login />;
  }

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
  <button className="theme-toggle" onClick={handleToggleTheme} title="Toggle theme">
  {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
</button>

  <button className="settings-btn" onClick={() => setShowSettings(true)} title="Settings">
  <Settings size={14} />
</button>
<button className="settings-btn" onClick={handleOpenHistory} title="History">
  <History size={16} />
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

            <div className="top-row">
              <UsageBadge remaining={remaining} />
              <DailySpark onUse={handleUseSpark} />
            </div>

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
              onRequestInitial={handleRequestInitial}
              onRequestPartner={handleRequestPartner}
              onPick={handlePickKeyword}
              wordA={wordA}
              wordB={wordB}
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

      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          onLogout={() => { handleLogout(); setShowSettings(false); }}
          
        />
      )}
      <HistoryDrawer
  open={showHistory}
  onClose={() => setShowHistory(false)}
  history={history}
  onSelect={handleSelectHistory}
/>

    </div>
  );
}