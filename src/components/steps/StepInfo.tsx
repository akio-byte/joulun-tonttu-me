import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight } from "lucide-react";

interface StepInfoProps {
  onNext: (data: { name: string; email: string; giftWishes: string }) => void;
}

export const StepInfo = ({ onNext }: StepInfoProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [giftWishes, setGiftWishes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onNext({
        name: name.trim(),
        email: email.trim(),
        giftWishes: giftWishes.trim()
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-card-foreground mb-2">
          🎄 Omat tiedot
        </h2>
        <p className="text-muted-foreground font-body">
          Kerro meille nimesi, niin pääset aloittamaan!
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-lg font-semibold text-card-foreground">
            Nimi *
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="Kirjoita nimesi"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-14 text-lg border-2 border-muted focus:border-christmas-gold transition-colors"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-lg font-semibold text-card-foreground">
            Sähköposti (valinnainen)
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="esimerkki@email.fi"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-14 text-lg border-2 border-muted focus:border-christmas-gold transition-colors"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="giftWishes" className="text-lg font-semibold text-card-foreground">
            Lahjatoiveet (valinnainen)
          </Label>
          <Textarea
            id="giftWishes"
            placeholder="Mitä toivoisit joululahjaksi?"
            value={giftWishes}
            onChange={(e) => setGiftWishes(e.target.value)}
            className="min-h-[100px] text-lg border-2 border-muted focus:border-christmas-gold transition-colors resize-none"
          />
        </div>

        <p className="text-sm text-muted-foreground bg-christmas-cream rounded-lg p-4 border border-muted">
          💌 Jos jätät sähköpostin, saat <strong>Joulun Osaaja -osaamismerkin</strong> sähköpostiisi. 
          Muuten saat vain tulostettavan todistuksen.
        </p>
      </div>

      <Button
        type="submit"
        variant="gold"
        size="xl"
        className="w-full"
        disabled={!name.trim()}
      >
        Aloita tonttututka
        <ArrowRight className="ml-2" />
      </Button>
    </form>
  );
};
