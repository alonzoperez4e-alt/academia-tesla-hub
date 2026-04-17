import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Loader2, Send, Wifi, WifiOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { groupService } from '@/services/groupService';
import type { GroupChatMessage } from '@/types/api.types';
import { useToast } from '@/hooks/use-toast';

interface GroupChatProps {
  groupId: number | null | undefined;
  groupName: string | null | undefined;
  studentId: number | null | undefined;
  studentName: string | null | undefined;
  resetSignal?: number;
}

const stripTrailingSlash = (value: string) => value.replace(/\/$/, '');

const resolveWsBaseUrl = () => {
  const envWs = import.meta.env.VITE_WS_BASE_URL as string | undefined;
  if (envWs) return stripTrailingSlash(envWs);

  const apiBase = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';
  if (apiBase) {
    const cleaned = stripTrailingSlash(apiBase);
    const withoutApi = cleaned.replace(/\/api\/(v1)?$/i, '');
    return withoutApi || cleaned;
  }

  if (typeof window !== 'undefined') return window.location.origin;
  return 'http://localhost:8080';
};

const getDisplayTime = (message: GroupChatMessage) => {
  const raw = message.timestamp ?? message.updatedAt ?? message.createdAt;
  if (!raw) return '';
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
};

const getTimestampMs = (message: GroupChatMessage) => {
  const raw = message.timestamp ?? message.updatedAt ?? message.createdAt;
  if (typeof raw === 'number') return raw;
  const parsed = raw ? Date.parse(raw) : NaN;
  return Number.isNaN(parsed) ? 0 : parsed;
};

const normalizeId = (id: string | number | undefined | null) => (id === undefined || id === null ? null : String(id));

