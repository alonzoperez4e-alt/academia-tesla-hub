import { useMemo, useState } from "react";

type DinoStage = "egg" | "cracking" | "hatching" | "grown";
type DinoSize = "sm" | "md" | "lg";

interface StudentDinoGifProps {
  exp: number;
  progressPercent?: number;
  size?: DinoSize;
  showProgressText?: boolean;
  className?: string;
}

// Simple video renderer that swaps assets based on EXP.
const StudentDinoGif = ({
  exp,
  progressPercent,
  size = "md",
  showProgressText = true,
  className = "",
}: StudentDinoGifProps) => {
  const [loadError, setLoadError] = useState(false);

  const stage: DinoStage = useMemo(() => {
    if (exp <= 1249) return "egg";
    if (exp <= 2499) return "cracking";
    if (exp <= 3749) return "hatching";
    return "grown";
  }, [exp]);

  const sizeConfig: Record<DinoSize, { maxWidth: number; minWidth: number }> = {
    sm: { maxWidth: 140, minWidth: 120 },
    md: { maxWidth: 200, minWidth: 150 },
    lg: { maxWidth: 240, minWidth: 180 },
  };

  const { maxWidth, minWidth } = sizeConfig[size];

  const mapExpToProgress = (value: number) => {
    const clamped = Math.max(0, value);
    if (clamped >= 3750) {
      const span = Math.min(clamped, 5000) - 3750;
      return Math.min(75 + (span / 1250) * 25, 100);
    }
    if (clamped >= 2500) return 50 + ((clamped - 2500) / 1250) * 25;
    if (clamped >= 1250) return 25 + ((clamped - 1250) / 1250) * 25;
    return (clamped / 1250) * 25;
  };

  const resolvedProgress = useMemo(() => {
    if (typeof progressPercent === "number") return Math.max(0, Math.min(100, Math.round(progressPercent)));
    return Math.round(mapExpToProgress(exp));
  }, [exp, progressPercent]);

  const renderStage = () => {
    const stageToFile: Record<DinoStage, { src: string; label: string }> = {
      egg: { src: "https://res.cloudinary.com/djh8zsaii/video/upload/v1771864271/egg1_poqxvi.mp4", label: "Mascota etapa huevo" },
      cracking: { src: "https://res.cloudinary.com/djh8zsaii/video/upload/v1771864394/cracking1_js5lyl.mp4", label: "Mascota agrietándose" },
      hatching: { src: "https://res.cloudinary.com/djh8zsaii/video/upload/v1771883596/CreciendoSopi-Picsart-BackgroundRemover_zpt6i7.mp4", label: "Mascota naciendo" },
      grown: { src: "https://res.cloudinary.com/djh8zsaii/video/upload/v1771989927/DinoGrande-Picsart-BackgroundRemover_j4vtmw.mp4", label: "Mascota completamente crecida" },
    };

    const asset = stageToFile[stage];

    if (!loadError) {
      return (
        <div
          className="absolute inset-0 select-none"
          style={{ pointerEvents: "none" }}
          onContextMenu={(e) => e.preventDefault()}
        >
          <video
            playsInline
            autoPlay
            loop
            muted
            controls={false}
            controlsList="nodownload noplaybackrate nofullscreen"
            disablePictureInPicture
            aria-hidden="true"
            tabIndex={-1}
            className="h-full w-full object-contain"
            style={{ pointerEvents: "none", userSelect: "none" }}
            onError={() => setLoadError(true)}
          >
            <source src={asset.src} type="video/mp4" />
          </video>
        </div>
      );
    }

    return (
      <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-gradient-to-br from-muted/50 to-muted text-muted-foreground text-sm font-medium">
        No se pudo cargar el video
      </div>
    );
  };

  return (
    <div className={`flex flex-col items-center ${className}`} style={{ width: "100%", maxWidth, minWidth }}>
      <div
        className="relative w-full"
        style={{ aspectRatio: "4 / 5" }}
        aria-label="Mascota del estudiante"
      >
        {renderStage()}
      </div>

      {showProgressText && (
        <div className="mt-3 text-center space-y-1">
          <div className="text-sm font-bold text-primary">{resolvedProgress}% Completado</div>
          <p className="text-xs text-muted-foreground">Evolución basada en EXP</p>
        </div>
      )}
    </div>
  );
};

export default StudentDinoGif;