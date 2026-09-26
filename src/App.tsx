import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  PREBUILT_QUIZZES,
  QuizDefinition,
  QuizAttempt,
  CandidateProfile,
  DifficultyLevel,
  QuizCategory,
  AIAnalysisReport,
  synthesizeQuizLocally,
  synthesizeAnalysisLocally,
} from "./data/mockTests";
import { buildStandaloneHtmlSource } from "./utils/standaloneExporter";
import {
  ToastAlert,
  ToastNotice,
  SubmitConfirmationModal,
  ScorecardCelebrationModal,
  ClearHistoryModal,
  ExportSingleHtmlModal,
} from "./components/QuizModals";
import {
  ResultAnalyticsView,
  ReviewFilter,
} from "./components/ResultAnalyticsView";

type AppView = "dashboard" | "quiz" | "result";

const STORAGE_KEYS = {
  PROFILE: "assessai_v1_profile",
  ATTEMPTS: "assessai_v1_attempts",
  CUSTOM_QUIZZES: "assessai_v1_custom_quizzes",
  THEME: "assessai_v1_theme",
};

const QUICK_TOPICS = [
  "BCA Operating Systems",
  "Python Programming",
  "Data Structures & Algorithms",
  "Database Management Systems (SQL)",
  "Computer Networks & TCP/IP",
  "Object-Oriented Programming in Java",
  "Quantitative Aptitude & Logic",
];

