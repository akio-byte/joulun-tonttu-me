import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Mail, Loader2, CheckCircle2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { generatePDF } from "@/utils/pdfGenerator";

interface StepResultsProps {
  name: string;
  email: string;
  userWish: string;
  elfImage: string;
  elfTitle: string;
  elfDescription: string;
  mysticalPhrase: string;
  score: number;
  isObfConfigured: boolean;
  obfSettings: {
    clientId: string;
    clientSecret: string;
    badgeId: string;
  };
  onRestart: () => void;
}

export const StepResults = ({
  name,
  email,
  userWish,
  elfImage,
  elfTitle,
  elfDescription,
  mysticalPhrase,
  score,
  isObfConfigured,
  obfSettings,
  onRestart,
}: StepResultsProps) => {
  const [isSendingBadge, setIsSendingBadge] = useState(false);
  const [badgeSent, setBadgeSent] = useState(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);

  const handleDownloadPDF = async () => {
    setIsDownloadingPDF(true);
    try {
      await generatePDF({
        name,
        userWish,
        elfImage,
        elfTitle,
        elfDescription,
        score,
      });
      toast.success("Todistus ladattu!");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Todistuksen lataus epäonnistui. Kokeile uudelleen.");
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  const handleSendBadge = async () => {
    if (!email || !isObfConfigured) return;

    setIsSendingBadge(true);
    try {
      const bridgeUrl = import.meta.env.VITE_OBF_BRIDGE_URL;
      if (!bridgeUrl) {
        throw new Error("OBF bridge URL not configured");
      }

      const response = await fetch(`${bridgeUrl}/award-badge`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          badge_id: obfSettings.badgeId,
          recipient: { email },
          notify: true,
          client_id: obfSettings.clientId,
          client_secret: obfSettings.clientSecret,
        }),
      });

      if (!response.ok) {
        throw new Error(`Badge request failed with status ${response.status}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Badge sending failed");
      }

      setBadgeSent(true);
      toast.success("Osaamismerkki lähetetty ✅");
    } catch (error) {
      console.error("Badge sending error:", error);
      toast.error(
        "Osaamismerkin lähetys epäonnistui. Tarkista asetukset ja yritä uudelleen."
      );
    } finally {
      setIsSendingBadge(false);
    }
  };

  const showBadgeButton = email && isObfConfigured && !badgeSent;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-card-foreground mb-2">
          Hienoa, {name}! 🎉
        </h2>
        <p className="text-muted-foreground font-body">
          Tonttutaikasi on valmis!
        </p>
      </div>

      <div className="flex flex-col items-center">
        <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-2xl overflow-hidden border-4 border-christmas-gold shadow-glow mb-6">
          <img
            src={elfImage}
            alt="Tonttukuvasi"
            className="w-full h-full object-cover"
          />
          {/* Eduro/Joulun Osaaja watermark */}
          <div className="absolute bottom-2 right-2 bg-christmas-red/80 text-christmas-snow text-xs px-2 py-1 rounded font-semibold">
            Joulun Osaaja
          </div>
        </div>

        <div className="text-center max-w-md">
          <h3 className="text-2xl md:text-3xl font-display font-bold text-christmas-gold mb-2">
            {elfTitle}
          </h3>
          <p className="text-card-foreground font-body leading-relaxed">
            {elfDescription}
          </p>
        </div>

        {/* Mystical phrase box - wow element */}
        {mysticalPhrase && (
          <div className="mt-6 w-full max-w-md">
            <div className="bg-gradient-to-br from-christmas-gold/20 to-christmas-red/10 border-2 border-christmas-gold/50 rounded-2xl p-5 text-center shadow-lg">
              <p className="text-sm text-christmas-gold mb-1 font-semibold">
                ✨ Joulutaian viesti ✨
              </p>
              <p className="text-card-foreground font-display italic text-lg leading-relaxed">
                "{mysticalPhrase}"
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3 pt-4">
        <Button
          variant="gold"
          size="xl"
          className="w-full"
          onClick={handleDownloadPDF}
          disabled={isDownloadingPDF}
        >
          {isDownloadingPDF ? (
            <Loader2 className="mr-2 animate-spin" />
          ) : (
            <FileText className="mr-2" />
          )}
          📄 Tulosta Joulun Osaaja -todistus
        </Button>

        {showBadgeButton && (
          <Button
            variant="green"
            size="xl"
            className="w-full"
            onClick={handleSendBadge}
            disabled={isSendingBadge}
          >
            {isSendingBadge ? (
              <Loader2 className="mr-2 animate-spin" />
            ) : (
              <Mail className="mr-2" />
            )}
            📧 Lähetä digitaalinen osaamismerkki
          </Button>
        )}

        {badgeSent && (
          <div className="flex items-center justify-center gap-2 p-4 bg-christmas-green/10 rounded-xl border border-christmas-green text-christmas-green">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-semibold">Osaamismerkki lähetetty ✅</span>
          </div>
        )}
      </div>

      <div className="text-center pt-6">
        <Button variant="outline" onClick={onRestart}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Aloita alusta
        </Button>
      </div>
    </div>
  );
};
