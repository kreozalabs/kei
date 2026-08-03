export function isMacPlatform(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Mac|iPod|iPhone|iPad/i.test(navigator.platform || navigator.userAgent || "");
}

export function formatKeyForPlatform(key: string): string {
  const isMac = isMacPlatform();
  if (key === "Mod" || key === "⌘" || key === "Ctrl") {
    return isMac ? "⌘" : "Ctrl";
  }
  if (key === "Alt" || key === "⌥ Alt" || key === "⌥") {
    return isMac ? "⌥ Alt" : "Alt";
  }
  return key;
}

const MODIFIER_SYNONYMS: Record<string, string[]> = {
  mod: ["mod", "ctrl", "control", "ctl", "cmd", "command", "meta", "⌘"],
  ctrl: ["ctrl", "control", "ctl", "mod", "cmd", "command", "meta", "⌘"],
  control: ["ctrl", "control", "ctl", "mod", "cmd", "command", "meta", "⌘"],
  ctl: ["ctrl", "control", "ctl", "mod", "cmd", "command", "meta", "⌘"],
  cmd: ["cmd", "command", "meta", "super", "win", "⌘", "mod", "ctrl", "control"],
  command: ["cmd", "command", "meta", "super", "win", "⌘", "mod", "ctrl", "control"],
  meta: ["cmd", "command", "meta", "super", "win", "⌘", "mod", "ctrl", "control"],
  "⌘": ["cmd", "command", "meta", "super", "win", "⌘", "mod", "ctrl", "control"],
  alt: ["alt", "opt", "option", "⌥"],
  option: ["alt", "opt", "option", "⌥"],
  opt: ["alt", "opt", "option", "⌥"],
  "⌥": ["alt", "opt", "option", "⌥"],
  shift: ["shift"],
};

export function matchCommandShortcut(
  command: { description: string; category: string; shortcuts: string[][] },
  searchQuery: string
): boolean {
  const query = searchQuery.trim().toLowerCase();
  if (!query) return true;

  // 1. Match description or category directly
  if (
    command.description.toLowerCase().includes(query) ||
    command.category.toLowerCase().includes(query)
  ) {
    return true;
  }

  // 2. Check shortcuts with VS Code style key matching
  const queryTokens = query.split(/[\s+\->]+/).filter(Boolean);

  for (const shortcutKeys of command.shortcuts) {
    // Check formatted string representations
    const rawJoinedWithPlus = shortcutKeys.join("+").toLowerCase();
    const rawJoinedWithSpace = shortcutKeys.join(" ").toLowerCase();
    const platformFormatted = shortcutKeys.map(formatKeyForPlatform);
    const platformJoinedWithPlus = platformFormatted.join("+").toLowerCase();
    const platformJoinedWithSpace = platformFormatted.join(" ").toLowerCase();
    const platformJoinedDirect = platformFormatted.join("").toLowerCase();

    if (
      rawJoinedWithPlus.includes(query) ||
      rawJoinedWithSpace.includes(query) ||
      platformJoinedWithPlus.includes(query) ||
      platformJoinedWithSpace.includes(query) ||
      platformJoinedDirect.includes(query)
    ) {
      return true;
    }

    // Filter out sequence separators ('>') for token matching
    const meaningfulKeys = shortcutKeys.filter((k) => k !== ">");

    if (queryTokens.length > 0) {
      const allTokensMatch = queryTokens.every((token) => {
        return meaningfulKeys.some((key) => {
          const lowerKey = key.toLowerCase();
          if (lowerKey === token || lowerKey.includes(token)) return true;

          const synonyms = MODIFIER_SYNONYMS[lowerKey];
          if (synonyms && synonyms.includes(token)) return true;

          const platformKey = formatKeyForPlatform(key).toLowerCase();
          if (platformKey === token || platformKey.includes(token)) return true;
          const platformSynonyms = MODIFIER_SYNONYMS[platformKey];
          if (platformSynonyms && platformSynonyms.includes(token)) return true;

          return false;
        });
      });

      if (allTokensMatch) return true;
    }
  }

  return false;
}
