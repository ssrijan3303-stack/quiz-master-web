import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getGenAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error("GEMINI_API_KEY is not configured on the server.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "2mb" }));

  // 1. Dynamic AI Quiz Generation Endpoint
  app.post("/api/ai/generate-quiz", async (req, res) => {
    try {
      const { topic, difficulty = "Medium", questionCount = 8 } = req.body || {};
      if (!topic || typeof topic !== "string") {
        res.status(400).json({ error: "A valid quiz topic is required." });
        return;
      }

      const count = Math.min(Math.max(Number(questionCount) || 8, 5), 10);
      const ai = getGenAIClient();

      const prompt = `Create a rigorous, university and technical-interview grade multiple-choice mock test on the topic: "${topic}".
Difficulty Level: ${difficulty}.
Number of Questions: ${count}.

Requirements:
1. Every question must be technically accurate, unambiguous, and test conceptual depth, practical application, or analytical reasoning.
2. Provide exactly 4 distinct options per question (do not prefix options with A/B/C/D; provide clean option text).
3. "correctAnswer" must be the 0-based integer index (0, 1, 2, or 3) corresponding to the exact correct option.
4. "explanation" must clearly explain why the correct option is right and why common misconceptions fail (2-3 sentences).
5. "subtopic" must name the specific sub-concept tested (e.g., "Deadlock Avoidance", "List Comprehensions", "B+ Tree Indexing").`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          systemInstruction:
            "You are a senior computer science professor and examination architect creating accurate, well-structured multiple-choice assessments.",
          temperature: 0.7,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
                description: "Formal title for the generated mock test.",
              },
              category: {
                type: Type.STRING,
                description:
                  "Academic category such as BCA Subjects, Computer Science, Programming, or Aptitude & Logic.",
              },
              description: {
                type: Type.STRING,
                description:
                  "1-2 sentence overview of the concepts covered in this assessment.",
              },
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: {
                      type: Type.STRING,
                      description: "The question stem.",
                    },
                    options: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: "Exactly 4 answer choices.",
                    },
                    correctAnswer: {
                      type: Type.INTEGER,
                      description: "0-based index (0 to 3) of the correct option.",
                    },
                    explanation: {
                      type: Type.STRING,
                      description:
                        "Detailed conceptual explanation of the correct answer.",
                    },
                    subtopic: {
                      type: Type.STRING,
                      description: "Specific subtopic tested by this question.",
                    },
                  },
                  required: [
                    "question",
                    "options",
                    "correctAnswer",
                    "explanation",
                    "subtopic",
                  ],
                },
              },
            },
            required: ["title", "category", "description", "questions"],
          },
        },
      });

      const rawText = response.text;
      if (!rawText) {
        throw new Error("Empty response from Gemini model.");
      }

      const parsed = JSON.parse(rawText.trim());
      res.json(parsed);
    } catch (error: any) {
      console.error("AI Quiz Generation Error:", error?.message || error);
      res.status(500).json({
        error:
          error?.message ||
          "Failed to generate quiz via Gemini API.",
      });
    }
  });

  // 2. AI Performance Analysis & Diagnostic Feedback Endpoint
  app.post("/api/ai/analyze-performance", async (req, res) => {
    try {
      const {
        quizTitle,
        topic,
        difficulty,
        totalQuestions,
        correctCount,
        incorrectCount,
        skippedCount,
        timeTakenSeconds,
        weakSubtopics = [],
        strongSubtopics = [],
        missedQuestions = [],
      } = req.body || {};

      const ai = getGenAIClient();

      const missedSummary = Array.isArray(missedQuestions)
        ? missedQuestions
            .slice(0, 5)
            .map(
              (m: any, idx: number) =>
                `${idx + 1}. [${m.subtopic}] Q: ${m.question} | Candidate chose: "${m.selectedOption || "Skipped"}" | Correct: "${m.correctOption}"`
            )
            .join("\n")
        : "";

      const prompt = `Analyze this candidate's mock test performance and provide structured, constructive diagnostic feedback:
- Assessment: ${quizTitle || topic} (Difficulty: ${difficulty || "Medium"})
- Score: ${correctCount} / ${totalQuestions} (${Math.round(
        (correctCount / Math.max(totalQuestions, 1)) * 100
      )}% accuracy)
- Incorrect: ${incorrectCount}, Unattempted/Skipped: ${skippedCount}
- Total Time Taken: ${timeTakenSeconds} seconds
- Strong Subtopics: ${strongSubtopics.join(", ") || "None recorded"}
- Weak Subtopics: ${weakSubtopics.join(", ") || "None recorded"}
- Sample Missed Questions:
${missedSummary || "No missed questions!"}

Return a structured JSON diagnostic report identifying strengths, specific conceptual gaps, a 3-step study roadmap, and a recommended follow-up topic.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          systemInstruction:
            "You are an expert academic mentor and technical interview coach providing precise, actionable diagnostic feedback.",
          temperature: 0.5,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              headline: {
                type: Type.STRING,
                description:
                  "Concise 5-8 word diagnostic headline summarizing performance.",
              },
              executiveSummary: {
                type: Type.STRING,
                description:
                  "2-3 sentences analyzing accuracy, time management, and conceptual command.",
              },
              strengths: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "2-3 specific conceptual or pacing strengths demonstrated.",
              },
              weakAreas: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description:
                  "2-3 specific subtopics or misconceptions that need review.",
              },
              studyPlan: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    stepTitle: { type: Type.STRING },
                    action: { type: Type.STRING },
                    estimatedTime: { type: Type.STRING },
                  },
                  required: ["stepTitle", "action", "estimatedTime"],
                },
                description: "3 concrete study steps to improve mastery.",
              },
              recommendedNextTopic: {
                type: Type.STRING,
                description:
                  "A specific topic name for a targeted follow-up mock test.",
              },
            },
            required: [
              "headline",
              "executiveSummary",
              "strengths",
              "weakAreas",
              "studyPlan",
              "recommendedNextTopic",
            ],
          },
        },
      });

      const rawText = response.text;
      if (!rawText) {
        throw new Error("Empty analysis response from Gemini model.");
      }

      const parsed = JSON.parse(rawText.trim());
      res.json(parsed);
    } catch (error: any) {
      console.error("AI Performance Analysis Error:", error?.message || error);
      res.status(500).json({
        error:
          error?.message ||
          "Failed to generate AI performance analysis.",
      });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AssessAI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
