export type JwtClaims = {
  sub?: string;
  nombre?: string;
  apellido?: string;
  idUsuario?: number;
  role?: string;
  exp?: number;
  iat?: number;
};

export const decodeJwtClaims = (token: string): JwtClaims | null => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, "0")}`)
        .join("")
    );

    return JSON.parse(json) as JwtClaims;
  } catch {
    return null;
  }
};