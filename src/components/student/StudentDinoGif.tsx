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

// Simple GIF renderer that swaps assets based on EXP.
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
    const stageToFile: Record<DinoStage, { src: string; alt: string }> = {
      egg: { src: "/assets/dino/egg.gif", alt: "Mascota etapa huevo" },
      cracking: { src: "/assets/dino/cracking.gif", alt: "Mascota agrietándose" },
      hatching: { src: "/assets/dino/hatching.gif", alt: "Mascota naciendo" },
      grown: { src: "/assets/dino/grown.gif", alt: "Mascota completamente crecida" },
    };

    const asset = stageToFile[stage];

    if (!loadError) {
      return (
        <img
          src={asset.src}
          alt={asset.alt}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-contain"
          onError={() => setLoadError(true)}
        />
      );
    }

    return (
      <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-gradient-to-br from-muted/50 to-muted text-muted-foreground text-sm font-medium">
        No se pudo cargar el GIF
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