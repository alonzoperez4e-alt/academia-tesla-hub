import { signIn, getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import { authSession } from './authSession';
import type { LoginRequest, AuthResponse, RegisterRequest } from '../types/api.types';

const normalizeRole = (role?: string | null) => (role ?? "").trim().toLowerCase() || null;

export const loginService = {
  LogearUsuario: async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
      // 1. Enviar credenciales a AWS Cognito
      const signInOutput = await signIn({
        username: credentials.codigo,
        password: credentials.password,
      });

      if (signInOutput.nextStep.signInStep !== 'DONE') {
        const step = signInOutput.nextStep.signInStep;
        console.warn("Estado de usuario en Cognito:", step);
        
        // Aquí detectamos si es el caso de cambio de contraseña obligatoria
        if (step === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
            throw new Error("Debes establecer una nueva contraseña.");
        }
        throw new Error(`Se requiere acción adicional en Cognito: ${step}`);
      }

      // 2. Obtener la sesión y los tokens de AWS
      const session = await fetchAuthSession();
      const accessToken = session.tokens?.accessToken?.toString() ?? "";
      
      // 3. Extraer los datos del perfil (claims) que vienen en el idToken
      const idTokenPayload = session.tokens?.idToken?.payload;
      const user = await getCurrentUser();

      // Cognito suele devolver los roles en un arreglo 'cognito:groups'. Usamos 'estudiante' por defecto.
      const groups = idTokenPayload?.['cognito:groups'] as string[] | undefined;
      const rawRole = groups && groups.length > 0 ? groups[0] : 'estudiante'; 
      const normalizedRole = normalizeRole(rawRole);

      // Mapear atributos de Cognito a tu estructura
      const nombre = (idTokenPayload?.given_name as string) ?? (idTokenPayload?.name as string) ?? "";
      const apellido = (idTokenPayload?.family_name as string) ?? "";
      const idUsuario = (idTokenPayload?.sub as string) ?? user.userId;

      // 4. Guardar en tu estado global actual (localStorage)
      authSession.set(accessToken, normalizedRole, {
        idUsuario: idUsuario,
        nombre: nombre,
        apellido: apellido,
        codigo: credentials.codigo,
      });

      return {
        accessToken,
        role: normalizedRole,
      };

    } catch (error: any) {
      console.error("Error en autenticación con Cognito:", error);
      
      // AWS devuelve errores específicos, los convertimos a un mensaje amigable para el usuario
      if (error.name === 'NotAuthorizedException' || error.name === 'UserNotFoundException') {
        throw new Error("Código de usuario o contraseña incorrectos");
      }
      if (error.name === 'PasswordResetRequiredException') {
        throw new Error("Debes restablecer tu contraseña.");
      }
      throw new Error(error.message || "Error al iniciar sesión");
    }
  },

  RegistrarUsuario: async (payload: RegisterRequest): Promise<AuthResponse> => {
    // El registro ahora se maneja desde el backend (IaC) o consola de AWS
    throw new Error("El registro de usuarios está deshabilitado en esta pantalla.");
  },
};
