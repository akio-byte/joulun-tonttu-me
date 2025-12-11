import { useState } from "react";
import { WizardCard } from "./WizardCard";
import { ProgressIndicator } from "./ProgressIndicator";
import { StepInfo } from "./steps/StepInfo";
import { StepQuiz } from "./steps/StepQuiz";
import { StepCamera } from "./steps/StepCamera";
import { StepGenerating } from "./steps/StepGenerating";
import { StepResults } from "./steps/StepResults";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type WizardStep = "info" | "quiz" | "camera" | "generating" | "results";

interface WizardData {
  name: string;
  email: string;
  giftWishes: string;
  answers: number[];
  score: number;
  photoBase64: string;
  elfImage: string;
  elfTitle: string;
  elfDescription: string;
}

export const ChristmasWizard = () => {
  const [currentStep, setCurrentStep] = useState<WizardStep>("info");
  const [wizardData, setWizardData] = useState<WizardData>({
    name: "",
    email: "",
    giftWishes: "",
    answers: [],
    score: 0,
    photoBase64: "",
    elfImage: "",
    elfTitle: "",
    elfDescription: "",
  });

  const stepNumbers: Record<WizardStep, number> = {
    info: 1,
    quiz: 2,
    camera: 3,
    generating: 4,
    results: 5,
  };

  const handleInfoNext = (data: { name: string; email: string; giftWishes: string }) => {
    setWizardData((prev) => ({ ...prev, ...data }));
    setCurrentStep("quiz");
  };

  const handleQuizNext = (answers: number[], score: number) => {
    setWizardData((prev) => ({ ...prev, answers, score }));
    setCurrentStep("camera");
  };

  const handleCameraNext = async (photoBase64: string) => {
    setWizardData((prev) => ({ ...prev, photoBase64 }));
    setCurrentStep("generating");

    try {
      const { data, error } = await supabase.functions.invoke("generate-elf", {
        body: {
          photoBase64,
          answers: wizardData.answers,
          score: wizardData.score,
          name: wizardData.name,
        },
      });

      if (error) {
        throw error;
      }

      if (data?.elfImageBase64 && data?.title && data?.description) {
        setWizardData((prev) => ({
          ...prev,
          elfImage: data.elfImageBase64,
          elfTitle: data.title,
          elfDescription: data.description,
        }));
        setCurrentStep("results");
      } else {
        throw new Error("Invalid response from AI");
      }
    } catch (error) {
      console.error("Elf generation error:", error);
      
      // Fallback - app never crashes, always shows results
      setWizardData((prev) => ({
        ...prev,
        elfImage: prev.photoBase64,
        elfTitle: "Joulun Osaaja",
        elfDescription: `Tällä kertaa taika ei onnistunut, mutta olet silti Joulun osaaja, ${wizardData.name}! Sinussa asuu aito jouluhenki ja tiimityöskentelyn taika.`,
      }));
      setCurrentStep("results");
    }
  };

  return (
    <div className="w-full px-4 py-8">
      <WizardCard>
        <ProgressIndicator currentStep={stepNumbers[currentStep]} totalSteps={5} />
        
        {currentStep === "info" && <StepInfo onNext={handleInfoNext} />}
        
        {currentStep === "quiz" && (
          <StepQuiz
            onNext={handleQuizNext}
            onBack={() => setCurrentStep("info")}
          />
        )}
        
        {currentStep === "camera" && (
          <StepCamera
            onNext={handleCameraNext}
            onBack={() => setCurrentStep("quiz")}
          />
        )}
        
        {currentStep === "generating" && <StepGenerating />}
        
        {currentStep === "results" && (
          <StepResults
            name={wizardData.name}
            email={wizardData.email}
            giftWishes={wizardData.giftWishes}
            elfImage={wizardData.elfImage}
            elfTitle={wizardData.elfTitle}
            elfDescription={wizardData.elfDescription}
            score={wizardData.score}
          />
        )}
      </WizardCard>
    </div>
  );
};
