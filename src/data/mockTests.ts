export type DifficultyLevel = "Easy" | "Medium" | "Hard";

export type QuizCategory =
  | "BCA Subjects"
  | "Computer Science"
  | "Programming"
  | "Aptitude & Logic"
  | "AI Custom";

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // 0-based index (0..3)
  explanation: string;
  subtopic: string;
}

export interface QuizDefinition {
  id: string;
  title: string;
  category: QuizCategory;
  difficulty: DifficultyLevel;
  durationMinutes: number;
  perQuestionSeconds: number;
  description: string;
  questions: QuizQuestion[];
  isAIGenerated?: boolean;
}

export interface StudyStep {
  stepTitle: string;
  action: string;
  estimatedTime: string;
}

export interface AIAnalysisReport {
  headline: string;
  executiveSummary: string;
  strengths: string[];
  weakAreas: string[];
  studyPlan: StudyStep[];
  recommendedNextTopic: string;
  source: "gemini" | "smart_engine";
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  quizTitle: string;
  category: QuizCategory;
  difficulty: DifficultyLevel;
  timestamp: string;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  skippedCount: number;
  accuracy: number;
  timeTakenSeconds: number;
  timerMode: "full" | "per_question";
  userAnswers: Record<number, number | null>;
  markedQuestions: number[];
  questionTimes: Record<number, number>;
  questions: QuizQuestion[];
  aiAnalysis: AIAnalysisReport;
}

export interface CandidateProfile {
  name: string;
  program: string;
  targetAccuracy: number;
  preferredTimerMode: "full" | "per_question";
}

