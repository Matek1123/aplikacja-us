require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

function detectTopic(prompt) {
  const p = prompt.toLowerCase();

  if (p.includes("ether") || p.includes("eth")) return "ether";
  if (p.includes("staking")) return "staking";
  if (p.includes("airdrop")) return "airdrop";
  if (p.includes("nft")) return "nft";
  if (p.includes("bitcoin") || p.includes("btc")) return "bitcoin";
  if (p.includes("zus")) return "zus";
  if (p.includes("gmina") || p.includes("miasto")) return "gmina";
  if (p.includes("budowa") || p.includes("garaż") || p.includes("garaz")) return "budowa";

  return "default";
}

function isFinalMailPrompt(prompt) {
  const p = prompt.toLowerCase();
  return p.includes("napisz formalny mail") || p.includes("mail ma być gotowy");
}

function questions(topic) {
  const templates = {
    bitcoin: `
Możliwe intencje:
- rozliczenie sprzedaży BTC za PLN,
- rozliczenie zamiany BTC na inną kryptowalutę,
- ustalenie kosztów uzyskania przychodu,
- obowiązek wykazania transakcji w PIT-38,
- dokumentowanie transakcji z giełd kryptowalut.

Pytania doprecyzowujące:
1. Czy chodzi o sprzedaż BTC za PLN, czy zamianę na inną kryptowalutę?
2. W którym roku kupiono BTC, a w którym sprzedano?
3. Czy użytkownik posiada historię transakcji z giełdy?
4. Czy środki zostały wypłacone na konto bankowe?
5. Czy transakcje były prywatne, czy w ramach działalności gospodarczej?

Proponowany zakres zapytania do urzędu:
Zapytanie o sposób rozliczenia sprzedaży Bitcoin, wykazania kosztów oraz obowiązków podatkowych w PIT.
`,

    ether: `
Możliwe intencje:
- rozliczenie sprzedaży ETH,
- zamiana ETH na inne tokeny,
- opodatkowanie zysków z Ethereum,
- koszty gas fee,
- transakcje DeFi na sieci Ethereum.

Pytania doprecyzowujące:
1. Czy chodzi o zakup, sprzedaż, zamianę ETH, czy korzystanie z DeFi?
2. Czy użytkownik ponosił opłaty gas fee?
3. Czy ETH zostało sprzedane za PLN/EUR, czy wymienione na inne tokeny?
4. Czy transakcje miały miejsce na giełdzie, czy w portfelu prywatnym?
5. Czy użytkownik chce zapytać o rozliczenie kosztów transakcyjnych?

Proponowany zakres zapytania do urzędu:
Zapytanie o podatkowe rozliczenie transakcji ETH, w tym sprzedaży, zamiany oraz kosztów opłat sieciowych.
`,

    staking: `
Możliwe intencje:
- opodatkowanie nagród ze stakingu,
- moment powstania przychodu,
- sposób wyceny otrzymanych tokenów,
- późniejsza sprzedaż tokenów ze stakingu,
- różnica między stakingiem prywatnym a giełdowym.

Pytania doprecyzowujące:
1. Czy staking odbywał się na giełdzie, czy z prywatnego portfela?
2. Jakie tokeny były otrzymywane jako nagrody?
3. Czy nagrody zostały sprzedane, czy nadal są trzymane?
4. Czy użytkownik zna wartość tokenów w dniu otrzymania?
5. Czy staking był wykonywany prywatnie, czy w działalności gospodarczej?

Proponowany zakres zapytania do urzędu:
Zapytanie o moment i sposób opodatkowania nagród ze stakingu kryptowalut.
`,

    airdrop: `
Możliwe intencje:
- opodatkowanie tokenów otrzymanych z airdropu,
- moment powstania przychodu,
- wycena tokenów,
- sprzedaż tokenów z airdropu,
- brak odpłatnego nabycia.

Pytania doprecyzowujące:
1. Czy tokeny zostały otrzymane nieodpłatnie?
2. Czy w momencie otrzymania miały wartość rynkową?
3. Czy tokeny zostały później sprzedane?
4. Czy użytkownik wykonał jakieś działania w zamian za airdrop?
5. Czy airdrop był związany z działalnością gospodarczą?

Proponowany zakres zapytania do urzędu:
Zapytanie o sposób rozliczenia tokenów otrzymanych nieodpłatnie w ramach airdropu.
`,

    nft: `
Możliwe intencje:
- sprzedaż NFT,
- zakup NFT jako koszt,
- tworzenie i mintowanie NFT,
- rozliczenie przychodu z praw autorskich lub aktywów cyfrowych,
- transakcje na zagranicznych platformach.

Pytania doprecyzowujące:
1. Czy użytkownik kupił, sprzedał, czy stworzył NFT?
2. Czy NFT było związane ze sztuką, grą, kolekcją czy usługą?
3. Czy sprzedaż była jednorazowa, czy powtarzalna?
4. Czy użytkownik prowadzi działalność gospodarczą?
5. W jakiej walucie otrzymano zapłatę?

Proponowany zakres zapytania do urzędu:
Zapytanie o podatkowe rozliczenie sprzedaży lub tworzenia NFT.
`,

    zus: `
Możliwe intencje:
- obowiązek opłacania składek,
- działalność gospodarcza,
- ulga na start,
- mały ZUS,
- zbieg umowy o pracę i działalności.

Pytania doprecyzowujące:
1. Czy użytkownik prowadzi działalność gospodarczą?
2. Czy ma jednocześnie umowę o pracę?
3. Czy korzystał już z ulgi na start?
4. Jaki jest przewidywany przychód?
5. Czy pytanie dotyczy składek społecznych, zdrowotnych, czy obu?

Proponowany zakres zapytania do urzędu:
Zapytanie o obowiązek składkowy i możliwość skorzystania z ulg w ZUS.
`,

    gmina: `
Możliwe intencje:
- sprawa lokalna w urzędzie gminy,
- podatki lokalne,
- odpady komunalne,
- meldunek,
- zaświadczenia lub decyzje administracyjne.

Pytania doprecyzowujące:
1. Czy sprawa dotyczy podatku od nieruchomości, meldunku, odpadów czy zaświadczenia?
2. Czy użytkownik jest właścicielem nieruchomości?
3. Jakiej miejscowości dotyczy sprawa?
4. Czy istnieje już decyzja administracyjna?
5. Czy użytkownik chce złożyć wniosek, zapytanie czy odwołanie?

Proponowany zakres zapytania do urzędu:
Zapytanie do gminy o właściwą procedurę, dokumenty i podstawę prawną.
`,

    budowa: `
Możliwe intencje:
- budowa garażu,
- zgłoszenie robót budowlanych,
- pozwolenie na budowę,
- odległość od granicy działki,
- zgodność z miejscowym planem.

Pytania doprecyzowujące:
1. Czy chodzi o garaż, dom, altanę czy inną budowlę?
2. Jaka jest powierzchnia planowanego obiektu?
3. Czy działka ma miejscowy plan zagospodarowania?
4. Jak daleko obiekt ma stać od granicy działki?
5. Czy użytkownik chce zapytać o zgłoszenie czy pozwolenie?

Proponowany zakres zapytania do urzędu:
Zapytanie o wymagania formalne dla planowanej budowy oraz właściwą procedurę.
`,

    default: `
Możliwe intencje:
- uzyskanie informacji od urzędu,
- doprecyzowanie procedury,
- ustalenie wymaganych dokumentów,
- prośba o wskazanie podstawy prawnej.

Pytania doprecyzowujące:
1. Jakiego urzędu dotyczy sprawa?
2. Czy sprawa dotyczy podatków, administracji, świadczeń czy nieruchomości?
3. Czy użytkownik chce zapytać o procedurę, decyzję czy interpretację?
4. Czy sprawa jest jednorazowa, czy powtarzalna?
5. Czy istnieją dokumenty lub decyzje związane ze sprawą?

Proponowany zakres zapytania do urzędu:
Formalne zapytanie o właściwą procedurę, wymagane dokumenty i podstawę prawną.
`,
  };

  return templates[topic] || templates.default;
}

