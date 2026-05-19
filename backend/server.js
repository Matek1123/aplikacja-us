const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("US AI backend działa");
});

function detectCase(text) {
  const t = text.toLowerCase();

  if (
    t.includes("bitcoin") ||
    t.includes("btc") ||
    t.includes("krypto") ||
    t.includes("kryptowalut") ||
    t.includes("eth") ||
    t.includes("ether")
  ) {
    return {
      office: "Krajowa Informacja Skarbowa",
      category: "Podatki / Kryptowaluty",
      risk: "Średni",
      topic: "Zapytanie dotyczące opodatkowania kryptowalut",
      documents: [
        "historia transakcji z giełdy",
        "potwierdzenia przelewów",
        "daty zakupu i sprzedaży",
        "wartość transakcji w PLN",
        "informacja o rezydencji podatkowej"
      ],
      question: "W którym kraju znajdowała się Twoja rezydencja podatkowa w roku sprzedaży?",
      finalQuestions: [
        "W którym państwie powinien zostać rozliczony podatek od opisanej transakcji?",
        "Czy sprzedaż kryptowaluty należy wykazać w deklaracji PIT-38?",
        "Czy zastosowanie mają przepisy umowy o unikaniu podwójnego opodatkowania?",
        "Jakie dokumenty należy posiadać na potrzeby rozliczenia?"
      ]
    };
  }

  if (
    t.includes("budowa") ||
    t.includes("garaż") ||
    t.includes("garaz") ||
    t.includes("pozwolenie")
  ) {
    return {
      office: "Starostwo Powiatowe / Urząd Miasta",
      category: "Budownictwo",
      risk: "Średni",
      topic: "Zapytanie dotyczące sprawy budowlanej",
      documents: [
        "numer działki",
        "adres nieruchomości",
        "opis planowanych robót",
        "mapa lub szkic sytuacyjny",
        "informacja o miejscowym planie"
      ],
      question: "Czy inwestycja została już zgłoszona albo objęta pozwoleniem?",
      finalQuestions: [
        "Czy opisana sytuacja wymaga zgłoszenia lub pozwolenia?",
        "Jakie dokumenty należy przygotować?",
        "Jaka jest właściwa podstawa prawna?",
        "Jaki urząd jest właściwy dla tej sprawy?"
      ]
    };
  }

  if (t.includes("zus") || t.includes("składk") || t.includes("działalność")) {
    return {
      office: "Zakład Ubezpieczeń Społecznych",
      category: "ZUS / Składki",
      risk: "Średni",
      topic: "Zapytanie dotyczące składek i działalności",
      documents: [
        "CEIDG",
        "umowa o pracę, jeśli istnieje",
        "informacja o przychodach",
        "data rozpoczęcia działalności",
        "dotychczasowe zgłoszenia ZUS"
      ],
      question: "Czy działalność jest już zarejestrowana?",
      finalQuestions: [
        "Czy istnieje obowiązek opłacania składek?",
        "Jakie składki należy opłacać?",
        "Czy można skorzystać z ulg?",
        "Jakie dokumenty należy złożyć?"
      ]
    };
  }

  return {
    office: "Właściwy urząd",
    category: "Sprawa urzędowa",
    risk: "Niski / do ustalenia",
    topic: "Zapytanie dotyczące sprawy urzędowej",
    documents: [
      "opis sprawy",
      "daty zdarzeń",
      "posiadane dokumenty",
      "dane kontaktowe",
      "ewentualne wcześniejsze decyzje lub pisma"
    ],
    question: "Jaki jest najważniejszy cel Twojego zapytania?",
    finalQuestions: [
      "Jaki urząd jest właściwy?",
      "Jakie dokumenty należy przygotować?",
      "Jaka jest podstawa prawna?"
    ]
  };
}

function buildMail(caseData, originalText, answer) {
  const questions = caseData.finalQuestions
    .map((q, i) => `${i + 1}. ${q}`)
    .join("\n");

  return `Szanowni Państwo,

zwracam się z uprzejmą prośbą o udzielenie informacji dotyczącej sprawy:

${caseData.topic}

Opis sytuacji:
${originalText}

Dodatkowe informacje:
${answer || "Brak dodatkowych informacji."}

W związku z powyższym proszę o informację:

${questions}

Będę wdzięczny za wskazanie właściwej podstawy prawnej oraz rekomendowanego sposobu dalszego postępowania.

Z poważaniem
[Imię i nazwisko]

Sugerowany urząd:
${caseData.office}`;
}

app.post("/ask-question", (req, res) => {
  const { text = "" } = req.body;
  const data = detectCase(text);

  res.json({
    question: data.question,
    office: data.office,
    category: data.category,
    risk: data.risk,
    documents: data.documents,
    topic: data.topic
  });
});

app.post("/generate-mail", (req, res) => {
  const { originalText = "", answer = "" } = req.body;
  const data = detectCase(originalText);
  const mail = buildMail(data, originalText, answer);

  res.json({
    mail,
    office: data.office,
    category: data.category,
    risk: data.risk,
    documents: data.documents,
    topic: data.topic
  });
});

app.listen(3001, "127.0.0.1", () => {
  console.log("US AI backend działa na porcie 3001");
});
