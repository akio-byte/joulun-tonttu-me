import { Snowfall } from "@/components/Snowfall";
import { ChristmasWizard } from "@/components/ChristmasWizard";
import { SettingsModal } from "@/components/SettingsModal";
import { useSettings } from "@/hooks/useSettings";

const Index = () => {
  const { settings, saveSettings, isLoaded } = useSettings();

  if (!isLoaded) {
    return (
      <div className="min-h-screen christmas-gradient flex items-center justify-center">
        <div className="text-christmas-snow text-xl font-display animate-pulse">
          Ladataan...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen christmas-gradient relative overflow-hidden">
      <Snowfall />
      <SettingsModal settings={settings} onSave={saveSettings} />

      {/* Header */}
      <header className="relative z-20 pt-8 pb-4 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-christmas-snow drop-shadow-lg animate-fade-in">
          🎄 Joulun Osaaja
        </h1>
        <p
          className="text-lg md:text-xl text-christmas-snow/80 mt-2 font-body animate-fade-in"
          style={{ animationDelay: "0.2s" }}
        >
          AI Tonttukioski
        </p>
      </header>

      {/* Main Content */}
      <main className="relative z-20 flex items-center justify-center min-h-[calc(100vh-180px)]">
        <ChristmasWizard />
      </main>

      {/* Footer */}
      <footer className="relative z-20 py-4 text-center">
        <p className="text-sm text-christmas-snow/60 font-body">
          © 2024 Eduro • Joulun Osaaja -kioski
        </p>
      </footer>
    </div>
  );
};

export default Index;
