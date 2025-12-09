import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface WizardCardProps {
  children: ReactNode;
  className?: string;
}

export const WizardCard = ({ children, className }: WizardCardProps) => {
  return (
    <div
      className={cn(
        "card-gradient rounded-3xl p-8 md:p-12 shadow-christmas w-full max-w-2xl mx-auto animate-scale-in",
        className
      )}
    >
      {children}
    </div>
  );
};
