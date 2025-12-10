import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Mail, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { generatePDF } from "@/utils/pdfGenerator";

interface StepResultsProps {
  name: string;
  email: string;
  elfImage: string;
  elfTitle: string;
  elfDescription: string;
  score: number;
}

export const StepResults = ({
  name,
  email,
  elfImage,
  elfTitle,
  elfDescription,
  score,
}: StepResultsProps) => {
  const [isSendingBadge, setIsSendingBadge] = useState(false);
  const [badgeSent, setBadgeSent] = useState(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);

  const handleDownloadPDF = async () => {
    setIsDownloadingPDF(true);
    try {
      await generatePDF({
        name,
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
    if (!email) return;

    setIsSendingBadge(true);
    try {
      const response = await fetch(import.meta.env.VITE_OBF_BRIDGE_URL + "/award-badge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          elfTitle,
          elfDescription,
          score,
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
      toast.success("Osaamismerkki on lähetetty sähköpostiisi!");
    } catch (error) {
      console.error("Badge sending error:", error);
      toast.error(
        "Osaamismerkin lähetys epäonnistui. Pyydä ohjaajaa tarkistamaan sähköposti ja järjestelmä."
      );
    } finally {
      setIsSendingBadge(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-card-foreground mb-2">
          🎉 Onnittelut, {name}!
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
        </div>

        <div className="text-center max-w-md">
          <h3 className="text-2xl md:text-3xl font-display font-bold text-christmas-gold mb-2">
            {elfTitle}
          </h3>
          <p className="text-card-foreground font-body leading-relaxed">
            {elfDescription}
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Tonttupisteet: <span className="font-bold text-christmas-gold">{score}/10</span>
          </p>
        </div>
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
          📄 Lataa Joulun Osaaja -todistus (PDF)
        </Button>

        {email && !badgeSent && (
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
            📧 Lähetä osaamismerkki sähköpostiin
          </Button>
        )}

        {badgeSent && (
          <div className="flex items-center justify-center gap-2 p-4 bg-christmas-green/10 rounded-xl border border-christmas-green text-christmas-green">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-semibold">Osaamismerkki lähetetty!</span>
          </div>
        )}
      </div>

      <div className="text-center pt-6">
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
        >
          🎄 Aloita alusta
        </Button>
      </div>
    </div>
  );
};
