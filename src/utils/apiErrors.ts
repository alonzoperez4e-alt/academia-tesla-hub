export const isUsuarioNoRegistradoError = (error: unknown): boolean => {
  const err = error as any;
  return err?.response?.status === 404 && err?.response?.data?.error === "USUARIO_NO_REGISTRADO";
};

export const isCodigoYaExisteError = (error: unknown): boolean => {
  const err = error as any;
  return err?.response?.status === 409 && err?.response?.data?.error === "CODIGO_YA_EXISTE";
};

export const isCognitoUsuarioYaExisteError = (error: unknown): boolean => {
  const err = error as any;
  return err?.response?.status === 409 && err?.response?.data?.error === "COGNITO_USUARIO_YA_EXISTE";
};

export const isCognitoNoDisponibleError = (error: unknown): boolean => {
  const err = error as any;
  return err?.response?.status === 503 && err?.response?.data?.error === "COGNITO_NO_DISPONIBLE";
};

export const getApiErrorMessage = (error: unknown): string | undefined => {
  const err = error as any;
  return err?.response?.data?.message;
};
