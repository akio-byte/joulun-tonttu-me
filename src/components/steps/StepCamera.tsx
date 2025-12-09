import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";

interface StepCameraProps {
  onNext: (photoBase64: string) => void;
  onBack: () => void;
}

export const StepCamera = ({ onNext, onBack }: StepCameraProps) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
      }
      setHasPermission(true);
    } catch (err) {
      console.error("Camera error:", err);
      setHasPermission(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setIsStreaming(false);
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        setCapturedPhoto(dataUrl);
        stopCamera();
      }
    }
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    startCamera();
  };

  const handleContinue = () => {
    if (capturedPhoto) {
      onNext(capturedPhoto);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-card-foreground mb-2">
          📸 Ota kuva
        </h2>
        <p className="text-muted-foreground font-body">
          Hymyile kameralle! Teemme sinusta tontun.
        </p>
      </div>

      <div className="relative aspect-[4/3] w-full max-w-md mx-auto rounded-2xl overflow-hidden bg-muted border-4 border-christmas-gold shadow-glow">
        {hasPermission === false ? (
          <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
            <div>
              <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-card-foreground font-semibold mb-2">Kamera ei käytettävissä</p>
              <p className="text-sm text-muted-foreground">
                Salli kameran käyttö selaimen asetuksista.
              </p>
            </div>
          </div>
        ) : capturedPhoto ? (
          <img src={capturedPhoto} alt="Kuvattu" className="w-full h-full object-cover" />
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {!capturedPhoto && hasPermission !== false && (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="gold"
            size="xl"
            onClick={capturePhoto}
            disabled={!isStreaming}
            className="min-w-[200px]"
          >
            <Camera className="mr-2" />
            Ota kuva
          </Button>
        </div>
      )}

      {capturedPhoto && (
        <div className="flex justify-center gap-4">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={retakePhoto}
          >
            <RotateCcw className="mr-2" />
            Ota uudelleen
          </Button>
        </div>
      )}

      <div className="flex gap-4 pt-4">
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
        <Button
          type="button"
          variant="gold"
          size="lg"
          onClick={handleContinue}
          disabled={!capturedPhoto}
          className="flex-1"
        >
          Luo tonttuhahmo
          <ArrowRight className="ml-2" />
        </Button>
      </div>
    </div>
  );
};
