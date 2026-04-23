"use client";

import * as React from "react";
import {
  BookOpen,
  Bot,
  Brain,
  CalendarDays,
  ChevronDown,
  Flame,
  Gamepad2,
  History,
  Lightbulb,
  Moon,
  Sparkles,
  Star,
  StarOff,
  Sun,
  Target,
  Crown,
  Rocket,
  Zap
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "./components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./components/ui/dialog";
import { useTheme } from "./src/theme-provider";

type TabId = "quiz" | "learn" | "history";
type DifficultyId = "easy" | "medium" | "hard";
type FeedbackState = "idle" | "correct" | "incorrect";

type QuizQuestion = {
  left: number;
  right: number;
  answer: number;
};

type QuizResult = {
  date: string;
  difficulty: DifficultyId;
  score: number;
  total: number;
  badges: string[];
};

type DivProps = React.HTMLAttributes<HTMLDivElement>;

function Card({ className = "", ...props }: DivProps) {
  return (
    <div
      className={`rounded-3xl border border-slate-200/80 bg-white/90 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 ${className}`}
      {...props}
    />
  );
}

function CardHeader({ className = "", ...props }: DivProps) {
  return <div className={`p-5 sm:p-6 ${className}`} {...props} />;
}

function CardTitle({ className = "", ...props }: DivProps) {
  return <h2 className={`text-lg font-semibold tracking-tight sm:text-xl ${className}`} {...props} />;
}

function CardContent({ className = "", ...props }: DivProps) {
  return <div className={`px-5 pb-5 pt-0 sm:px-6 sm:pb-6 ${className}`} {...props} />;
}

const NAV_ITEMS: Array<{ id: TabId; labelKey: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: "quiz", labelKey: "nav.quiz", icon: Gamepad2 },
  { id: "learn", labelKey: "nav.learn", icon: BookOpen },
  { id: "history", labelKey: "nav.history", icon: History }
];

const QUIZ_LEVELS: Array<{ id: DifficultyId; count: number; min: number; max: number }> = [
  { id: "easy", count: 10, min: 1, max: 5 },
  { id: "medium", count: 20, min: 2, max: 9 },
  { id: "hard", count: 30, min: 2, max: 12 }
];

const HISTORY_KEY = "multiplication-quiz-history-v2";
const DAILY_FACT_SESSION_KEY = "hasSeenFact";

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createQuizQuestions(level: { count: number; min: number; max: number }) {
  return Array.from({ length: level.count }, () => {
    const left = randomInt(level.min, level.max);
    const right = randomInt(level.min, level.max);
    return { left, right, answer: left * right };
  });
}

function useQuizHistory() {
  const [history, setHistory] = React.useState<QuizResult[]>([]);

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(HISTORY_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as QuizResult[];
      if (Array.isArray(parsed)) {
        setHistory(parsed);
      }
    } catch {
      setHistory([]);
    }
  }, []);

  const addResult = React.useCallback((result: Omit<QuizResult, "date">) => {
    setHistory((prev) => {
      const next = [{ ...result, date: new Date().toISOString() }, ...prev].slice(0, 30);
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearHistory = React.useCallback(() => {
    setHistory([]);
    window.localStorage.removeItem(HISTORY_KEY);
  }, []);

  return { history, addResult, clearHistory };
}

function ThemeToggleButton() {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={toggleTheme}
      aria-label={t("settings.theme")}
      className="relative h-10 min-w-[40px] rounded-full border border-slate-300/80 bg-white/70 p-0 dark:border-slate-700 dark:bg-slate-900/80"
    >
      <Sun
        className={`absolute h-5 w-5 text-amber-500 transition-all duration-300 ${isDark ? "scale-0 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"}`}
      />
      <Moon
        className={`absolute h-5 w-5 text-cyan-400 transition-all duration-300 ${isDark ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0"}`}
      />
      <span className="sr-only">{t("settings.theme")}</span>
    </Button>
  );
}

function LanguageMenu() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const current = i18n.language === "ka" ? "ka" : "en";

  React.useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const setLanguage = React.useCallback(
    async (lang: "en" | "ka") => {
      await i18n.changeLanguage(lang);
      setOpen(false);
    },
    [i18n]
  );

  return (
    <div ref={containerRef} className="relative">
      <Button
        type="button"
        variant="outline"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="h-10 min-w-[112px] rounded-full border-slate-300/80 bg-white/70 px-3 text-xs dark:border-slate-700 dark:bg-slate-900/80 sm:text-sm"
      >
        <span className="mr-1">{current.toUpperCase()}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </Button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-40 rounded-2xl border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-800 dark:bg-slate-900">
          <button
            type="button"
            onClick={() => void setLanguage("en")}
            className={`flex h-10 w-full items-center rounded-xl px-3 text-left text-sm transition-all active:scale-95 ${current === "en" ? "bg-emerald-500 text-white" : "hover:bg-slate-100 dark:hover:bg-slate-800"}`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => void setLanguage("ka")}
            className={`flex h-10 w-full items-center rounded-xl px-3 text-left text-sm transition-all active:scale-95 ${current === "ka" ? "bg-emerald-500 text-white" : "hover:bg-slate-100 dark:hover:bg-slate-800"}`}
          >
            KA
          </button>
        </div>
      )}
    </div>
  );
}

