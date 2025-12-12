import { useState, useEffect, useCallback } from "react";

export interface AppSettings {
  obfClientId: string;
  obfClientSecret: string;
  obfBadgeId: string;
  aiApiKey: string;
  enableObfIssuing: boolean;
}

const SETTINGS_KEY = "joulun-osaaja-settings";

const defaultSettings: AppSettings = {
  obfClientId: "",
  obfClientSecret: "",
  obfBadgeId: "",
  aiApiKey: "",
  enableObfIssuing: false,
};

export const useSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings({ ...defaultSettings, ...parsed });
      }
    } catch (e) {
      console.error("Failed to load settings:", e);
    }
    setIsLoaded(true);
  }, []);

  const saveSettings = useCallback((newSettings: AppSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
    } catch (e) {
      console.error("Failed to save settings:", e);
    }
  }, []);

  const isObfConfigured = settings.enableObfIssuing && 
    settings.obfClientId.trim() !== "" && 
    settings.obfClientSecret.trim() !== "" && 
    settings.obfBadgeId.trim() !== "";

  const isAiConfigured = settings.aiApiKey.trim() !== "";

  return {
    settings,
    saveSettings,
    isLoaded,
    isObfConfigured,
    isAiConfigured,
  };
};
