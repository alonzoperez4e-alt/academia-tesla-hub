import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const DINO_STAGE_ASSET_PATHS = {
  egg: "dinosaurio/HuevoDinosaurio.mp4",
  cracking: "dinosaurio/CrugiendoDinosaurio.mp4",
  hatching: "dinosaurio/CreciendoDinosaurio.mp4",
  grown: "dinosaurio/PostulanteDinosaurio.mp4",
} as const;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getAssetUrl = (path: string) => {
  const baseUrl = import.meta.env.VITE_CLOUDFRONT_URL?.replace(/\/+$/, "");
  const normalizedPath = path.replace(/^\/+/, "");

  if (!baseUrl) {
    return `/${normalizedPath}`;
  }

  return `${baseUrl}/${normalizedPath}`;
};
