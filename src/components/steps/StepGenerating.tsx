import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const loadingMessages = [
  "🎄 Luodaan tonttutaikaa...",
  "🧝‍♂️ Etsitään sopivaa tonttulakkia...",
  "✨ Ripotellaan tonttumagiaa...",
  "🎁 Kääritään lahjapakettia...",
  "❄️ Viimeistellään lumiefekti...",
];

export const StepGenerating = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full bg-christmas-gold/20 flex items-center justify-center animate-pulse-glow">
          <Loader2 className="w-12 h-12 text-christmas-gold animate-spin" />
        </div>
        <div className="absolute inset-0 rounded-full animate-shimmer" />
      </div>
      
      <h2 className="text-2xl md:text-3xl font-display font-bold text-card-foreground mb-4 text-center">
        Tonttutaika käynnissä!
      </h2>
      
      <p className="text-lg text-muted-foreground font-body text-center animate-fade-in" key={messageIndex}>
        {loadingMessages[messageIndex]}
      </p>
    </div>
  );
};