function finalMail(topic) {
  return `Szanowni Państwo,

zwracam się z uprzejmą prośbą o udzielenie informacji w sprawie opisanej poniżej.

Chciałbym uzyskać stanowisko urzędu dotyczące właściwego sposobu postępowania, obowiązków formalnych oraz ewentualnych konsekwencji podatkowych lub administracyjnych związanych z przedstawioną sytuacją.

Proszę w szczególności o odpowiedź na następujące pytania:
1. Jakie obowiązki mogą powstać w opisanej sytuacji?
2. Jakie dokumenty lub dane powinienem przygotować?
3. Czy sprawa wymaga zgłoszenia, deklaracji, wniosku lub innej czynności urzędowej?
4. Jaka jest właściwa podstawa prawna dla wskazanego stanowiska?
5. Czy urząd może wskazać rekomendowany sposób dalszego postępowania?

Proszę o odpowiedź w możliwie jednoznacznej formie wraz ze wskazaniem podstawy prawnej.

Z poważaniem
[Imię i nazwisko]`;
}

app.post("/generate", async (req, res) => {
  const { prompt = "" } = req.body;
  const topic = detectTopic(prompt);

  if (isFinalMailPrompt(prompt)) {
    return res.json({ text: finalMail(topic) });
  }

  return res.json({ text: questions(topic) });
});

app.listen(3001, "127.0.0.1", () => {
  console.log("Mock AI działa na porcie 3001");
});