function QuizView({ onComplete }: { onComplete: (result: Omit<QuizResult, "date">) => void }) {
  const { t } = useTranslation();
  const [difficulty, setDifficulty] = React.useState<DifficultyId>("easy");
  const [started, setStarted] = React.useState(false);
  const [finished, setFinished] = React.useState(false);
  const [questions, setQuestions] = React.useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [answerInput, setAnswerInput] = React.useState("");
  const [correctCount, setCorrectCount] = React.useState(0);
  const [feedback, setFeedback] = React.useState<FeedbackState>("idle");
  const [streak, setStreak] = React.useState(0);
  const [showHint, setShowHint] = React.useState(false);
  const [milestonePopup, setMilestonePopup] = React.useState<string | null>(null);
  const [mascotMood, setMascotMood] = React.useState<"idle" | "happy" | "supportive">("idle");
  const [mascotText, setMascotText] = React.useState("");

  const inputRef = React.useRef<HTMLInputElement>(null);

  const currentLevel = React.useMemo(
    () => QUIZ_LEVELS.find((level) => level.id === difficulty) ?? QUIZ_LEVELS[0],
    [difficulty]
  );
  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length || currentLevel.count;

  React.useEffect(() => {
    if (started && !finished) {
      inputRef.current?.focus();
    }
  }, [currentIndex, finished, started]);

  const startQuiz = React.useCallback(() => {
    const generated = createQuizQuestions(currentLevel);
    setQuestions(generated);
    setCurrentIndex(0);
    setCorrectCount(0);
    setAnswerInput("");
    setFeedback("idle");
    setStreak(0);
    setShowHint(false);
    setMilestonePopup(null);
    setMascotMood("idle");
    setMascotText("");
    setFinished(false);
    setStarted(true);
  }, [currentLevel]);

  const submitAnswer = React.useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      if (!currentQuestion) return;

      const value = Number(answerInput);
      if (!Number.isFinite(value)) return;

      const isCorrect = value === currentQuestion.answer;
      const nextCorrectCount = isCorrect ? correctCount + 1 : correctCount;
      setFeedback(isCorrect ? "correct" : "incorrect");
      if (isCorrect) {
        setCorrectCount((prev) => prev + 1);
        setMascotMood("happy");
        setMascotText(t("quiz.mascotCorrect"));
        setStreak((prev) => {
          const next = prev + 1;
          if ([3, 5, 10].includes(next)) {
            setMilestonePopup(t("quiz.streakFire"));
          }
          return next;
        });
      } else {
        const encouragements = [t("quiz.mascotIncorrect")];
        const randomPhrase = encouragements[randomInt(0, encouragements.length - 1)];
        setMascotMood("supportive");
        setMascotText(randomPhrase);
        setStreak(0);
      }

      window.setTimeout(() => {
        const isLast = currentIndex >= questions.length - 1;
        if (isLast) {
          setFinished(true);
          const earnedBadges: string[] = [];
          const isPerfect = nextCorrectCount === questions.length;
          if (isPerfect) {
            earnedBadges.push("perfectScore");
            if (difficulty === "easy") earnedBadges.push("easyMaster");
            if (difficulty === "medium") earnedBadges.push("mediumMaster");
            if (difficulty === "hard") earnedBadges.push("hardMaster");
          }
          onComplete({ difficulty, score: nextCorrectCount, total: questions.length, badges: earnedBadges });
          return;
        }
        setCurrentIndex((prev) => prev + 1);
        setAnswerInput("");
        setFeedback("idle");
        setShowHint(false);
        setMascotMood("idle");
      }, 380);
      window.setTimeout(() => {
        setMilestonePopup(null);
      }, 1400);
    },
    [answerInput, correctCount, currentIndex, currentQuestion, difficulty, onComplete, questions.length, streak, t]
  );

  return (
    <section className="space-y-6">
      <Card className="overflow-hidden">
        <CardContent className="pt-5 sm:pt-6">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {QUIZ_LEVELS.map((item) => (
              <Button
                key={item.id}
                type="button"
                variant={difficulty === item.id ? "default" : "outline"}
                onClick={() => setDifficulty(item.id)}
                className="h-14 min-w-[132px] justify-start rounded-2xl px-4 text-left text-sm"
              >
                {t(`quiz.${item.id}`)}
              </Button>
            ))}
          </div>
          <div className="mt-3">
            <Button type="button" onClick={startQuiz} className="h-12 min-w-[140px] rounded-2xl px-6">
              {t("quiz.start")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-5 pt-5 sm:pt-6">
          <div className="space-y-2">
            <div className="flex min-h-[24px] items-center justify-between text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
              <span>
                {t("quiz.question")}: {started ? currentIndex + 1 : 0}/{totalQuestions}
              </span>
              <div className="flex items-center gap-2">
                <span className="min-w-[92px] text-right">
                  {t("quiz.score")}: {correctCount}/{started ? currentIndex : 0}
                </span>
                {streak >= 3 && (
                  <span className="fire-badge inline-flex min-w-[96px] items-center justify-center gap-1 rounded-full bg-orange-500/90 px-2 py-1 text-[11px] font-semibold text-white">
                    <Flame className="h-3.5 w-3.5" />
                    On Fire!
                  </span>
                )}
                <span className="min-w-[84px] text-right">{t(`quiz.${difficulty}`)}</span>
              </div>
            </div>
            <div className="min-h-[28px]">
              {milestonePopup && (
                <div className="streak-pop inline-flex items-center gap-2 rounded-full bg-orange-500/90 px-3 py-1 text-xs font-semibold text-white">
                  <Flame className="h-4 w-4" />
                  {milestonePopup}
                </div>
              )}
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <progress
                value={started ? currentIndex + 1 : 0}
                max={totalQuestions}
                className="quiz-progress h-2 w-full overflow-hidden rounded-full"
              />
            </div>
          </div>

          <Card
            className={[
              "min-h-[172px] bg-slate-50/80 dark:bg-slate-950/40",
              feedback === "correct" ? "quiz-correct-glow border-emerald-300/50 dark:border-emerald-900/50" : "",
              feedback === "incorrect" ? "quiz-incorrect-shake border-red-300/60 bg-red-50/60 dark:border-red-900/50 dark:bg-red-950/20" : ""
            ].join(" ")}
          >
            <CardContent className="flex min-h-[172px] items-center justify-center">
              <div className="flex items-center gap-3">
                <p className="text-center text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  {started && currentQuestion ? `${currentQuestion.left} x ${currentQuestion.right} = ?` : "— x — = ?"}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowHint((prev) => !prev)}
                  disabled={!started || finished || !currentQuestion}
                  className="h-10 min-w-[40px] rounded-full p-0"
                  aria-label="Toggle visual hint"
                >
                  <Lightbulb className={`h-5 w-5 ${showHint ? "text-amber-500" : ""}`} />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardContent className="flex min-h-[64px] items-center gap-3 pt-5">
              <div
                className={[
                  "inline-flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300",
                  mascotMood === "happy" ? "mascot-bounce" : "",
                  mascotMood === "supportive" ? "mascot-wiggle" : ""
                ].join(" ")}
              >
                <Bot className="h-5 w-5" />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {mascotText || t("quiz.mascotCorrect")}
              </p>
            </CardContent>
          </Card>

          <div className="min-h-[120px]">
            {showHint && started && currentQuestion ? (
              <div className="hint-pop rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3 dark:border-emerald-900/50 dark:bg-emerald-950/20">
                <div className="inline-grid gap-1.5">
                  {Array.from({ length: currentQuestion.left }, (_, rowIdx) => (
                    <div key={`hint-row-${rowIdx}`} className="flex gap-1.5">
                      {Array.from({ length: currentQuestion.right }, (_, colIdx) => (
                        <Star
                          key={`hint-icon-${rowIdx}-${colIdx}`}
                          className="h-4 w-4 fill-emerald-400 text-emerald-500 dark:fill-emerald-500/70 dark:text-emerald-400"
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div />
            )}
          </div>

          <form onSubmit={submitAnswer} className="space-y-3">
            <label className="block text-center text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
              {t("quiz.question")}
            </label>
            <input
              ref={inputRef}
              type="number"
              inputMode="numeric"
              placeholder={t("quiz.placeholder")}
              value={answerInput}
              onChange={(event) => setAnswerInput(event.target.value)}
              className="mx-auto block h-16 w-full max-w-sm min-w-[220px] rounded-2xl border-0 bg-slate-100 px-4 text-center text-4xl font-semibold text-slate-900 outline-none ring-2 ring-transparent transition-all focus-visible:ring-emerald-500 dark:bg-slate-800 dark:text-white"
              disabled={!started || finished}
            />
            <Button type="submit" className="h-12 min-w-[140px] rounded-2xl px-6" disabled={!started || finished}>
              {t("quiz.submit")}
            </Button>
            <p className="min-h-[24px] text-sm font-medium">
              {finished
                ? `${t("quiz.gameOver")} ${t("quiz.score")}: ${correctCount}/${totalQuestions}`
                : feedback === "correct"
                  ? t("quiz.mascotCorrect")
                  : feedback === "incorrect"
                    ? t("quiz.mascotIncorrect")
                    : "\u00a0"}
            </p>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}

function LearnView() {
  const { t } = useTranslation();
  const [activeCell, setActiveCell] = React.useState<{ row: number; col: number } | null>(null);
  const numbers = React.useMemo(() => Array.from({ length: 10 }, (_, idx) => idx + 1), []);

  return (
    <section className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("learn.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">{t("learn.hoverHint")}</p>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
            <div className="grid min-w-[628px] grid-cols-11 gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-300 text-xs font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                x
              </div>
              {numbers.map((n) => (
                <div
                  key={`h-${n}`}
                  className={[
                    "flex h-12 w-12 items-center justify-center rounded-xl text-xs font-semibold transition-colors",
                    activeCell?.col === n
                      ? "bg-emerald-200 text-slate-900 dark:bg-emerald-900/50 dark:text-slate-100"
                      : "bg-slate-300 text-slate-700 dark:bg-slate-700 dark:text-slate-200"
                  ].join(" ")}
                >
                  {n}
                </div>
              ))}
              {numbers.map((row) => (
                <React.Fragment key={`r-${row}`}>
                  <div
                    className={[
                      "flex h-12 w-12 items-center justify-center rounded-xl text-xs font-semibold transition-colors",
                      activeCell?.row === row
                        ? "bg-emerald-200 text-slate-900 dark:bg-emerald-900/50 dark:text-slate-100"
                        : "bg-slate-300 text-slate-700 dark:bg-slate-700 dark:text-slate-200"
                    ].join(" ")}
                  >
                    {row}
                  </div>
                  {numbers.map((col) => (
                    <button
                      key={`${row}-${col}`}
                      type="button"
                      onMouseEnter={() => setActiveCell({ row, col })}
                      onFocus={() => setActiveCell({ row, col })}
                      onClick={() => setActiveCell({ row, col })}
                      className={[
                        "h-12 w-12 rounded-xl border text-xs font-medium transition-colors",
                        activeCell?.row === row && activeCell?.col === col
                          ? "border-emerald-400 bg-emerald-300/70 text-slate-900 dark:border-emerald-500 dark:bg-emerald-700/50 dark:text-slate-100"
                          : activeCell?.row === row || activeCell?.col === col
                            ? "border-emerald-200 bg-emerald-100/80 text-slate-900 dark:border-emerald-900 dark:bg-emerald-950/35 dark:text-slate-100"
                            : "border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                      ].join(" ")}
                      aria-label={`${row} x ${col} = ${row * col}`}
                    >
                      {row * col}
                    </button>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      <SmartHints />
    </section>
  );
}

function SmartHints() {
  const { t } = useTranslation();
  const hints = (t("smartHints.hints", { returnObjects: true }) as Array<{
    icon: "zap" | "brain" | "target" | "sparkles" | "lightbulb";
    title: string;
    description: string;
  }>) ?? [];

  const iconMap = {
    zap: Zap,
    brain: Brain,
    target: Target,
    sparkles: Sparkles,
    lightbulb: Lightbulb
  } as const;

  const tintClasses = [
    "bg-amber-50/90 border-amber-200/80 dark:bg-amber-950/20 dark:border-amber-900/40",
    "bg-sky-50/90 border-sky-200/80 dark:bg-sky-950/20 dark:border-sky-900/40",
    "bg-emerald-50/90 border-emerald-200/80 dark:bg-emerald-950/20 dark:border-emerald-900/40",
    "bg-violet-50/90 border-violet-200/80 dark:bg-violet-950/20 dark:border-violet-900/40"
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("smartHints.sectionTitle")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {hints.map((hint, index) => {
            const Icon = iconMap[hint.icon] ?? Sparkles;
            return (
              <Card
                key={`${hint.title}-${index}`}
                className={[
                  "min-h-[150px] rounded-2xl border transition-all hover:-translate-y-1 hover:shadow-md",
                  tintClasses[index % tintClasses.length]
                ].join(" ")}
              >
                <CardContent className="pt-5">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 shrink-0 text-slate-700 dark:text-slate-200" />
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 sm:text-base">
                      {hint.title}
                    </h4>
                  </div>
                  <p className="mt-3 min-h-[64px] text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                    {hint.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function HistoryView({ history, onClear }: { history: QuizResult[]; onClear: () => void }) {
  const { t } = useTranslation();
  const allBadges = React.useMemo(() => {
    const unique = new Set<string>();
    for (const item of history) {
      for (const badge of item.badges ?? []) unique.add(badge);
    }
    return Array.from(unique);
  }, [history]);

  const badgeStyleMap: Record<string, string> = {
    perfectScore:
      "border-violet-300/70 bg-gradient-to-br from-violet-100 via-fuchsia-100 to-pink-100 dark:border-violet-800/60 dark:from-violet-900/30 dark:via-fuchsia-900/25 dark:to-pink-900/20",
    easyMaster:
      "border-amber-300/70 bg-gradient-to-br from-amber-100 via-orange-100 to-yellow-100 dark:border-amber-800/60 dark:from-amber-900/30 dark:via-orange-900/20 dark:to-yellow-900/20",
    mediumMaster:
      "border-slate-300/70 bg-gradient-to-br from-slate-100 via-zinc-100 to-gray-100 dark:border-slate-700/60 dark:from-slate-800/50 dark:via-zinc-800/40 dark:to-gray-800/40",
    hardMaster:
      "border-sky-300/70 bg-gradient-to-br from-sky-100 via-cyan-100 to-blue-100 dark:border-sky-800/60 dark:from-sky-900/30 dark:via-cyan-900/20 dark:to-blue-900/20"
  };
  const badgeIconMap = {
    easyMaster: Zap,
    mediumMaster: Brain,
    hardMaster: Crown,
    perfectScore: Rocket
  } as const;

  return (
    <section className="space-y-8">
      <Card className="award-glow min-h-[220px]">
        <CardHeader>
          <CardTitle>{t("history.awardsTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          {allBadges.length === 0 ? (
            <div className="flex min-h-[140px] items-center gap-3 rounded-2xl border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
              <StarOff className="h-8 w-8 shrink-0 opacity-55" />
              <p>{t("history.noAwards")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {allBadges.map((badge) => {
                const BadgeIcon = badgeIconMap[badge as keyof typeof badgeIconMap] ?? Sparkles;
                return (
                <div
                  key={badge}
                  className={[
                    "award-card flex min-h-[96px] items-center gap-3 rounded-2xl border px-4 py-3 transition-all hover:scale-105",
                    badgeStyleMap[badge] ??
                      "border-slate-300/70 bg-gradient-to-br from-slate-100 via-zinc-100 to-gray-100 dark:border-slate-700/60 dark:from-slate-800/50 dark:via-zinc-800/40 dark:to-gray-800/40"
                  ].join(" ")}
                >
                  <BadgeIcon className="h-5 w-5 text-amber-500" />
                  <span className="font-semibold text-slate-800 dark:text-slate-100">
                    {t(`history.badges.${badge}`)}
                  </span>
                </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="min-h-[300px]">
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle>{t("history.pastGames")}</CardTitle>
            <Button type="button" variant="outline" className="h-10 min-w-[140px] rounded-2xl" onClick={onClear}>
              {t("history.clear")}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {history.length === 0 ? (
            <div className="flex min-h-[140px] items-center gap-3 rounded-2xl border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
              <History className="h-8 w-8 shrink-0 opacity-55" />
              <p>{t("history.noGames")}</p>
            </div>
          ) : (
            history.map((item, idx) => (
              <div
                key={`${item.date}-${idx}`}
                className="grid min-h-[72px] grid-cols-1 gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm sm:grid-cols-3 sm:items-center dark:border-slate-800"
              >
                <span className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <CalendarDays className="h-4 w-4" />
                  {t("history.date")}: {new Date(item.date).toLocaleDateString()}
                </span>
                <span className="text-slate-700 dark:text-slate-200">
                  {t("history.difficulty")}: {t(`quiz.${item.difficulty}`)}
                </span>
                <span
                  className={`font-semibold ${
                    (item.score / item.total) * 100 > 80
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-slate-700 dark:text-slate-200"
                  }`}
                >
                  {t("quiz.score")}: {item.score}/{item.total}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </section>
  );
}

export default function MultiplicationTableLayout() {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = React.useState<TabId>("quiz");
  const { history, addResult, clearHistory } = useQuizHistory();
  const [dailyFactOpen, setDailyFactOpen] = React.useState(false);
  const [dailyFact, setDailyFact] = React.useState("");

  React.useEffect(() => {
    const hasSeenFact = window.sessionStorage.getItem(DAILY_FACT_SESSION_KEY);
    if (hasSeenFact) return;

    const facts = t("funFacts", { returnObjects: true }) as string[];
    if (!Array.isArray(facts) || facts.length === 0) return;

    const randomFact = facts[randomInt(0, facts.length - 1)];
    setDailyFact(randomFact);
    setDailyFactOpen(true);
    window.sessionStorage.setItem(DAILY_FACT_SESSION_KEY, "1");
  }, [t]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-40 h-16 border-b border-slate-200/80 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/85">
        <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between px-3 sm:px-4">
          <div className="min-w-[180px]">
            <h1 className="truncate text-base font-semibold sm:text-lg">{t("quiz.title")}</h1>
            <p className="hidden text-xs text-slate-500 dark:text-slate-400 sm:block">{t("learn.title")}</p>
          </div>
          <div className="flex items-center gap-2">
            <LanguageMenu />
            <ThemeToggleButton />
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl gap-4 px-3 pb-24 pt-4 sm:px-4 md:pb-6">
        <aside className="sticky top-20 hidden h-fit w-60 shrink-0 rounded-3xl border border-slate-200/80 bg-white/80 p-2 dark:border-slate-800 dark:bg-slate-900/70 md:block">
          <nav aria-label="Primary navigation">
            <ul className="space-y-1">
              {NAV_ITEMS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <li key={tab.id}>
                    <Button
                      type="button"
                      variant={isActive ? "default" : "ghost"}
                      onClick={() => setActiveTab(tab.id)}
                      className="h-12 w-full min-w-[210px] justify-start gap-3 rounded-2xl px-4 text-sm"
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{t(tab.labelKey)}</span>
                    </Button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        <main className="w-full min-w-0">
          <Card className="min-h-[620px]">
            <CardHeader>
              <CardTitle className="min-h-[32px]">
                {activeTab === "quiz" && t("quiz.title")}
                {activeTab === "learn" && t("learn.title")}
                {activeTab === "history" && t("history.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeTab === "quiz" && <QuizView onComplete={addResult} />}
              {activeTab === "learn" && <LearnView />}
              {activeTab === "history" && <HistoryView history={history} onClear={clearHistory} />}
            </CardContent>
          </Card>
        </main>
      </div>

      <nav
        aria-label="Primary navigation"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200/80 bg-white/95 p-2 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 md:hidden"
      >
        <ul className="grid grid-cols-3 gap-2">
          {NAV_ITEMS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <li key={tab.id}>
                <Button
                  type="button"
                  variant={isActive ? "default" : "ghost"}
                  onClick={() => setActiveTab(tab.id)}
                  className="h-12 w-full min-w-[98px] gap-2 rounded-2xl px-2 text-xs"
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{t(tab.labelKey)}</span>
                </Button>
              </li>
            );
          })}
        </ul>
      </nav>

      <Dialog open={dailyFactOpen} onOpenChange={setDailyFactOpen}>
        <DialogContent className="text-center">
          <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-500 shadow-[0_0_25px_rgba(251,191,36,0.45)] dark:bg-amber-900/30 dark:text-amber-300">
            <Lightbulb className="h-7 w-7" />
          </div>
          <DialogTitle>{i18n.language === "ka" ? "იცოდი რომ?" : "Did you know?"}</DialogTitle>
          <DialogDescription className="mt-3 text-lg leading-relaxed">{dailyFact}</DialogDescription>
          <Button
            type="button"
            onClick={() => setDailyFactOpen(false)}
            className="mt-6 h-12 min-w-[180px] rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-base font-semibold text-white"
          >
            {i18n.language === "ka" ? "წავედით!" : "Let's Go!"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
