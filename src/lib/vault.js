const STORAGE_KEY = "synapsescape_vault_v1";

export function getVault() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveToVault(idea) {
  const vault = getVault();
  const updated = [idea, ...vault];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function removeFromVault(id) {
  const vault = getVault().filter((i) => i.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(vault));
  return vault;
}
