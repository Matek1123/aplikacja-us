import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const app = express();

app.use(cors());
app.use(express.json());

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

function extractJson(text) {
  const cleaned = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start === -1 || end === -1) {
    throw new Error("Model nie zwrócił JSON-a: " + cleaned);
  }

  return cleaned.slice(start, end + 1);
}

function fallbackResponse({ userInput, editedInput, clarificationAnswer }) {
  const text = editedInput || userInput || "";
  const extra = clarificationAnswer || "";

  return {
    category: "sprawa formalna",
    institutionType: "właściwa instytucja",
    confidence: 0.35,
    needsClarification: false,
    question: null,
    office: "Właściwa instytucja lub urząd",
    recipientReason:
      "Nie udało się użyć modelu AI, więc wygenerowano podstawową wiadomość awaryjną.",
    subject: "Prośba o informację w sprawie",
    message: `Szanowni Państwo,

zwracam się z prośbą o informację dotyczącą następującej sprawy:

${text}

${extra ? `Dodatkowe informacje: ${extra}` : ""}

Proszę o wskazanie, czy powyższa sprawa powinna zostać zgłoszona do Państwa instytucji, a jeśli tak, to w jakim trybie należy to zrobić.

Proszę również o informację, jakie dokumenty powinienem przygotować oraz czy sprawę można załatwić elektronicznie.

Jeżeli nie są Państwo właściwym adresatem tej sprawy, proszę o wskazanie właściwej instytucji.

Z poważaniem`,
    fallback: true,
  };
}

app.post("/api/chat", async (req, res) => {
  try {
    console.log("BODY:", req.body);

    if (!OPENROUTER_API_KEY) {
      return res.json(fallbackResponse(req.body));
    }

    const { userInput, editedInput, clarificationAnswer } = req.body;

    const effectiveInput = editedInput || userInput;

    const prompt = `
Zwróć TYLKO poprawny JSON. Bez markdowna. Bez komentarzy.

Opis użytkownika:
${effectiveInput}

Odpowiedź na pytanie pomocnicze:
${clarificationAnswer || "Brak"}

Jesteś inteligentnym asystentem do tworzenia formalnych wiadomości do:
- urzędów,
- instytucji publicznych,
- sądów,
- ZUS,
- urzędów skarbowych,
- starostw,
- urzędów miast i gmin,
- banków,
- firm,
- platform internetowych,
- działów obsługi klienta,
- działów reklamacji.

Twoje zadanie:
Z KAŻDEGO opisu użytkownika stwórz możliwie sensowną wiadomość formalną.

Nie odrzucaj tematu.
Nie pisz, że sprawa jest bez sensu.
Nie ograniczaj się tylko do spraw urzędowych.
Nie udzielaj porady prawnej ani podatkowej jako finalnej odpowiedzi.
Masz przygotować wiadomość do wysłania.

Najpierw ustal:
1. kategorię sprawy,
2. typ instytucji,
3. sugerowanego odbiorcę,
4. czy naprawdę brakuje jednej kluczowej informacji.

Jeśli brakuje jednej kluczowej informacji, zadaj dokładnie jedno krótkie pytanie pomocnicze.
Jeśli informacji wystarcza, wygeneruj gotową wiadomość.

Nie zadawaj pytania, jeśli jesteś w stanie stworzyć sensowny mail bez niego.
Nie pytaj ponownie o informacje, które użytkownik już podał.
Nie zadawaj ogólnych pytań typu:
- "O jaką sprawę chodzi?"
- "Proszę doprecyzować."
- "Czy możesz wyjaśnić?"

Pytanie pomocnicze musi być konkretne i praktyczne.

Zawsze zasugeruj, gdzie wiadomość powinna trafić.
Zawsze dodaj krótkie uzasadnienie wyboru odbiorcy.

Przykłady logiki odbiorcy:
- budowa domu, pozwolenie na budowę, zgłoszenie budowy, projekt budowlany -> starostwo powiatowe, wydział architektury i budownictwa, albo urząd miasta na prawach powiatu
- warunki zabudowy, MPZP, plan miejscowy, podział działki, numer porządkowy domu -> urząd gminy albo urząd miasta
- prawo jazdy, rejestracja auta, dowód rejestracyjny, wydział komunikacji -> starostwo powiatowe, wydział komunikacji
- meldunek, dowód osobisty, USC -> urząd gminy albo urząd miasta
- podatki, PIT, VAT, PCC, kryptowaluty, Bitcoin, Ethereum, Shiba Inu, NFT, staking, Binance, Bybit, Coinbase, Kraken, trading -> urząd skarbowy właściwy dla miejsca zamieszkania
- ZUS, składki, emerytura, renta, zwolnienie lekarskie -> ZUS
- działalność gospodarcza, CEIDG -> CEIDG, urząd miasta/gminy, urząd skarbowy albo ZUS zależnie od sprawy
- KRS, spółka -> KRS albo sąd rejestrowy
- księga wieczysta, hipoteka -> sąd rejonowy, wydział ksiąg wieczystych
- spadek, testament -> sąd rejonowy albo notariusz
- mandat, odmowa przyjęcia mandatu, policja, wykroczenie -> policja, sąd rejonowy albo właściwy organ
- alkohol w miejscu publicznym, picie piwa na ławce -> policja, straż miejska albo sąd rejonowy
- bank, Revolut, Wise, przelew, karta -> bank lub instytucja płatnicza
- sklep, reklamacja, gwarancja -> dział reklamacji sprzedawcy
- konto internetowe, blokada, ban -> dział obsługi klienta platformy
- nietypowa sprawa, np. sprzedaż dziwnego przedmiotu, kolekcji, rzeczy wartościowej -> wybierz najbliższą sensowną instytucję

Zasady stylu:
- pisz po polsku
- styl formalny, spokojny, konkretny
- nie kopiuj tekstu użytkownika 1:1
- uporządkuj chaos
- nie wymyślaj faktów, których użytkownik nie podał
- jeśli czegoś nie wiesz, poproś instytucję o wskazanie właściwego trybu postępowania

Mail ma zawierać:
- zwrot grzecznościowy
- opis sytuacji
- konkretne pytanie albo prośbę
- prośbę o wskazanie dalszych kroków
- prośbę o wskazanie wymaganych dokumentów, jeśli ma to sens
- zakończenie

Pole "confidence":
- liczba od 0 do 1
- 1 oznacza bardzo wysoką pewność
- 0.5 oznacza średnią pewność
- 0.2 oznacza niską pewność

Zwróć JSON dokładnie w tym formacie:
{
  "category": string | null,
  "institutionType": string | null,
  "confidence": number,
  "needsClarification": boolean,
  "question": string | null,
  "office": string | null,
  "recipientReason": string | null,
  "subject": string | null,
  "message": string | null
}
`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:8081",
        "X-Title": "US AI",
      },
      body: JSON.stringify({
        model: "qwen/qwen-2.5-72b-instruct:free",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
      }),
    });

    const data = await response.json();

    console.log("OPENROUTER RAW:", JSON.stringify(data, null, 2));

    if (!response.ok) {
      throw new Error(JSON.stringify(data));
    }

    const rawText = data.choices?.[0]?.message?.content;

    if (!rawText) {
      throw new Error("Brak odpowiedzi z OpenRouter");
    }

    const jsonText = extractJson(rawText);
    const parsed = JSON.parse(jsonText);

    return res.json(parsed);
  } catch (error) {
    console.error("BACKEND ERROR:", error);

    return res.json(fallbackResponse(req.body));
  }
});

app.listen(3001, () => {
  console.log("Backend działa na http://localhost:3001");
});
