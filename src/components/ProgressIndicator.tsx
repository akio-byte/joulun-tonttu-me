import { cn } from "@/lib/utils";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export const ProgressIndicator = ({ currentStep, totalSteps }: ProgressIndicatorProps) => {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={i}
          className={cn(
            "h-2 rounded-full transition-all duration-300",
            i + 1 === currentStep
              ? "w-8 bg-christmas-gold"
              : i + 1 < currentStep
              ? "w-4 bg-christmas-green"
              : "w-4 bg-muted"
          )}
        />
      ))}
    </div>
  );
};