export const GroupChat = ({ groupId, groupName, studentId, studentName, resetSignal }: GroupChatProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<GroupChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [historyLoading, setHistoryLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const stompRef = useRef<Client | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const localIdCounterRef = useRef(0);

  const wsBaseUrl = useMemo(() => resolveWsBaseUrl(), []);

  const withStableId = (message: GroupChatMessage): GroupChatMessage & { id: string } => {
    const normalized = normalizeId(message.id);
    if (normalized) return { ...message, id: normalized };
    const generated = `local-${Date.now()}-${localIdCounterRef.current++}`;
    return { ...message, id: generated };
  };

  const orderedMessages = useMemo(() => {
    const seen = new Set<string>();
    const deduped: GroupChatMessage[] = [];

    for (const msg of messages) {
      const id = normalizeId(msg.id);
      if (!id) continue;
      if (seen.has(id)) continue;
      seen.add(id);
      deduped.push(msg);
    }

    return deduped.sort((a, b) => getTimestampMs(a) - getTimestampMs(b));
  }, [messages]);

  useEffect(() => {
    let isActive = true;
    if (!groupId || !studentId) return undefined;

    const fetchAndConnect = async () => {
      setHistoryLoading(true);
      setMessages([]);
      setConnectError(null);

      try {
        const history = await groupService.getChatHistory(groupId);
        if (isActive) setMessages((history ?? []).map(withStableId));
      } catch (error: any) {
        if (!isActive) return;
        const status = error?.response?.status as number | undefined;
        const message = error?.response?.data as any;
        const notFound = status === 404 || (typeof message === 'string' && /no encontrado/i.test(message));
        toast({ title: 'No se pudo cargar el chat', description: 'El grupo podría haber sido eliminado.', variant: 'destructive' });
        if (notFound) {
          setMessages([]);
          navigate('/dashboard');
          return;
        }
      } finally {
        if (isActive) setHistoryLoading(false);
      }

      if (!isActive) return;
      setConnecting(true);

      if (!wsBaseUrl) {
        setConnectError('No se pudo preparar la conexión WebSocket.');
        setConnecting(false);
        return;
      }

      const socket = new SockJS(`${wsBaseUrl}/ws-chat`);
      const client = new Client({
        webSocketFactory: () => socket as any,
        reconnectDelay: 5000,
        onConnect: () => {
          if (!isActive) return;
          setConnecting(false);
          setConnected(true);
          const topic = `/topic/group/${groupId}`;
          client.subscribe(topic, (frame) => {
            try {
              const incoming = withStableId(JSON.parse(frame.body) as GroupChatMessage);
              if (!isActive) return;
              setMessages((prev) => {
                const incomingId = normalizeId(incoming.id)!;
                const idx = prev.findIndex((m) => normalizeId(m.id) === incomingId);
                if (idx >= 0) {
                  const copy = [...prev];
                  copy[idx] = { ...copy[idx], ...incoming };
                  return copy;
                }
                return [...prev, incoming];
              });
            } catch (error) {
              console.error('No se pudo parsear el mensaje de chat', error);
            }
          });

          // Suscripción a evento de eliminación del grupo
          client.subscribe(`/topic/group/${groupId}/deleted`, () => {
            toast({ title: 'Este grupo ha sido eliminado', description: 'Serás redirigido al dashboard.', variant: 'destructive' });
            setMessages([]);
            navigate('/dashboard');
          });
        },
        onStompError: () => {
          if (!isActive) return;
          setConnectError('Hubo un problema con el canal de chat.');
          setConnecting(false);
          setConnected(false);
        },
        onWebSocketClose: () => {
          if (!isActive) return;
          setConnected(false);
        },
      });

      stompRef.current = client;
      client.activate();
    };

    fetchAndConnect();

    return () => {
      isActive = false;
      setConnected(false);
      setConnecting(false);
      stompRef.current?.deactivate();
      stompRef.current = null;
      setMessages([]);
    };
  }, [groupId, studentId, wsBaseUrl, toast]);

  useEffect(() => {
    if (resetSignal === undefined) return;
    setMessages([]);
    stompRef.current?.deactivate();
    stompRef.current = null;
    setConnected(false);
    setConnecting(false);
    localIdCounterRef.current = 0;
  }, [resetSignal]);

  useEffect(() => {
    const INTERVAL_MS = 60000;
    const MAX_AGE_MS = 3600000;

    const interval = setInterval(() => {
      setMessages((prev) => {
        const now = Date.now();
        return prev.filter((msg) => {
          const ts = getTimestampMs(msg);
          if (!ts) return true;
          return now - ts <= MAX_AGE_MS;
        });
      });
    }, INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    requestAnimationFrame(() => {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    });
  }, [orderedMessages.length, historyLoading]);

  const safeStudentName = studentName?.trim() || 'Invitado';

  const handleSend = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    if (!stompRef.current || !stompRef.current.connected) {
      toast({ title: 'El chat aún no está listo', description: 'Espera a que se conecte y vuelve a intentar.', variant: 'destructive' });
      return;
    }

    try {
      stompRef.current.publish({
        destination: `/app/chat/${groupId}/sendMessage`,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ studentId, studentName: safeStudentName, content: trimmed }),
      });
      setInputValue('');
    } catch (error) {
      toast({ title: 'No se pudo enviar el mensaje', description: 'Inténtalo de nuevo.', variant: 'destructive' });
    }
  };

  const missingData = !groupId || !groupName || !studentId;

  if (missingData) {
    return (
      <Card key={`chat-loading-${groupId ?? 'none'}`} className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg">Chat del grupo</CardTitle>
          <CardDescription>Cargando datos del chat...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          Espera un momento
        </CardContent>
      </Card>
    );
  }

  return (
    <div key={`chat-${groupId}`}>
      <Card className="border-primary/20">
        <CardHeader className="space-y-2">
          <CardTitle className="text-lg">Chat del grupo</CardTitle>
          <CardDescription>
            Los mensajes se eliminan a la hora de haber enviado
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {connecting && (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Conectando...
              </span>
            )}
            {!connecting && connected && (
              <span className="inline-flex items-center gap-2 text-primary">
                <Wifi className="w-4 h-4" /> Conectado
              </span>
            )}
            {!connecting && !connected && (
              <span className="inline-flex items-center gap-2 text-destructive">
                <WifiOff className="w-4 h-4" /> Desconectado
              </span>
            )}
            {connectError && <span className="text-destructive">{connectError}</span>}
          </div>

          <Separator />

          <div ref={messagesContainerRef} className="h-80 overflow-y-auto rounded-lg border border-border bg-secondary/40 p-3 space-y-3" aria-label="Mensajes del grupo">
            {historyLoading ? (
              <div className="flex items-center justify-center h-full text-muted-foreground gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Cargando historial...
              </div>
            ) : orderedMessages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm text-center">
                Aún no hay mensajes. ¡Envía el primero!
              </div>
            ) : (
              orderedMessages
                .filter((message) => !!normalizeId(message.id))
                .map((message) => {
                  const stableId = normalizeId(message.id)!;
                  const isMine = message.studentId === studentId;
                  const time = getDisplayTime(message);

                  return (
                    <div key={stableId} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-xl px-3 py-2 shadow-sm ${isMine ? 'bg-primary text-primary-foreground' : 'bg-white text-foreground border border-border'}`}>
                        <div className="text-xs font-semibold opacity-80">
                          {isMine ? 'Tú' : message.studentName || `Estudiante ${message.studentId ?? 'N/A'}`}
                        </div>
                        <div className="text-sm whitespace-pre-wrap break-words">{message.content}</div>
                        {time ? <div className="text-[11px] opacity-70 mt-1 text-right flex items-center gap-1 justify-end">{time}</div> : null}
                      </div>
                    </div>
                  );
                })
            )}
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Input
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                placeholder="Escribe un mensaje..."
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    handleSend();
                  }
                }}
              />
              <Button onClick={handleSend} disabled={!connected || !inputValue.trim()} className="shrink-0">
                <Send className="w-4 h-4 mr-2" />
                Enviar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GroupChat;
