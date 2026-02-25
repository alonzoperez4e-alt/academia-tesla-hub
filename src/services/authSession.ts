export interface Session {
  accessToken: string | null;
  role: string | null;
  idUsuario: number | string | null;
  nombre: string | null;
  apellido: string | null;
  codigo: string | null;
}

const storedSession = localStorage.getItem('tesla_auth_session');
let session: Session = storedSession ? JSON.parse(storedSession) : {
  accessToken: null,
  role: null,
  idUsuario: null,
  nombre: null,
  apellido: null,
  codigo: null,
};

export const authSession = {
  getAccessToken: () => session.accessToken,
  getRole: () => session.role,
  getProfile: () => ({
    idUsuario: session.idUsuario,
    nombre: session.nombre,
    apellido: session.apellido,
    codigo: session.codigo,
  }),
  set: (accessToken: string, role: string | null, userData?: Partial<Session>) => {
    session = { ...session, accessToken, role, ...userData };
    localStorage.setItem('tesla_auth_session', JSON.stringify(session));
  },
  clear: () => {
    session = { accessToken: null, role: null, idUsuario: null, nombre: null, apellido: null, codigo: null };
    localStorage.removeItem('tesla_auth_session');
  }
};