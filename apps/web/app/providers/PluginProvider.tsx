import * as React from "react";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  BackgroundImagePlugin,
  DEFAULT_BACKGROUND_CONFIG,
  type BackgroundImageConfig
} from "@kreozalabs/kei-plugin-background-image";
import {
  CustomFontPlugin,
  DEFAULT_FONT_CONFIG,
  type CustomFontConfig
} from "@kreozalabs/kei-plugin-custom-font";

interface PluginContextType {
  backgroundImage: {
    enabled: boolean;
    config: BackgroundImageConfig;
    activeUrl: string;
    updateConfig: (partial: Partial<BackgroundImageConfig>) => Promise<void>;
  };
  customFont: {
    enabled: boolean;
    config: CustomFontConfig;
    updateConfig: (partial: Partial<CustomFontConfig>) => Promise<void>;
  };
}

const PluginContext = createContext<PluginContextType>({
  backgroundImage: {
    enabled: true,
    config: DEFAULT_BACKGROUND_CONFIG,
    activeUrl: "",
    updateConfig: async () => {}
  },
  customFont: {
    enabled: true,
    config: DEFAULT_FONT_CONFIG,
    updateConfig: async () => {}
  }
});

const STORAGE_KEY_BG = "kei_plugin_background_image_config";
const STORAGE_KEY_FONT = "kei_plugin_custom_font_config";

export function PluginProvider({ children }: { children: React.ReactNode }) {
  // Background Image Plugin state
  const [bgPlugin] = useState(() => new BackgroundImagePlugin());
  const [bgConfig, setBgConfig] = useState<BackgroundImageConfig>(() => {
    if (typeof window === "undefined") return DEFAULT_BACKGROUND_CONFIG;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_BG);
      if (stored) {
        return { ...DEFAULT_BACKGROUND_CONFIG, ...JSON.parse(stored) };
      }
    } catch {
      // fallback
    }
    return DEFAULT_BACKGROUND_CONFIG;
  });
  const [activeUrl, setActiveUrl] = useState<string>("");

  // Custom Font Plugin state
  const [fontPlugin] = useState(() => new CustomFontPlugin());
  const [fontConfig, setFontConfig] = useState<CustomFontConfig>(() => {
    if (typeof window === "undefined") return DEFAULT_FONT_CONFIG;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_FONT);
      if (stored) {
        return { ...DEFAULT_FONT_CONFIG, ...JSON.parse(stored) };
      }
    } catch {
      // fallback
    }
    return DEFAULT_FONT_CONFIG;
  });

  // Sync background plugin instance
  useEffect(() => {
    bgPlugin.updateConfig(bgConfig);
    setActiveUrl(bgPlugin.getActiveImageUrl());
  }, [bgConfig, bgPlugin]);

  // Sync font plugin instance and DOM styling
  useEffect(() => {
    fontPlugin.updateConfig(fontConfig);
    if (typeof document !== "undefined") {
      fontPlugin.applyToDOM(document);
    }
  }, [fontConfig, fontPlugin]);

  const updateBgConfig = useCallback(
    async (partial: Partial<BackgroundImageConfig>) => {
      const updated = { ...bgConfig, ...partial };
      setBgConfig(updated);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY_BG, JSON.stringify(updated));
      }
      await bgPlugin.updateConfig(updated);
      setActiveUrl(bgPlugin.getActiveImageUrl());
    },
    [bgConfig, bgPlugin]
  );

  const updateFontConfig = useCallback(
    async (partial: Partial<CustomFontConfig>) => {
      const updated = { ...fontConfig, ...partial };
      setFontConfig(updated);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY_FONT, JSON.stringify(updated));
      }
      await fontPlugin.updateConfig(updated);
      if (typeof document !== "undefined") {
        fontPlugin.applyToDOM(document);
      }
    },
    [fontConfig, fontPlugin]
  );

  return (
    <PluginContext.Provider
      value={{
        backgroundImage: {
          enabled: bgConfig.enabled,
          config: bgConfig,
          activeUrl,
          updateConfig: updateBgConfig
        },
        customFont: {
          enabled: fontConfig.enabled,
          config: fontConfig,
          updateConfig: updateFontConfig
        }
      }}
    >
      {children}
    </PluginContext.Provider>
  );
}

export function usePlugins() {
  return useContext(PluginContext);
}

