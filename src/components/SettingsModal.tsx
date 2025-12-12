import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Settings, Save, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { AppSettings } from "@/hooks/useSettings";

interface SettingsModalProps {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
}

export const SettingsModal = ({ settings, onSave }: SettingsModalProps) => {
  const [open, setOpen] = useState(false);
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [showSecrets, setShowSecrets] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = () => {
    onSave(localSettings);
    toast.success("Asetukset tallennettu!");
    setOpen(false);
  };

  const updateField = (field: keyof AppSettings, value: string | boolean) => {
    setLocalSettings((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 right-4 z-50 bg-card/80 hover:bg-card text-card-foreground shadow-lg"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-card-foreground">
            ⚙️ Asetukset
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* AI API Key */}
          <div className="space-y-2">
            <Label htmlFor="aiApiKey" className="text-card-foreground font-semibold">
              Generative AI API-avain
            </Label>
            <p className="text-xs text-muted-foreground">
              Google Gemini tai muu AI API-avain taika-ominaisuuksiin
            </p>
            <div className="relative">
              <Input
                id="aiApiKey"
                type={showSecrets ? "text" : "password"}
                placeholder="API-avain..."
                value={localSettings.aiApiKey}
                onChange={(e) => updateField("aiApiKey", e.target.value)}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={() => setShowSecrets(!showSecrets)}
              >
                {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <hr className="border-muted" />

          {/* OBF Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold text-card-foreground">OpenBadgeFactory (OBF)</h3>

            <div className="space-y-2">
              <Label htmlFor="obfClientId" className="text-card-foreground">
                OBF Client ID
              </Label>
              <Input
                id="obfClientId"
                type={showSecrets ? "text" : "password"}
                placeholder="Client ID..."
                value={localSettings.obfClientId}
                onChange={(e) => updateField("obfClientId", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="obfClientSecret" className="text-card-foreground">
                OBF Client Secret
              </Label>
              <Input
                id="obfClientSecret"
                type={showSecrets ? "text" : "password"}
                placeholder="Client Secret..."
                value={localSettings.obfClientSecret}
                onChange={(e) => updateField("obfClientSecret", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="obfBadgeId" className="text-card-foreground">
                Badge ID
              </Label>
              <Input
                id="obfBadgeId"
                type="text"
                placeholder="Jouluosaaja badge ID..."
                value={localSettings.obfBadgeId}
                onChange={(e) => updateField("obfBadgeId", e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="enableObf"
                checked={localSettings.enableObfIssuing}
                onCheckedChange={(checked) => updateField("enableObfIssuing", !!checked)}
              />
              <Label htmlFor="enableObf" className="text-card-foreground cursor-pointer">
                Ota OBF-merkin lähetys käyttöön
              </Label>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="gold" onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Tallenna
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
