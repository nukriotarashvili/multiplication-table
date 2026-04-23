"use client";

import * as React from "react";
import { BookOpen, Bot, ChevronDown, Flame, Gamepad2, History, Lightbulb, Moon, Sparkles, Star, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "./components/ui/button";
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
  { id: "quiz", labelKey: "tabs.quiz", icon: Gamepad2 },
  { id: "learn", labelKey: "tabs.learn", icon: BookOpen },
  { id: "history", labelKey: "tabs.history", icon: History }
];

const QUIZ_LEVELS: Array<{ id: DifficultyId; count: number; min: number; max: number }> = [
  { id: "easy", count: 10, min: 1, max: 5 },
  { id: "medium", count: 20, min: 2, max: 9 },
  { id: "hard", count: 30, min: 2, max: 12 }
];

const HISTORY_KEY = "multiplication-quiz-history-v2";

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
      aria-label={isDark ? t("theme.toLight") : t("theme.toDark")}
      className="relative h-10 min-w-[40px] rounded-full border border-slate-300/80 bg-white/70 p-0 dark:border-slate-700 dark:bg-slate-900/80"
    >
      <Sun
        className={`absolute h-5 w-5 text-amber-500 transition-all duration-300 ${isDark ? "scale-0 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"}`}
      />
      <Moon
        className={`absolute h-5 w-5 text-cyan-400 transition-all duration-300 ${isDark ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0"}`}
      />
      <span className="sr-only">{isDark ? t("theme.light") : t("theme.dark")}</span>
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
            {t("language.english")}
          </button>
          <button
            type="button"
            onClick={() => void setLanguage("ka")}
            className={`flex h-10 w-full items-center rounded-xl px-3 text-left text-sm transition-all active:scale-95 ${current === "ka" ? "bg-emerald-500 text-white" : "hover:bg-slate-100 dark:hover:bg-slate-800"}`}
          >
            {t("language.georgian")}
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
        setMascotText(t("quiz.mascot.great"));
        setStreak((prev) => {
          const next = prev + 1;
          if ([3, 5, 10].includes(next)) {
            setMilestonePopup(t("quiz.streakMilestone", { count: next }));
          }
          return next;
        });
      } else {
        const encouragements = [
          t("quiz.mascot.tryAgain"),
          t("quiz.mascot.youCanDoIt"),
          t("quiz.mascot.keepGoing"),
          t("quiz.mascot.almostThere")
        ];
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
            earnedBadges.push("perfect_score");
            if (difficulty === "easy") earnedBadges.push("easy_master");
            if (difficulty === "medium") earnedBadges.push("medium_master");
            if (difficulty === "hard") earnedBadges.push("hard_master");
          }
          if (streak >= 10 || [3, 5, 10].includes(streak)) {
            earnedBadges.push("streak_star");
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
                {t("quiz.difficultyRange", {
                  label: t(`quiz.difficulties.${item.id}`),
                  count: item.count,
                  min: item.min,
                  max: item.max
                })}
              </Button>
            ))}
          </div>
          <div className="mt-3">
            <Button type="button" onClick={startQuiz} className="h-12 min-w-[140px] rounded-2xl px-6">
              {started ? t("quiz.playAgain") : t("quiz.start")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-5 pt-5 sm:pt-6">
          <div className="space-y-2">
            <div className="flex min-h-[24px] items-center justify-between text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
              <span>{t("quiz.questionProgress", { current: started ? currentIndex + 1 : 0, total: totalQuestions })}</span>
              <div className="flex items-center gap-2">
                <span className="min-w-[92px] text-right">
                  Score: {correctCount}/{started ? currentIndex : 0}
                </span>
                {streak >= 3 && (
                  <span className="fire-badge inline-flex min-w-[96px] items-center justify-center gap-1 rounded-full bg-orange-500/90 px-2 py-1 text-[11px] font-semibold text-white">
                    <Flame className="h-3.5 w-3.5" />
                    On Fire!
                  </span>
                )}
                <span className="min-w-[84px] text-right">{t(`quiz.difficulties.${difficulty}`)}</span>
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
                {mascotText || t("quiz.mascot.default")}
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
              {t("quiz.yourAnswer")}
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
                ? t("quiz.finalScore", { score: correctCount, total: totalQuestions })
                : feedback === "correct"
                  ? t("quiz.correct")
                  : feedback === "incorrect"
                    ? t("quiz.incorrect", { answer: currentQuestion?.answer ?? 0 })
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
  const [hovered, setHovered] = React.useState<{ row: number; col: number } | null>(null);
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
            <div className="grid min-w-[560px] grid-cols-11 gap-2">
              <div className="flex h-10 items-center justify-center rounded-xl bg-slate-200 text-xs font-semibold dark:bg-slate-800">x</div>
              {numbers.map((n) => (
                <div
                  key={`h-${n}`}
                  className={`flex h-10 items-center justify-center rounded-xl text-xs font-semibold ${hovered?.col === n ? "bg-emerald-500 text-white" : "bg-slate-200 dark:bg-slate-800"}`}
                >
                  {n}
                </div>
              ))}
              {numbers.map((row) => (
                <React.Fragment key={`r-${row}`}>
                  <div className={`flex h-10 items-center justify-center rounded-xl text-xs font-semibold ${hovered?.row === row ? "bg-emerald-500 text-white" : "bg-slate-200 dark:bg-slate-800"}`}>{row}</div>
                  {numbers.map((col) => (
                    <button
                      key={`${row}-${col}`}
                      type="button"
                      onMouseEnter={() => setHovered({ row, col })}
                      onMouseLeave={() => setHovered(null)}
                      className={`h-10 rounded-xl border text-xs transition-all ${hovered?.row === row || hovered?.col === col ? "border-emerald-300 bg-emerald-50 text-slate-900 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-slate-100" : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"}`}
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

      <Card>
        <CardHeader>
          <CardTitle>{t("learn.patternHints")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm sm:text-base">
          <p>
            <span className="font-semibold">{t("learn.nineTitle")}</span> {t("learn.nineText")}
          </p>
          <p>
            <span className="font-semibold">{t("learn.fiveTitle")}</span> {t("learn.fiveText")}
          </p>
        </CardContent>
      </Card>
    </section>
  );
}

function HistoryView({ history, onClear }: { history: QuizResult[]; onClear: () => void }) {
  const { t } = useTranslation();
  const average = history.length
    ? Math.round(
        history.reduce((sum, item) => sum + Math.round((item.score / item.total) * 100), 0) / history.length
      )
    : 0;
  const allBadges = React.useMemo(() => {
    const unique = new Set<string>();
    for (const item of history) {
      for (const badge of item.badges ?? []) unique.add(badge);
    }
    return Array.from(unique);
  }, [history]);

  return (
    <section className="space-y-6">
      <Card className="award-glow">
        <CardHeader>
          <CardTitle>{t("history.myAwards")}</CardTitle>
        </CardHeader>
        <CardContent>
          {allBadges.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
              {t("history.noAwards")}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {allBadges.map((badge) => (
                <div
                  key={badge}
                  className="award-card flex min-h-[90px] items-center gap-3 rounded-2xl border border-amber-300/60 bg-gradient-to-br from-amber-100 via-pink-100 to-purple-100 px-4 py-3 dark:border-amber-800/50 dark:from-amber-900/30 dark:via-fuchsia-900/20 dark:to-violet-900/20"
                >
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  <span className="font-semibold text-slate-800 dark:text-slate-100">
                    {t(`history.badges.${badge}`)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { label: t("history.recentAttempts", { count: history.length }), value: `${history.length}` },
          { label: t("history.accuracy", { value: average }), value: `${average}%` },
          { label: t("history.title"), value: history[0] ? new Date(history[0].date).toLocaleDateString() : "--" }
        ].map((stat) => (
          <Card key={stat.label} className="min-h-[120px]">
            <CardContent className="flex h-full flex-col justify-center pt-5 sm:pt-6">
              <p className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
              <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle>{t("history.recentAttempts", { count: history.length })}</CardTitle>
            <Button type="button" variant="outline" className="h-10 min-w-[140px] rounded-2xl" onClick={onClear}>
              {t("history.clear")}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {history.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
              {t("history.noAttempts")}
            </div>
          ) : (
            history.map((item, idx) => (
              <div
                key={`${item.date}-${idx}`}
                className="flex min-h-[56px] items-center justify-between rounded-2xl border border-slate-200 px-4 text-sm dark:border-slate-800"
              >
                <span>{t("history.mode", { difficulty: t(`quiz.difficulties.${item.difficulty}`) })}</span>
                <span>{t("history.score", { score: item.score, total: item.total })}</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </section>
  );
}

export default function MultiplicationTableLayout() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = React.useState<TabId>("quiz");
  const { history, addResult, clearHistory } = useQuizHistory();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-40 h-16 border-b border-slate-200/80 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/85">
        <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between px-3 sm:px-4">
          <div className="min-w-[180px]">
            <h1 className="truncate text-base font-semibold sm:text-lg">{t("app.title")}</h1>
            <p className="hidden text-xs text-slate-500 dark:text-slate-400 sm:block">{t("app.subtitle")}</p>
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
    </div>
  );
}
