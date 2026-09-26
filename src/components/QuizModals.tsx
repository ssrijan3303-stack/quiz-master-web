import React from "react";
import { QuizAttempt, QuizDefinition } from "../data/mockTests";

export interface ToastNotice {
  id: number;
  title: string;
  message: string;
  tone: "indigo" | "emerald" | "rose" | "amber";
}

export function ToastAlert({
  toast,
  onDismiss,
}: {
  toast: ToastNotice | null;
  onDismiss: () => void;
}) {
  if (!toast) return null;

  const toneStyles = {
    indigo:
      "border-indigo-500/40 bg-slate-900/95 text-slate-100 shadow-indigo-500/15",
    emerald:
      "border-emerald-500/40 bg-emerald-950/95 text-emerald-100 shadow-emerald-500/15",
    rose: "border-rose-500/40 bg-rose-950/95 text-rose-100 shadow-rose-500/15",
    amber:
      "border-amber-500/40 bg-amber-950/95 text-amber-100 shadow-amber-500/15",
  }[toast.tone];

  const indicatorDot = {
    indigo: "bg-indigo-400",
    emerald: "bg-emerald-400",
    rose: "bg-rose-400",
    amber: "bg-amber-400",
  }[toast.tone];

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full px-4 pointer-events-none">
      <div
        className={`animate-modal-in pointer-events-auto rounded-2xl border p-4 backdrop-blur-md shadow-2xl flex items-start justify-between gap-3 ${toneStyles}`}
      >
        <div className="flex items-start gap-3">
          <span
            className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${indicatorDot}`}
          />
          <div>
            <p className="text-xs font-semibold tracking-wide">{toast.title}</p>
            <p className="text-xs opacity-90 mt-0.5 leading-relaxed">
              {toast.message}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="text-xs opacity-70 hover:opacity-100 px-1.5 py-0.5 rounded cursor-pointer"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export function SubmitConfirmationModal({
  open,
  quiz,
  answeredCount,
  markedCount,
  secondsLeftFormatted,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  quiz: QuizDefinition | null;
  answeredCount: number;
  markedCount: number;
  secondsLeftFormatted: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open || !quiz) return null;

  const total = quiz.questions.length;
  const unansweredCount = Math.max(0, total - answeredCount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-backdrop-in">
      <div className="animate-modal-in w-full max-w-md rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 md:p-7 shadow-2xl space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Final Examination Lock
            </p>
            <h3 className="font-display text-xl font-semibold text-slate-900 dark:text-white">
              Submit Your Assessment?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Review your question palette summary before locking your responses
              and generating the AI diagnostic report.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-sm p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* 3-Card Status Breakdown */}
        <div className="grid grid-cols-3 gap-3 font-mono tabular-nums text-center">
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {answeredCount}
            </div>
            <div className="text-[11px] font-sans font-medium text-slate-600 dark:text-slate-300 mt-0.5">
              ✓ Answered
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30">
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              {unansweredCount}
            </div>
            <div className="text-[11px] font-sans font-medium text-slate-600 dark:text-slate-300 mt-0.5">
              ○ Unanswered
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {markedCount}
            </div>
            <div className="text-[11px] font-sans font-medium text-slate-600 dark:text-slate-300 mt-0.5">
              ⚑ Marked
            </div>
          </div>
        </div>

        {unansweredCount > 0 && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-700 dark:text-rose-300 leading-relaxed">
            <strong>Attention:</strong> You still have{" "}
            <span className="font-mono font-bold">{unansweredCount}</span>{" "}
            unanswered question{unansweredCount > 1 ? "s" : ""} with{" "}
            <span className="font-mono font-bold">{secondsLeftFormatted}</span>{" "}
            remaining on the clock.
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 text-xs font-semibold border border-slate-300 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
          >
            Return to Questions
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-5 py-2.5 text-xs font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl shadow-lg shadow-indigo-500/25 active:scale-95 transition-all cursor-pointer"
          >
            Confirm & Score Quiz →
          </button>
        </div>
      </div>
    </div>
  );
}

export function ScorecardCelebrationModal({
  open,
  attempt,
  targetAccuracy,
  formatTime,
  onClose,
  onRetake,
}: {
  open: boolean;
  attempt: QuizAttempt | null;
  targetAccuracy: number;
  formatTime: (sec: number) => string;
  onClose: () => void;
  onRetake: () => void;
}) {
  if (!open || !attempt) return null;

  const passed = attempt.accuracy >= targetAccuracy;
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (attempt.accuracy / 100) * circumference;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-backdrop-in">
      <div className="animate-modal-in w-full max-w-lg rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 md:p-8 shadow-2xl space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              {passed
                ? "★ Target Benchmark Achieved"
                : "● Official Assessment Scorecard"}
            </p>
            <h3 className="font-display text-2xl font-semibold text-slate-900 dark:text-white mt-0.5">
              {attempt.quizTitle}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono tabular-nums">
              {attempt.category} · {attempt.difficulty} · Completed in{" "}
              {formatTime(attempt.timeTakenSeconds)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-sm p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Radial SVG Score Gauge + Summary */}
        <div className="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800">
          <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r={radius}
                stroke="currentColor"
                strokeWidth="10"
                fill="transparent"
                className="text-slate-200 dark:text-slate-700"
              />
              <circle
                cx="60"
                cy="60"
                r={radius}
                stroke="currentColor"
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className={`transition-all duration-700 ease-out ${
                  passed
                    ? "text-emerald-500"
                    : attempt.accuracy >= 55
                    ? "text-indigo-500"
                    : "text-rose-500"
                }`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-mono tabular-nums font-bold text-slate-900 dark:text-white">
                {attempt.accuracy}%
              </span>
              <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Accuracy
              </span>
            </div>
          </div>

          <div className="space-y-2 text-center sm:text-left">
            <div className="text-sm font-semibold text-slate-900 dark:text-white">
              {attempt.aiAnalysis.headline}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
              {attempt.aiAnalysis.executiveSummary}
            </p>
          </div>
        </div>

        {/* 4 Metric Highlights (Emerald for Correct, Rose for Incorrect) */}
        <div className="grid grid-cols-4 gap-2.5 font-mono tabular-nums text-center">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              ✓ {attempt.correctCount}
            </div>
            <div className="text-[11px] font-sans text-slate-600 dark:text-slate-300">
              Correct
            </div>
          </div>
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30">
            <div className="text-lg font-bold text-rose-600 dark:text-rose-400">
              ✕ {attempt.incorrectCount}
            </div>
            <div className="text-[11px] font-sans text-slate-600 dark:text-slate-300">
              Incorrect
            </div>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <div className="text-lg font-bold text-amber-600 dark:text-amber-400">
              ○ {attempt.skippedCount}
            </div>
            <div className="text-[11px] font-sans text-slate-600 dark:text-slate-300">
              Skipped
            </div>
          </div>
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30">
            <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
              {formatTime(attempt.timeTakenSeconds)}
            </div>
            <div className="text-[11px] font-sans text-slate-600 dark:text-slate-300">
              Duration
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onRetake}
            className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold border border-slate-300 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
          >
            Retake Quiz
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:flex-1 py-2.5 px-5 text-xs font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl shadow-lg shadow-indigo-500/25 active:scale-95 transition-all cursor-pointer"
          >
            Inspect Full Analytics, AI Study Plan & Answer Key →
          </button>
        </div>
      </div>
    </div>
  );
}

export function ClearHistoryModal({
  open,
  attemptCount,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  attemptCount: number;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-backdrop-in">
      <div className="animate-modal-in w-full max-w-md rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-5">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            Destructive Action Confirmation
          </p>
          <h3 className="font-display text-xl font-semibold text-slate-900 dark:text-white">
            Clear All Past Quiz Attempts?
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            This will permanently remove all{" "}
            <strong className="font-mono">{attemptCount}</strong> recorded quiz
            scorecards and analytics logs from your browser&apos;s LocalStorage.
          </p>
        </div>
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-lg shadow-rose-500/25 active:scale-95 transition-all cursor-pointer"
          >
            Yes, Delete History
          </button>
        </div>
      </div>
    </div>
  );
}

export function ExportSingleHtmlModal({
  open,
  htmlSource,
  copied,
  onClose,
  onCopy,
  onDownload,
}: {
  open: boolean;
  htmlSource: string;
  copied: boolean;
  onClose: () => void;
  onCopy: () => void;
  onDownload: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-backdrop-in">
      <div className="animate-modal-in w-full max-w-3xl rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 md:p-7 shadow-2xl space-y-5 max-h-[90vh] flex flex-col">
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Portable Single-File Edition
            </p>
            <h3 className="font-display text-xl font-semibold text-slate-900 dark:text-white mt-0.5">
              Standalone HTML (Tailwind CDN + Vanilla JavaScript)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Includes the upgraded Deep Slate / Indigo / Violet / Emerald /
              Rose design system, animated pop-up modals, and all 8 subject
              question banks in one self-contained HTML file.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-sm p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-200 leading-relaxed">
          <pre className="whitespace-pre-wrap break-all">
            {htmlSource.slice(0, 4200)}
            {"\n\n/* ... Complete standalone file ready for copy or download ... */"}
          </pre>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
            Zero build step required · Runs directly in any browser
          </span>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onCopy}
              className="px-4 py-2.5 text-xs font-semibold border border-slate-300 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
            >
              {copied ? "✓ Copied Full HTML!" : "Copy Complete HTML"}
            </button>
            <button
              type="button"
              onClick={onDownload}
              className="px-5 py-2.5 text-xs font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl shadow-lg shadow-indigo-500/25 active:scale-95 transition-all cursor-pointer"
            >
              Download AssessAI-Mock-Test-Platform.html
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
