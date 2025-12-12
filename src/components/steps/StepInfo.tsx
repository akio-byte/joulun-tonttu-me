import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight } from "lucide-react";

interface StepInfoProps {
  onNext: (data: { name: string; email: string; giftWishes: string }) => void;
}

export const StepInfo = ({ onNext }: StepInfoProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const validateEmail = (value: string): boolean => {
    if (!value.trim()) return true; // Empty is OK (optional)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (value && !validateEmail(value)) {
      setEmailError("Tarkista sähköpostiosoite (esim. nimi@esimerkki.fi)");
    } else {
      setEmailError("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length >= 2 && (email === "" || validateEmail(email))) {
      onNext({
        name: name.trim(),
        email: email.trim(),
        giftWishes: "",
      });
    }
  };

  const isNameValid = name.trim().length >= 2;
  const isEmailValid = email === "" || validateEmail(email);
  const canSubmit = isNameValid && isEmailValid;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-card-foreground mb-2">
          🎄 Tervetuloa!
        </h2>
        <p className="text-muted-foreground font-body">
          Kerro meille nimesi, niin pääset aloittamaan seikkailun!
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-lg font-semibold text-card-foreground">
            Nimesi *
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="Kirjoita nimesi (vähintään 2 merkkiä)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-14 text-lg border-2 border-muted focus:border-christmas-gold transition-colors"
            required
            minLength={2}
          />
          {name.length > 0 && name.length < 2 && (
            <p className="text-sm text-christmas-red">Nimen on oltava vähintään 2 merkkiä</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-lg font-semibold text-card-foreground">
            Sähköpostiosoite (vapaaehtoinen)
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="esimerkki@email.fi"
            value={email}
            onChange={handleEmailChange}
            className={`h-14 text-lg border-2 transition-colors ${
              emailError
                ? "border-christmas-red focus:border-christmas-red"
                : "border-muted focus:border-christmas-gold"
            }`}
          />
          {emailError && <p className="text-sm text-christmas-red">{emailError}</p>}
        </div>

        <p className="text-sm text-muted-foreground bg-christmas-cream rounded-lg p-4 border border-muted">
          💌 Jos jätät sähköpostin, saat <strong>Joulun Osaaja -osaamismerkin</strong>{" "}
          sähköpostiisi (edellyttää OBF-asetukset). Muuten saat vain tulostettavan
          todistuksen.
        </p>
      </div>

      <Button
        type="submit"
        variant="gold"
        size="xl"
        className="w-full"
        disabled={!canSubmit}
      >
        Aloita seikkailu ✨
        <ArrowRight className="ml-2" />
      </Button>
    </form>
  );
};