export const PREBUILT_QUIZZES: QuizDefinition[] = [
  {
    id: "bca-os",
    title: "BCA Operating Systems",
    category: "BCA Subjects",
    difficulty: "Medium",
    durationMinutes: 10,
    perQuestionSeconds: 60,
    description:
      "Process scheduling algorithms, concurrency & deadlocks, virtual memory paging, semaphore synchronization, and disk management.",
    questions: [
      {
        id: "os-1",
        subtopic: "CPU Scheduling",
        question:
          "Which CPU scheduling algorithm is provably optimal in terms of minimizing the average waiting time for a given set of processes?",
        options: [
          "First-Come, First-Served (FCFS)",
          "Shortest Remaining Time First (Preemptive SJF)",
          "Round Robin with a small time quantum",
          "Multilevel Feedback Queue Scheduling",
        ],
        correctAnswer: 1,
        explanation:
          "Shortest Job First (and its preemptive version, Shortest Remaining Time First) always executes the process with the smallest remaining CPU burst first, mathematically minimizing average waiting time.",
      },
      {
        id: "os-2",
        subtopic: "Deadlock Handling",
        question:
          "In Edward Coffman's deadlock characterization, which condition is directly broken if an operating system enforces a strict global numbering of all resource types and requires processes to request resources in increasing order?",
        options: [
          "Mutual Exclusion",
          "Hold and Wait",
          "No Preemption",
          "Circular Wait",
        ],
        correctAnswer: 3,
        explanation:
          "Imposing a total ordering on resource types and requiring processes to request resources in strictly increasing numerical order makes a cycle in the resource allocation graph impossible, eliminating Circular Wait.",
      },
      {
        id: "os-3",
        subtopic: "Virtual Memory & Paging",
        question:
          "A system uses 32-bit logical addresses with a 4 KB page size. If the page table is single-level and each page table entry occupies 4 bytes, how many entries does the page table contain?",
        options: [
          "2^12 (4,096 entries)",
          "2^20 (1,048,576 entries)",
          "2^16 (65,536 entries)",
          "2^22 (4,194,304 entries)",
        ],
        correctAnswer: 1,
        explanation:
          "Page size = 4 KB = 2^12 bytes, so 12 bits are used for the page offset. The remaining 32 - 12 = 20 bits index the page table, yielding 2^20 (1,048,576) entries.",
      },
      {
        id: "os-4",
        subtopic: "Page Replacement",
        question:
          "Which page replacement algorithm can suffer from Belady's Anomaly, where increasing the number of allocated physical page frames results in a higher page fault rate?",
        options: [
          "Least Recently Used (LRU)",
          "Optimal Page Replacement (OPT)",
          "First-In, First-Out (FIFO)",
          "Least Frequently Used (LFU) with stack property",
        ],
        correctAnswer: 2,
        explanation:
          "FIFO does not satisfy the stack inclusion property, meaning the set of pages in memory with k frames is not always a subset of the pages in memory with k+1 frames, causing Belady's Anomaly.",
      },
      {
        id: "os-5",
        subtopic: "Process Synchronization",
        question:
          "A counting semaphore is initialized to 12. Subsequently, 18 P (wait) operations and 10 V (signal) operations are completed on this semaphore. What is the resulting value of the semaphore?",
        options: ["4", "6", "-4", "2"],
        correctAnswer: 0,
        explanation:
          "Each P (wait) operation decrements the semaphore value by 1, and each V (signal) operation increments it by 1. Therefore: 12 - 18 + 10 = 4.",
      },
      {
        id: "os-6",
        subtopic: "Memory Management",
        question:
          "What is the primary cause of 'Thrashing' in a multiprogramming operating system using demand paging?",
        options: [
          "Excessive internal fragmentation inside fixed-size partitions",
          "The sum of working-set sizes of active processes exceeding total available physical frames",
          "A high Translation Lookaside Buffer (TLB) hit ratio",
          "DMA controller monopolizing the system bus during disk I/O",
        ],
        correctAnswer: 1,
        explanation:
          "Thrashing occurs when active processes do not have enough physical frames to hold their working sets (locality of reference), causing continuous page faults and swapping where CPU utilization plummets.",
      },
      {
        id: "os-7",
        subtopic: "Deadlock Avoidance",
        question:
          "Dijkstra's Banker's Algorithm is classified under which category of operating system deadlock management strategies?",
        options: [
          "Deadlock Prevention",
          "Deadlock Avoidance",
          "Deadlock Detection and Recovery",
          "Deadlock Ignorance (Ostrich Algorithm)",
        ],
        correctAnswer: 1,
        explanation:
          "The Banker's Algorithm dynamically inspects maximum resource claims before granting a request to ensure the system remains in a Safe State, which is the hallmark of Deadlock Avoidance.",
      },
      {
        id: "os-8",
        subtopic: "Disk Scheduling",
        question:
          "Which disk arm scheduling algorithm services requests in one direction until the last needed request in that direction is reached, then immediately reverses direction without going all the way to the physical end of the disk platter?",
        options: ["SCAN (Elevator)", "C-SCAN", "LOOK", "SSTF"],
        correctAnswer: 2,
        explanation:
          "LOOK improves upon SCAN by 'looking' ahead for pending requests in the current travel direction and reversing immediately after the furthest request rather than traversing to cylinder 0 or max.",
      },
      {
        id: "os-9",
        subtopic: "System Calls & Kernel",
        question:
          "When a user-mode process invokes the fork() system call in Unix/Linux, what value is returned to the newly created child process upon successful execution?",
        options: [
          "The Process ID (PID) of the parent process",
          "Zero (0)",
          "A negative integer (-1)",
          "The Process ID (PID) of the child process itself",
        ],
        correctAnswer: 1,
        explanation:
          "Upon a successful fork(), the kernel returns the child's positive PID to the parent process and returns 0 to the newly created child process so each branch can identify its role.",
      },
      {
        id: "os-10",
        subtopic: "Hardware Translation",
        question:
          "If a Translation Lookaside Buffer (TLB) has a hit ratio of 90%, a TLB lookup takes 2 ns, and a main memory access takes 100 ns (with a single-level page table in memory), what is the Effective Memory Access Time (EMAT)?",
        options: ["112 ns", "102 ns", "120 ns", "192 ns"],
        correctAnswer: 0,
        explanation:
          "On a TLB hit (90%), access takes 2 ns (TLB) + 100 ns (memory) = 102 ns. On a TLB miss (10%), access takes 2 ns (TLB) + 100 ns (page table) + 100 ns (memory) = 202 ns. EMAT = 0.9 * 102 + 0.1 * 202 = 91.8 + 20.2 = 112 ns.",
      },
    ],
  },
  {
    id: "python-mastery",
    title: "Python Programming",
    category: "Programming",
    difficulty: "Easy",
    durationMinutes: 8,
    perQuestionSeconds: 60,
    description:
      "Core Python data structures, mutability semantics, list comprehensions, generators, function argument unpacking, and OOP fundamentals.",
    questions: [
      {
        id: "py-1",
        subtopic: "Default Mutable Arguments",
        question:
          "What is the output of calling `def append_item(val, seq=[]): seq.append(val); return seq` twice as `append_item(10)` followed by `append_item(20)`?",
        options: [
          "[10] and then [20]",
          "[10] and then [10, 20]",
          "TypeError: default argument cannot be a list",
          "[10, 20] on the first call",
        ],
        correctAnswer: 1,
        explanation:
          "In Python, default parameter values are evaluated only once when the `def` statement is executed, not each time the function is called. Both calls mutate the exact same list object `[10, 20]`.",
      },
      {
        id: "py-2",
        subtopic: "Dictionary Hashing",
        question:
          "Which of the following Python objects CANNOT be used as a key in a standard `dict`?",
        options: [
          "A tuple containing only integers: (1, 2, 3)",
          "A frozenset of strings: frozenset({'a', 'b'})",
          "A tuple containing a list: (1, [2, 3])",
          "A user-defined class instance with default __hash__",
        ],
        correctAnswer: 2,
        explanation:
          "Dictionary keys must be hashable (immutable throughout their lifetime). While a tuple is immutable, a tuple containing a mutable list `(1, [2, 3])` raises `TypeError: unhashable type: 'list'`.",
      },
      {
        id: "py-3",
        subtopic: "Generators & Lazy Evaluation",
        question:
          "What does the expression `(x * x for x in range(5))` return in Python 3?",
        options: [
          "A tuple `(0, 1, 4, 9, 16)`",
          "A generator object that yields values lazily on iteration",
          "A list `[0, 1, 4, 9, 16]`",
          "A set `{0, 1, 4, 9, 16}`",
        ],
        correctAnswer: 1,
        explanation:
          "Parentheses around a comprehension syntax create a generator expression, which computes items one at a time on demand (`__next__()`) with O(1) auxiliary memory rather(than materializing a tuple.",
      },
      {
        id: "py-4",
        subtopic: "Slicing Semantics",
        question:
          "Given `nums = [10, 20, 30, 40, 50]`, what is the result of evaluating `nums[::-2]`?",
        options: [
          "[50, 30, 10]",
          "[10, 30, 50]",
          "[50, 40]",
          "IndexError: slice step cannot be negative",
        ],
        correctAnswer: 0,
        explanation:
          "A negative step `-2` traverses the sequence from right to left starting at the last element (`50`) and stepping backwards by 2 indices, producing `[50, 30, 10]`.",
      },
      {
        id: "py-5",
        subtopic: "Identity vs Equality",
        question:
          "In Python, what is the exact semantic difference between the `==` operator and the `is` keyword?",
        options: [
          "`==` compares memory addresses, while `is` compares value equality",
          "`==` invokes `__eq__()` to compare values, while `is` checks if both references point to the identical object in memory (`id(a) == id(b)`)",
          "`is` is used only for strings and numbers, whereas `==` is used for lists",
          "There is no difference in Python 3.10+",
        ],
        correctAnswer: 1,
        explanation:
          "The `==` operator tests value equality via the `__eq__` special method, whereas `is` tests object identity by comparing the underlying memory addresses (`id()`).",
      },
      {
        id: "py-6",
        subtopic: "Decorators",
        question:
          "When you apply `@functools.wraps(func)` inside a custom Python decorator wrapper function, what problem does it solve?",
        options: [
          "It automatically caches the return values of the decorated function",
          "It preserves the original function's metadata (`__name__`, `__doc__`, `__annotations__`) on the wrapper",
          "It converts synchronous functions into async coroutines",
          "It prevents the decorated function from raising exceptions",
        ],
        correctAnswer: 1,
        explanation:
          "Without `@functools.wraps(func)`, decorating a function replaces its `__name__` and `__doc__` with those of the inner wrapper function, hindering debugging and introspection.",
      },
      {
        id: "py-7",
        subtopic: "Time Complexity in Python",
        question:
          "What is the average-case time complexity of checking membership `x in container` when `container` is a Python `set` versus a Python `list` of length N?",
        options: [
          "O(1) for `set`, O(N) for `list`",
          "O(log N) for `set`, O(N) for `list`",
          "O(N) for both `set` and `list`",
          "O(1) for both `set` and `list`",
        ],
        correctAnswer: 0,
        explanation:
          "Python `set` is implemented as an open-addressed hash table providing O(1) average lookup, whereas `list` is a dynamic array requiring O(N) linear scan.",
      },
      {
        id: "py-8",
        subtopic: "Method Resolution Order",
        question:
          "Which algorithm does Python 3 use to compute the Method Resolution Order (MRO) in classes with multiple inheritance?",
        options: [
          "Depth-First Left-to-Right Search",
          "Breadth-First Search",
          "C3 Superclass Linearization",
          "Dijkstra's Shortest Inheritance Path",
        ],
        correctAnswer: 2,
        explanation:
          "Python uses C3 Linearization to guarantee monotonicity and preserve local precedence order in complex multiple-inheritance diamond hierarchies.",
      },
    ],
  },
  {
    id: "dsa-core",
    title: "Data Structures & Algorithms",
    category: "Computer Science",
    difficulty: "Hard",
    durationMinutes: 12,
    perQuestionSeconds: 75,
    description:
      "Asymptotic analysis, balanced search trees, graph shortest-path algorithms, hashing strategies, heaps, and dynamic programming.",
    questions: [
      {
        id: "dsa-1",
        subtopic: "Asymptotic Complexity",
        question:
          "Using the Master Theorem, what is the tight asymptotic time complexity of the recurrence relation T(n) = 2T(n/2) + n log n?",
        options: [
          "Θ(n log n)",
          "Θ(n (log n)^2)",
          "Θ(n^2)",
          "Θ(n)",
        ],
        correctAnswer: 1,
        explanation:
          "Here a = 2, b = 2, so n^(log_b a) = n^1 = n. Since f(n) = n log n = Θ(n^(log_b a) * log^k n) with k = 1, the extended Case 2 of the Master Theorem gives T(n) = Θ(n (log n)^2).",
      },
      {
        id: "dsa-2",
        subtopic: "Binary Heaps",
        question:
          "What is the worst-case time complexity of building a Binary Max-Heap in-place from an unsorted array of N elements using Floyd's bottom-up heapify algorithm?",
        options: [
          "O(N log N)",
          "O(N)",
          "O(log N)",
          "O(N^2)",
        ],
        correctAnswer: 1,
        explanation:
          "Although a single `siftDown` can take O(log N) at the root, most nodes are near the bottom of the tree. Summing `h / 2^(h+1)` over all heights converges to a linear O(N) bound.",
      },
      {
        id: "dsa-3",
        subtopic: "Graph Algorithms",
        question:
          "Why does Dijkstra's single-source shortest path algorithm fail to guarantee correct results on graphs containing negative-weight edges?",
        options: [
          "Priority queues cannot store negative numbers",
          "It greedily finalizes the distance to the extracted minimum-distance vertex assuming future paths through unvisited vertices can only increase path cost",
          "Negative edges always create infinite cycles in every graph",
          "Adjacency lists cannot represent negative weights",
        ],
        correctAnswer: 1,
        explanation:
          "Dijkstra's greedy invariant assumes that adding edges to a path never decreases its total weight. A negative edge encountered later can make a path to an already-finalized vertex shorter.",
      },
      {
        id: "dsa-4",
        subtopic: "Balanced Search Trees",
        question:
          "In an AVL tree, what is the maximum allowed absolute difference (balance factor) between the heights of the left and right subtrees of any node?",
        options: ["0", "1", "2", "log2(N)"],
        correctAnswer: 1,
        explanation:
          "An AVL tree enforces a strict height-balance invariant where every node's balance factor `height(left) - height(right)` must be in `{-1, 0, +1}`, i.e., at most 1.",
      },
      {
        id: "dsa-5",
        subtopic: "Sorting Stability & Space",
        question:
          "Which of the following comparison-based sorting algorithms guarantees O(N log N) worst-case time complexity AND O(1) auxiliary space complexity?",
        options: [
          "QuickSort",
          "MergeSort (standard array implementation)",
          "HeapSort",
          "Insertion Sort",
        ],
        correctAnswer: 2,
        explanation:
          "HeapSort sorts in-place with O(1) extra space and guarantees O(N log N) time even in the worst case, unlike QuickSort (O(N^2) worst case) or standard MergeSort (O(N) space).",
      },
      {
        id: "dsa-6",
        subtopic: "Hash Tables",
        question:
          "In open-addressed hash tables, which probing technique suffers from 'Primary Clustering', where long contiguous runs of occupied slots build up and degrade lookup time?",
        options: [
          "Linear Probing",
          "Quadratic Probing",
          "Double Hashing",
          "Separate Chaining with balanced trees",
        ],
        correctAnswer: 0,
        explanation:
          "Linear probing checks `(h(k) + i) mod m`. Any collision in a contiguous cluster lengthens that cluster by 1 slot, increasing the probability of future keys landing in the same cluster.",
      },
      {
        id: "dsa-7",
        subtopic: "Minimum Spanning Trees",
        question:
          "Kruskal's algorithm for finding a Minimum Spanning Tree (MST) relies on which auxiliary data structure to efficiently detect whether adding an edge creates a cycle?",
        options: [
          "Monotonic Stack",
          "Disjoint-Set Union (Union-Find) with path compression",
          "Trie (Prefix Tree)",
          "Doubly Linked Deque",
        ],
        correctAnswer: 1,
        explanation:
          "Kruskal's sorts edges by weight and uses Disjoint-Set Union (Union-Find) to check in near-constant O(α(V)) time whether two endpoints already belong to the same connected component.",
      },
      {
        id: "dsa-8",
        subtopic: "Dynamic Programming",
        question:
          "Which two fundamental properties must an optimization problem exhibit for Dynamic Programming to be applicable and advantageous?",
        options: [
          "Greedy Choice Property and Tail Recursion",
          "Optimal Substructure and Overlapping Subproblems",
          "Bipartite Graph Structure and Monotonicity",
          "Divide-and-Conquer Independence and Linear Space",
        ],
        correctAnswer: 1,
        explanation:
          "Dynamic Programming requires Optimal Substructure (optimal solution builds from optimal subproblem solutions) and Overlapping Subproblems (the same subproblems recur repeatedly and benefit from memoization/tabulation).",
      },
      {
        id: "dsa-9",
        subtopic: "Tree Traversals",
        question:
          "Which pair of tree traversal sequences is ALWAYS sufficient to uniquely reconstruct any arbitrary Binary Tree (with distinct node values)?",
        options: [
          "Preorder and Postorder",
          "Inorder and Preorder",
          "Level-order and Postorder",
          "Preorder alone",
        ],
        correctAnswer: 1,
        explanation:
          "Preorder identifies the root of each subtree first, while Inorder partitions the remaining elements into exact left and right subtrees. Preorder + Postorder cannot distinguish a single left child from a single right child.",
      },
      {
        id: "dsa-10",
        subtopic: "Amortized Analysis",
        question:
          "When a dynamic array (like C++ `std::vector` or Python `list`) doubles its capacity whenever it becomes full, what is the amortized time complexity of a single `push_back` / `append` operation over N insertions?",
        options: ["O(1)", "O(log N)", "O(N)", "O(sqrt(N))"],
        correctAnswer: 0,
        explanation:
          "Across N insertions, array copies happen only at powers of 2: 1 + 2 + 4 + ... + N < 2N total element copies. Dividing < 3N total work by N operations yields O(1) amortized cost per insertion.",
      },
    ],
  },
  {
    id: "bca-dbms",
    title: "Database Management Systems (DBMS)",
    category: "BCA Subjects",
    difficulty: "Medium",
    durationMinutes: 8,
    perQuestionSeconds: 60,
    description:
      "Relational normalization (1NF through BCNF), SQL query semantics, ACID transaction isolation levels, and B+ Tree indexing.",
    questions: [
      {
        id: "db-1",
        subtopic: "Normalization & BCNF",
        question:
          "A relational schema R is in Boyce-Codd Normal Form (BCNF) if and only if for every non-trivial functional dependency X → Y that holds in R:",
        options: [
          "Y is a prime attribute (part of some candidate key)",
          "X is a superkey of R",
          "There are no transitive dependencies between non-prime attributes",
          "Every attribute in X is atomic",
        ],
        correctAnswer: 1,
        explanation:
          "BCNF strengthens 3NF by requiring that the determinant X of EVERY non-trivial functional dependency X → Y must be a superkey of R, without exception for prime attributes.",
      },
      {
        id: "db-2",
        subtopic: "ACID Properties",
        question:
          "Which ACID property guarantees that once a database transaction successfully executes `COMMIT`, its modifications persist even in the event of an immediate power loss or system crash?",
        options: ["Atomicity", "Consistency", "Isolation", "Durability"],
        correctAnswer: 3,
        explanation:
          "Durability ensures committed changes are permanently recorded in non-volatile storage (typically via Write-Ahead Logging / redo logs) and survive subsequent crashes.",
      },
      {
        id: "db-3",
        subtopic: "SQL Aggregations & Filtering",
        question:
          "In a standard SQL query containing `WHERE`, `GROUP BY`, `HAVING`, and `ORDER BY` clauses, what is their logical order of execution?",
        options: [
          "WHERE → GROUP BY → HAVING → ORDER BY",
          "GROUP BY → WHERE → HAVING → ORDER BY",
          "WHERE → HAVING → GROUP BY → ORDER BY",
          "HAVING → WHERE → GROUP BY → ORDER BY",
        ],
        correctAnswer: 0,
        explanation:
          "`WHERE` filters individual rows before grouping; `GROUP BY` forms groups; `HAVING` filters those aggregated groups; and `ORDER BY` sorts the final result set last.",
      },
      {
        id: "db-4",
        subtopic: "B+ Tree Indexing",
        question:
          "Why do relational database engines strongly prefer B+ Trees over standard B-Trees for disk-based table indexing?",
        options: [
          "B+ Trees store data pointers only in leaf nodes and link leaf nodes sequentially, making both fan-out higher and range scans vastly faster",
          "B+ Trees never require node splitting during insertions",
          "B+ Trees use hash functions instead of key comparisons",
          "B+ Trees store all keys in main memory only",
        ],
        correctAnswer: 0,
        explanation:
          "By omitting data pointers from internal nodes, B+ Trees pack more routing keys per disk block (higher fan-out, shallower height) and link all leaves in a doubly linked list for rapid `BETWEEN` range queries.",
      },
      {
        id: "db-5",
        subtopic: "SQL NULL Semantics",
        question:
          "In SQL, what does `SELECT COUNT(*), COUNT(commission) FROM Employees` return if the `Employees` table has 100 rows and 35 of those rows have `NULL` in the `commission` column?",
        options: [
          "100 and 100",
          "100 and 65",
          "65 and 65",
          "100 and 35",
        ],
        correctAnswer: 1,
        explanation:
          "`COUNT(*)` counts all rows regardless of NULLs (100), whereas `COUNT(column_name)` counts only rows where that specific expression is non-NULL (100 - 35 = 65).",
      },
      {
        id: "db-6",
        subtopic: "Concurrency Control",
        question:
          "Which transaction isolation level prevents Dirty Reads and Non-Repeatable Reads, and is the minimum standard level defined to also prevent Phantom Reads?",
        options: [
          "READ UNCOMMITTED",
          "READ COMMITTED",
          "REPEATABLE READ",
          "SERIALIZABLE",
        ],
        correctAnswer: 3,
        explanation:
          "In the ANSI SQL standard, SERIALIZABLE is the highest isolation level and guarantees complete protection against Dirty Reads, Non-Repeatable Reads, and Phantom Reads.",
      },
      {
        id: "db-7",
        subtopic: "Relational Algebra",
        question:
          "Which Relational Algebra operator corresponds to filtering columns (vertical partitioning) and automatically eliminates duplicate tuples in pure set semantics?",
        options: [
          "Selection (σ)",
          "Projection (π)",
          "Cartesian Product (×)",
          "Natural Join (⋈)",
        ],
        correctAnswer: 1,
        explanation:
          "Projection (π) selects a vertical subset of attributes (columns) from a relation and, because relational algebra operates on mathematical sets, removes duplicate resulting tuples.",
      },
      {
        id: "db-8",
        subtopic: "Decomposition Properties",
        question:
          "When decomposing a relation R(A, B, C) into R1(A, B) and R2(B, C), under what condition is the decomposition guaranteed to be a Lossless-Join Decomposition?",
        options: [
          "Either B → A or B → C holds in R (i.e., R1 ∩ R2 is a superkey of R1 or R2)",
          "A → B and B → C must both fail",
          "R1 and R2 must have zero attributes in common",
          "The number of rows in R1 must equal the number of rows in R2",
        ],
        correctAnswer: 0,
        explanation:
          "By Heath's Theorem, decomposing R into R1 and R2 is lossless if and only if the common attributes (R1 ∩ R2 = {B}) functionally determine all attributes of R1 (B → A) or R2 (B → C).",
      },
    ],
  },
  {
    id: "cs-networks",
    title: "Computer Networks & TCP/IP",
    category: "Computer Science",
    difficulty: "Medium",
    durationMinutes: 8,
    perQuestionSeconds: 60,
    description:
      "OSI & TCP/IP protocol stacks, IPv4 CIDR subnetting, TCP reliability & congestion control, DNS hierarchy, and network security.",
    questions: [
      {
        id: "net-1",
        subtopic: "CIDR Subnetting",
        question:
          "How many usable host IPv4 addresses are available in a subnet configured with a `/26` CIDR prefix (`255.255.255.192`)?",
        options: ["64", "62", "30", "126"],
        correctAnswer: 1,
        explanation:
          "A `/26` prefix leaves 32 - 26 = 6 host bits. Total addresses = 2^6 = 64. Subtracting 2 reserved addresses (the network address and the broadcast address) leaves 62 usable host addresses.",
      },
      {
        id: "net-2",
        subtopic: "TCP Handshake & Flags",
        question:
          "During the second step of a standard TCP three-way connection handshake, which control flags are set in the segment sent by the server back to the client?",
        options: [
          "SYN only",
          "ACK only",
          "SYN and ACK",
          "FIN and ACK",
        ],
        correctAnswer: 2,
        explanation:
          "Step 1: Client sends SYN. Step 2: Server responds with SYN-ACK (synchronizing its own sequence number and acknowledging the client's ISN). Step 3: Client replies with ACK.",
      },
      {
        id: "net-3",
        subtopic: "OSI Layer Responsibilities",
        question:
          "At which layer of the 7-layer OSI model do routers primarily operate when inspecting destination IP addresses and forwarding packets across networks?",
        options: [
          "Layer 2 — Data Link Layer",
          "Layer 3 — Network Layer",
          "Layer 4 — Transport Layer",
          "Layer 5 — Session Layer",
        ],
        correctAnswer: 1,
        explanation:
          "Logical addressing (IPv4/IPv6) and inter-network packet routing are core functions of Layer 3 (Network Layer), whereas switches operate on MAC addresses at Layer 2.",
      },
      {
        id: "net-4",
        subtopic: "Address Resolution",
        question:
          "Which protocol is used by a host on a local Ethernet LAN to discover the 48-bit hardware MAC address corresponding to a known IPv4 address?",
        options: [
          "DHCP (Dynamic Host Configuration Protocol)",
          "ARP (Address Resolution Protocol)",
          "ICMP (Internet Control Message Protocol)",
          "NAT (Network Address Translation)",
        ],
        correctAnswer: 1,
        explanation:
          "ARP broadcasts an ARP Request frame on the local link asking who owns the target IPv4 address, and the matching host replies with its 48-bit MAC address.",
      },
      {
        id: "net-5",
        subtopic: "Transport Protocols",
        question:
          "Why do real-time voice/video streaming and DNS lookups typically use UDP rather than TCP at the Transport Layer?",
        options: [
          "UDP encrypts packet payloads automatically while TCP does not",
          "UDP avoids connection setup latency, head-of-line blocking, and retransmission delays",
          "UDP guarantees in-order delivery with a larger 64-byte header",
          "Routers prioritize UDP packets over all TCP packets by default",
        ],
        correctAnswer: 1,
        explanation:
          "UDP is connectionless with a minimal 8-byte header and zero handshake or retransmission delay, preventing head-of-line blocking in latency-sensitive queries and media streams.",
      },
      {
        id: "net-6",
        subtopic: "TCP Congestion Control",
        question:
          "In TCP Congestion Control, how does the congestion window (`cwnd`) grow during the 'Slow Start' phase before reaching the slow-start threshold (`ssthresh`)?",
        options: [
          "Linearly by 1 MSS per hours",
          "Exponentially — doubling every Round-Trip Time (RTT) as ACKs arrive",
          "Logarithmically",
          "It remains fixed at 1 MSS until a timeout occurs",
        ],
        correctAnswer: 1,
        explanation:
          "During Slow Start, `cwnd` increases by 1 MSS for every ACK received, which effectively doubles the congestion window every RTT (exponential growth) until `ssthresh` is reached.",
      },
      {
        id: "net-7",
        subtopic: "Application Protocols",
        question:
          "Which standard port numbers are assigned by IANA to HTTPS, SSH, and DNS respectively?",
        options: [
          "443, 22, and 53",
          "80, 21, and 53",
          "443, 23, and 25",
          "8080, 22, and 110",
        ],
        correctAnswer: 0,
        explanation:
          "HTTPS uses port 443 (TLS-encrypted HTTP), SSH uses port 22, and DNS uses port 53 (both UDP and TCP).",
      },
      {
        id: "net-8",
        subtopic: "Error Detection",
        question:
          "Which error-detection mechanism is computed and appended in the trailer of an IEEE 802.3 Ethernet Data Link frame?",
        options: [
          "Single Parity Bit",
          "32-bit Cyclic Redundancy Check (CRC-32) in the Frame Check Sequence (FCS)",
          "SHA-256 Cryptographic Hash",
          "Hamming Code for multi-bit correction",
        ],
        correctAnswer: 1,
        explanation:
          "Ethernet frames end with a 4-byte Frame Check Sequence (FCS) containing a CRC-32 polynomial remainder to detect burst bit errors introduced on the physical medium.",
      },
    ],
  },
  {
    id: "aptitude-quant",
    title: "Quantitative Aptitude & Logical Reasoning",
    category: "Aptitude & Logic",
    difficulty: "Easy",
    durationMinutes: 10,
    perQuestionSeconds: 75,
    description:
      "Placement and entrance exam essentials: Time & Work, Conditional Probability, Permutations, Number Series, Ratios, and Deductive Logic.",
    questions: [
      {
        id: "apt-1",
        subtopic: "Time & Work",
        question:
          "Developer A can complete a backend module in 12 days, and Developer B can complete the same module in 15 days. If they work together for 4 days and then Developer A leaves, how many more days will Developer B take to finish the remaining work alone?",
        options: ["6 days", "5 days", "8 days", "4.5 days"],
        correctAnswer: 0,
        explanation:
          "Combined 1-day work = 1/12 + 1/15 = 9/60 = 3/20. In 4 days together, they finish 4 * (3/20) = 12/20 = 3/5 of the work. Remaining work = 2/5. B alone takes (2/5) / (1/15) = 6 days.",
      },
      {
        id: "apt-2",
        subtopic: "Permutations & Strings",
        question:
          "In how many distinct ways can the letters of the word 'ALGORITHM' be arranged such that the vowels ('A', 'O', 'I') always stay together?",
        options: ["30,240", "4,320", "362,880", "15,120"],
        correctAnswer: 0,
        explanation:
          "'ALGORITHM' has 9 distinct letters: 6 consonants and 3 vowels (A, O, I). Treating the 3 vowels as 1 super-unit gives 7 units, which can be arranged in 7! = 5,040 ways. The 3 vowels arrange internally in 3! = 6 ways. Total = 5,040 * 6 = 30,240.",
      },
      {
        id: "apt-3",
        subtopic: "Probability",
        question:
          "Two fair six-sided dice are rolled simultaneously. What is the probability that the sum of the numbers on the top faces is at least 10?",
        options: ["1/6", "1/9", "5/36", "7/36"],
        correctAnswer: 0,
        explanation:
          "Total outcomes = 36. Sums ≥ 10 are: Sum 10 {(4,6),(5,5),(6,4)} = 3 ways; Sum 11 {(5,6),(6,5)} = 2 ways; Sum 12 {(6,6)} = 1 way. Favorable outcomes = 3 + 2 + 1 = 6. Probability = 6/36 = 1/6.",
      },
      {
        id: "apt-4",
        subtopic: "Number Series",
        question:
          "Find the missing number in the progression: 3, 7, 15, 31, 63, ?",
        options: ["125", "127", "129", "131"],
        correctAnswer: 1,
        explanation:
          "Each term follows the pattern `2n + 1` (or `2^k - 1`): 3*2+1=7, 7*2+1=15, 15*2+1=31, 31*2+1=63, and 63*2+1 = 127.",
      },
      {
        id: "apt-5",
        subtopic: "Relative Speed & Trains",
        question:
          "A train 180 meters long is running at a speed of 72 km/h. How many seconds will it take to completely cross a platform that is 220 meters long?",
        options: ["20 seconds", "18 seconds", "25 seconds", "15 seconds"],
        correctAnswer: 0,
        explanation:
          "Convert speed to m/s: 72 * (5/18) = 20 m/s. Total distance to cover = train length + platform length = 180 + 220 = 400 meters. Time = 400 m / 20 m/s = 20 seconds.",
      },
      {
        id: "apt-6",
        subtopic: "Percentages & Profit",
        question:
          "A server license price is first increased by 25% and later discounted by 20% during an annual sale. What is the net percentage change in the final price compared to the original price?",
        options: [
          "5% increase",
          "0% (No net change)",
          "5% decrease",
          "2.5% increase",
        ],
        correctAnswer: 1,
        explanation:
          "Let original price = 100. After 25% increase, price = 125. After 20% discount on 125, reduction = 0.20 * 125 = 25, returning the price to 100 (0% net change).",
      },
      {
        id: "apt-7",
        subtopic: "Deductive Syllogisms",
        question:
          "Statements: (1) All compilers are programs. (2) Some programs are open-source. Which conclusion logically and necessarily follows?",
        options: [
          "All compilers are open-source",
          "Some compilers are definitely open-source",
          "Every compiler is a program",
          "No compiler is open-source",
        ],
        correctAnswer: 2,
        explanation:
          "Since 'All compilers are programs', every individual compiler is necessarily a program. The overlap between 'open-source' and 'programs' does not have to intersect the 'compilers' subset.",
      },
      {
        id: "apt-8",
        subtopic: "Logarithms & Exponents",
        question:
          "If log_2(x) + log_2(x - 2) = 3, what is the valid real value of x?",
        options: ["4", "-2", "6", "8"],
        correctAnswer: 0,
        explanation:
          "Combine logarithms: log_2(x(x - 2)) = 3 => x^2 - 2x = 2^3 = 8 => x^2 - 2x - 8 = 0 => (x - 4)(x + 2) = 0. Since logarithm arguments must be strictly positive (x > 2), x = 4 is the unique valid solution.",
      },
    ],
  },
  {
    id: "oop-cpp-java",
    title: "Object-Oriented Systems (C++ & Java)",
    category: "Programming",
    difficulty: "Hard",
    durationMinutes: 10,
    perQuestionSeconds: 75,
    description:
      "Runtime polymorphism, virtual method tables, destructor semantics, memory management, generics, and SOLID architecture principles.",
    questions: [
      {
        id: "oop-1",
        subtopic: "Virtual Destructors",
        question:
          "In C++, why should a base class destructor always be declared `virtual` if objects of derived classes are deleted through a base-class pointer (`delete basePtr`)?",
        options: [
          "To allow the base class to be instantiated on the stack",
          "To prevent undefined behavior and memory leaks by ensuring the derived class destructor runs before the base class destructor",
          "Because C++ syntax prohibits non-virtual destructors in classes with private fields",
          "To make all member functions automatically inline",
        ],
        correctAnswer: 1,
        explanation:
          "Deleting a derived object via a non-virtual base pointer invokes only the base destructor (undefined behavior), leaking any resources allocated by the derived class.",
      },
      {
        id: "oop-2",
        subtopic: "Dynamic Dispatch & vtable",
        question:
          "How do C++ compilers typically implement runtime polymorphism for classes containing `virtual` functions?",
        options: [
          "By duplicating the source code of every derived class at link time",
          "Using a per-class Virtual Method Table (`vtable`) of function pointers and a hidden `vptr` inside each object instance",
          "By reflection lookups using string method names at runtime",
          "Using preprocessor macros before compilation",
        ],
        correctAnswer: 1,
        explanation:
          "Each polymorphic class has a `vtable` containing pointers to the most-derived overrides, and each instance stores a `vptr` initialized by its constructor to point to its class's `vtable`.",
      },
      {
        id: "oop-3",
        subtopic: "Java Memory & Strings",
        question:
          "In Java, why is `String` designed as an immutable final class?",
        options: [
          "Because Java does not support character arrays",
          "To enable safe String Pool interning, thread safety without synchronization, and cached hash codes for HashMap keys",
          "To allow Strings to be garbage collected before the method returns",
          "So that the `+` operator mutates the String buffer in place",
        ],
        correctAnswer: 1,
        explanation:
          "Immutability allows multiple references to safely share literals in the String Constant Pool, guarantees thread safety, prevents security tampering (e.g., file paths), and lets String cache its `hashCode`.",
      },
      {
        id: "oop-4",
        subtopic: "Constructor & Destructor Order",
        question:
          "When an instance of a derived class `Child` (inheriting from `Parent`) is created and later destroyed, in what order do constructors and destructors execute?",
        options: [
          "Constructor: Child then Parent | Destructor: Parent then Child",
          "Constructor: Parent then Child | Destructor: Child then Parent",
          "Constructor: Parent then Child | Destructor: Parent then Child",
          "Constructor: Child then Parent | Destructor: Child then Parent",
        ],
        correctAnswer: 1,
        explanation:
          "Base subobjects are constructed first (`Parent` → `Child`) so the derived constructor can safely rely on initialized base members, and destroyed in exact reverse order (`Child` → `Parent`).",
      },
      {
        id: "oop-5",
        subtopic: "SOLID Principles",
        question:
          "Which SOLID design principle states that objects of a superclass shall be replaceable with objects of its subclasses without breaking the correctness or contracts of the program?",
        options: [
          "Single Responsibility Principle (SRP)",
          "Open-Closed Principle (OCP)",
          "Liskov Substitution Principle (LSP)",
          "Dependency Inversion Principle (DIP)",
        ],
        correctAnswer: 2,
        explanation:
          "Formulated by Barbara Liskov, the Liskov Substitution Principle (LSP) requires behavioral subtyping: subclasses must honor all preconditions, postconditions, and invariants of the base type.",
      },
      {
        id: "oop-6",
        subtopic: "Java `equals` and `hashCode`",
        question:
          "In Java, if two objects `a` and `b` satisfy `a.equals(b) == true`, what does the `Object.hashCode()` contract strictly require?",
        options: [
          "`a.hashCode()` and `b.hashCode()` must return the exact same integer value",
          "`a == b` must also be true",
          "`a.hashCode()` must be strictly greater than `b.hashCode()`",
          "Their hash codes must be distinct to prevent bucket collisions",
        ],
        correctAnswer: 0,
        explanation:
          "Equal objects MUST produce equal hash codes; violating this breaks hash-based collections like `HashMap` and `HashSet` because lookups will search the wrong hash bucket.",
      },
      {
        id: "oop-7",
        subtopic: "Abstract Classes vs Interfaces",
        question:
          "In modern Java (Java 8+), what remains a fundamental distinction between an `abstract class` and an `interface`?",
        options: [
          "Interfaces cannot contain any method implementations at all",
          "An abstract class can hold mutable instance fields (non-static state) and constructors, whereas interface fields are implicitly `public static final`",
          "A class can extend multiple abstract classes but implement only one interface",
          "Abstract classes cannot have `private` helper methods",
        ],
        correctAnswer: 1,
        explanation:
          "While Java 8+ interfaces support `default` and `static` methods, interfaces still cannot hold per-instance mutable state or constructors; a class can implement multiple interfaces but extend only one class.",
      },
      {
        id: "oop-8",
        subtopic: "RAII & Smart Pointers",
        question:
          "Which C++11 smart pointer enforces exclusive ownership of a dynamically allocated resource and cannot be copied, only moved via `std::move`?",
        options: [
          "std::shared_ptr",
          "std::unique_ptr",
          "std::weak_ptr",
          "std::auto_ptr",
        ],
        correctAnswer: 1,
        explanation:
          "`std::unique_ptr` models zero-overhead exclusive RAII ownership: its copy constructor is deleted, and ownership transfers explicitly via move semantics (`std::move`).",
      },
    ],
  },
  {
    id: "web-js-arch",
    title: "Web Engineering & JavaScript Runtime",
    category: "Programming",
    difficulty: "Medium",
    durationMinutes: 8,
    perQuestionSeconds: 60,
    description:
      "JavaScript Event Loop, Microtask vs Macrotask queues, lexical closures, Promises, DOM event delegation, and HTTP caching.",
    questions: [
      {
        id: "web-1",
        subtopic: "Event Loop & Microtasks",
        question:
          "In what order does the JavaScript runtime log values for:\n`console.log(1); setTimeout(() => console.log(2), 0); Promise.resolve().then(() => console.log(3)); console.log(4);`?",
        options: [
          "1, 2, 3, 4",
          "1, 4, 3, 2",
          "1, 4, 2, 3",
          "1, 3, 4, 2",
        ],
        correctAnswer: 1,
        explanation:
          "Synchronous code (`1`, `4`) executes on the call stack first. Before picking the next macrotask (`setTimeout` → `2`), the event loop drains the entire microtask queue (`Promise.then` → `3`), yielding `1, 4, 3, 2`.",
      },
      {
        id: "web-2",
        subtopic: "Lexical Closures",
        question:
          "What is a 'Closure' in JavaScript?",
        options: [
          "A syntax for immediately terminating a browser tab",
          "The combination of a function bundled together with references to its surrounding lexical environment, allowing access to outer variables even after the outer function has returned",
          "A method on `Object.prototype` that freezes object properties",
          "An automatic garbage collection sweep of global variables",
        ],
        correctAnswer: 1,
        explanation:
          "Because JavaScript uses lexical scoping, inner functions retain a live reference to variables in their enclosing scope record even after the outer execution context pops off the stack.",
      },
      {
        id: "web-3",
        subtopic: "Promise Concurrency",
        question:
          "How does `Promise.all([p1, p2, p3])` behave if `p2` rejects immediately while `p1` and `p3` are still pending?",
        options: [
          "It waits for `p1` and `p3` to settle and returns an array of status objects",
          "It rejects immediately (fail-fast) with `p2`'s rejection reason",
          "It ignores `p2` and resolves with `[res1, res3]`",
          "It automatically retries `p2` three times",
        ],
        correctAnswer: 1,
        explanation:
          "`Promise.all` is fail-fast: as soon as any input promise rejects, the returned promise immediately rejects with that error. (`Promise.allSettled` is used when you want to wait for all outcomes).",
      },
      {
        id: "web-4",
        subtopic: "DOM Event Propagation",
        question:
          "Which DOM Event method prevents an event from bubbling up to parent elements while still allowing other event listeners on the exact same target element to run?",
        options: [
          "event.preventDefault()",
          "event.stopPropagation()",
          "event.stopImmediatePropagation()",
          "return false",
        ],
        correctAnswer: 1,
        explanation:
          "`event.stopPropagation()` halts further propagation up/down the DOM tree, whereas `preventDefault()` cancels default browser actions (like form submission) without stopping bubbling.",
      },
      {
        id: "web-5",
        subtopic: "HTTP Semantics",
        question:
          "In RESTful HTTP architecture, what does it mean for an HTTP method (such as `GET`, `PUT`, or `DELETE`) to be 'Idempotent'?",
        options: [
          "The request never modifies any state on the server",
          "Making multiple identical requests produces the exact same intended server state as making a single request",
          "The response payload is always compressed with gzip",
          "The request parameters are sent only in the URL query string",
        ],
        correctAnswer: 1,
        explanation:
          "An operation is idempotent if executing it N > 1 times has the same state effect on the server resource as executing it once (`PUT` and `DELETE` are idempotent; `POST` is not).",
      },
      {
        id: "web-6",
        subtopic: "Variable Hoisting & TDZ",
        question:
          "What happens when you reference a variable declared with `let` or `const` in the same block before its declaration line is reached?",
        options: [
          "It evaluates to `undefined` without throwing an error",
          "It throws a `ReferenceError` because the variable is in the Temporal Dead Zone (TDZ)",
          "It creates a property on the global `window` object",
          "It evaluates to `null`",
        ],
        correctAnswer: 1,
        explanation:
          "While `let` and `const` declarations are hoisted to the top of their block scope, they remain uninitialized in the Temporal Dead Zone (TDZ) until execution reaches the declaration.",
      },
      {
        id: "web-7",
        subtopic: "Web Security (CORS)",
        question:
          "When does a browser automatically issue an HTTP `OPTIONS` preflight request before sending an actual cross-origin `fetch()` request?",
        options: [
          "On every single `GET` request to any domain",
          "When the request is non-simple (e.g., uses `PUT`/`DELETE`, or sets custom headers like `Authorization` or `Content-Type: application/json`)",
          "Only when loading `<img>` tags from a CDN",
          "Only when the server uses HTTP/1.0",
        ],
        correctAnswer: 1,
        explanation:
          "Browsers send a CORS preflight `OPTIONS` request whenever a cross-origin request could have side effects on server data (non-simple methods or headers) to verify `Access-Control-Allow-*` permissions first.",
      },
      {
        id: "web-8",
        subtopic: "Equality & Type Coercion",
        question:
          "In JavaScript, what is the result of `[1, 2] == [1, 2]` and `Object.is(NaN, NaN)` respectively?",
        options: [
          "`true` and `false`",
          "`false` and `true`",
          "`true` and `true`",
          "`false` and `false`",
        ],
        correctAnswer: 1,
        explanation:
          "Two distinct array literals `[1, 2]` have different memory references so `==` returns `false`. `Object.is(NaN, NaN)` returns `true` (fixing the quirk where `NaN === NaN` is `false`).",
      },
    ],
  },
];

