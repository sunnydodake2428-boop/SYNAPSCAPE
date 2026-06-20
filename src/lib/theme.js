const STORAGE_KEY = "synapsescape_theme_v1";

export function getTheme() {
  return localStorage.getItem(STORAGE_KEY) ?? "dark";
}

export function setTheme(theme) {
  localStorage.setItem(STORAGE_KEY, theme);
  document.documentElement.setAttribute("data-theme", theme);
}

export function applyStoredTheme() {
  const theme = getTheme();
  document.documentElement.setAttribute("data-theme", theme);
  return theme;
}