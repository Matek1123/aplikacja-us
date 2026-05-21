import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config({ path: ".env.local" });

const app = express();

app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

function extractJson(text) {
  const cleaned = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start === -1 || end === -1) {
    throw new Error("Gemini nie zwrócił JSON-a: " + cleaned);
  }

  return cleaned.slice(start, end + 1);
}

app.post("/api/chat", async (req, res) => {
  try {
    console.log("BODY:", req.body);

    const { userInput, editedInput, clarificationAnswer } = req.body;

    const effectiveInput = editedInput || userInput;

    const prompt = `
Zwróć TYLKO poprawny JSON. Bez markdowna. Bez komentarzy.

Opis użytkownika:
${effectiveInput}

Odpowiedź na pytanie pomocnicze:
${clarificationAnswer || "Brak"}

Zasady:
- Nie przepisuj tekstu 1:1.
- Zrozum intencję użytkownika.
- Jeśli brakuje ważnej informacji, zadaj dokładnie jedno krótkie pytanie.
- Jeśli informacji wystarcza, napisz gotową wiadomość.
- Pisz po polsku.
- Nie wymyślaj faktów.

Format:
{
  "needsClarification": true albo false,
  "question": "pytanie albo null",
  "message": "wiadomość albo null"
}
`;

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    console.log("GEMINI RAW:", result.text);

    const jsonText = extractJson(result.text || "");
    const parsed = JSON.parse(jsonText);

    return res.json(parsed);
  } catch (error) {
    console.error("BACKEND ERROR:", error);

    return res.status(500).json({
      error: "Błąd backendu AI",
      details: String(error),
    });
  }
});

app.listen(3001, () => {
  console.log("Backend działa na http://localhost:3001");
});
