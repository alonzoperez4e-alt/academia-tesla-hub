import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Trophy, Users, LogOut } from 'lucide-react';
import { groupService } from '@/services/groupService';
import type { GroupInfo, GroupRankingEntry } from '@/types/api.types';
import { useToast } from '@/hooks/use-toast';
import { GroupChat } from './GroupChat.tsx';

interface GroupInteractionProps {
  studentId: number;
  studentName?: string;
}

const formatError = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Ocurrió un error. Inténtalo de nuevo.';
};

const stripDiacritics = (value: string) => value.normalize('NFD').replace(/\p{Diacritic}+/gu, '');

export const GroupInteraction = ({ studentId, studentName }: GroupInteractionProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState<GroupInfo | null>(null);
  const [ranking, setRanking] = useState<GroupRankingEntry[]>([]);
  const [actionLoading, setActionLoading] = useState<'create' | 'join' | 'leave' | null>(null);
  const [createName, setCreateName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [autoRefreshTick, setAutoRefreshTick] = useState(0);
  const [chatResetSignal, setChatResetSignal] = useState(0);

  const currentUserName = useMemo(() => (studentName && studentName.trim() ? studentName.trim() : 'Tú'), [studentName]);

  const handleLoadStatus = async () => {
    setLoading(true);
    try {
      const data = await groupService.getStudentGroup(studentId);
      setGroup(data ? { ...data, name: stripDiacritics(data.name) } : null);
      if (data) {
        const ranks = await groupService.getRanking(data.id);
        setRanking(ranks);
      } else {
        setRanking([]);
      }
    } catch (error) {
      toast({ title: 'No se pudo cargar tu estado', description: formatError(error), variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleLoadStatus();
  }, [studentId]);

  // Auto-actualiza ranking cada 30s cuando hay grupo
  useEffect(() => {
    if (!group) return;
    const interval = setInterval(async () => {
      setAutoRefreshTick((tick) => tick + 1);
    }, 30000);
    return () => clearInterval(interval);
  }, [group?.id]);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!createName.trim()) {
      toast({ title: 'Ingresa un nombre para el grupo', variant: 'destructive' });
      return;
    }
    setActionLoading('create');
    try {
      const cleanName = stripDiacritics(createName.trim());
      const created = await groupService.createGroup(cleanName, studentId);
      setGroup({ ...created, name: stripDiacritics(created.name) });
      setRanking(await groupService.getRanking(created.id));
      toast({ title: 'Grupo creado', description: 'Comparte el código con tus compañeros.' });
    } catch (error) {
      toast({ title: 'No se pudo crear el grupo', description: formatError(error), variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleJoin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!joinCode.trim()) {
      toast({ title: 'Ingresa el código del grupo', variant: 'destructive' });
      return;
    }
    setActionLoading('join');
    try {
      const message = await groupService.joinGroup(joinCode.trim(), studentId);
      toast({ title: 'Te uniste al grupo', description: message });
      const data = await groupService.getStudentGroup(studentId);
      setGroup(data ? { ...data, name: stripDiacritics(data.name) } : null);
      if (data) setRanking(await groupService.getRanking(data.id));
    } catch (error) {
      toast({ title: 'No se pudo unir al grupo', description: formatError(error), variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleLeave = async () => {
    if (!group) return;
    setActionLoading('leave');
    try {
      const message = await groupService.leaveGroup(group.id, studentId);
      toast({ title: 'Saliste del grupo', description: message });
      setChatResetSignal((n) => n + 1);
      setGroup(null);
      setRanking([]);
      setJoinCode('');
      setCreateName('');
      setAutoRefreshTick(0);
      navigate('/dashboard');
    } catch (error) {
      toast({ title: 'No se pudo salir del grupo', description: formatError(error), variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  // Re-fetch ranking when autoRefreshTick updates
  useEffect(() => {
    const fetchRanking = async () => {
      if (!group) return;
      try {
        const ranks = await groupService.getRanking(group.id);
        setRanking(ranks);
      } catch (error) {
        toast({ title: 'No se pudo actualizar el ranking', description: formatError(error), variant: 'destructive' });
      }
    };
    fetchRanking();
  }, [autoRefreshTick, group?.id]);

  const renderContent = () => {
    if (loading) {
      return (
        <Card className="bg-card/50 border-primary/20">
          <CardContent className="flex items-center gap-3 py-6">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-muted-foreground text-sm">Cargando tu estado de grupo...</span>
          </CardContent>
        </Card>
      );
    }

    if (!group) {
      return (
        <div className="grid grid-cols-1 gap-4 max-w-2xl mx-auto">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Crear grupo</CardTitle>
              <CardDescription>Genera un código único para invitar a tus amigos.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <Input
                  placeholder="Nombre del grupo"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  disabled={actionLoading === 'create'}
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                />
                <Button
                  key={actionLoading === 'create' ? 'create-loading' : 'create-ready'}
                  type="submit"
                  className="w-full"
                  disabled={actionLoading === 'create'}
                >
                  {actionLoading === 'create' && (
                    <span className="inline-flex items-center mr-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </span>
                  )}
                  Crear grupo
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Unirse a grupo</CardTitle>
              <CardDescription>Usa el código que te compartió tu compañero.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJoin} className="space-y-4">
                <Input
                  placeholder="Ej: TSL-X9Y8"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  disabled={actionLoading === 'join'}
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                />
                <Button
                  key={actionLoading === 'join' ? 'join-loading' : 'join-ready'}
                  type="submit"
                  variant="secondary"
                  className="w-full"
                  disabled={actionLoading === 'join'}
                >
                  {actionLoading === 'join' && (
                    <span className="inline-flex items-center mr-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </span>
                  )}
                  Unirme al grupo
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="space-y-4">
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-white to-accent/5">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-2">
            <CardTitle className="text-2xl">{group.name}</CardTitle>
            <div className="flex items-center gap-2 text-base flex-wrap text-muted-foreground">
              <Badge variant="outline" className="text-sm px-3 py-1">Código: {group.code}</Badge>
              <Separator orientation="vertical" className="h-4 hidden sm:block" />
              <span>Comparte este código para invitar.</span>
            </div>
          </div>
          <Button
            key={actionLoading === 'leave' ? 'leave-loading' : 'leave-ready'}
            variant="outline"
            onClick={handleLeave}
            disabled={actionLoading === 'leave'}
            className="w-full sm:w-auto"
          >
            {actionLoading === 'leave' ? (
              <span className="inline-flex items-center mr-2">
                <Loader2 className="w-4 h-4 animate-spin" />
              </span>
            ) : (
              <LogOut className="w-4 h-4 mr-2" />
            )}
            Salir del grupo
          </Button>
        </CardHeader>
      </Card>

      <Card className="border-primary/10">
        <CardHeader>
          <CardTitle className="text-lg">Ranking del grupo</CardTitle>
          <CardDescription>Solo para miembros de este grupo. No afecta tu exp global.</CardDescription>
        </CardHeader>
        <CardContent>
          {ranking.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aún no hay puntos registrados en este grupo.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table className="w-full table-auto text-sm sm:text-base">
                <TableHeader>
                  <TableRow className="[&>*]:py-2 sm:[&>*]:py-3">
                    <TableHead className="w-10 sm:w-14">N</TableHead>
                    <TableHead className="min-w-[160px] sm:min-w-[220px]">Estudiante</TableHead>
                    <TableHead className="text-right whitespace-nowrap">EXP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ranking.map((entry) => {
                    const displayName = entry.studentName || `Estudiante ${entry.studentId}`;
                    const isCurrentUser = entry.studentId === studentId || displayName === currentUserName;
                    return (
                      <TableRow key={`${entry.studentId}-${entry.position}`} className={`${isCurrentUser ? 'bg-primary/5' : ''} [&>*]:py-2 sm:[&>*]:py-3`}>
                        <TableCell className="font-semibold">{entry.position}</TableCell>
                        <TableCell className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-muted-foreground shrink-0" />
                          <span className="font-medium text-xs sm:text-sm leading-tight break-words">
                            {displayName}
                          </span>
                          {isCurrentUser && <Badge variant="secondary" className="shrink-0">Tú</Badge>}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-foreground whitespace-nowrap">{entry.groupExp}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <GroupChat
        groupId={group.id}
        groupName={group.name}
        studentId={studentId}
        studentName={currentUserName}
        resetSignal={chatResetSignal}
      />
      </div>
    );
  };

  return (
    <div key={group ? `group-${group.id}` : 'no-group'} className="max-w-4xl mx-auto space-y-4">
      {renderContent()}
    </div>
  );
};

export default GroupInteraction;