export default function App() {
  // Default to Deep Slate Dark Mode for the rich Indigo/Violet/Emerald/Rose aesthetic
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    return saved ? saved === "dark" : true;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem(STORAGE_KEYS.THEME, darkMode ? "dark" : "light");
  }, [darkMode]);

  // Navigation View State
  const [view, setView] = useState<AppView>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Toast Alert System
  const [toast, setToast] = useState<ToastNotice | null>(null);
  const triggerToast = (
    title: string,
    message: string,
    tone: ToastNotice["tone"] = "indigo"
  ) => {
    setToast({ id: Date.now(), title, message, tone });
  };

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  // Candidate Profile State (LocalStorage)
  const [profile, setProfile] = useState<CandidateProfile>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return {
      name: "Aarav Sharma",
      program: "BCA Semester V",
      targetAccuracy: 85,
      preferredTimerMode: "full",
    };
  });

  const [profileForm, setProfileForm] = useState<CandidateProfile>(profile);

  // Past Quiz Attempts State (LocalStorage)
  const [attempts, setAttempts] = useState<QuizAttempt[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ATTEMPTS);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return [];
  });

  // Saved AI Custom Quizzes (LocalStorage)
  const [customQuizzes, setCustomQuizzes] = useState<QuizDefinition[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_QUIZZES);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return [];
  });

  // Dashboard Filters
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // AI Generator State
  const [aiTopic, setAiTopic] = useState<string>("BCA Operating Systems");
  const [aiDifficulty, setAiDifficulty] = useState<DifficultyLevel>("Medium");
  const [aiQuestionCount, setAiQuestionCount] = useState<number>(8);
  const [aiTimerMode, setAiTimerMode] = useState<"full" | "per_question">(
    "full"
  );
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState<boolean>(false);
  const [aiStatusMessage, setAiStatusMessage] = useState<string | null>(null);

  // Active Quiz Session State
  const [activeQuiz, setActiveQuiz] = useState<QuizDefinition | null>(null);
  const [timerMode, setTimerMode] = useState<"full" | "per_question">("full");
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number | null>>(
    {}
  );
  const [markedQuestions, setMarkedQuestions] = useState<number[]>([]);
  const [visitedQuestions, setVisitedQuestions] = useState<number[]>([0]);
  const [questionTimes, setQuestionTimes] = useState<Record<number, number>>(
    {}
  );
  const [secondsLeft, setSecondsLeft] = useState<number>(600);
  const [totalElapsedSeconds, setTotalElapsedSeconds] = useState<number>(0);

  // Animated Pop-up Modals State
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState<boolean>(false);
  const [scorecardModalOpen, setScorecardModalOpen] = useState<boolean>(false);
  const [confirmClearHistory, setConfirmClearHistory] =
    useState<boolean>(false);
  const [exportModalOpen, setExportModalOpen] = useState<boolean>(false);
  const [copiedHtmlNotice, setCopiedHtmlNotice] = useState<boolean>(false);

  // Result & Analytics State
  const [activeAttempt, setActiveAttempt] = useState<QuizAttempt | null>(null);
  const [isAnalyzingAI, setIsAnalyzingAI] = useState<boolean>(false);
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>("all");

  // Refs for Section Scrolling
  const generatorRef = useRef<HTMLDivElement | null>(null);
  const modulesRef = useRef<HTMLDivElement | null>(null);
  const historyRef = useRef<HTMLDivElement | null>(null);
  const profileRef = useRef<HTMLDivElement | null>(null);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    setMobileMenuOpen(false);
    if (view !== "dashboard") {
      setView("dashboard");
      setTimeout(() => {
        ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    } else {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Save Attempts & Custom Quizzes to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(attempts));
    } catch {
      // ignore
    }
  }, [attempts]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.CUSTOM_QUIZZES,
        JSON.stringify(customQuizzes.slice(0, 12))
      );
    } catch {
      // ignore
    }
  }, [customQuizzes]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned: CandidateProfile = {
      name: profileForm.name.trim() || "Candidate",
      program: profileForm.program.trim() || "BCA / CS Candidate",
      targetAccuracy: Math.min(
        100,
        Math.max(40, Number(profileForm.targetAccuracy) || 85)
      ),
      preferredTimerMode: profileForm.preferredTimerMode,
    };
    setProfile(cleaned);
    setProfileForm(cleaned);
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(cleaned));
    triggerToast(
      "Candidate Profile Updated",
      `Saved ${cleaned.name} (${cleaned.program}) with ${cleaned.targetAccuracy}% target benchmark.`,
      "emerald"
    );
  };

  // Start a Quiz Session
  const startQuizSession = (
    quiz: QuizDefinition,
    modeOverride?: "full" | "per_question"
  ) => {
    const chosenMode = modeOverride || profile.preferredTimerMode || "full";
    setActiveQuiz(quiz);
    setTimerMode(chosenMode);
    setCurrentIndex(0);
    setUserAnswers({});
    setMarkedQuestions([]);
    setVisitedQuestions([0]);
    setQuestionTimes({});
    setTotalElapsedSeconds(0);
    setConfirmSubmitOpen(false);
    setScorecardModalOpen(false);
    setSecondsLeft(
      chosenMode === "full"
        ? quiz.durationMinutes * 60
        : quiz.perQuestionSeconds || 60
    );
    setView("quiz");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Navigate to a specific question index during quiz
  const goToQuestion = (index: number) => {
    if (!activeQuiz) return;
    if (index < 0 || index >= activeQuiz.questions.length) return;
    setCurrentIndex(index);
    setVisitedQuestions((prev) =>
      prev.includes(index) ? prev : [...prev, index]
    );
    if (timerMode === "per_question") {
      setSecondsLeft(activeQuiz.perQuestionSeconds || 60);
    }
  };

  // Real-Time Countdown Timer Effect
  useEffect(() => {
    if (view !== "quiz" || !activeQuiz) return;

    const interval = setInterval(() => {
      setTotalElapsedSeconds((prev) => prev + 1);
      setQuestionTimes((prev) => ({
        ...prev,
        [currentIndex]: (prev[currentIndex] || 0) + 1,
      }));

      setSecondsLeft((prev) => {
        if (prev === 60 && timerMode === "full") {
          triggerToast(
            "Low Time Alert (01:00 Remaining)",
            "One minute left on the examination clock. Review marked questions.",
            "amber"
          );
        }
        if (prev <= 1) {
          if (timerMode === "per_question") {
            if (currentIndex < activeQuiz.questions.length - 1) {
              const nextIdx = currentIndex + 1;
              setCurrentIndex(nextIdx);
              setVisitedQuestions((v) =>
                v.includes(nextIdx) ? v : [...v, nextIdx]
              );
              return activeQuiz.perQuestionSeconds || 60;
            } else {
              setTimeout(() => finalizeQuizSubmission(), 0);
              return 0;
            }
          } else {
            setTimeout(() => finalizeQuizSubmission(), 0);
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [view, activeQuiz, currentIndex, timerMode]);

  // Keyboard Navigation in Quiz View
  useEffect(() => {
    if (view !== "quiz" || !activeQuiz || confirmSubmitOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }
      const key = e.key.toLowerCase();
      if (key === "1" || key === "a") handleSelectOption(0);
      else if (key === "2" || key === "b") handleSelectOption(1);
      else if (key === "3" || key === "c") handleSelectOption(2);
      else if (key === "4" || key === "d") handleSelectOption(3);
      else if (key === "arrowright" || key === "n") {
        if (currentIndex < activeQuiz.questions.length - 1) {
          goToQuestion(currentIndex + 1);
        }
      } else if (key === "arrowleft" || key === "p") {
        if (currentIndex > 0) {
          goToQuestion(currentIndex - 1);
        }
      } else if (key === "m") {
        handleToggleMark();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [view, activeQuiz, currentIndex, timerMode, confirmSubmitOpen]);

  const handleSelectOption = (optionIndex: number) => {
    setUserAnswers((prev) => ({
      ...prev,
      [currentIndex]: optionIndex,
    }));
  };

  const handleClearResponse = () => {
    setUserAnswers((prev) => {
      const next = { ...prev };
      delete next[currentIndex];
      return next;
    });
  };

  const handleToggleMark = () => {
    setMarkedQuestions((prev) =>
      prev.includes(currentIndex)
        ? prev.filter((i) => i !== currentIndex)
        : [...prev, currentIndex]
    );
  };

  // Submit Quiz & Request AI Performance Analysis
  const finalizeQuizSubmission = async () => {
    if (!activeQuiz) return;

    let correctCount = 0;
    let incorrectCount = 0;
    let skippedCount = 0;
    const strongSubtopics = new Set<string>();
    const weakSubtopics = new Set<string>();
    const missedQuestions: {
      subtopic: string;
      question: string;
      selectedOption: string | null;
      correctOption: string;
    }[] = [];

    activeQuiz.questions.forEach((q, idx) => {
      const ans = userAnswers[idx];
      if (ans === undefined || ans === null) {
        skippedCount++;
        weakSubtopics.add(q.subtopic);
        missedQuestions.push({
          subtopic: q.subtopic,
          question: q.question,
          selectedOption: null,
          correctOption: q.options[q.correctAnswer],
        });
      } else if (ans === q.correctAnswer) {
        correctCount++;
        strongSubtopics.add(q.subtopic);
      } else {
        incorrectCount++;
        weakSubtopics.add(q.subtopic);
        missedQuestions.push({
          subtopic: q.subtopic,
          question: q.question,
          selectedOption: q.options[ans] || null,
          correctOption: q.options[q.correctAnswer],
        });
      }
    });

    const totalQuestions = activeQuiz.questions.length;
    const accuracy = Math.round(
      (correctCount / Math.max(totalQuestions, 1)) * 100
    );

    const partialAttempt: Omit<QuizAttempt, "aiAnalysis"> = {
      id: `attempt-${Date.now()}`,
      quizId: activeQuiz.id,
      quizTitle: activeQuiz.title,
      category: activeQuiz.category,
      difficulty: activeQuiz.difficulty,
      timestamp: new Date().toLocaleString([], {
        month: "short",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      totalQuestions,
      correctCount,
      incorrectCount,
      skippedCount,
      accuracy,
      timeTakenSeconds: Math.max(1, totalElapsedSeconds),
      timerMode,
      userAnswers: { ...userAnswers },
      markedQuestions: [...markedQuestions],
      questionTimes: { ...questionTimes },
      questions: activeQuiz.questions,
    };

    const initialAnalysis = synthesizeAnalysisLocally(partialAttempt);
    const fullAttempt: QuizAttempt = {
      ...partialAttempt,
      aiAnalysis: initialAnalysis,
    };

    setActiveAttempt(fullAttempt);
    setAttempts((prev) => [fullAttempt, ...prev]);
    setReviewFilter("all");
    setConfirmSubmitOpen(false);
    setView("result");
    setScorecardModalOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Enhance with live server-side Gemini AI Performance Analysis
    setIsAnalyzingAI(true);
    try {
      const response = await fetch("/api/ai/analyze-performance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizTitle: activeQuiz.title,
          topic: activeQuiz.title,
          difficulty: activeQuiz.difficulty,
          totalQuestions,
          correctCount,
          incorrectCount,
          skippedCount,
          timeTakenSeconds: Math.max(1, totalElapsedSeconds),
          weakSubtopics: Array.from(weakSubtopics),
          strongSubtopics: Array.from(strongSubtopics),
          missedQuestions,
        }),
      });

      if (response.ok) {
        const aiData = await response.json();
        const geminiReport: AIAnalysisReport = {
          headline: aiData.headline || initialAnalysis.headline,
          executiveSummary:
            aiData.executiveSummary || initialAnalysis.executiveSummary,
          strengths:
            Array.isArray(aiData.strengths) && aiData.strengths.length > 0
              ? aiData.strengths
              : initialAnalysis.strengths,
          weakAreas:
            Array.isArray(aiData.weakAreas) && aiData.weakAreas.length > 0
              ? aiData.weakAreas
              : initialAnalysis.weakAreas,
          studyPlan:
            Array.isArray(aiData.studyPlan) && aiData.studyPlan.length > 0
              ? aiData.studyPlan
              : initialAnalysis.studyPlan,
          recommendedNextTopic:
            aiData.recommendedNextTopic || initialAnalysis.recommendedNextTopic,
          source: "gemini",
        };

        setActiveAttempt((prev) =>
          prev && prev.id === fullAttempt.id
            ? { ...prev, aiAnalysis: geminiReport }
            : prev
        );
        setAttempts((prev) =>
          prev.map((a) =>
            a.id === fullAttempt.id ? { ...a, aiAnalysis: geminiReport } : a
          )
        );
      }
    } catch {
      // Keeps the instant smart_engine analysis seamlessly
    } finally {
      setIsAnalyzingAI(false);
    }
  };

  // Dynamic AI Quiz Generation Handler
  const handleGenerateAIQuiz = async (
    e?: React.FormEvent,
    overrideTopic?: string
  ) => {
    if (e) e.preventDefault();
    const targetTopic = (overrideTopic ?? aiTopic).trim();
    if (!targetTopic) return;

    setIsGeneratingQuiz(true);
    setAiStatusMessage(
      `Synthesizing ${aiQuestionCount} ${aiDifficulty.toLowerCase()}-level questions on "${targetTopic}"...`
    );

    try {
      const response = await fetch("/api/ai/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: targetTopic,
          difficulty: aiDifficulty,
          questionCount: aiQuestionCount,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(
          errData.error || `Server returned status ${response.status}`
        );
      }

      const data = await response.json();
      if (
        !data ||
        !Array.isArray(data.questions) ||
        data.questions.length === 0
      ) {
        throw new Error("Invalid question payload returned.");
      }

      const validCategory: QuizCategory = [
        "BCA Subjects",
        "Computer Science",
        "Programming",
        "Aptitude & Logic",
      ].includes(data.category)
        ? data.category
        : "AI Custom";

      const newQuiz: QuizDefinition = {
        id: `gemini-quiz-${Date.now()}`,
        title: data.title || `${targetTopic} — AI Assessment`,
        category: validCategory,
        difficulty: aiDifficulty,
        durationMinutes: data.questions.length,
        perQuestionSeconds: 60,
        description:
          data.description ||
          `AI-generated ${aiDifficulty.toLowerCase()} mock test on ${targetTopic}.`,
        questions: data.questions.map((q: any, idx: number) => ({
          id: `gq-${Date.now()}-${idx}`,
          question: q.question,
          options:
            Array.isArray(q.options) && q.options.length === 4
              ? q.options
              : ["Option A", "Option B", "Option C", "Option D"],
          correctAnswer:
            typeof q.correctAnswer === "number" &&
            q.correctAnswer >= 0 &&
            q.correctAnswer <= 3
              ? q.correctAnswer
              : 0,
          explanation:
            q.explanation ||
            "Verify the primary definition and invariants of this concept.",
          subtopic: q.subtopic || targetTopic,
        })),
        isAIGenerated: true,
      };

      setCustomQuizzes((prev) => [newQuiz, ...prev]);
      setAiStatusMessage(null);
      triggerToast(
        "AI Assessment Synthesized",
        `Generated ${newQuiz.questions.length} questions on "${targetTopic}".`,
        "indigo"
      );
      startQuizSession(newQuiz, aiTimerMode);
    } catch {
      const fallbackQuiz = synthesizeQuizLocally(
        targetTopic,
        aiDifficulty,
        aiQuestionCount
      );
      setCustomQuizzes((prev) => [fallbackQuiz, ...prev]);
      setAiStatusMessage(null);
      triggerToast(
        "Custom Quiz Ready",
        `Prepared ${fallbackQuiz.questions.length} questions on "${targetTopic}".`,
        "indigo"
      );
      startQuizSession(fallbackQuiz, aiTimerMode);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  // Combined Pre-built + Custom Quizzes for Filtering
  const allQuizzes = useMemo(
    () => [...customQuizzes, ...PREBUILT_QUIZZES],
    [customQuizzes]
  );

  const filteredQuizzes = useMemo(() => {
    return allQuizzes.filter((q) => {
      const catMatch =
        categoryFilter === "All" || q.category === categoryFilter;
      const diffMatch =
        difficultyFilter === "All" || q.difficulty === difficultyFilter;
      const query = searchQuery.trim().toLowerCase();
      const searchMatch =
        !query ||
        q.title.toLowerCase().includes(query) ||
        q.description.toLowerCase().includes(query) ||
        q.category.toLowerCase().includes(query);
      return catMatch && diffMatch && searchMatch;
    });
  }, [allQuizzes, categoryFilter, difficultyFilter, searchQuery]);

  // Aggregate Candidate Metrics
  const dashboardStats = useMemo(() => {
    if (attempts.length === 0) {
      return {
        totalAttempts: 0,
        meanAccuracy: 0,
        bestAccuracy: 0,
        totalQuestionsSolved: 0,
      };
    }
    const totalAttempts = attempts.length;
    const meanAccuracy = Math.round(
      attempts.reduce((acc, a) => acc + a.accuracy, 0) / totalAttempts
    );
    const bestAccuracy = Math.max(...attempts.map((a) => a.accuracy));
    const totalQuestionsSolved = attempts.reduce(
      (acc, a) => acc + (a.correctCount + a.incorrectCount),
      0
    );
    return {
      totalAttempts,
      meanAccuracy,
      bestAccuracy,
      totalQuestionsSolved,
    };
  }, [attempts]);

  // Download Single-File HTML Handler
  const handleDownloadStandaloneHtml = () => {
    const htmlSource = buildStandaloneHtmlSource();
    const blob = new Blob([htmlSource], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "AssessAI-Mock-Test-Platform.html";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    triggerToast(
      "Standalone HTML Downloaded",
      "AssessAI-Mock-Test-Platform.html saved to your device.",
      "emerald"
    );
  };

  const handleCopyStandaloneHtml = async () => {
    const htmlSource = buildStandaloneHtmlSource();
    try {
      await navigator.clipboard.writeText(htmlSource);
      setCopiedHtmlNotice(true);
      triggerToast(
        "Copied to Clipboard",
        "Complete single-file HTML code copied.",
        "emerald"
      );
      setTimeout(() => setCopiedHtmlNotice(false), 2500);
    } catch {
      // ignore
    }
  };

  // Format Seconds into MM:SS
  const formatTime = (secs: number) => {
    const clamped = Math.max(0, secs);
    const m = Math.floor(clamped / 60);
    const s = clamped % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const totalTimerAllocation = activeQuiz
    ? timerMode === "full"
      ? activeQuiz.durationMinutes * 60
      : activeQuiz.perQuestionSeconds || 60
    : 600;

  const timerProgressPercent = Math.min(
    100,
    Math.max(0, Math.round((secondsLeft / Math.max(1, totalTimerAllocation)) * 100))
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 dark:bg-[#0B0F19] dark:text-slate-100 transition-colors duration-200">
      {/* Top Navigation Bar — Glassmorphic 3-Zone Contract */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Zone 1: Brand Wordmark */}
          <button
            type="button"
            onClick={() => {
              setView("dashboard");
              setMobileMenuOpen(false);
            }}
            className="font-display text-xl font-semibold tracking-tight text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            AssessAI
          </button>

          {/* Zone 2: Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-300">
            <button
              type="button"
              onClick={() => setView("dashboard")}
              className={`hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                view === "dashboard"
                  ? "text-indigo-600 dark:text-indigo-400 font-semibold underline decoration-indigo-500 decoration-2 underline-offset-8"
                  : ""
              }`}
            >
              Dashboard
            </button>
            <button
              type="button"
              onClick={() => scrollToSection(generatorRef)}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              AI Quiz Studio
            </button>
            <button
              type="button"
              onClick={() => scrollToSection(modulesRef)}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Subject Modules
            </button>
            <button
              type="button"
              onClick={() => scrollToSection(historyRef)}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Attempt History
            </button>
            <button
              type="button"
              onClick={() => scrollToSection(profileRef)}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Candidate Profile
            </button>
          </nav>

          {/* Zone 3: Theme Switcher, Single-File HTML Export & Mobile Menu Toggle */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setDarkMode((d) => !d)}
              className="px-3.5 py-2 text-xs font-medium border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all whitespace-nowrap shrink-0 cursor-pointer"
            >
              {darkMode ? "Light Theme" : "Dark Theme"}
            </button>
            <button
              type="button"
              onClick={() => setExportModalOpen(true)}
              className="px-4 py-2 text-xs font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl shadow-md shadow-indigo-500/20 active:scale-95 transition-all whitespace-nowrap shrink-0 cursor-pointer"
            >
              Single-File HTML
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((o) => !o)}
              className="md:hidden px-3 py-2 text-xs font-semibold border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* Responsive Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 py-3 flex flex-wrap items-center gap-3 text-xs font-medium">
            <button
              type="button"
              onClick={() => {
                setView("dashboard");
                setMobileMenuOpen(false);
              }}
              className="px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold"
            >
              Dashboard
            </button>
            <button
              type="button"
              onClick={() => scrollToSection(generatorRef)}
              className="px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300"
            >
              AI Quiz Studio
            </button>
            <button
              type="button"
              onClick={() => scrollToSection(modulesRef)}
              className="px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300"
            >
              Subject Modules
            </button>
            <button
              type="button"
              onClick={() => scrollToSection(historyRef)}
              className="px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300"
            >
              Attempt History
            </button>
            <button
              type="button"
              onClick={() => scrollToSection(profileRef)}
              className="px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300"
            >
              Candidate Profile
            </button>
          </div>
        )}
      </header>

      {/* Floating Animated Toast Alert */}
      <ToastAlert toast={toast} onDismiss={() => setToast(null)} />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-[1320px] w-full mx-auto px-4 sm:px-6 py-8">
        {view === "dashboard" && (
          <div className="space-y-10">
            {/* Hero & Candidate Telemetry Overview + 01. Dynamic AI Quiz Generator */}
            <section
              ref={generatorRef}
              className="border border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/85 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-xl shadow-slate-950/5"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-8 border-b border-slate-200 dark:border-slate-800">
                <div className="space-y-2.5 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                      Candidate Workspace
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      {profile.name}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{profile.program}</span>
                  </div>
                  <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold text-slate-900 dark:text-white tracking-tight">
                    AI-Powered Online Mock Test & Technical Assessment Platform
                  </h1>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                    Synthesize custom multiple-choice examinations on any BCA,
                    Computer Science, or Programming topic using AI, practice
                    with real-time question palettes, and receive subtopic-level
                    diagnostic feedback.
                  </p>
                </div>

                {/* Highlighted Candidate Telemetry Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-4 shrink-0">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Completed Tests
                    </p>
                    <p className="text-2xl font-mono tabular-nums font-bold text-slate-900 dark:text-white mt-0.5">
                      {dashboardStats.totalAttempts}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30">
                    <p className="text-xs text-indigo-600 dark:text-indigo-300 font-medium">
                      Mean Accuracy
                    </p>
                    <p className="text-2xl font-mono tabular-nums font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                      {dashboardStats.meanAccuracy}%
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                    <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                      Peak Score
                    </p>
                    <p className="text-2xl font-mono tabular-nums font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {dashboardStats.bestAccuracy}%
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Target Benchmark
                    </p>
                    <p className="text-2xl font-mono tabular-nums font-bold text-slate-900 dark:text-white mt-0.5">
                      {profile.targetAccuracy}%
                    </p>
                  </div>
                </div>
              </div>

              {/* 01. Dynamic AI Quiz Generator */}
              <div className="pt-8 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                      01. Dynamic AI Quiz & Mock Test Generator
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Type any academic syllabus topic, programming language, or
                      technical concept to synthesize 5–10 custom MCQs with
                      verified explanations.
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={(e) => handleGenerateAIQuiz(e)}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4"
                >
                  <div className="md:col-span-5">
                    <label
                      htmlFor="ai-topic-input"
                      className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                    >
                      Topic, Subject, or Syllabus Unit
                    </label>
                    <input
                      id="ai-topic-input"
                      type="text"
                      value={aiTopic}
                      onChange={(e) => setAiTopic(e.target.value)}
                      placeholder="e.g., BCA Operating Systems, Python Programming, Data Structures..."
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-[#F8FAFC] dark:bg-[#0B0F19] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label
                      htmlFor="ai-difficulty-select"
                      className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                    >
                      Difficulty Level
                    </label>
                    <select
                      id="ai-difficulty-select"
                      value={aiDifficulty}
                      onChange={(e) =>
                        setAiDifficulty(e.target.value as DifficultyLevel)
                      }
                      className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-[#F8FAFC] dark:bg-[#0B0F19] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label
                      htmlFor="ai-count-select"
                      className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                    >
                      Question Count
                    </label>
                    <select
                      id="ai-count-select"
                      value={aiQuestionCount}
                      onChange={(e) =>
                        setAiQuestionCount(Number(e.target.value))
                      }
                      className="w-full px-3 py-2.5 text-sm font-mono tabular-nums rounded-xl border border-slate-300 dark:border-slate-700 bg-[#F8FAFC] dark:bg-[#0B0F19] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value={5}>5 Questions</option>
                      <option value={8}>8 Questions</option>
                      <option value={10}>10 Questions</option>
                    </select>
                  </div>

                  <div className="md:col-span-3 flex flex-col justify-end">
                    <label
                      htmlFor="ai-timer-mode"
                      className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                    >
                      Examination Timer Mode
                    </label>
                    <div className="flex items-center gap-2">
                      <select
                        id="ai-timer-mode"
                        value={aiTimerMode}
                        onChange={(e) =>
                          setAiTimerMode(
                            e.target.value as "full" | "per_question"
                          )
                        }
                        className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-[#F8FAFC] dark:bg-[#0B0F19] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="full">Full Test Timer</option>
                        <option value="per_question">Per-Question (60s)</option>
                      </select>
                      <button
                        type="submit"
                        disabled={isGeneratingQuiz}
                        className="px-4 py-2.5 text-sm font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-60 text-white rounded-xl shadow-lg shadow-indigo-500/25 active:scale-95 transition-all whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        {isGeneratingQuiz ? "Generating..." : "Launch AI Quiz"}
                      </button>
                    </div>
                  </div>
                </form>

                {aiStatusMessage && (
                  <div className="text-xs font-mono tabular-nums text-indigo-600 dark:text-indigo-400 pt-1 animate-pulse">
                    ● {aiStatusMessage}
                  </div>
                )}

                {/* Quick Preset Topic Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-xs text-slate-500 dark:text-slate-400 mr-1">
                    Quick Select Topic:
                  </span>
                  {QUICK_TOPICS.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setAiTopic(item)}
                      className={`px-3 py-1.5 text-xs rounded-xl border transition-all whitespace-nowrap cursor-pointer active:scale-95 ${
                        aiTopic === item
                          ? "border-indigo-500 bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-semibold shadow-sm"
                          : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-indigo-500/40 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* 02. Pre-Built Subject Categories & Mock Test Library */}
            <section ref={modulesRef} className="space-y-5">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    02. Curated Subject Mock Tests & Question Banks
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Filter by academic discipline, difficulty level, or search
                    specific syllabus keywords.
                  </p>
                </div>

                {/* Interactive Filter Controls */}
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter modules..."
                    className="px-3.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />

                  {/* Category Segmented Control */}
                  <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-200/70 dark:bg-slate-800/90 rounded-xl">
                    {[
                      "All",
                      "BCA Subjects",
                      "Computer Science",
                      "Programming",
                      "Aptitude & Logic",
                      ...(customQuizzes.length > 0 ? ["AI Custom"] : []),
                    ].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategoryFilter(cat)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                          categoryFilter === cat
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Difficulty Segmented Control */}
                  <div className="flex items-center gap-1 p-1 bg-slate-200/70 dark:bg-slate-800/90 rounded-xl">
                    {["All", "Easy", "Medium", "Hard"].map((diff) => (
                      <button
                        key={diff}
                        type="button"
                        onClick={() => setDifficultyFilter(diff)}
                        className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                          difficultyFilter === diff
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {filteredQuizzes.length === 0 ? (
                <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl p-10 text-center space-y-3">
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    No mock tests match your current filter criteria.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setCategoryFilter("All");
                      setDifficultyFilter("All");
                      setSearchQuery("");
                    }}
                    className="px-4 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-all cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {filteredQuizzes.map((quiz) => {
                    const pastForQuiz = attempts.filter(
                      (a) =>
                        a.quizId === quiz.id || a.quizTitle === quiz.title
                    );
                    const bestForQuiz =
                      pastForQuiz.length > 0
                        ? Math.max(...pastForQuiz.map((a) => a.accuracy))
                        : null;

                    return (
                      <article
                        key={quiz.id}
                        className="group border border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/85 backdrop-blur-md rounded-2xl p-6 flex flex-col justify-between hover:-translate-y-0.5 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-200"
                      >
                        <div>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                            <span className="font-sans font-semibold text-indigo-600 dark:text-indigo-400">
                              {quiz.category}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span
                              className={`font-semibold ${
                                quiz.difficulty === "Hard"
                                  ? "text-rose-600 dark:text-rose-400"
                                  : quiz.difficulty === "Medium"
                                  ? "text-amber-600 dark:text-amber-400"
                                  : "text-emerald-600 dark:text-emerald-400"
                              }`}
                            >
                              {quiz.difficulty}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>{quiz.questions.length} Questions</span>
                            <span aria-hidden="true">·</span>
                            <span>{quiz.durationMinutes} Mins</span>
                            {bestForQuiz !== null && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                  ✓ Best: {bestForQuiz}%
                                </span>
                              </>
                            )}
                          </div>

                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {quiz.title}
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                            {quiz.description}
                          </p>
                        </div>

                        <div className="pt-5 mt-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                            {quiz.questions
                              .slice(0, 2)
                              .map((q) => q.subtopic)
                              .join(" · ")}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                startQuizSession(quiz, "per_question")
                              }
                              className="px-3.5 py-2 text-xs font-semibold border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all whitespace-nowrap cursor-pointer"
                            >
                              Rapid 60s/Q
                            </button>
                            <button
                              type="button"
                              onClick={() => startQuizSession(quiz, "full")}
                              className="px-4 py-2 text-xs font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl shadow-md shadow-indigo-500/20 active:scale-95 transition-all whitespace-nowrap cursor-pointer"
                            >
                              Start Mock Test →
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            {/* 03. Attempt History Table & 04. Candidate Profile */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Attempt History (8 Columns) */}
              <section
                ref={historyRef}
                className="lg:col-span-8 border border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/85 backdrop-blur-md rounded-2xl p-6 shadow-xl shadow-slate-950/5"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                      03. Past Quiz Attempts & Analytics Log
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Persisted in browser LocalStorage. Select any past attempt
                      to inspect its full scorecard and AI study plan.
                    </p>
                  </div>
                  {attempts.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setConfirmClearHistory(true)}
                      className="px-3 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                    >
                      Clear History
                    </button>
                  )}
                </div>

                {attempts.length === 0 ? (
                  <div className="py-12 text-center space-y-3">
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      No mock test attempts recorded yet.
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                      Launch any pre-built subject test or synthesize a custom
                      AI quiz above to log your performance metrics and
                      personalized study feedback here.
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        startQuizSession(PREBUILT_QUIZZES[0], "full")
                      }
                      className="mt-2 px-4 py-2.5 text-xs font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl shadow-md shadow-indigo-500/20 hover:from-indigo-500 hover:to-violet-500 active:scale-95 transition-all cursor-pointer"
                    >
                      Take First Diagnostic Test (BCA Operating Systems)
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto mt-2">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                          <th className="py-3 pr-4 font-medium">
                            Assessment Module
                          </th>
                          <th className="py-3 px-3 font-medium text-right">
                            Score
                          </th>
                          <th className="py-3 px-3 font-medium text-right">
                            Accuracy
                          </th>
                          <th className="py-3 px-3 font-medium text-right">
                            Duration
                          </th>
                          <th className="py-3 pl-3 font-medium text-right">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs font-mono tabular-nums">
                        {attempts.map((att) => {
                          const metTarget =
                            att.accuracy >= profile.targetAccuracy;
                          return (
                            <tr
                              key={att.id}
                              className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                            >
                              <td className="py-3.5 pr-4 font-sans">
                                <div className="font-semibold text-slate-900 dark:text-white text-sm">
                                  {att.quizTitle}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                  {att.timestamp} · {att.category} ·{" "}
                                  {att.difficulty}
                                </div>
                              </td>
                              <td className="py-3.5 px-3 text-right text-slate-700 dark:text-slate-200 font-semibold">
                                {att.correctCount} / {att.totalQuestions}
                              </td>
                              <td className="py-3.5 px-3 text-right font-bold">
                                <span
                                  className={
                                    metTarget
                                      ? "text-emerald-600 dark:text-emerald-400"
                                      : att.accuracy >= 60
                                      ? "text-amber-600 dark:text-amber-400"
                                      : "text-rose-600 dark:text-rose-400"
                                  }
                                >
                                  {metTarget
                                    ? `✓ ${att.accuracy}%`
                                    : `${att.accuracy}%`}
                                </span>
                              </td>
                              <td className="py-3.5 px-3 text-right text-slate-600 dark:text-slate-400">
                                {formatTime(att.timeTakenSeconds)}
                              </td>
                              <td className="py-3.5 pl-3 text-right font-sans">
                                <div className="flex items-center justify-end gap-3">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveAttempt(att);
                                      setReviewFilter("all");
                                      setView("result");
                                      window.scrollTo({
                                        top: 0,
                                        behavior: "smooth",
                                      });
                                    }}
                                    className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold whitespace-nowrap cursor-pointer"
                                  >
                                    View Report
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const reconstructed: QuizDefinition = {
                                        id: att.quizId,
                                        title: att.quizTitle,
                                        category: att.category,
                                        difficulty: att.difficulty,
                                        durationMinutes: att.questions.length,
                                        perQuestionSeconds: 60,
                                        description: `Retake session for ${att.quizTitle}`,
                                        questions: att.questions,
                                      };
                                      startQuizSession(reconstructed);
                                    }}
                                    className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white whitespace-nowrap cursor-pointer"
                                  >
                                    Retake
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              {/* Candidate Profile (4 Columns) */}
              <section
                ref={profileRef}
                className="lg:col-span-4 border border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/85 backdrop-blur-md rounded-2xl p-6 shadow-xl shadow-slate-950/5 space-y-5"
              >
                <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    04. Candidate Profile & Preferences
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Configure your candidate identity and target accuracy
                    benchmark.
                  </p>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div>
                    <label
                      htmlFor="profile-name"
                      className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                    >
                      Candidate Full Name
                    </label>
                    <input
                      id="profile-name"
                      type="text"
                      value={profileForm.name}
                      onChange={(e) =>
                        setProfileForm((p) => ({ ...p, name: e.target.value }))
                      }
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-[#F8FAFC] dark:bg-[#0B0F19] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="profile-program"
                      className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                    >
                      Academic Program / Track
                    </label>
                    <input
                      id="profile-program"
                      type="text"
                      value={profileForm.program}
                      onChange={(e) =>
                        setProfileForm((p) => ({
                          ...p,
                          program: e.target.value,
                        }))
                      }
                      placeholder="e.g., BCA Semester V, B.Tech CS"
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-[#F8FAFC] dark:bg-[#0B0F19] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="profile-target"
                        className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                      >
                        Target Score (%)
                      </label>
                      <input
                        id="profile-target"
                        type="number"
                        min={40}
                        max={100}
                        value={profileForm.targetAccuracy}
                        onChange={(e) =>
                          setProfileForm((p) => ({
                            ...p,
                            targetAccuracy: Number(e.target.value),
                          }))
                        }
                        className="w-full px-3 py-2 text-sm font-mono tabular-nums rounded-xl border border-slate-300 dark:border-slate-700 bg-[#F8FAFC] dark:bg-[#0B0F19] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="profile-timer"
                        className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                      >
                        Default Timer
                      </label>
                      <select
                        id="profile-timer"
                        value={profileForm.preferredTimerMode}
                        onChange={(e) =>
                          setProfileForm((p) => ({
                            ...p,
                            preferredTimerMode: e.target.value as
                              | "full"
                              | "per_question",
                          }))
                        }
                        className="w-full px-2.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-[#F8FAFC] dark:bg-[#0B0F19] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="full">Full Test</option>
                        <option value="per_question">Per Question</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 text-xs font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl shadow-md shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer"
                  >
                    Save Profile to LocalStorage
                  </button>
                </form>
              </section>
            </div>
          </div>
        )}

        {/* INTERACTIVE QUIZ EXAMINATION INTERFACE */}
        {view === "quiz" && activeQuiz && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Stage: Active Question & Options (8 Columns) */}
            <div className="lg:col-span-8 border border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-xl shadow-slate-950/5 space-y-6">
              {/* Top Exam Status Header with Bold Highlighted Timer */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {activeQuiz.title}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{activeQuiz.difficulty}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                      {activeQuiz.questions[currentIndex].subtopic}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                    Question {String(currentIndex + 1).padStart(2, "0")} of{" "}
                    {String(activeQuiz.questions.length).padStart(2, "0")}
                  </h2>
                </div>

                {/* Bold Highlighted Real-Time Countdown Timer Box */}
                <div
                  className={`px-4 py-2.5 rounded-2xl border font-mono tabular-nums transition-all ${
                    secondsLeft <= 30
                      ? "border-rose-500/50 bg-rose-500/15 text-rose-600 dark:text-rose-400 animate-pulse shadow-lg shadow-rose-500/10"
                      : secondsLeft <= 120
                      ? "border-amber-500/50 bg-amber-500/15 text-amber-600 dark:text-amber-400"
                      : "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  <div className="text-[10px] uppercase tracking-wider font-sans opacity-80">
                    {timerMode === "full"
                      ? "Full Exam Clock"
                      : "Question Clock"}
                  </div>
                  <div className="text-base sm:text-lg font-bold">
                    {secondsLeft <= 30
                      ? `! Critical · ${formatTime(secondsLeft)}`
                      : secondsLeft <= 120
                      ? `▲ Low Time · ${formatTime(secondsLeft)}`
                      : `● Nominal · ${formatTime(secondsLeft)}`}
                  </div>
                </div>
              </div>

              {/* Dual Animated Progress Bars: Question Advancement & Timer Depletion */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
                  <span>
                    Question Progress:{" "}
                    {Math.round(
                      ((currentIndex + 1) / activeQuiz.questions.length) * 100
                    )}
                    %
                  </span>
                  <span>
                    Answered: {Object.keys(userAnswers).length} /{" "}
                    {activeQuiz.questions.length}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500 ease-out rounded-full"
                    style={{
                      width: `${
                        ((currentIndex + 1) / activeQuiz.questions.length) * 100
                      }%`,
                    }}
                  />
                </div>
                <div className="w-full h-1 bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-700 ease-linear ${
                      secondsLeft <= 30
                        ? "bg-rose-500"
                        : secondsLeft <= 120
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                    style={{ width: `${timerProgressPercent}%` }}
                  />
                </div>
              </div>

              {/* Question Stem */}
              <div className="py-2">
                <p className="text-base sm:text-lg font-medium text-slate-900 dark:text-white leading-relaxed whitespace-pre-line">
                  {activeQuiz.questions[currentIndex].question}
                </p>
              </div>

              {/* 4 Multiple Choice Options with Smooth Micro-Interactions */}
              <div className="space-y-3">
                {activeQuiz.questions[currentIndex].options.map(
                  (optionText, optIdx) => {
                    const isSelected = userAnswers[currentIndex] === optIdx;
                    const optionLabel = ["A", "B", "C", "D"][optIdx];

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelectOption(optIdx)}
                        className={`w-full text-left p-4 rounded-xl border transition-all duration-150 flex items-start gap-3.5 cursor-pointer active:scale-[0.99] ${
                          isSelected
                            ? "border-indigo-500 bg-indigo-500/10 dark:bg-indigo-500/15 text-slate-900 dark:text-white ring-1 ring-indigo-500 shadow-md shadow-indigo-500/10"
                            : "border-slate-200 dark:border-slate-800 hover:border-indigo-500/40 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200"
                        }`}
                      >
                        <span
                          className={`font-mono tabular-nums text-xs font-bold px-2.5 py-1 rounded-lg border shrink-0 mt-0.5 transition-colors ${
                            isSelected
                              ? "border-indigo-500 bg-gradient-to-br from-indigo-600 to-violet-600 text-white"
                              : "border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400"
                          }`}
                        >
                          {optionLabel}
                        </span>
                        <span className="text-sm sm:text-base leading-relaxed flex-1">
                          {optionText}
                        </span>
                        {isSelected && (
                          <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 shrink-0 self-center">
                            ✓ Selected
                          </span>
                        )}
                      </button>
                    );
                  }
                )}
              </div>

              {/* Quiz Navigation & Action Bar */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    disabled={currentIndex === 0}
                    onClick={() => goToQuestion(currentIndex - 1)}
                    className="px-4 py-2.5 text-xs font-semibold border border-slate-300 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 active:scale-95 transition-all whitespace-nowrap cursor-pointer disabled:cursor-not-allowed"
                  >
                    ← Previous
                  </button>

                  <button
                    type="button"
                    onClick={handleToggleMark}
                    className={`px-4 py-2.5 text-xs font-semibold border rounded-xl active:scale-95 transition-all whitespace-nowrap cursor-pointer ${
                      markedQuestions.includes(currentIndex)
                        ? "border-amber-500 bg-amber-500/15 text-amber-700 dark:text-amber-300"
                        : "border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    {markedQuestions.includes(currentIndex)
                      ? "▲ Marked for Review"
                      : "⚑ Mark for Review"}
                  </button>

                  {userAnswers[currentIndex] !== undefined &&
                    userAnswers[currentIndex] !== null && (
                      <button
                        type="button"
                        onClick={handleClearResponse}
                        className="px-3 py-2 text-xs font-medium text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors whitespace-nowrap cursor-pointer"
                      >
                        Clear Answer
                      </button>
                    )}
                </div>

                <div className="flex items-center gap-2.5">
                  {currentIndex < activeQuiz.questions.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => goToQuestion(currentIndex + 1)}
                      className="px-5 py-2.5 text-xs font-semibold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl hover:bg-slate-800 dark:hover:bg-white active:scale-95 transition-all whitespace-nowrap cursor-pointer"
                    >
                      Next Question →
                    </button>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => setConfirmSubmitOpen(true)}
                    className="px-5 py-2.5 text-xs font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl shadow-lg shadow-indigo-500/25 active:scale-95 transition-all whitespace-nowrap cursor-pointer"
                  >
                    Submit Quiz
                  </button>
                </div>
              </div>
            </div>

            {/* Right Deck: Question Navigation Palette & Status Summary (4 Columns) */}
            <aside className="lg:col-span-4 border border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl p-6 shadow-xl shadow-slate-950/5 space-y-6">
              <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  Question Navigation Palette
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Active question is highlighted in Indigo. Keyboard:{" "}
                  <span className="font-mono">1-4</span> options,{" "}
                  <span className="font-mono">N/P</span> navigate,{" "}
                  <span className="font-mono">M</span> mark.
                </p>
              </div>

              {/* Question Number Grid with Highlighted Active Question */}
              <div className="grid grid-cols-5 gap-2.5 font-mono tabular-nums">
                {activeQuiz.questions.map((q, idx) => {
                  const isAnswered =
                    userAnswers[idx] !== undefined && userAnswers[idx] !== null;
                  const isMarked = markedQuestions.includes(idx);
                  const isVisited = visitedQuestions.includes(idx);
                  const isCurrent = currentIndex === idx;

                  let btnStyle =
                    "border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 bg-transparent";
                  let symbol = "·";

                  if (isAnswered && isMarked) {
                    btnStyle =
                      "border-amber-400 bg-emerald-600 text-white font-bold";
                    symbol = "⚑";
                  } else if (isAnswered) {
                    btnStyle =
                      "border-emerald-600 bg-emerald-600 text-white font-bold";
                    symbol = "✓";
                  } else if (isMarked) {
                    btnStyle =
                      "border-amber-500 bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold";
                    symbol = "▲";
                  } else if (isVisited) {
                    btnStyle =
                      "border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 bg-slate-100/80 dark:bg-slate-800/70";
                    symbol = "○";
                  }

                  if (isCurrent) {
                    btnStyle =
                      "border-indigo-500 bg-gradient-to-br from-indigo-600 to-violet-600 text-white font-bold ring-2 ring-indigo-400 ring-offset-2 dark:ring-offset-slate-900 scale-105 shadow-lg shadow-indigo-500/30";
                  }

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => goToQuestion(idx)}
                      className={`h-11 rounded-xl border text-xs flex items-center justify-center gap-1 transition-all cursor-pointer ${btnStyle} ${
                        !isCurrent ? "hover:scale-105" : ""
                      }`}
                      title={`Question ${idx + 1}: ${q.subtopic}`}
                    >
                      <span>{String(idx + 1).padStart(2, "0")}</span>
                      <span className="text-[10px]">{symbol}</span>
                    </button>
                  );
                })}
              </div>

              {/* Explicit Legend */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                  <span>✓ Answered</span>
                  <span className="font-mono tabular-nums font-bold text-emerald-600 dark:text-emerald-400">
                    {Object.keys(userAnswers).length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                  <span>▲ Marked for Review</span>
                  <span className="font-mono tabular-nums font-bold text-amber-600 dark:text-amber-400">
                    {markedQuestions.length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                  <span>○ Visited (Unanswered)</span>
                  <span className="font-mono tabular-nums font-semibold">
                    {
                      visitedQuestions.filter(
                        (idx) =>
                          userAnswers[idx] === undefined ||
                          userAnswers[idx] === null
                      ).length
                    }
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span>· Unvisited</span>
                  <span className="font-mono tabular-nums">
                    {activeQuiz.questions.length - visitedQuestions.length}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
                <button
                  type="button"
                  onClick={() => setConfirmSubmitOpen(true)}
                  className="w-full py-3 px-4 text-xs font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl shadow-lg shadow-indigo-500/25 active:scale-95 transition-all cursor-pointer"
                >
                  Finish & Submit Assessment
                </button>
                <button
                  type="button"
                  onClick={() => setView("dashboard")}
                  className="w-full py-2 px-4 text-xs font-medium text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                >
                  Abort & Return to Dashboard
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* DETAILED RESULT, ANALYTICS & AI FEEDBACK SECTION */}
        {view === "result" && activeAttempt && (
          <ResultAnalyticsView
            activeAttempt={activeAttempt}
            profileName={profile.name}
            targetAccuracy={profile.targetAccuracy}
            isAnalyzingAI={isAnalyzingAI}
            isGeneratingQuiz={isGeneratingQuiz}
            reviewFilter={reviewFilter}
            setReviewFilter={setReviewFilter}
            formatTime={formatTime}
            onRetake={(quiz, mode) => startQuizSession(quiz, mode)}
            onBackToDashboard={() => setView("dashboard")}
            onOpenScorecardPopup={() => setScorecardModalOpen(true)}
            onGenerateRemedialQuiz={(topic) => {
              setAiTopic(topic);
              handleGenerateAIQuiz(undefined, topic);
            }}
          />
        )}
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 py-6 mt-12 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>
            AssessAI — AI-Powered Online Mock Test & Technical Quiz Platform
          </span>
          <div className="flex items-center gap-4">
            <span>LocalStorage Persistence Active</span>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => setExportModalOpen(true)}
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium cursor-pointer"
            >
              Export Standalone Single-File HTML
            </button>
          </div>
        </div>
      </footer>

      {/* Animated Pop-up Modals */}
      <SubmitConfirmationModal
        open={confirmSubmitOpen}
        quiz={activeQuiz}
        answeredCount={Object.keys(userAnswers).length}
        markedCount={markedQuestions.length}
        secondsLeftFormatted={formatTime(secondsLeft)}
        onCancel={() => setConfirmSubmitOpen(false)}
        onConfirm={finalizeQuizSubmission}
      />

      <ScorecardCelebrationModal
        open={scorecardModalOpen}
        attempt={activeAttempt}
        targetAccuracy={profile.targetAccuracy}
        formatTime={formatTime}
        onClose={() => setScorecardModalOpen(false)}
        onRetake={() => {
          if (!activeAttempt) return;
          setScorecardModalOpen(false);
          startQuizSession(
            {
              id: activeAttempt.quizId,
              title: activeAttempt.quizTitle,
              category: activeAttempt.category,
              difficulty: activeAttempt.difficulty,
              durationMinutes: activeAttempt.questions.length,
              perQuestionSeconds: 60,
              description: "",
              questions: activeAttempt.questions,
            },
            activeAttempt.timerMode
          );
        }}
      />

      <ClearHistoryModal
        open={confirmClearHistory}
        attemptCount={attempts.length}
        onCancel={() => setConfirmClearHistory(false)}
        onConfirm={() => {
          setAttempts([]);
          setConfirmClearHistory(false);
          triggerToast(
            "Attempt History Cleared",
            "All past quiz logs have been removed from LocalStorage.",
            "rose"
          );
        }}
      />

      <ExportSingleHtmlModal
        open={exportModalOpen}
        htmlSource={buildStandaloneHtmlSource()}
        copied={copiedHtmlNotice}
        onClose={() => setExportModalOpen(false)}
        onCopy={handleCopyStandaloneHtml}
        onDownload={handleDownloadStandaloneHtml}
      />
    </div>
  );
}