// Intelligent Local Topic Synthesizer (Fallback if offline or API key not set)
export function synthesizeQuizLocally(
  rawTopic: string,
  difficulty: DifficultyLevel,
  count: number
): QuizDefinition {
  const topic = rawTopic.trim() || "Computer Science Fundamentals";
  const lower = topic.toLowerCase();

  // Check if any prebuilt pool matches keywords closely
  const matchedPool: QuizQuestion[] = [];
  for (const quiz of PREBUILT_QUIZZES) {
    if (
      lower.includes("os") ||
      lower.includes("operating") ||
      lower.includes("process") ||
      lower.includes("deadlock")
    ) {
      if (quiz.id === "bca-os") matchedPool.push(...quiz.questions);
    }
    if (lower.includes("python") || lower.includes("django") || lower.includes("pandas")) {
      if (quiz.id === "python-mastery") matchedPool.push(...quiz.questions);
    }
    if (
      lower.includes("data structure") ||
      lower.includes("dsa") ||
      lower.includes("algorithm") ||
      lower.includes("tree") ||
      lower.includes("graph")
    ) {
      if (quiz.id === "dsa-core") matchedPool.push(...quiz.questions);
    }
    if (
      lower.includes("dbms") ||
      lower.includes("database") ||
      lower.includes("sql") ||
      lower.includes("normalization")
    ) {
      if (quiz.id === "bca-dbms") matchedPool.push(...quiz.questions);
    }
    if (
      lower.includes("network") ||
      lower.includes("tcp") ||
      lower.includes("osi") ||
      lower.includes("subnet")
    ) {
      if (quiz.id === "cs-networks") matchedPool.push(...quiz.questions);
    }
    if (
      lower.includes("aptitude") ||
      lower.includes("math") ||
      lower.includes("logic") ||
      lower.includes("probability")
    ) {
      if (quiz.id === "aptitude-quant") matchedPool.push(...quiz.questions);
    }
    if (
      lower.includes("oop") ||
      lower.includes("c++") ||
      lower.includes("java") ||
      lower.includes("polymorphism")
    ) {
      if (quiz.id === "oop-cpp-java") matchedPool.push(...quiz.questions);
    }
    if (
      lower.includes("web") ||
      lower.includes("javascript") ||
      lower.includes("react") ||
      lower.includes("frontend") ||
      lower.includes("html")
    ) {
      if (quiz.id === "web-js-arch") matchedPool.push(...quiz.questions);
    }
  }

  // Dynamic domain-contextual generator for any custom topic
  const generatedTemplates: QuizQuestion[] = [
    {
      id: `custom-1-${Date.now()}`,
      subtopic: `${topic} — Core Architecture`,
      question: `In the context of ${topic}, which architectural principle is most critical for maintaining scalability, deterministic behavior, and low coupling across components?`,
      options: [
        "Strict modular separation of concerns with well-defined interface contracts",
        "Storing all execution state in unindexed global mutable variables",
        "Eliminating error handling boundaries to reduce instruction count",
        "Hardcoding environment-specific parameters inside core business routines",
      ],
      correctAnswer: 0,
      explanation: `In ${topic}, enforcing modular separation of concerns and explicit interface contracts allows components to scale, be tested independently, and evolve without cascading regressions.`,
    },
    {
      id: `custom-2-${Date.now()}`,
      subtopic: `${topic} — Performance & Complexity`,
      question: `When optimizing a system built around ${topic} under high concurrency or large dataset loads, which strategy yields the highest asymptotic improvement?`,
      options: [
        "Replacing linear O(N) lookups with indexed or hash-partitioned O(1) / O(log N) access paths",
        "Increasing polling frequency in a busy-wait loop on the main thread",
        "Serializing all parallel requests through a single global lock",
        "Duplicating the entire dataset in memory on every read operation",
      ],
      correctAnswer: 0,
      explanation: `Algorithmic and indexing improvements—moving from linear scans to logarithmic or constant-time indexed lookups—reduce computational overhead by orders of magnitude as N grows in ${topic}.`,
    },
    {
      id: `custom-3-${Date.now()}`,
      subtopic: `${topic} — State & Concurrency`,
      question: `What is the primary hazard when multiple concurrent execution threads or processes mutate shared state in ${topic} without synchronization primitives?`,
      options: [
        "Race conditions and non-deterministic state corruption",
        "Automatic compilation into static machine code",
        "Guaranteed reduction in memory bandwidth usage",
        "Immediate upgrade to lossless compression",
      ],
      correctAnswer: 0,
      explanation: `Unsynchronized concurrent writes to shared state cause race conditions (read-modify-write hazards), leading to lost updates and non-deterministic failures in ${topic}.`,
    },
    {
      id: `custom-4-${Date.now()}`,
      subtopic: `${topic} — Verification & Edge Cases`,
      question: `During rigorous validation of a ${topic} implementation, why is boundary-value analysis prioritized alongside standard happy-path testing?`,
      options: [
        "Defects disproportionately cluster at extremal boundaries (empty inputs, zero capacities, overflow limits, and off-by-one indices)",
        "Boundary-value analysis eliminates the need for syntax checking",
        "It reduces the binary size of the compiled executable",
        "It bypasses runtime memory allocation entirely",
      ],
      correctAnswer: 0,
      explanation: `In ${topic}, edge cases such as empty collections, maximum capacity thresholds, and off-by-one index boundaries are the primary source of runtime exceptions and logic bugs.`,
    },
    {
      id: `custom-5-${Date.now()}`,
      subtopic: `${topic} — Fault Tolerance`,
      question: `How does a resilient ${topic} workflow handle transient failures or invalid upstream inputs gracefully?`,
      options: [
        "By validating preconditions early (fail-fast) and applying bounded retries with exponential backoff or clean fallback states",
        "By silently swallowing all exceptions and returning uninitialized pointers",
        "By halting the entire operating system kernel on the first warning",
        "By disabling checksums and schema validation",
      ],
      correctAnswer: 0,
      explanation: `Defensive validation combined with bounded exponential backoff and explicit fallback states ensures ${topic} systems remain reliable and observable under degraded conditions.`,
    },
    {
      id: `custom-6-${Date.now()}`,
      subtopic: `${topic} — Resource Lifecycle`,
      question: `Which practice prevents resource exhaustion and memory leaks during long-running operations in ${topic}?`,
      options: [
        "Deterministic acquisition and release of handles/buffers using scoped lifecycle blocks (RAII / try-finally / context managers)",
        "Allocating new connections on every request without closing idle handles",
        "Storing unbounded historical logs in an in-memory array",
        "Disabling garbage collection and buffer pooling",
      ],
      correctAnswer: 0,
      explanation: `Deterministic cleanup via scoped resource management guarantees that file descriptors, network sockets, and memory buffers in ${topic} are reclaimed even when exceptions occur.`,
    },
    {
      id: `custom-7-${Date.now()}`,
      subtopic: `${topic} — Security & Integrity`,
      question: `When designing secure data handling within ${topic}, which defense-in-depth measure is essential against injection and tampering?`,
      options: [
        "Strict input sanitization, parameterized execution, and least-privilege access control",
        "Relying exclusively on client-side UI validation",
        "Concatenating raw user strings directly into system commands",
        "Storing plaintext credentials inside public configuration files",
      ],
      correctAnswer: 0,
      explanation: `Enforcing server/engine-level input validation, parameterized queries/commands, and least-privilege permissions protects ${topic} workflows from injection and privilege escalation.`,
    },
    {
      id: `custom-8-${Date.now()}`,
      subtopic: `${topic} — Trade-off Analysis`,
      question: `In ${topic}, what is the fundamental trade-off introduced when adding an in-memory caching layer in front of a primary data store?`,
      options: [
        "Lower read latency and reduced backend load at the cost of cache invalidation complexity and potential staleness",
        "Higher read latency in exchange for zero memory consumption",
        "Complete elimination of network hardware requirements",
        "Automatic conversion of unstructured data into normalized 5NF tables",
      ],
      correctAnswer: 0,
      explanation: `Caching dramatically accelerates read-heavy workloads in ${topic} (high cache hit ratio), but requires careful TTL, write-through, or invalidation policies to prevent stale reads.`,
    },
    {
      id: `custom-9-${Date.now()}`,
      subtopic: `${topic} — Observability`,
      question: `Which triad of telemetry signals provides the clearest diagnostic visibility when troubleshooting latency spikes in ${topic}?`,
      options: [
        "Structured logs, quantitative metrics (p50/p95/p99 latency), and distributed execution traces",
        "Randomly sampled console print statements without timestamps",
        "CPU fan speed acoustic measurements",
        "Static source code line counts",
      ],
      correctAnswer: 0,
      explanation: `Combining tail-latency percentiles (p95/p99), correlated traces, and structured context logs lets engineers pinpoint bottlenecks in ${topic} rapidly.`,
    },
    {
      id: `custom-10-${Date.now()}`,
      subtopic: `${topic} — Abstraction Layers`,
      question: `Why do modern implementations of ${topic} separate the logical specification (interface/API) from the physical implementation?`,
      options: [
        "So underlying algorithms and storage engines can be upgraded or optimized without breaking dependent client code",
        "To double the required network round-trips for local function calls",
        "To prevent compilers from performing type checking",
        "To force users to rewrite application code after every patch",
      ],
      correctAnswer: 0,
      explanation: `Data and procedural abstraction decouple *what* an operation accomplishes from *how* it is implemented, enabling seamless performance upgrades in ${topic}.`,
    },
  ];

  const combined = [...matchedPool, ...generatedTemplates].slice(0, count).map((q, idx) => ({
    ...q,
    id: `ai-q-${Date.now()}-${idx}`,
  }));

  return {
    id: `ai-quiz-${Date.now()}`,
    title: `${topic} — AI Mock Assessment`,
    category: "AI Custom",
    difficulty,
    durationMinutes: count,
    perQuestionSeconds: 60,
    description: `Dynamically synthesized ${difficulty.toLowerCase()}-difficulty assessment covering core concepts, edge cases, and analytical problem solving in ${topic}.`,
    questions: combined,
    isAIGenerated: true,
  };
}

