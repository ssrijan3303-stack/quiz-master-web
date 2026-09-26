import { PREBUILT_QUIZZES } from "../data/mockTests";

export function buildStandaloneHtmlSource(): string {
  const serializedQuizzes = JSON.stringify(PREBUILT_QUIZZES, null, 2);

  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AssessAI — AI-Powered Online Mock Test & Quiz Platform</title>
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            display: ['Fraunces', 'Georgia', 'serif'],
            sans: ['Plus Jakarta Sans', 'sans-serif'],
            mono: ['JetBrains Mono', 'monospace']
          }
        }
      }
    };
  </script>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&family=JetBrains+Mono:wght@400;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    .tabular-nums { font-variant-numeric: tabular-nums; }
    h1, h2 { text-wrap: balance; }
    @keyframes modalFadeIn {
      from { opacity: 0; transform: scale(0.95) translateY(10px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
    .animate-modal-in { animation: modalFadeIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  </style>
</head>
<body class="bg-[#F8FAFC] text-slate-900 dark:bg-[#0B0F19] dark:text-slate-100 font-sans min-h-screen flex flex-col transition-colors duration-200">

  <!-- Top Navigation Bar -->
  <header class="border-b border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md sticky top-0 z-30">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
      <a href="#dashboard" onclick="app.navigate('dashboard'); return false;" class="font-display text-xl font-semibold tracking-tight text-slate-900 dark:text-white hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
        AssessAI
      </a>
      <nav class="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-300">
        <a href="#dashboard" onclick="app.navigate('dashboard'); return false;" class="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap">Dashboard</a>
        <a href="#ai-generator" onclick="app.scrollToSection('ai-generator-box'); return false;" class="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap">AI Quiz Studio</a>
        <a href="#history" onclick="app.scrollToSection('history-section'); return false;" class="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap">Attempt History</a>
        <a href="#profile" onclick="app.scrollToSection('profile-section'); return false;" class="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap">Candidate Profile</a>
      </nav>
      <div class="flex items-center gap-2.5">
        <button onclick="app.toggleTheme()" id="theme-btn" class="px-3.5 py-2 text-xs font-medium border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all whitespace-nowrap">
          Light Theme
        </button>
        <button onclick="app.scrollToSection('ai-generator-box')" class="px-4 py-2 text-xs font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl shadow-md shadow-indigo-500/20 active:scale-95 transition-all whitespace-nowrap">
          Generate AI Quiz
        </button>
      </div>
    </div>
  </header>

  <!-- Floating Toast Alert Container -->
  <div id="toast-container" class="fixed bottom-5 right-5 z-50 pointer-events-none"></div>

  <!-- Modal Container (Submission Confirmation & Final Results Scorecard) -->
  <div id="modal-root"></div>

  <!-- Main Viewport -->
  <main id="app-root" class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8"></main>

  <!-- Quiet Footer -->
  <footer class="border-t border-slate-200/80 dark:border-slate-800/80 py-6 mt-12 text-xs text-slate-500 dark:text-slate-400">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <span>AssessAI Online Mock Test & Technical Assessment Platform</span>
      <span>LocalStorage Persistence Active · Standalone Edition</span>
    </div>
  </footer>

  <!-- Embedded Vanilla JavaScript Application Engine -->
  <script>
    const PREBUILT_QUIZZES = ${serializedQuizzes};

    const app = {
      view: 'dashboard',
      categoryFilter: 'All',
      difficultyFilter: 'All',
      activeQuiz: null,
      currentIndex: 0,
      userAnswers: {},
      markedQuestions: new Set(),
      visitedQuestions: new Set([0]),
      questionTimes: {},
      timerSecondsLeft: 0,
      totalSecondsElapsed: 0,
      timerInterval: null,
      lastAttempt: null,
      activeModal: null, // 'confirm-submit' | 'scorecard-popup' | null

      profile: JSON.parse(localStorage.getItem('assessai_profile') || '{"name":"Aarav Sharma","program":"BCA Semester V","targetAccuracy":85}'),
      attempts: JSON.parse(localStorage.getItem('assessai_attempts') || '[]'),
      darkMode: (localStorage.getItem('assessai_theme') || 'dark') === 'dark',

      init() {
        this.applyTheme();
        this.render();
      },

      showToast(message, type = 'indigo') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const borderCls = type === 'emerald' ? 'border-emerald-500/40 bg-emerald-950/90 text-emerald-200' : type === 'rose' ? 'border-rose-500/40 bg-rose-950/90 text-rose-200' : 'border-indigo-500/40 bg-slate-900/95 text-slate-100';
        container.innerHTML = \`
          <div class="animate-modal-in pointer-events-auto px-4 py-3 rounded-xl border \${borderCls} backdrop-blur-md shadow-xl text-xs font-medium flex items-center gap-2.5">
            <span>\${message}</span>
          </div>
        \`;
        setTimeout(() => { if (container) container.innerHTML = ''; }, 3200);
      },

      applyTheme() {
        const html = document.documentElement;
        const btn = document.getElementById('theme-btn');
        if (this.darkMode) {
          html.classList.add('dark');
          if (btn) btn.textContent = 'Light Theme';
        } else {
          html.classList.remove('dark');
          if (btn) btn.textContent = 'Dark Theme';
        }
      },

      toggleTheme() {
        this.darkMode = !this.darkMode;
        localStorage.setItem('assessai_theme', this.darkMode ? 'dark' : 'light');
        this.applyTheme();
      },

      navigate(target) {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.activeModal = null;
        this.view = target;
        window.scrollTo({ top: 0, behavior: 'smooth' });
        this.render();
      },

      scrollToSection(id) {
        if (this.view !== 'dashboard') {
          this.navigate('dashboard');
          setTimeout(() => {
            const el = document.getElementById(id);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 60);
        } else {
          const el = document.getElementById(id);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
      },

      saveProfile(e) {
        e.preventDefault();
        const name = document.getElementById('prof-name').value.trim() || 'Candidate';
        const program = document.getElementById('prof-program').value.trim() || 'Computer Science';
        const targetAccuracy = Math.min(100, Math.max(50, Number(document.getElementById('prof-target').value) || 85));
        this.profile = { name, program, targetAccuracy };
        localStorage.setItem('assessai_profile', JSON.stringify(this.profile));
        this.showToast('✓ Candidate profile saved to LocalStorage', 'emerald');
        this.render();
      },

      generateCustomAIQuiz(e) {
        e.preventDefault();
        const topicInput = document.getElementById('ai-topic-input').value.trim();
        const difficulty = document.getElementById('ai-diff-select').value;
        const count = Number(document.getElementById('ai-count-select').value) || 8;
        const topic = topicInput || 'BCA Operating Systems';

        const lower = topic.toLowerCase();
        let pool = [];
        PREBUILT_QUIZZES.forEach(q => {
          if (lower.includes('os') || lower.includes('operating')) { if (q.id === 'bca-os') pool.push(...q.questions); }
          if (lower.includes('python')) { if (q.id === 'python-mastery') pool.push(...q.questions); }
          if (lower.includes('data') || lower.includes('dsa') || lower.includes('algorithm')) { if (q.id === 'dsa-core') pool.push(...q.questions); }
          if (lower.includes('dbms') || lower.includes('sql') || lower.includes('database')) { if (q.id === 'bca-dbms') pool.push(...q.questions); }
          if (lower.includes('network') || lower.includes('tcp')) { if (q.id === 'cs-networks') pool.push(...q.questions); }
          if (lower.includes('aptitude') || lower.includes('math')) { if (q.id === 'aptitude-quant') pool.push(...q.questions); }
          if (lower.includes('oop') || lower.includes('java') || lower.includes('c++')) { if (q.id === 'oop-cpp-java') pool.push(...q.questions); }
          if (lower.includes('web') || lower.includes('javascript') || lower.includes('js')) { if (q.id === 'web-js-arch') pool.push(...q.questions); }
        });

        const templates = [
          {
            id: 'gen-1',
            subtopic: topic + ' — Architecture',
            question: 'In ' + topic + ', which design principle ensures modular maintainability and prevents tight coupling between subsystems?',
            options: [
              'Strict interface abstraction and separation of concerns',
              'Using global mutable state across all modules',
              'Hardcoding runtime parameters into execution loops',
              'Bypassing validation checks on external inputs'
            ],
            correctAnswer: 0,
            explanation: 'Separation of concerns and clean interface boundaries allow components in ' + topic + ' to evolve and scale independently.'
          },
          {
            id: 'gen-2',
            subtopic: topic + ' — Algorithmic Efficiency',
            question: 'When scaling a workload in ' + topic + ' for large input size N, which optimization yields the greatest asymptotic gain?',
            options: [
              'Replacing linear O(N) scans with indexed O(1) or O(log N) lookups',
              'Increasing busy-wait loop iterations on the main thread',
              'Duplicating entire memory buffers on each read request',
              'Serializing all concurrent tasks behind a single global lock'
            ],
            correctAnswer: 0,
            explanation: 'Reducing lookup complexity from O(N) to O(log N) or O(1) via hashing or tree indexing dramatically lowers latency as N grows.'
          },
          {
            id: 'gen-3',
            subtopic: topic + ' — Concurrency & State',
            question: 'What is the primary risk when multiple threads modify shared state in ' + topic + ' without synchronization?',
            options: [
              'Race conditions and non-deterministic data corruption',
              'Automatic compilation into static assembly',
              'Immediate reduction in CPU cache misses',
              'Guaranteed lossless data compression'
            ],
            correctAnswer: 0,
            explanation: 'Unsynchronized concurrent writes cause read-modify-write race conditions and inconsistent state.'
          },
          {
            id: 'gen-4',
            subtopic: topic + ' — Edge-Case Verification',
            question: 'Why is boundary-value analysis critical when testing an implementation of ' + topic + '?',
            options: [
              'Logic defects frequently occur at minimum/maximum bounds, empty inputs, and off-by-one indices',
              'It eliminates the need for compiler type checking',
              'It automatically encrypts network traffic',
              'It halves the source code file size'
            ],
            correctAnswer: 0,
            explanation: 'Boundary conditions (0, 1, N-1, N, empty sets, overflow thresholds) expose off-by-one and allocation bugs.'
          },
          {
            id: 'gen-5',
            subtopic: topic + ' — Fault Tolerance',
            question: 'How should a production-grade system in ' + topic + ' handle transient downstream failures?',
            options: [
              'Validate preconditions early and apply bounded retries with exponential backoff',
              'Silently ignore all errors and return uninitialized memory',
              'Terminate the host operating system immediately',
              'Disable logging and error telemetry'
            ],
            correctAnswer: 0,
            explanation: 'Fail-fast validation paired with bounded exponential backoff prevents cascading failures while recovering from transient faults.'
          },
          {
            id: 'gen-6',
            subtopic: topic + ' — Resource Management',
            question: 'Which pattern prevents memory and handle leaks during long-running execution in ' + topic + '?',
            options: [
              'Deterministic resource release using scoped lifecycle blocks (try-finally / RAII / context managers)',
              'Opening new connections without closing idle descriptors',
              'Storing unbounded logs in an in-memory array',
              'Disabling garbage collection entirely'
            ],
            correctAnswer: 0,
            explanation: 'Scoped lifecycle management guarantees descriptors and buffers are reclaimed even when exceptions occur.'
          },
          {
            id: 'gen-7',
            subtopic: topic + ' — Security & Validation',
            question: 'Which defense-in-depth practice protects ' + topic + ' workflows against injection and unauthorized access?',
            options: [
              'Parameterized execution, strict schema sanitization, and least-privilege permissions',
              'Relying solely on client-side form checks',
              'Concatenating raw user strings into system commands',
              'Hardcoding administrative credentials in client scripts'
            ],
            correctAnswer: 0,
            explanation: 'Parameterized execution and strict server-side schema validation prevent injection vulnerabilities.'
          },
          {
            id: 'gen-8',
            subtopic: topic + ' — Caching Trade-offs',
            question: 'What is the core architectural trade-off of introducing an in-memory cache layer in ' + topic + '?',
            options: [
              'Lower read latency and reduced backend load vs. cache invalidation and staleness management',
              'Higher read latency in exchange for zero RAM usage',
              'Elimination of all network protocols',
              'Automatic conversion of arrays into binary executables'
            ],
            correctAnswer: 0,
            explanation: 'Caching accelerates read throughput but requires careful TTL and invalidation policies to maintain consistency.'
          }
        ];

        const questions = [...pool, ...templates].slice(0, count);
        const customQuiz = {
          id: 'ai-' + Date.now(),
          title: topic + ' (AI Generated)',
          category: 'AI Custom',
          difficulty: difficulty,
          durationMinutes: count,
          perQuestionSeconds: 60,
          description: 'Dynamically generated AI mock assessment tailored to ' + topic + '.',
          questions: questions
        };
        this.showToast('✨ Generated ' + count + ' custom questions on ' + topic, 'indigo');
        this.startQuiz(customQuiz);
      },

      startQuizById(id) {
        const found = PREBUILT_QUIZZES.find(q => q.id === id);
        if (found) this.startQuiz(found);
      },

      startQuiz(quiz) {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.activeQuiz = quiz;
        this.currentIndex = 0;
        this.userAnswers = {};
        this.markedQuestions = new Set();
        this.visitedQuestions = new Set([0]);
        this.questionTimes = {};
        this.timerSecondsLeft = quiz.durationMinutes * 60;
        this.totalSecondsElapsed = 0;
        this.activeModal = null;
        this.view = 'quiz';

        this.timerInterval = setInterval(() => {
          this.timerSecondsLeft--;
          this.totalSecondsElapsed++;
          this.questionTimes[this.currentIndex] = (this.questionTimes[this.currentIndex] || 0) + 1;
          const timerEl = document.getElementById('live-timer-display');
          if (timerEl) {
            timerEl.innerHTML = this.formatTimerBadge(this.timerSecondsLeft);
          }
          if (this.timerSecondsLeft <= 0) {
            this.submitQuiz();
          }
        }, 1000);

        window.scrollTo({ top: 0, behavior: 'smooth' });
        this.render();
      },

      formatTimerBadge(sec) {
        const m = Math.floor(Math.max(0, sec) / 60);
        const s = Math.max(0, sec) % 60;
        const formatted = String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
        if (sec <= 30) {
          return '<span class="px-3.5 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-600 dark:text-rose-400 font-mono tabular-nums font-semibold animate-pulse">! Critical · ' + formatted + '</span>';
        }
        if (sec <= 120) {
          return '<span class="px-3.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-600 dark:text-amber-400 font-mono tabular-nums font-semibold">▲ Low Time · ' + formatted + '</span>';
        }
        return '<span class="px-3.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-mono tabular-nums font-semibold">● Nominal · ' + formatted + '</span>';
      },

      selectOption(optIdx) {
        this.userAnswers[this.currentIndex] = optIdx;
        this.render();
      },

      clearOption() {
        delete this.userAnswers[this.currentIndex];
        this.render();
      },

      toggleMark() {
        if (this.markedQuestions.has(this.currentIndex)) {
          this.markedQuestions.delete(this.currentIndex);
        } else {
          this.markedQuestions.add(this.currentIndex);
        }
        this.render();
      },

      goToQuestion(idx) {
        if (!this.activeQuiz) return;
        if (idx >= 0 && idx < this.activeQuiz.questions.length) {
          this.currentIndex = idx;
          this.visitedQuestions.add(idx);
          this.render();
        }
      },

      openConfirmSubmitModal() {
        this.activeModal = 'confirm-submit';
        this.renderModals();
      },

      closeModal() {
        this.activeModal = null;
        this.renderModals();
      },

      submitQuiz() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        const quiz = this.activeQuiz;
        if (!quiz) return;

        let correct = 0;
        let incorrect = 0;
        let skipped = 0;
        const weakSubtopics = [];

        quiz.questions.forEach((q, idx) => {
          const ans = this.userAnswers[idx];
          if (ans === undefined || ans === null) {
            skipped++;
            weakSubtopics.push(q.subtopic);
          } else if (ans === q.correctAnswer) {
            correct++;
          } else {
            incorrect++;
            weakSubtopics.push(q.subtopic);
          }
        });

        const accuracy = Math.round((correct / quiz.questions.length) * 100);
        const attempt = {
          id: 'att-' + Date.now(),
          quizId: quiz.id,
          quizTitle: quiz.title,
          category: quiz.category,
          difficulty: quiz.difficulty,
          timestamp: new Date().toLocaleString(),
          totalQuestions: quiz.questions.length,
          correctCount: correct,
          incorrectCount: incorrect,
          skippedCount: skipped,
          accuracy: accuracy,
          timeTakenSeconds: this.totalSecondsElapsed,
          userAnswers: { ...this.userAnswers },
          questions: quiz.questions,
          weakSubtopics: [...new Set(weakSubtopics)]
        };

        this.attempts.unshift(attempt);
        localStorage.setItem('assessai_attempts', JSON.stringify(this.attempts.slice(0, 25)));
        this.lastAttempt = attempt;
        this.view = 'result';
        this.activeModal = 'scorecard-popup';
        window.scrollTo({ top: 0, behavior: 'smooth' });
        this.render();
      },

      reviewPastAttempt(attemptId) {
        const found = this.attempts.find(a => a.id === attemptId);
        if (found) {
          this.lastAttempt = found;
          this.activeModal = null;
          this.view = 'result';
          window.scrollTo({ top: 0, behavior: 'smooth' });
          this.render();
        }
      },

      renderModals() {
        const modalRoot = document.getElementById('modal-root');
        if (!modalRoot) return;

        if (this.activeModal === 'confirm-submit' && this.activeQuiz) {
          const total = this.activeQuiz.questions.length;
          const answered = Object.keys(this.userAnswers).length;
          const unanswered = total - answered;
          const marked = this.markedQuestions.size;

          modalRoot.innerHTML = \`
            <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
              <div class="animate-modal-in w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-5">
                <div class="space-y-1">
                  <p class="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Final Submission Check</p>
                  <h3 class="font-display text-xl font-semibold text-slate-900 dark:text-white">Ready to Lock & Submit Quiz?</h3>
                  <p class="text-xs text-slate-500 dark:text-slate-400">Review your question completion status before generating your final scorecard.</p>
                </div>
                <div class="grid grid-cols-3 gap-3 text-center font-mono tabular-nums">
                  <div class="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                    <div class="text-xl font-bold text-emerald-600 dark:text-emerald-400">\${answered}</div>
                    <div class="text-[11px] font-sans text-slate-600 dark:text-slate-300 mt-0.5">Answered</div>
                  </div>
                  <div class="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30">
                    <div class="text-xl font-bold text-rose-600 dark:text-rose-400">\${unanswered}</div>
                    <div class="text-[11px] font-sans text-slate-600 dark:text-slate-300 mt-0.5">Unanswered</div>
                  </div>
                  <div class="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                    <div class="text-xl font-bold text-amber-600 dark:text-amber-400">\${marked}</div>
                    <div class="text-[11px] font-sans text-slate-600 dark:text-slate-300 mt-0.5">Marked</div>
                  </div>
                </div>
                <div class="flex items-center justify-end gap-3 pt-2">
                  <button onclick="app.closeModal()" class="px-4 py-2.5 text-xs font-semibold border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                    Keep Working
                  </button>
                  <button onclick="app.submitQuiz()" class="px-5 py-2.5 text-xs font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl shadow-lg shadow-indigo-500/25 active:scale-95 transition-all">
                    Confirm & Submit Quiz
                  </button>
                </div>
              </div>
            </div>
          \`;
          return;
        }

        if (this.activeModal === 'scorecard-popup' && this.lastAttempt) {
          const att = this.lastAttempt;
          modalRoot.innerHTML = \`
            <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
              <div class="animate-modal-in w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 md:p-8 shadow-2xl space-y-6 text-center">
                <div class="space-y-1">
                  <p class="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Assessment Complete</p>
                  <h3 class="font-display text-2xl font-semibold text-slate-900 dark:text-white">\${att.quizTitle}</h3>
                </div>
                <div class="py-2">
                  <div class="inline-flex flex-col items-center justify-center w-32 h-32 rounded-full border-4 \${att.accuracy >= 75 ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500' : att.accuracy >= 50 ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' : 'border-rose-500 bg-rose-500/10 text-rose-500'}">
                    <span class="text-3xl font-mono tabular-nums font-bold">\${att.accuracy}%</span>
                    <span class="text-[11px] uppercase tracking-wider font-sans text-slate-500 dark:text-slate-400">Accuracy</span>
                  </div>
                </div>
                <div class="grid grid-cols-3 gap-3 font-mono tabular-nums">
                  <div class="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                    <div class="text-lg font-bold text-emerald-600 dark:text-emerald-400">✓ \${att.correctCount}</div>
                    <div class="text-xs font-sans text-slate-500">Correct</div>
                  </div>
                  <div class="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30">
                    <div class="text-lg font-bold text-rose-600 dark:text-rose-400">✕ \${att.incorrectCount}</div>
                    <div class="text-xs font-sans text-slate-500">Incorrect</div>
                  </div>
                  <div class="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                    <div class="text-lg font-bold text-amber-600 dark:text-amber-400">○ \${att.skippedCount}</div>
                    <div class="text-xs font-sans text-slate-500">Skipped</div>
                  </div>
                </div>
                <div class="flex items-center justify-center gap-3 pt-2">
                  <button onclick="app.closeModal()" class="w-full py-3 px-5 text-xs font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl shadow-lg shadow-indigo-500/25 active:scale-95 transition-all">
                    Explore Detailed Answer Key & AI Study Plan →
                  </button>
                </div>
              </div>
            </div>
          \`;
          return;
        }

        modalRoot.innerHTML = '';
      },

      render() {
        const root = document.getElementById('app-root');
        if (!root) return;
        if (this.view === 'dashboard') {
          root.innerHTML = this.renderDashboard();
        } else if (this.view === 'quiz') {
          root.innerHTML = this.renderQuiz();
        } else if (this.view === 'result') {
          root.innerHTML = this.renderResult();
        }
        this.renderModals();
      },

      renderDashboard() {
        const filtered = PREBUILT_QUIZZES.filter(q => {
          const catMatch = this.categoryFilter === 'All' || q.category === this.categoryFilter;
          const diffMatch = this.difficultyFilter === 'All' || q.difficulty === this.difficultyFilter;
          return catMatch && diffMatch;
        });

        const avgAcc = this.attempts.length
          ? Math.round(this.attempts.reduce((s, a) => s + a.accuracy, 0) / this.attempts.length)
          : 0;

        return \`
          <div class="space-y-10">
            <!-- Hero & AI Studio -->
            <section class="border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/85 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-xl shadow-slate-900/5">
              <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
                <div class="space-y-2 max-w-2xl">
                  <p class="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Candidate Assessment Workspace · \${this.profile.name} (\${this.profile.program})</p>
                  <h1 class="font-display text-2xl md:text-4xl font-semibold text-slate-900 dark:text-white">
                    AI-Powered Online Mock Test & Technical Quiz Platform
                  </h1>
                  <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Synthesize custom multiple-choice assessments on any BCA, Computer Science, or Programming topic, practice under real-time examination timers, and receive granular subtopic diagnostics.
                  </p>
                </div>
                <div class="grid grid-cols-3 gap-6 pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 lg:pl-8 shrink-0">
                  <div>
                    <p class="text-xs text-slate-500 dark:text-slate-400">Attempts Logged</p>
                    <p class="text-2xl font-mono tabular-nums font-bold text-slate-900 dark:text-white mt-1">\${this.attempts.length}</p>
                  </div>
                  <div>
                    <p class="text-xs text-slate-500 dark:text-slate-400">Mean Accuracy</p>
                    <p class="text-2xl font-mono tabular-nums font-bold text-indigo-600 dark:text-indigo-400 mt-1">\${avgAcc}%</p>
                  </div>
                  <div>
                    <p class="text-xs text-slate-500 dark:text-slate-400">Target Benchmark</p>
                    <p class="text-2xl font-mono tabular-nums font-bold text-emerald-600 dark:text-emerald-400 mt-1">\${this.profile.targetAccuracy}%</p>
                  </div>
                </div>
              </div>

              <!-- 01. Dynamic AI Quiz Generator -->
              <div id="ai-generator-box" class="pt-6">
                <div class="mb-4">
                  <h2 class="text-lg font-semibold text-slate-900 dark:text-white">01. Dynamic AI Assessment Generator</h2>
                  <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Enter any academic subject or programming topic to synthesize a custom timed multiple-choice test.</p>
                </div>
                <form onsubmit="app.generateCustomAIQuiz(event)" class="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div class="md:col-span-6">
                    <label class="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Assessment Topic or Subject</label>
                    <input id="ai-topic-input" type="text" placeholder="e.g., BCA Operating Systems, Python OOP, Data Structures..." class="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-[#F8FAFC] dark:bg-[#0B0F19] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                  </div>
                  <div class="md:col-span-2">
                    <label class="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Difficulty</label>
                    <select id="ai-diff-select" class="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-[#F8FAFC] dark:bg-[#0B0F19] text-slate-900 dark:text-white">
                      <option value="Easy">Easy</option>
                      <option value="Medium" selected>Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                  <div class="md:col-span-2">
                    <label class="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Questions</label>
                    <select id="ai-count-select" class="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-[#F8FAFC] dark:bg-[#0B0F19] text-slate-900 dark:text-white font-mono tabular-nums">
                      <option value="5">5 Questions</option>
                      <option value="8" selected>8 Questions</option>
                      <option value="10">10 Questions</option>
                    </select>
                  </div>
                  <div class="md:col-span-2 flex items-end">
                    <button type="submit" class="w-full py-2.5 px-4 text-sm font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl shadow-md shadow-indigo-500/20 active:scale-95 transition-all whitespace-nowrap">
                      Launch AI Quiz
                    </button>
                  </div>
                </form>
              </div>
            </section>

            <!-- 02. Pre-Built Subject Mock Tests -->
            <section class="space-y-4">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 class="text-lg font-semibold text-slate-900 dark:text-white">02. Curated Examination Modules</h2>
                  <p class="text-xs text-slate-500 dark:text-slate-400">Select a pre-built syllabus module with verified explanations and benchmark timers.</p>
                </div>
                <div class="flex flex-wrap items-center gap-1 p-1 bg-slate-200/70 dark:bg-slate-800/90 rounded-xl">
                  \${['All', 'BCA Subjects', 'Computer Science', 'Programming', 'Aptitude & Logic'].map(cat => \`
                    <button onclick="app.categoryFilter = '\${cat}'; app.render();" class="px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap \${this.categoryFilter === cat ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}">
                      \${cat}
                    </button>
                  \`).join('')}
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                \${filtered.map(q => \`
                  <div class="border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/85 rounded-2xl p-6 flex flex-col justify-between hover:-translate-y-0.5 hover:border-indigo-500/40 hover:shadow-lg transition-all duration-200">
                    <div>
                      <div class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                        <span class="text-indigo-600 dark:text-indigo-400 font-sans font-medium">\${q.category}</span>
                        <span>·</span>
                        <span class="\${q.difficulty === 'Hard' ? 'text-rose-500' : q.difficulty === 'Medium' ? 'text-amber-500' : 'text-emerald-500'}">\${q.difficulty}</span>
                        <span>·</span>
                        <span>\${q.questions.length} Questions</span>
                        <span>·</span>
                        <span>\${q.durationMinutes} Mins</span>
                      </div>
                      <h3 class="text-lg font-semibold text-slate-900 dark:text-white mt-2">\${q.title}</h3>
                      <p class="text-sm text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">\${q.description}</p>
                    </div>
                    <div class="pt-5 mt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span class="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">Pass Benchmark: \${this.profile.targetAccuracy}%</span>
                      <button onclick="app.startQuizById('\${q.id}')" class="px-4 py-2 text-xs font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl shadow-md shadow-indigo-500/20 active:scale-95 transition-all whitespace-nowrap">
                        Start Mock Test →
                      </button>
                    </div>
                  </div>
                \`).join('')}
              </div>
            </section>

            <!-- 03. Attempt History & Candidate Profile -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <section id="history-section" class="lg:col-span-8 border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/85 rounded-2xl p-6 shadow-sm">
                <h2 class="text-lg font-semibold text-slate-900 dark:text-white mb-1">03. Past Quiz Attempts (LocalStorage)</h2>
                <p class="text-xs text-slate-500 dark:text-slate-400 mb-4">Click any completed session to inspect its scorecard and question-by-question key.</p>
                \${this.attempts.length === 0 ? \`
                  <div class="py-10 text-center border-t border-slate-100 dark:border-slate-800">
                    <p class="text-sm text-slate-500 dark:text-slate-400">No quiz attempts recorded yet. Start any mock test above to log your first result.</p>
                  </div>
                \` : \`
                  <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr class="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                          <th class="py-2.5 pr-4 font-medium">Assessment</th>
                          <th class="py-2.5 px-3 font-medium text-right">Score</th>
                          <th class="py-2.5 px-3 font-medium text-right">Accuracy</th>
                          <th class="py-2.5 px-3 font-medium text-right">Time</th>
                          <th class="py-2.5 pl-3 font-medium text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-100 dark:divide-slate-800 font-mono tabular-nums text-xs">
                        \${this.attempts.map(a => \`
                          <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td class="py-3 pr-4 font-sans">
                              <div class="font-medium text-slate-900 dark:text-white">\${a.quizTitle}</div>
                              <div class="text-xs text-slate-500">\${a.timestamp} · \${a.difficulty}</div>
                            </td>
                            <td class="py-3 px-3 text-right">\${a.correctCount}/\${a.totalQuestions}</td>
                            <td class="py-3 px-3 text-right font-semibold \${a.accuracy >= 75 ? 'text-emerald-600 dark:text-emerald-400' : a.accuracy >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}">\${a.accuracy}%</td>
                            <td class="py-3 px-3 text-right">\${a.timeTakenSeconds}s</td>
                            <td class="py-3 pl-3 text-right font-sans">
                              <button onclick="app.reviewPastAttempt('\${a.id}')" class="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">Review</button>
                            </td>
                          </tr>
                        \`).join('')}
                      </tbody>
                    </table>
                  </div>
                \`}
              </section>

              <section id="profile-section" class="lg:col-span-4 border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/85 rounded-2xl p-6 shadow-sm">
                <h2 class="text-lg font-semibold text-slate-900 dark:text-white mb-1">04. Candidate Profile</h2>
                <p class="text-xs text-slate-500 dark:text-slate-400 mb-4">Saved locally in your browser.</p>
                <form onsubmit="app.saveProfile(event)" class="space-y-4">
                  <div>
                    <label class="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Candidate Name</label>
                    <input id="prof-name" type="text" value="\${this.profile.name}" class="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-[#F8FAFC] dark:bg-[#0B0F19] text-slate-900 dark:text-white" />
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Program / Track</label>
                    <input id="prof-program" type="text" value="\${this.profile.program}" class="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-[#F8FAFC] dark:bg-[#0B0F19] text-slate-900 dark:text-white" />
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Target Accuracy (%)</label>
                    <input id="prof-target" type="number" min="50" max="100" value="\${this.profile.targetAccuracy}" class="w-full px-3 py-2 text-sm font-mono tabular-nums rounded-xl border border-slate-300 dark:border-slate-700 bg-[#F8FAFC] dark:bg-[#0B0F19] text-slate-900 dark:text-white" />
                  </div>
                  <button type="submit" class="w-full py-2.5 px-4 text-xs font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl shadow-md shadow-indigo-500/20 active:scale-95 transition-all">
                    Save Profile Settings
                  </button>
                </form>
              </section>
            </div>
          </div>
        \`;
      },

      renderQuiz() {
        const quiz = this.activeQuiz;
        const q = quiz.questions[this.currentIndex];
        const selected = this.userAnswers[this.currentIndex];
        const isMarked = this.markedQuestions.has(this.currentIndex);
        const progressPct = Math.round(((this.currentIndex + 1) / quiz.questions.length) * 100);

        return \`
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div class="lg:col-span-8 border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
              <div class="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <p class="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">\${quiz.title} · \${q.subtopic}</p>
                  <h2 class="text-xl font-bold text-slate-900 dark:text-white mt-0.5 font-mono tabular-nums">
                    Question \${String(this.currentIndex + 1).padStart(2, '0')} of \${String(quiz.questions.length).padStart(2, '0')}
                  </h2>
                </div>
                <div id="live-timer-display" class="text-sm">
                  \${this.formatTimerBadge(this.timerSecondsLeft)}
                </div>
              </div>

              <!-- Animated Question Progress Bar -->
              <div class="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div class="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500 ease-out" style="width: \${progressPct}%"></div>
              </div>

              <p class="text-base md:text-lg font-medium text-slate-900 dark:text-white leading-relaxed">
                \${q.question}
              </p>

              <div class="space-y-3 pt-2">
                \${q.options.map((opt, idx) => {
                  const active = selected === idx;
                  const letter = ['A', 'B', 'C', 'D'][idx];
                  return \`
                    <button onclick="app.selectOption(\${idx})" class="w-full text-left p-4 rounded-xl border transition-all duration-150 flex items-start gap-3.5 \${active ? 'border-indigo-500 bg-indigo-500/10 dark:bg-indigo-500/15 text-slate-900 dark:text-white shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500' : 'border-slate-200 dark:border-slate-800 hover:border-indigo-500/40 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200'}">
                      <span class="font-mono tabular-nums text-xs font-bold px-2.5 py-1 rounded-lg border \${active ? 'border-indigo-500 bg-indigo-600 text-white' : 'border-slate-300 dark:border-slate-700 text-slate-500'}">\${letter}</span>
                      <span class="text-sm leading-relaxed flex-1">\${opt}</span>
                    </button>
                  \`;
                }).join('')}
              </div>

              <div class="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div class="flex items-center gap-2">
                  <button onclick="app.goToQuestion(\${this.currentIndex - 1})" \${this.currentIndex === 0 ? 'disabled' : ''} class="px-4 py-2.5 text-xs font-semibold border border-slate-300 dark:border-slate-700 rounded-xl disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all">
                    ← Previous
                  </button>
                  <button onclick="app.toggleMark()" class="px-4 py-2.5 text-xs font-semibold border rounded-xl active:scale-95 transition-all \${isMarked ? 'border-amber-500 text-amber-600 dark:text-amber-300 bg-amber-500/15' : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'}">
                    \${isMarked ? '▲ Marked for Review' : '⚑ Mark for Review'}
                  </button>
                  \${selected !== undefined ? \`
                    <button onclick="app.clearOption()" class="px-3 py-2 text-xs text-slate-500 hover:text-rose-500 transition-colors">
                      Clear
                    </button>
                  \` : ''}
                </div>
                <div class="flex items-center gap-2">
                  \${this.currentIndex < quiz.questions.length - 1 ? \`
                    <button onclick="app.goToQuestion(\${this.currentIndex + 1})" class="px-5 py-2.5 text-xs font-semibold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl active:scale-95 transition-all">
                      Next Question →
                    </button>
                  \` : ''}
                  <button onclick="app.openConfirmSubmitModal()" class="px-5 py-2.5 text-xs font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl shadow-md shadow-indigo-500/25 active:scale-95 transition-all">
                    Submit Quiz
                  </button>
                </div>
              </div>
            </div>

            <!-- Right: Question Palette Grid -->
            <div class="lg:col-span-4 border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 rounded-2xl p-6 space-y-5 shadow-xl">
              <div>
                <h3 class="text-sm font-semibold text-slate-900 dark:text-white">Question Navigation Palette</h3>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Active question is highlighted in Indigo.</p>
              </div>

              <div class="grid grid-cols-5 gap-2.5 font-mono tabular-nums">
                \${quiz.questions.map((_, idx) => {
                  const ans = this.userAnswers[idx] !== undefined;
                  const mark = this.markedQuestions.has(idx);
                  const vis = this.visitedQuestions.has(idx);
                  const cur = this.currentIndex === idx;
                  let cls = 'border-slate-200 dark:border-slate-800 text-slate-500';
                  let sym = '·';
                  if (ans && mark) { cls = 'border-amber-400 bg-emerald-600 text-white'; sym = '⚑'; }
                  else if (ans) { cls = 'border-emerald-600 bg-emerald-600 text-white'; sym = '✓'; }
                  else if (mark) { cls = 'border-amber-500 bg-amber-500/15 text-amber-600 dark:text-amber-300'; sym = '▲'; }
                  else if (vis) { cls = 'border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/60'; sym = '○'; }
                  if (cur) cls = 'border-indigo-500 bg-gradient-to-br from-indigo-600 to-violet-600 text-white ring-2 ring-indigo-400 ring-offset-2 dark:ring-offset-slate-900 scale-105 shadow-md shadow-indigo-500/30';

                  return \`
                    <button onclick="app.goToQuestion(\${idx})" class="h-11 rounded-xl border text-xs font-bold flex items-center justify-center gap-0.5 transition-all \${cls}">
                      <span>\${String(idx + 1).padStart(2, '0')}</span>
                      <span class="text-[10px]">\${sym}</span>
                    </button>
                  \`;
                }).join('')}
              </div>

              <div class="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <div class="flex items-center justify-between"><span>✓ Answered</span><span class="font-mono tabular-nums text-emerald-500 font-bold">\${Object.keys(this.userAnswers).length}</span></div>
                <div class="flex items-center justify-between"><span>▲ Marked for Review</span><span class="font-mono tabular-nums text-amber-500 font-bold">\${this.markedQuestions.size}</span></div>
                <div class="flex items-center justify-between"><span>○ Visited (Unanswered)</span><span class="font-mono tabular-nums">\${Math.max(0, this.visitedQuestions.size - Object.keys(this.userAnswers).length)}</span></div>
                <div class="flex items-center justify-between"><span>· Unvisited</span><span class="font-mono tabular-nums">\${quiz.questions.length - this.visitedQuestions.size}</span></div>
              </div>

              <button onclick="app.openConfirmSubmitModal()" class="w-full py-3 px-4 text-xs font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl shadow-lg shadow-indigo-500/25 active:scale-95 transition-all">
                Finish & Submit Assessment
              </button>
            </div>
          </div>
        \`;
      },

      renderResult() {
        const att = this.lastAttempt;
        if (!att) return '';

        const weakText = att.weakSubtopics && att.weakSubtopics.length
          ? 'Focus your next review session on: ' + att.weakSubtopics.slice(0, 3).join(', ') + '.'
          : 'Outstanding command across all tested subtopics! Try increasing the difficulty level to Hard.';

        return \`
          <div class="space-y-8">
            <section class="border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
              <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <p class="text-xs text-indigo-600 dark:text-indigo-400 font-mono tabular-nums font-semibold">Assessment Result · \${att.timestamp}</p>
                  <h1 class="font-display text-2xl md:text-3xl font-semibold text-slate-900 dark:text-white mt-1">\${att.quizTitle}</h1>
                </div>
                <div class="flex items-center gap-3">
                  <button onclick="app.navigate('dashboard')" class="px-4 py-2.5 text-xs font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl shadow-md shadow-indigo-500/20">
                    ← Back to Dashboard
                  </button>
                </div>
              </div>

              <!-- Instant Scorecard -->
              <div class="grid grid-cols-2 md:grid-cols-5 gap-4 font-mono tabular-nums">
                <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <p class="text-xs font-sans text-slate-500">Total Questions</p>
                  <p class="text-2xl font-bold mt-1">\${att.totalQuestions}</p>
                </div>
                <div class="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <p class="text-xs font-sans text-emerald-600 dark:text-emerald-400">✓ Correct</p>
                  <p class="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">\${att.correctCount}</p>
                </div>
                <div class="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30">
                  <p class="text-xs font-sans text-rose-600 dark:text-rose-400">✕ Incorrect</p>
                  <p class="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">\${att.incorrectCount}</p>
                </div>
                <div class="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30">
                  <p class="text-xs font-sans text-indigo-600 dark:text-indigo-400">Accuracy Score</p>
                  <p class="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">\${att.accuracy}%</p>
                </div>
                <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <p class="text-xs font-sans text-slate-500">Time Taken</p>
                  <p class="text-2xl font-bold mt-1">\${att.timeTakenSeconds}s</p>
                </div>
              </div>

              <!-- AI Performance Analysis Feedback -->
              <div class="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <h2 class="text-base font-semibold text-slate-900 dark:text-white">AI Performance Diagnostic & Study Feedback</h2>
                <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  You scored <strong>\${att.accuracy}%</strong> (\${att.correctCount} of \${att.totalQuestions} correct) in \${att.timeTakenSeconds} seconds. \${weakText}
                </p>
              </div>
            </section>

            <!-- Detailed Answer Key & Explanations -->
            <section class="border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
              <h2 class="text-lg font-semibold text-slate-900 dark:text-white">Detailed Question Review & Explanations</h2>
              <div class="divide-y divide-slate-200 dark:divide-slate-800">
                \${att.questions.map((q, idx) => {
                  const userAns = att.userAnswers[idx];
                  const isCorrect = userAns === q.correctAnswer;
                  const isSkipped = userAns === undefined || userAns === null;
                  return \`
                    <div class="py-6 first:pt-0 last:pb-0 space-y-3">
                      <div class="flex items-center justify-between text-xs font-mono tabular-nums">
                        <span class="text-slate-500">Question \${String(idx + 1).padStart(2, '0')} · \${q.subtopic}</span>
                        <span class="font-bold \${isCorrect ? 'text-emerald-600 dark:text-emerald-400' : isSkipped ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}">
                          \${isCorrect ? '✓ Correct (+1)' : isSkipped ? '○ Unattempted (0)' : '✕ Incorrect (0)'}
                        </span>
                      </div>
                      <p class="text-base font-medium text-slate-900 dark:text-white">\${q.question}</p>
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                        \${q.options.map((opt, oIdx) => {
                          const isRight = oIdx === q.correctAnswer;
                          const isChosen = oIdx === userAns;
                          let style = 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400';
                          let tag = '';
                          if (isRight) {
                            style = 'border-emerald-500/60 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200 font-medium';
                            tag = ' ✓ Correct Answer';
                          } else if (isChosen && !isRight) {
                            style = 'border-rose-500/60 bg-rose-500/10 text-rose-900 dark:text-rose-200 font-medium';
                            tag = ' ✕ Your Answer';
                          }
                          return \`<div class="p-3.5 rounded-xl border \${style}">\${['A','B','C','D'][oIdx]}. \${opt}<span class="font-mono ml-1 font-bold">\${tag}</span></div>\`;
                        }).join('')}
                      </div>
                      <p class="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl leading-relaxed border border-slate-200/60 dark:border-slate-700/60">
                        <strong class="text-indigo-600 dark:text-indigo-400">Explanation:</strong> \${q.explanation}
                      </p>
                    </div>
                  \`;
                }).join('')}
              </div>
            </section>
          </div>
        \`;
      }
    };

    window.addEventListener('DOMContentLoaded', () => app.init());
  </script>
</body>
</html>`;
}
