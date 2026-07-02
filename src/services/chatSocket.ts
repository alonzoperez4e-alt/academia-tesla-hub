import { Client, IFrame } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { authGateway } from '@/contexts/AuthContext';

const stripTrailingSlash = (value: string) => value.replace(/\/$/, '');

export const resolveWsBaseUrl = (): string => {
  const envWs = import.meta.env.VITE_WS_BASE_URL;
  if (envWs) return stripTrailingSlash(envWs);

  const apiBase = import.meta.env.VITE_API_BASE_URL ?? '';
  if (apiBase) {
    const cleaned = stripTrailingSlash(apiBase);
    const withoutApi = cleaned.replace(/\/api\/(v1)?$/i, '');
    return withoutApi || cleaned;
  }

  if (typeof window !== 'undefined') return window.location.origin;
  return 'http://localhost:8080';
};

// Heuristic to classify a STOMP ERROR frame as an auth rejection vs. some other broker error.
// The exact wording the backend's ChannelInterceptor sends on CONNECT auth failure hasn't
// been confirmed yet — widen/replace this pattern once that's known.
const looksLikeAuthError = (frame: IFrame): boolean => {
  const text = `${frame.headers?.message ?? ''} ${frame.body ?? ''}`;
  return /auth|token|unauthor|forbidden|401|403/i.test(text);
};

interface CreateAuthenticatedStompClientOptions {
  wsBaseUrl: string;
  onConnect?: (client: Client) => void;
  onAuthError?: (frame: IFrame) => void;
  onNetworkDrop?: () => void;
}

// Builds a STOMP client wired to the CloudFront-fronted /ws-chat endpoint, attaching a fresh
// Cognito access token as a connectHeader on every (re)connect attempt via beforeConnect —
// this runs before the initial CONNECT and every automatic reconnect, so a token refreshed
// mid-session is picked up instead of a stale one being retried forever.
export const createAuthenticatedStompClient = ({
  wsBaseUrl,
  onConnect,
  onAuthError,
  onNetworkDrop,
}: CreateAuthenticatedStompClientOptions): Client => {
  const client = new Client({
    webSocketFactory: () => new SockJS(`${wsBaseUrl}/ws-chat`) as unknown as WebSocket,
    reconnectDelay: 5000,
    beforeConnect: async () => {
      const token = await authGateway.getAccessToken();
      client.connectHeaders = token ? { Authorization: `Bearer ${token}` } : {};
    },
    onConnect: () => onConnect?.(client),
    onStompError: (frame) => {
      if (looksLikeAuthError(frame)) {
        // A rejected/expired token will fail identically on every retry — stop the
        // automatic reconnect loop instead of hammering the broker.
        client.deactivate();
        onAuthError?.(frame);
      } else {
        onNetworkDrop?.();
      }
    },
    onWebSocketClose: () => {
      onNetworkDrop?.();
    },
  });

  return client;
};
