import { useState } from "react";
import { WizardCard } from "./WizardCard";
import { ProgressIndicator } from "./ProgressIndicator";
import { StepInfo } from "./steps/StepInfo";
import { StepWish } from "./steps/StepWish";
import { StepCamera } from "./steps/StepCamera";
import { StepGenerating } from "./steps/StepGenerating";
import { StepResults } from "./steps/StepResults";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/hooks/useSettings";

type WizardStep = "info" | "wish" | "camera" | "generating" | "results";

interface WizardData {
  name: string;
  email: string;
  userWish: string;
  photoBase64: string;
  elfImage: string;
  elfTitle: string;
  elfDescription: string;
  mysticalPhrase: string;
  score: number;
}

export const ChristmasWizard = () => {
  const [currentStep, setCurrentStep] = useState<WizardStep>("info");
  const { settings, isObfConfigured, isAiConfigured } = useSettings();
  const [wizardData, setWizardData] = useState<WizardData>({
    name: "",
    email: "",
    userWish: "",
    photoBase64: "",
    elfImage: "",
    elfTitle: "",
    elfDescription: "",
    mysticalPhrase: "",
    score: 0,
  });

  const stepNumbers: Record<WizardStep, number> = {
    info: 1,
    wish: 2,
    camera: 3,
    generating: 4,
    results: 5,
  };

  const handleInfoNext = (data: { name: string; email: string; giftWishes: string }) => {
    setWizardData((prev) => ({ ...prev, name: data.name, email: data.email }));
    setCurrentStep("wish");
  };

  const handleWishNext = (wish: string) => {
    setWizardData((prev) => ({ ...prev, userWish: wish }));
    setCurrentStep("camera");
  };

  const handleCameraNext = async (photoBase64: string) => {
    setWizardData((prev) => ({ ...prev, photoBase64 }));
    setCurrentStep("generating");

    try {
      const { data, error } = await supabase.functions.invoke("generate-elf", {
        body: {
          photoBase64,
          userWish: wizardData.userWish,
          name: wizardData.name,
          aiApiKey: isAiConfigured ? settings.aiApiKey : undefined,
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
          mysticalPhrase: data.mysticalPhrase || "",
          score: data.score || 8,
        }));
        setCurrentStep("results");
      } else {
        throw new Error("Invalid response from AI");
      }
    } catch (error) {
      console.error("Elf generation error:", error);

      // Fallback - app never crashes, always shows results
      const fallbackPhrase = wizardData.userWish
        ? `${wizardData.name} kantaa mukanaan unelmaa: ${wizardData.userWish.substring(0, 50)}...`
        : "";

      setWizardData((prev) => ({
        ...prev,
        elfImage: prev.photoBase64,
        elfTitle: "Joulun Osaaja",
        elfDescription: `Tällä kertaa taika ei onnistunut, mutta olet silti Joulun osaaja, ${wizardData.name}! Sinussa asuu aito jouluhenki ja tiimityöskentelyn taika.`,
        mysticalPhrase: fallbackPhrase,
        score: 8,
      }));
      setCurrentStep("results");
    }
  };

  const handleRestart = () => {
    setWizardData({
      name: "",
      email: "",
      userWish: "",
      photoBase64: "",
      elfImage: "",
      elfTitle: "",
      elfDescription: "",
      mysticalPhrase: "",
      score: 0,
    });
    setCurrentStep("info");
  };

  return (
    <div className="w-full px-4 py-8">
      <WizardCard>
        <ProgressIndicator currentStep={stepNumbers[currentStep]} totalSteps={5} />

        {currentStep === "info" && <StepInfo onNext={handleInfoNext} />}

        {currentStep === "wish" && (
          <StepWish
            onNext={handleWishNext}
            onBack={() => setCurrentStep("info")}
          />
        )}

        {currentStep === "camera" && (
          <StepCamera
            onNext={handleCameraNext}
            onBack={() => setCurrentStep("wish")}
          />
        )}

        {currentStep === "generating" && <StepGenerating />}

        {currentStep === "results" && (
          <StepResults
            name={wizardData.name}
            email={wizardData.email}
            userWish={wizardData.userWish}
            elfImage={wizardData.elfImage}
            elfTitle={wizardData.elfTitle}
            elfDescription={wizardData.elfDescription}
            mysticalPhrase={wizardData.mysticalPhrase}
            score={wizardData.score}
            isObfConfigured={isObfConfigured}
            obfSettings={{
              clientId: settings.obfClientId,
              clientSecret: settings.obfClientSecret,
              badgeId: settings.obfBadgeId,
            }}
            onRestart={handleRestart}
          />
        )}
      </WizardCard>
    </div>
  );
};
