type Session = {
  accessToken: string | null;
  role: string | null;
  idUsuario: number | null;
  nombre: string | null;
  apellido: string | null;
  codigo: string | null;
};

let session: Session = {
  accessToken: null,
  role: null,
  idUsuario: null,
  nombre: null,
  apellido: null,
  codigo: null,
};

export const authSession = {
  set(
    accessToken: string,
    role: string | null,
    profile?: {
      idUsuario?: number | null;
      nombre?: string | null;
      apellido?: string | null;
      codigo?: string | null;
    }
  ) {
    session.accessToken = accessToken;
    session.role = role;
    session.idUsuario = profile?.idUsuario ?? null;
    session.nombre = profile?.nombre ?? null;
    session.apellido = profile?.apellido ?? null;
    session.codigo = profile?.codigo ?? null;
  },
  getAccessToken() {
    return session.accessToken;
  },
  getRole() {
    return session.role;
  },
  getProfile() {
    return {
      idUsuario: session.idUsuario,
      nombre: session.nombre,
      apellido: session.apellido,
      codigo: session.codigo,
    };
  },
  clear() {
    session = {
      accessToken: null,
      role: null,
      idUsuario: null,
      nombre: null,
      apellido: null,
      codigo: null,
    };
  },
};