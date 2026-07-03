export const isUsuarioNoRegistradoError = (error: unknown): boolean => {
  const err = error as any;
  return err?.response?.status === 404 && err?.response?.data?.error === "USUARIO_NO_REGISTRADO";
};