export function synthesizeAnalysisLocally(
  attempt: Omit<QuizAttempt, "aiAnalysis">
): AIAnalysisReport {
  const {
    quizTitle,
    totalQuestions,
    correctCount,
    incorrectCount,
    skippedCount,
    accuracy,
    timeTakenSeconds,
    questions,
    userAnswers,
  } = attempt;

  const avgTime = Math.round(timeTakenSeconds / Math.max(totalQuestions, 1));
  const strongSubtopics = new Set<string>();
  const weakSubtopics = new Set<string>();

  questions.forEach((q, idx) => {
    const ans = userAnswers[idx];
    if (ans === q.correctAnswer) {
      strongSubtopics.add(q.subtopic);
    } else {
      weakSubtopics.add(q.subtopic);
    }
  });

  const strongArr = Array.from(strongSubtopics);
  const weakArr = Array.from(weakSubtopics);

  let headline = "Solid Conceptual Foundation with Targeted Growth Areas";
  if (accuracy >= 85) {
    headline = "Distinction-Grade Mastery & High Analytical Precision";
  } else if (accuracy >= 60) {
    headline = "Competent Command with Specific Subtopic Gaps";
  } else {
    headline = "Foundational Review Recommended Before Advanced Practice";
  }

  const executiveSummary = `You achieved ${accuracy}% accuracy (${correctCount}/${totalQuestions} correct, ${incorrectCount} incorrect, ${skippedCount} unattempted) on "${quizTitle}" with an average pacing of ${avgTime}s per question. ${
    accuracy >= 80
      ? "Your conceptual grasp and elimination accuracy are strong across primary topics."
      : "Focusing on the missed subtopics below and reviewing the step-by-step explanations will rapidly lift your score above 85%."
  }`;

  const strengths =
    strongArr.length > 0
      ? strongArr.slice(0, 3).map((s) => `Strong accuracy demonstrated in ${s}`)
      : [
          `Completed assessment with ${avgTime}s average time per question`,
          "Engaged with multi-concept technical questions",
        ];

  const weakAreas =
    weakArr.length > 0
      ? weakArr
          .slice(0, 3)
          .map((w) => `Requires deeper conceptual review in ${w}`)
      : [
          "Edge-case stress testing under faster time constraints",
          "Advanced synthesis across multi-step problems",
        ];

  const primaryWeak = weakArr[0] || quizTitle;

  return {
    headline,
    executiveSummary,
    strengths,
    weakAreas,
    studyPlan: [
      {
        stepTitle: "01. Review Missed Question Explanations",
        action: `Inspect the detailed rationales for ${
          weakArr.slice(0, 2).join(" & ") || "all questions"
        } in the breakdown table below and note why distractor options fail.`,
        estimatedTime: "15 mins",
      },
      {
        stepTitle: "02. Targeted Subtopic Drill",
        action: `Practice 5–8 focused problems specifically targeting "${primaryWeak}" to reinforce edge-case intuition.`,
        estimatedTime: "25 mins",
      },
      {
        stepTitle: "03. Timed Verification Retake",
        action: `Generate a follow-up AI mock test on "${primaryWeak}" using Per-Question Timer mode to lock in speed and accuracy.`,
        estimatedTime: "10 mins",
      },
    ],
    recommendedNextTopic:
      weakArr.length > 0
        ? `${quizTitle.replace(" — AI Mock Assessment", "")}: ${weakArr[0]}`
        : `Advanced ${quizTitle.replace(" — AI Mock Assessment", "")}`,
    source: "smart_engine",
  };
}
