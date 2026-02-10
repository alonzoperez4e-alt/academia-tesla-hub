import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { GamifiedStatusBar } from "@/components/gamification/GamifiedStatusBar";
import { LearningPath } from "@/components/gamification/LearningPath";
import { RankingTab } from "@/components/gamification/RankingTab";
import { MobileBottomNav } from "@/components/gamification/MobileBottomNav";
import { StreakMascot } from "@/components/gamification/StreakMascot";
import StudentCharacter3D from "@/components/student/StudentCharacter3D";
import { DinoMascot } from "@/components/student/DinoMascot";
import StudentProgressProfile from "@/components/student/StudentProgressProfile";
import StudentMiniProfile from "@/components/student/StudentMiniProfile";
import { QuizModal, QuizQuestion } from "@/components/student/QuizModal";
import { Construction, User, LogOut, IdCard, GraduationCap, Flame, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { el } from "date-fns/locale";
import { a } from "vitest/dist/chunks/suite.d.FvehnV49.js";

// Mock data for lessons with quizzes
const mockLessons: Record<string, { 
  id: string; 
  title: string; 
  description: string; 
  questions: QuizQuestion[]; 
  completedAttempts: number;
  bestScore: number;
  totalQuestions: number;
}> = {
  "w1-leccion1": {
    id: "w1-leccion1",
    title: "Sintaxis",
    description: "Técnicas fundamentales para analizar textos.",
    completedAttempts: 2,
    bestScore: 8,
    totalQuestions: 10,
    questions: [
      {
  id: "q1",
  text: `Analiza el siguiente párrafo:

"El sargento echaba una ojeada a la Madre Patrocinio y el
moscardón sigue allí. 

La lancha cabecea sobre las aguas turbias,
entre dos murallas de árboles que exhalan un vaho quemante,
pegajoso. 

Ovillados bajo el pamacari, desnudos de la cintura para
arriba, los guardias duermen abrigados por el verdoso, amarillento
sol del mediodía; la cabeza de Chiquito yace sobre el vientre
pesado; el Rubio transpira a chorros; el Oscuro gruñe boca abierta. 

Una sombrilla de jejenes escolta la lancha; entre los cuerpos
evolucionan mariposas, avispas, moscas gordas".

En el texto aparecen ............... oraciones.`,
  options: ["dos", "tres", "cuatro", "cinco", "seis"],
  correctAnswer: 2,
  solutionText: `Una oración gramatical es una unidad de sentido completo que, por lo general, termina con un punto. Si contamos los puntos en el texto, encontramos cuatro:

1) El sargento echaba una ojeada a la Madre Patrocinio y el moscardón sigue allí.

2) La lancha cabecea sobre las aguas turbias, entre dos murallas de árboles que exhalan un vaho quemante, pegajoso.

3) Ovillados bajo el pamacari, desnudos de la cintura para arriba, los guardias duermen abrigados por el verdoso, amarillento sol del mediodía; la cabeza de Chiquito yace sobre el vientre pesado; el Rubio transpira a chorros; el Oscuro gruñe boca abierta.

4) Una sombrilla de jejenes escolta la lancha; entre los cuerpos evolucionan mariposas, avispas, moscas gordas.`
},


      {
        id: "q2",
        text: "La primera oración del texto anterior: “El sargento echaba una ojeada a la Madre Patrocinio y el moscardón sigue allí” es:",
        options: ["Simple", "Compuesta yuxtapuesta", "Compuesta coordinada copulativa", "Compuesta coordinada disyuntiva", "Compuesta coordinada adversativa"],
        correctAnswer: 2,
        solutionText: 'La oración "El sargento echaba una ojeada a la Madre Patrocinio y el moscardón sigue allí" es compuesta porque tiene dos verbos conjugados: echaba y sigue. Está formada por dos proposiciones unidas por el nexo "y". El nexo "y" es una conjunción coordinante copulativa, ya que su función es sumar o añadir información.',
      },
      {
        id: "q3",
        text: `En el mismo texto "guardias" funciona sintácticamente como:
"Ovillados bajo el pamacari, desnudos de la cintura para arriba, los guardias duermen abrigados por el verdoso, amarillento sol del mediodía"`,
        options: ["Núcleo del sujeto", "Complemento directo", "Objeto indirecto", "Complemento agente", "Circunstancial"],
        correctAnswer: 0,
        solutionText: 'En la oración "...los guardias duermen...", realizamos la pregunta al verbo: ¿Quiénes duermen? La respuesta es "los guardias". Por lo tanto, "los guardias" es el sujeto de la oración. La palabra más importante dentro del sujeto, el sustantivo, es "guardias", que funciona como el núcleo del sujeto.',
        },
    ],
  },
  "w1-leccion2": {
    id: "w1-leccion2",
    title: "SUSTANTIVO",
    description: " ",
    completedAttempts: 1,
    bestScore: 9,
    totalQuestions: 10,
    questions: [
      {
        id: "q4",
        text: 'En la última proposición del texto, “Una sombrilla de jejenes escolta la lancha; entre los cuerpos evolucionan mariposas, avispas, moscas gordas". se observa una sucesión de:',
        options: ["Sustantivos", "Adjetivos", "Proposiciones", "Verbos", "Adverbios"],
        correctAnswer: 0,
        solutionText: 'La última parte de la oración es "...evolucionan mariposas, avispas, moscas gordas". Las palabras "mariposas", "avispas" y "moscas" son sustantivos, ya que nombran a seres (en este caso, insectos). Forman una enumeración de sustantivos.',
      },
      {
        id: "q5",
        text: 'En la última oración "la lancha" actúa como:                                                                                          “Una sombrilla de jejenes escolta la lancha; entre los cuerpos evolucionan mariposas, avispas, moscas gordas"',
        options: ["Circunstancial", "Complemento directo", "Complemento indirecto", "Predicativo", "Modificador Directo"],
        correctAnswer: 1,
        solutionText: 'La oración es "Una sombrilla de jejenes escolta la lancha". Para identificar el complemento directo (CD), preguntamos al verbo: ¿Qué escolta la sombrilla de jejenes? La respuesta es "la lancha". Además, podemos reemplazarlo por el pronombre "la": "Una sombrilla de jejenes la escolta". Esta sustitución confirma que es el CD. ',
      },
    ],
  },
  "w2-leccion1": {
    id: "w2-leccion1",
    title: "VERBO",
    description: " ",
    completedAttempts: 0,
    bestScore: 0,
    totalQuestions: 10,
    questions: [
      {
        id: "q6",
        text: 'En el siguiente texto: Cuando Raquel se lastimó el pie, Julio se asustó tanto que se desmayó y su hijita que se distraía en el parque corrió a ver a su padre para ayudarlo a levantarse. El número de verbos cuasirreflejos que encontramos es:',
        options: ["2", "3", "4", "5", "6"],
        correctAnswer: 2,
        solutionText: `Un verbo cuasirreflejo es aquel en el que el pronombre (me, te, se) no cumple una función sintáctica de objeto directo o indirecto, sino que es parte de la estructura del verbo, usualmente indicando un proceso o cambio en el sujeto. Los verbos son: se asustó: La acción de asustarse no recae sobre Julio como un objeto, sino que expresa un cambio de estado. se desmayó: Es una acción intransitiva, el pronombre es parte inherente del verbo. se distraía: Indica un proceso que ocurre en el sujeto. levantarse: El pronombre "se" indica que la acción de levantar la realiza el propio sujeto. El verbo "se lastimó el pie" se considera reflexivo, no cuasirreflejo`,

      },
      {
        id: "q7",
        text: `Presentan verbos auxiliares:
1. Ella ha besado con mucha pasión a Julio.
2. María fue a ver a sus notas a la Universidad.
3. El ladrón fue capturado por el policía.
4. Los profesores son explotados por el gobierno.
5. Hubo terribles lamentos.`,
        options: ["Todas", "1,3 y 4", "1,2 y 5", "2,3 y 4", "1 y 4"],
        correctAnswer: 1,
        solutionText: `Un verbo auxiliar ayuda a formar tiempos compuestos (haber + participio) o la voz pasiva (ser + participio). ha besado: "ha" es auxiliar del verbo haber. ✅      fue a ver: "fue" es el verbo principal (verbo ir), no un auxiliar. ❌     fue capturado: "fue" es auxiliar del verbo ser para formar la voz pasiva. ✅           son explotados: "son" es auxiliar del verbo ser para formar la voz pasiva. ✅           Hubo terribles lamentos: "hubo" es el verbo principal (impersonal). ❌`,
      },
    ],
  },
};

// Mock week sections with lessons
const mockWeekSections = [
  {
    week: 1,
    title: "Fundamentos de Comunicación",
    isUnlocked: true,
    lessons: [
      {
        id: "w1-leccion1",
        type: "leccion" as const,
        title: "SINTAXIS",
        description: " ",
        isCompleted: true,
        isLocked: false,
        isCurrent: false,
        exp: 50,
        completionRate: 80,
      },
      {
        id: "w1-leccion2",
        type: "leccion" as const,
        title: "SUSTANTIVO",
        description: " ",
        isCompleted: true,
        isLocked: false,
        isCurrent: false,
        exp: 75,
        completionRate: 90,
      },
    ],
  },
  {
    week: 2,
    title: "Ortografía y Redacción",
    isUnlocked: true,
    lessons: [
      {
        id: "w2-leccion1",
        type: "leccion" as const,
        title: "VERBO",
        description: " ",
        isCompleted: false,
        isLocked: false,
        isCurrent: true,
        exp: 50,
        completionRate: 0,
      },
      {
        id: "w2-leccion2",
        type: "leccion" as const,
        title: "Práctica de Redacción",
        description: "Ejercicios para mejorar tu escritura.",
        isCompleted: false,
        isLocked: true,
        isCurrent: false,
        exp: 75,
        completionRate: 0,
      },
    ],
  },
  {
    week: 3,
    title: "Análisis Textual",
    isUnlocked: false,
    lessons: [
      {
        id: "w3-leccion1",
        type: "leccion" as const,
        title: "Tipos de Texto",
        description: "Aprende a identificar diferentes tipos de textos.",
        isCompleted: false,
        isLocked: true,
        isCurrent: false,
        exp: 50,
        completionRate: 0,
      },
      {
        id: "w3-leccion2",
        type: "leccion" as const,
        title: "Análisis Práctico",
        description: "Ejercicios de análisis textual.",
        isCompleted: false,
        isLocked: true,
        isCurrent: false,
        exp: 75,
        completionRate: 0,
      },
    ],
  },
];

// Generate locked weeks 4-8
for (let w = 4; w <= 8; w++) {
  mockWeekSections.push({
    week: w,
    title: `Semana ${w}`,
    isUnlocked: false,
    lessons: [
      {
        id: `w${w}-leccion1`,
        type: "leccion" as const,
        title: "Lección 1",
        description: "Contenido teórico.",
        isCompleted: false,
        isLocked: true,
        isCurrent: false,
        exp: 50,
        completionRate: 0,
      },
      {
        id: `w${w}-leccion2`,
        type: "leccion" as const,
        title: "Lección 2",
        description: "Práctica interactiva.",
        isCompleted: false,
        isLocked: true,
        isCurrent: false,
        exp: 75,
        completionRate: 0,
      },
    ],
  });
}

// Mock rankings base (sin el usuario actual)
const mockRankingsBase = [
  { position: 1, name: "Ana Martínez ", exp: 2450, trend: "same" as const },
  { position: 2, name: "Luis García", exp: 2380, trend: "up" as const },
  { position: 3, name: "María Fernández", exp: 2310, trend: "down" as const },
  { position: 5, name: "Pedro Sánchez", exp: 2180, trend: "down" as const },
  { position: 6, name: "Laura Díaz", exp: 2100, trend: "up" as const },
  { position: 7, name: "Jorge Ruiz", exp: 2050, trend: "same" as const },
  { position: 8, name: "Carmen López", exp: 1980, trend: "down" as const },
];

interface User {
  code: string;
  name: string;
  role: string;
  area?: string;
}

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<"path" | "ranking" | "profile" | "notifications">("path");
  const [selectedCourse, setSelectedCourse] = useState("comunicacion");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Reset scroll to top cuando cambia de tab
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);
  
  // Quiz modal state
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [currentLesson, setCurrentLesson] = useState<typeof mockLessons["w1-leccion1"] | null>(null);
  const [lessonAttempts, setLessonAttempts] = useState<Record<string, number>>({
    "w1-leccion1": 2,
    "w1-leccion2": 1,
  });

  // Gamification stats (removed lives)
  const [stats, setStats] = useState({
    currentStreak: 25,
    gems: 5000,
  });

  // Calculate overall progress
  const overallProgress = useMemo(() => {
    const totalLessons = mockWeekSections.reduce((total, week) => total + week.lessons.length, 0);
    const completedLessons = mockWeekSections.reduce((completed, week) => {
      return completed + week.lessons.filter(lesson => lesson.isCompleted).length;
    }, 0);
    
    return Math.round((completedLessons / totalLessons) * 100);
  }, []);

  // Calculate dinosaur progress based on EXP
  // 0-1249 EXP = 0-24% (egg), 1250-2499 = 25-49% (cracking), 
  // 2500-3749 = 50-74% (hatching), 3750-5000 = 75-100% (grown)
  const dinosaurProgress = useMemo(() => {
    const exp = stats.gems;
    if (exp < 1250) {
      // 0-1249 EXP = 0-24% (never reaches 25)
      return Math.floor((exp / 1250) * 25);
    } else if (exp < 2500) {
      // 1250-2499 EXP = 25-49% (never reaches 50)
      return 25 + Math.floor(((exp - 1250) / 1250) * 25);
    } else if (exp < 3750) {
      // 2500-3749 EXP = 50-74% (never reaches 75)
      return 50 + Math.floor(((exp - 2500) / 1250) * 25);
    } else {
      // 3750-5000 EXP = 75-100%
      return Math.min(75 + Math.floor(((exp - 3750) / 1250) * 25), 100);
    }
  }, [stats.gems]);

  // Calculate dinosaur stage from progress
  const dinoStage = useMemo(() => {
    if (dinosaurProgress < 25) return 'egg';
    if (dinosaurProgress < 50) return 'cracking';
    if (dinosaurProgress < 75) return 'hatching';
    return 'grown';
  }, [dinosaurProgress]);

  const totalLessons = useMemo(() => {
    return mockWeekSections.reduce((total, week) => total + week.lessons.length, 0);
  }, []);

  const completedLessons = useMemo(() => {
    return mockWeekSections.reduce((completed, week) => {
      return completed + week.lessons.filter(lesson => lesson.isCompleted).length;
    }, 0);
  }, []);

  // Calcular ranking dinámico con EXP real del usuario
  const { rankings: mockRankings, userPosition } = useMemo(() => {
    if (!user) {
      return { rankings: mockRankingsBase, userPosition: 4 };
    }

    // Crear entrada del usuario actual con EXP real
    const currentUserEntry = {
      name: user.name,
      exp: stats.gems, // EXP real del estado
      isCurrentUser: true as const,
      trend: "up" as const,
    };

    // Combinar usuario actual con otros rankings
    const allRankings = [...mockRankingsBase, currentUserEntry];

    // Ordenar por EXP descendente
    allRankings.sort((a, b) => b.exp - a.exp);

    // Asignar posiciones
    const rankedList = allRankings.map((entry, index) => ({
      ...entry,
      position: index + 1,
    }));

    // Encontrar posición del usuario (buscar el que tenga isCurrentUser = true)
    const userPos = rankedList.findIndex(entry => 'isCurrentUser' in entry && entry.isCurrentUser) + 1;

    return { rankings: rankedList, userPosition: userPos };
  }, [user, stats.gems]);

  useEffect(() => {
    const userData = sessionStorage.getItem("currentUser");
    if (!userData) {
      navigate("/login");
      return;
    }
    setUser(JSON.parse(userData));
  }, [navigate]);

  const handleNodeClick = (nodeId: string, weekNumber: number) => {
    const lesson = mockLessons[nodeId];
    if (lesson) {
      setCurrentLesson(lesson);
      setIsQuizOpen(true);
    } else {
      toast({
        title: "Lección no disponible",
        description: "Esta lección aún no tiene contenido asignado.",
      });
    }
  };

  const handleQuizComplete = (score: number, isFirstAttempt: boolean) => {
    if (currentLesson) {
      // Update attempts count
      setLessonAttempts(prev => ({
        ...prev,
        [currentLesson.id]: (prev[currentLesson.id] || 0) + 1,
      }));

      // Only add points on first attempt
      if (isFirstAttempt) {
        const points = score * 10;
        setStats(prev => ({
          ...prev,
          gems: prev.gems + points,
        }));
        toast({
          title: "¡Quiz completado!",
          description: `Has ganado ${points} puntos para el ranking.`,
        });
      } else {
        toast({
          title: "Quiz completado",
          description: "Este intento no suma puntos al ranking.",
        });
      }
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("currentUser");
    navigate("/login");
  };

  // Filter path based on search
  const filteredWeeks = useMemo(() => {
    if (!searchQuery.trim()) return mockWeekSections;
    
    return mockWeekSections.map(week => ({
      ...week,
      lessons: week.lessons.filter(lesson => 
        lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lesson.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })).filter(week => week.lessons.length > 0);
  }, [searchQuery]);

  // Check if course is enabled (only Comunicación for pilot)
  const isCourseEnabled = selectedCourse === "comunicacion";

  if (!user) return null;

  const renderContent = () => {
    if (!isCourseEnabled) {
      return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
          <Construction className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Curso Bloqueado
          </h2>
          <p className="text-muted-foreground max-w-md">
            Este curso será habilitado por el administrador próximamente.
            Por ahora, continúa con el curso de Comunicación.
          </p>
        </div>
      );
    }

    switch (activeTab) {
      case "path":
        return (
          <div className="pb-24 lg:pb-8 px-4 max-w-7xl mx-auto">
            {/* Overall Progress Character - Show on top of path */}
            <div className="flex justify-center items-center py-4 w-full">
              <div className="text-center">
                <div className="mb-1">
                  <DinoMascot
                    stage={dinoStage}
                    size="lg"
                  />
                </div>
                <div className="text-sm font-medium text-muted-foreground">
                  Crecimiento del dinosaurio: {Math.round(dinosaurProgress)}% ({stats.gems} EXP)
                </div>
              </div>
            </div>
            
            <LearningPath
              weeks={filteredWeeks}
              currentWeek={2}
              onNodeClick={handleNodeClick}
            />
          </div>
        );
      
      case "ranking":
        return (
          <div className="pb-24 lg:pb-8">
            <RankingTab
              rankings={mockRankings}
              userPosition={userPosition}
              userPreviousPosition={6}
              totalStudents={45}
            />
          </div>
        );
      
      case "profile":
        return (
          <div className="pb-24 lg:pb-8 px-4">
            <StudentProgressProfile
              userName={user.name.split(" ")[0]}
              overallProgress={overallProgress}
              dinosaurProgress={dinosaurProgress}
              completedLessons={completedLessons}
              totalLessons={totalLessons}
              currentStreak={stats.currentStreak}
              totalExp={stats.gems}
              weeklyGoal={75}
              userCode={user.code}
              userArea={user.area}
            />
          </div>
        );
      
      case "notifications":
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
            <Construction className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Próximamente
            </h2>
            <p className="text-muted-foreground max-w-md">
              Esta sección estará disponible en las siguientes actualizaciones. 
              ¡Mantente atento!
            </p>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-secondary">
      {/* Gamified Status Bar (without lives) */}
      <GamifiedStatusBar
        userName={user.name}
        userCode={user.code}
        currentStreak={stats.currentStreak}
        gems={stats.gems}
        selectedCourse={selectedCourse}
        onCourseChange={setSelectedCourse}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        onLogout={handleLogout}
      />

      {/* Desktop Navigation Tabs - Fixed siempre visible debajo del GamifiedStatusBar */}
      <div className="hidden lg:flex items-center justify-center gap-2 py-4 bg-card/95 backdrop-blur-sm border-b border-border fixed top-[88px] left-0 right-0 z-40 shadow-sm">
        {[
          { id: "path" as const, label: "El Camino" },
          { id: "ranking" as const, label: "Ranking" },
          { id: "profile" as const, label: "Mi Perfil" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 rounded-2xl font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-primary text-primary-foreground shadow-lg"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content - con padding-top para compensar ambos headers fixed */}
      <main className="min-h-[calc(100vh-8rem)] lg:pt-[156px]">
        {renderContent()}
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        notificationCount={3}
      />

      {/* Quiz Modal */}
      {currentLesson && (
        <QuizModal
          isOpen={isQuizOpen}
          onClose={() => {
            setIsQuizOpen(false);
            setCurrentLesson(null);
          }}
          lessonTitle={currentLesson.title}
          questions={currentLesson.questions}
          onComplete={handleQuizComplete}
          isFirstAttempt={(lessonAttempts[currentLesson.id] || 0) === 0}
          timePerQuestion={180}
        />
      )}
    </div>
  );
};

export default StudentDashboard;
