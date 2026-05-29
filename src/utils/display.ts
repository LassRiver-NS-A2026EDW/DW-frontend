const LANGUAGE_LABELS: Record<string, string> = {
  espanol: "Español",
};

export function formatLanguage(language: string) {
  return LANGUAGE_LABELS[language.trim().toLowerCase()] ?? language;
}
