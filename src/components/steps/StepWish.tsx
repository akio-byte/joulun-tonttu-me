import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, ArrowLeft } from "lucide-react";

interface StepWishProps {
  onNext: (wish: string) => void;
  onBack: () => void;
}

const MAX_CHARS = 160;

export const StepWish = ({ onNext, onBack }: StepWishProps) => {
  const [wish, setWish] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_CHARS) {
      setWish(value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(wish.trim());
  };

  const remainingChars = MAX_CHARS - wish.length;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-card-foreground mb-2">
          🎁 Pieni joululupaus
        </h2>
        <p className="text-muted-foreground font-body">
          Kerro toiveesi joulutaikalle
        </p>
      </div>

      <div className="bg-christmas-cream rounded-2xl p-6 border border-muted">
        <p className="text-lg text-card-foreground font-semibold mb-4 text-center">
          Jos joulutaika toteuttaisi yhden toiveesi, mikä se olisi?
        </p>
        <p className="text-sm text-muted-foreground mb-4 text-center">
          (1–2 asiaa riittää)
        </p>

        <Textarea
          placeholder="Kirjoita toiveesi tähän..."
          value={wish}
          onChange={handleChange}
          className="min-h-[120px] text-lg border-2 border-muted focus:border-christmas-gold transition-colors resize-none"
        />

        <div className="flex justify-end mt-2">
          <span
            className={`text-sm font-medium ${
              remainingChars < 20
                ? "text-christmas-red"
                : "text-muted-foreground"
            }`}
          >
            {remainingChars} / {MAX_CHARS}
          </span>
        </div>
      </div>

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={onBack}
          className="flex-1"
        >
          <ArrowLeft className="mr-2" />
          Takaisin
        </Button>
        <Button type="submit" variant="gold" size="lg" className="flex-1">
          Jatka kameraan
          <ArrowRight className="ml-2" />
        </Button>
      </div>
    </form>
  );
};
