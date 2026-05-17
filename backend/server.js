const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("AI server działa z Ollama");
});

app.post("/generate", async (req, res) => {
  try {
    const { prompt } = req.body;

    const finalPrompt = `
Jesteś inteligentnym asystentem pomagającym pisać formalne zapytania do polskich urzędów.

Użytkownik wpisuje krótką frazę.
Twoim zadaniem jest:
- zrozumieć intencję,
- wygenerować pytania doprecyzowujące,
- zasugerować możliwe problemy prawne/podatkowe,
- pisać naturalnie i dynamicznie,
- nie powtarzać szablonów.

Fraza użytkownika:
${prompt}
`;

    const response = await fetch("http://127.0.0.1:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3.2:3b",
        prompt: finalPrompt,
        stream: false,
      }),
    });

    const data = await response.json();

    res.json({
      text: data.response || "Brak odpowiedzi AI",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Błąd Ollama",
    });
  }
});

app.listen(3001, "127.0.0.1", () => {
  console.log("Backend działa z Ollama na porcie 3001");
});
