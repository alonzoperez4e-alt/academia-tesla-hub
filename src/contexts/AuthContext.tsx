import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { fetchAuthSession, signInWithRedirect, signOut as amplifySignOut } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import { userService } from '@/services/userService';

export interface AuthProfile {
  // sub de Cognito (UUID). No es el id_usuario numerico del backend — para eso usar `idUsuario`.
  cognitoSub: string | null;
  // id_usuario numerico real (tabla `usuario`), resuelto via GET /users/me. null hasta que
  // resuelve o si el usuario de Cognito aun no esta vinculado a una cuenta en el backend.
  idUsuario: number | null;
  nombre: string | null;
  apellido: string | null;
  codigo: string | null;
}

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
  role: string | null;
  profile: AuthProfile;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const EMPTY_PROFILE: AuthProfile = {
  cognitoSub: null,
  idUsuario: null,
  nombre: null,
  apellido: null,
  codigo: null,
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Confirmed with backend: the app role comes from Cognito group membership, carried as the
// `cognito:groups` claim on the ACCESS token (not the ID token) — Spring's JwtAuthenticationConverter
// reads authorities from there too (see SecurityConfig#jwtAuthenticationConverter). There is no
// `custom:role` attribute on this User Pool.
function extractRole(accessTokenPayload: Record<string, unknown> | undefined): string | null {
  if (!accessTokenPayload) return null;

  const groups = accessTokenPayload['cognito:groups'];
  if (Array.isArray(groups) && typeof groups[0] === 'string') {
    return groups[0].trim().toLowerCase();
  }

  return null;
}

function extractProfile(idTokenPayload: Record<string, unknown> | undefined): AuthProfile {
  if (!idTokenPayload) return EMPTY_PROFILE;

  return {
    cognitoSub: typeof idTokenPayload.sub === 'string' ? idTokenPayload.sub : null,
    idUsuario: null,
    nombre:
      typeof idTokenPayload.given_name === 'string'
        ? idTokenPayload.given_name
        : typeof idTokenPayload.name === 'string'
          ? idTokenPayload.name
          : null,
    apellido: typeof idTokenPayload.family_name === 'string' ? idTokenPayload.family_name : null,
    codigo:
      typeof idTokenPayload['cognito:username'] === 'string'
        ? (idTokenPayload['cognito:username'] as string)
        : typeof idTokenPayload.preferred_username === 'string'
          ? idTokenPayload.preferred_username
          : null,
  };
}

// Bridges the new Amplify-backed session into the sessionStorage shape that
// StudentDashboard/AdminDashboard/ParentDashboard already read, so their existing
// per-page guards keep working without a rewrite in this pass.
function mirrorSessionStorage(role: string | null, profile: AuthProfile, token: string | null) {
  if (!role || !token) {
    sessionStorage.removeItem('currentUser');
    return;
  }

  sessionStorage.setItem(
    'currentUser',
    JSON.stringify({
      token,
      name: [profile.nombre, profile.apellido].filter(Boolean).join(' ').trim(),
      role,
      code: profile.codigo ?? '',
      id: profile.idUsuario ?? 0,
    }),
  );
}

// Non-hook surface for modules outside the React tree (e.g. the axios interceptor in api.ts),
// which cannot call useAuth() since they aren't components.
export const authGateway = {
  getAccessToken: async (forceRefresh = false): Promise<string | null> => {
    try {
      const session = await fetchAuthSession({ forceRefresh });
      return session.tokens?.accessToken?.toString() ?? null;
    } catch {
      return null;
    }
  },
  clearAndRedirectToLogin: async (): Promise<void> => {
    sessionStorage.removeItem('currentUser');
    try {
      await amplifySignOut();
    } catch (error) {
      console.error('No se pudo cerrar la sesión de Cognito de forma limpia:', error);
    }
    window.location.href = '/login';
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [profile, setProfile] = useState<AuthProfile>(EMPTY_PROFILE);

  const clearLocalState = useCallback(() => {
    setAccessToken(null);
    setRole(null);
    setProfile(EMPTY_PROFILE);
    setIsAuthenticated(false);
    sessionStorage.removeItem('currentUser');
  }, []);

  const hydrate = useCallback(async (forceRefresh = false) => {
    try {
      const session = await fetchAuthSession({ forceRefresh });
      const token = session.tokens?.accessToken?.toString() ?? null;
      const idPayload = session.tokens?.idToken?.payload as Record<string, unknown> | undefined;
      const accessPayload = session.tokens?.accessToken?.payload as Record<string, unknown> | undefined;

      if (!token) {
        clearLocalState();
        return;
      }

      const nextRole = extractRole(accessPayload);
      const nextProfile = extractProfile(idPayload);

      // Resuelve el id_usuario numerico real del backend. Se espera aqui (no fire-and-forget)
      // para que quede listo en sessionStorage antes de que los dashboards lo lean. Si falla
      // (p.ej. el usuario de Cognito aun no esta vinculado en la tabla `usuario`) se degrada a
      // null sin bloquear el login, igual que ya hace authGateway.getAccessToken.
      try {
        const usuario = await userService.getMe();
        nextProfile.idUsuario = usuario.idUsuario;
      } catch (error) {
        console.error('No se pudo resolver el id_usuario del backend:', error);
        nextProfile.idUsuario = null;
      }

      setAccessToken(token);
      setRole(nextRole);
      setProfile(nextProfile);
      setIsAuthenticated(true);
      mirrorSessionStorage(nextRole, nextProfile, token);
    } catch (error) {
      console.error('No se pudo obtener la sesión de Cognito:', error);
      clearLocalState();
    } finally {
      setIsLoading(false);
    }
  }, [clearLocalState]);

  useEffect(() => {
    hydrate();

    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      switch (payload.event) {
        case 'signedIn':
        case 'tokenRefresh':
          hydrate();
          break;
        case 'signedOut':
        case 'tokenRefresh_failure':
        case 'signInWithRedirect_failure':
          setIsLoading(false);
          clearLocalState();
          break;
        default:
          break;
      }
    });

    return unsubscribe;
  }, [hydrate, clearLocalState]);

  const signIn = useCallback(async () => {
    await signInWithRedirect();
  }, []);

  const signOut = useCallback(async () => {
    sessionStorage.removeItem('currentUser');
    await amplifySignOut();
  }, []);

  const refresh = useCallback(() => hydrate(true), [hydrate]);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, accessToken, role, profile, signIn, signOut, refresh }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return ctx;
}
