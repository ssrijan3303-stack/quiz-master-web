import React from "react";
import { QuizAttempt, QuizDefinition } from "../data/mockTests";

export type ReviewFilter = "all" | "incorrect" | "correct" | "skipped";

export function ResultAnalyticsView({
  activeAttempt,
  profileName,
  targetAccuracy,
  isAnalyzingAI,
  isGeneratingQuiz,
  reviewFilter,
  setReviewFilter,
  formatTime,
  onRetake,
  onBackToDashboard,
  onOpenScorecardPopup,
  onGenerateRemedialQuiz,
}: {
  activeAttempt: QuizAttempt;
  profileName: string;
  targetAccuracy: number;
  isAnalyzingAI: boolean;
  isGeneratingQuiz: boolean;
  reviewFilter: ReviewFilter;
  setReviewFilter: (f: ReviewFilter) => void;
  formatTime: (secs: number) => string;
  onRetake: (quiz: QuizDefinition, mode: "full" | "per_question") => void;
  onBackToDashboard: () => void;
  onOpenScorecardPopup: () => void;
  onGenerateRemedialQuiz: (topic: string) => void;
}) {
  const passed = activeAttempt.accuracy >= targetAccuracy;

  const filteredQuestions = activeAttempt.questions
    .map((q, idx) => ({ q, idx }))
    .filter(({ q, idx }) => {
      const ans = activeAttempt.userAnswers[idx];
      const isCorrect = ans === q.correctAnswer;
      const isSkipped = ans === undefined || ans === null;
      if (reviewFilter === "correct") return isCorrect;
      if (reviewFilter === "incorrect") return !isCorrect && !isSkipped;
      if (reviewFilter === "skipped") return isSkipped;
      return true;
    });

  return (
    <div className="space-y-8">
      {/* 01. Instant Scorecard & Visual Distribution */}
      <section className="border border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-xl shadow-slate-950/5 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
              <span className="font-sans font-semibold text-indigo-600 dark:text-indigo-400">
                Completed {activeAttempt.timestamp}
              </span>
              <span aria-hidden="true">·</span>
              <span>{activeAttempt.category}</span>
              <span aria-hidden="true">·</span>
              <span>{activeAttempt.difficulty}</span>
              <span aria-hidden="true">·</span>
              <span>Candidate: {profileName}</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">
              {activeAttempt.quizTitle} — Official Scorecard
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onOpenScorecardPopup}
              className="px-3.5 py-2 text-xs font-semibold border border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 rounded-xl hover:bg-indigo-500/20 active:scale-95 transition-all whitespace-nowrap cursor-pointer"
            >
              Scorecard Pop-up
            </button>
            <button
              type="button"
              onClick={() => {
                const retakeQuiz: QuizDefinition = {
                  id: activeAttempt.quizId,
                  title: activeAttempt.quizTitle,
                  category: activeAttempt.category,
                  difficulty: activeAttempt.difficulty,
                  durationMinutes: activeAttempt.questions.length,
                  perQuestionSeconds: 60,
                  description: "",
                  questions: activeAttempt.questions,
                };
                onRetake(retakeQuiz, activeAttempt.timerMode);
              }}
              className="px-4 py-2 text-xs font-semibold border border-slate-300 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all whitespace-nowrap cursor-pointer"
            >
              Retake Quiz
            </button>
            <button
              type="button"
              onClick={onBackToDashboard}
              className="px-4 py-2 text-xs font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl shadow-md shadow-indigo-500/25 active:scale-95 transition-all whitespace-nowrap cursor-pointer"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>

        {/* Highlighted Quantitative Scorecard Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 font-mono tabular-nums">
          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30">
            <p className="text-xs font-sans font-medium text-indigo-600 dark:text-indigo-300">
              Accuracy Score
            </p>
            <p
              className={`text-2xl sm:text-3xl font-bold mt-1 ${
                passed
                  ? "text-emerald-600 dark:text-emerald-400"
                  : activeAttempt.accuracy >= 60
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {activeAttempt.accuracy}%
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800">
            <p className="text-xs font-sans font-medium text-slate-500 dark:text-slate-400">
              Total Questions
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
              {activeAttempt.totalQuestions}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
            <p className="text-xs font-sans font-medium text-emerald-700 dark:text-emerald-400">
              ✓ Correct
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {activeAttempt.correctCount}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30">
            <p className="text-xs font-sans font-medium text-rose-700 dark:text-rose-400">
              ✕ Incorrect
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-rose-600 dark:text-rose-400 mt-1">
              {activeAttempt.incorrectCount}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
            <p className="text-xs font-sans font-medium text-amber-700 dark:text-amber-400">
              ○ Unattempted
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400 mt-1">
              {activeAttempt.skippedCount}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800">
            <p className="text-xs font-sans font-medium text-slate-500 dark:text-slate-400">
              Time Taken
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
              {formatTime(activeAttempt.timeTakenSeconds)}
            </p>
          </div>
        </div>

        {/* Stacked Proportional Performance Breakdown Bar */}
        <div className="space-y-2.5 pt-2">
          <div className="flex flex-wrap items-center justify-between text-xs font-mono tabular-nums">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              ✓ Correct:{" "}
              {Math.round(
                (activeAttempt.correctCount / activeAttempt.totalQuestions) *
                  100
              )}
              % ({activeAttempt.correctCount})
            </span>
            <span className="text-rose-600 dark:text-rose-400 font-semibold">
              ✕ Incorrect:{" "}
              {Math.round(
                (activeAttempt.incorrectCount / activeAttempt.totalQuestions) *
                  100
              )}
              % ({activeAttempt.incorrectCount})
            </span>
            <span className="text-amber-600 dark:text-amber-400 font-semibold">
              ○ Unattempted:{" "}
              {Math.round(
                (activeAttempt.skippedCount / activeAttempt.totalQuestions) *
                  100
              )}
              % ({activeAttempt.skippedCount})
            </span>
          </div>
          <div className="w-full h-3.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
            <div
              className="h-full bg-emerald-500 transition-all duration-700 ease-out"
              style={{
                width: `${
                  (activeAttempt.correctCount / activeAttempt.totalQuestions) *
                  100
                }%`,
              }}
            />
            <div
              className="h-full bg-rose-500 transition-all duration-700 ease-out"
              style={{
                width: `${
                  (activeAttempt.incorrectCount /
                    activeAttempt.totalQuestions) *
                  100
                }%`,
              }}
            />
            <div
              className="h-full bg-amber-400 transition-all duration-700 ease-out"
              style={{
                width: `${
                  (activeAttempt.skippedCount / activeAttempt.totalQuestions) *
                  100
                }%`,
              }}
            />
          </div>
        </div>
      </section>

      {/* 02. AI Performance Analysis & Subtopic Mastery Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* AI Diagnostic Coach (7 Columns) */}
        <section className="lg:col-span-7 border border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-xl shadow-slate-950/5 space-y-6">
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                {isAnalyzingAI
                  ? "● Refining diagnostic with Gemini AI..."
                  : activeAttempt.aiAnalysis.source === "gemini"
                  ? "● AI Diagnostic Report (Gemini 3.8 Flash)"
                  : "● AI Performance Analysis & Study Coach"}
              </p>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-0.5">
                {activeAttempt.aiAnalysis.headline}
              </h2>
            </div>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {activeAttempt.aiAnalysis.executiveSummary}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
              <h3 className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                ✓ Demonstrated Strengths
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-200">
                {activeAttempt.aiAnalysis.strengths.map((s, i) => (
                  <li key={i} className="leading-relaxed">
                    · {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-2">
              <h3 className="text-xs font-bold text-rose-700 dark:text-rose-400">
                ▲ Priority Subtopics to Review
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-200">
                {activeAttempt.aiAnalysis.weakAreas.map((w, i) => (
                  <li key={i} className="leading-relaxed">
                    · {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 3-Step Recommended Study Roadmap */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Recommended 3-Step Study Roadmap
            </h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {activeAttempt.aiAnalysis.studyPlan.map((step, idx) => (
                <div
                  key={idx}
                  className="py-3 first:pt-1 last:pb-1 flex items-start justify-between gap-4"
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">
                      {step.stepTitle}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {step.action}
                    </p>
                  </div>
                  <span className="text-xs font-mono tabular-nums text-indigo-600 dark:text-indigo-400 font-semibold shrink-0">
                    {step.estimatedTime}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 1-Click Targeted Remedial Quiz CTA */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-600 dark:text-slate-300">
              Recommended Follow-Up Topic:{" "}
              <strong className="text-slate-900 dark:text-white">
                {activeAttempt.aiAnalysis.recommendedNextTopic}
              </strong>
            </div>
            <button
              type="button"
              disabled={isGeneratingQuiz}
              onClick={() =>
                onGenerateRemedialQuiz(
                  activeAttempt.aiAnalysis.recommendedNextTopic
                )
              }
              className="px-4 py-2.5 text-xs font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl shadow-md shadow-indigo-500/20 active:scale-95 transition-all whitespace-nowrap cursor-pointer"
            >
              {isGeneratingQuiz
                ? "Generating Remedial Quiz..."
                : "Generate Targeted Remedial Quiz →"}
            </button>
          </div>
        </section>

        {/* Subtopic Mastery & Pacing Analytics (5 Columns) */}
        <section className="lg:col-span-5 border border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-xl shadow-slate-950/5 space-y-6">
          <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Subtopic Accuracy & Pacing Graph
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Question-by-question response time and accuracy telemetry.
            </p>
          </div>

          <div className="space-y-3 font-mono tabular-nums text-xs">
            {activeAttempt.questions.map((q, idx) => {
              const ans = activeAttempt.userAnswers[idx];
              const isCorrect = ans === q.correctAnswer;
              const isSkipped = ans === undefined || ans === null;
              const spent = activeAttempt.questionTimes[idx] || 4;
              const maxBar = Math.max(
                30,
                ...Object.values(activeAttempt.questionTimes),
                10
              );
              const widthPct = Math.min(
                100,
                Math.max(8, Math.round((spent / maxBar) * 100))
              );

              return (
                <div key={q.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="truncate max-w-[230px] font-sans text-slate-700 dark:text-slate-300">
                      Q{String(idx + 1).padStart(2, "0")} · {q.subtopic}
                    </span>
                    <span
                      className={`font-semibold ${
                        isCorrect
                          ? "text-emerald-600 dark:text-emerald-400"
                          : isSkipped
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {isCorrect ? "✓" : isSkipped ? "○" : "✕"} {spent}s
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCorrect
                          ? "bg-emerald-500"
                          : isSkipped
                          ? "bg-amber-400"
                          : "bg-rose-500"
                      }`}
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* 03. Detailed Question-by-Question Answer Key & Explanations */}
      <section className="border border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-xl shadow-slate-950/5 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Detailed Question Review & Explanations
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Compare your selected responses against the verified answer key
              and conceptual breakdowns.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-200/70 dark:bg-slate-800/90 rounded-xl font-mono tabular-nums">
            {(
              [
                { id: "all", label: `All (${activeAttempt.totalQuestions})` },
                {
                  id: "incorrect",
                  label: `✕ Incorrect (${activeAttempt.incorrectCount})`,
                },
                {
                  id: "correct",
                  label: `✓ Correct (${activeAttempt.correctCount})`,
                },
                {
                  id: "skipped",
                  label: `○ Skipped (${activeAttempt.skippedCount})`,
                },
              ] as { id: ReviewFilter; label: string }[]
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setReviewFilter(tab.id)}
                className={`px-3 py-1.5 text-xs font-sans font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  reviewFilter === tab.id
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {filteredQuestions.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">
            No questions match this filter category.
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {filteredQuestions.map(({ q, idx }) => {
              const userAns = activeAttempt.userAnswers[idx];
              const isCorrect = userAns === q.correctAnswer;
              const isSkipped = userAns === undefined || userAns === null;
              const spentSecs = activeAttempt.questionTimes[idx] || 0;

              return (
                <div key={q.id} className="py-6 first:pt-2 last:pb-2 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono tabular-nums">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      <span className="font-bold text-slate-900 dark:text-white">
                        Question {String(idx + 1).padStart(2, "0")}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-sans text-indigo-600 dark:text-indigo-400 font-medium">
                        {q.subtopic}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>Time: {spentSecs}s</span>
                    </div>

                    <span
                      className={`font-bold ${
                        isCorrect
                          ? "text-emerald-600 dark:text-emerald-400"
                          : isSkipped
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {isCorrect
                        ? "✓ Correct (+1)"
                        : isSkipped
                        ? "○ Unattempted (0)"
                        : "✕ Incorrect (0)"}
                    </span>
                  </div>

                  <p className="text-base font-medium text-slate-900 dark:text-white leading-relaxed">
                    {q.question}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm">
                    {q.options.map((opt, optIdx) => {
                      const isRightOption = optIdx === q.correctAnswer;
                      const isUserChoice = optIdx === userAns;
                      const letter = ["A", "B", "C", "D"][optIdx];

                      let cardCls =
                        "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 bg-transparent";
                      let statusNote = "";

                      if (isRightOption) {
                        cardCls =
                          "border-emerald-500/60 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100 font-medium";
                        statusNote = isUserChoice
                          ? "✓ Your Answer (Correct)"
                          : "✓ Correct Answer";
                      } else if (isUserChoice && !isRightOption) {
                        cardCls =
                          "border-rose-500/60 bg-rose-500/10 text-rose-950 dark:text-rose-100 font-medium";
                        statusNote = "✕ Your Selected Answer";
                      }

                      return (
                        <div
                          key={optIdx}
                          className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 ${cardCls}`}
                        >
                          <div className="flex items-start gap-2.5">
                            <span className="font-mono tabular-nums font-bold">
                              {letter}.
                            </span>
                            <span className="leading-relaxed">{opt}</span>
                          </div>
                          {statusNote && (
                            <span className="font-mono text-[11px] font-bold shrink-0">
                              {statusNote}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                    <strong className="text-indigo-600 dark:text-indigo-400 font-semibold">
                      Conceptual Explanation:{" "}
                    </strong>
                    {q.explanation}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
