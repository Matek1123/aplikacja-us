import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { institutions } from "../data/institutions";
import { openai } from "../lib/openai";

export default function GeneratorScreen() {
  const [phrase, setPhrase] = useState("");
  const [aiQuestions, setAiQuestions] = useState("");
  const [userClarification, setUserClarification] = useState("");
  const [generatedMail, setGeneratedMail] = useState("");
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [loadingMail, setLoadingMail] = useState(false);

  const [selectedInstitutionId, setSelectedInstitutionId] = useState(
    institutions[0].id
  );

  const selectedInstitution = institutions.find(
    (item) => item.id === selectedInstitutionId
  );

  const generateQuestions = async () => {
    if (!phrase.trim()) {
      Alert.alert("Brak frazy", "Wpisz np. „Bitcoin podatki”.");
      return;
    }

    try {
      setLoadingQuestions(true);

      const completion = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content: `
Jesteś asystentem, który pomaga użytkownikowi doprecyzować sprawę przed napisaniem maila do polskiego urzędu.

Użytkownik wpisuje krótką frazę, np. "Bitcoin podatki", "budowa garażu", "zameldowanie", "spadek po ojcu".
Twoim zadaniem NIE jest jeszcze pisać maila.

Masz:
1. zgadnąć, o co użytkownikowi może chodzić,
2. wypisać konkretne możliwe wątki,
3. stworzyć listę pytań doprecyzowujących,
4. napisać to tak, żeby użytkownik mógł łatwo edytować tekst.

Format odpowiedzi:
"Możliwe intencje:"
- ...

"Pytania doprecyzowujące:"
1. ...
2. ...
3. ...

"Proponowany zakres zapytania do urzędu:"
...
`,
          },
          {
            role: "user",
            content: `
Fraza użytkownika:
${phrase}

Wybrany urząd:
${selectedInstitution?.name}

Kategoria:
${selectedInstitution?.category}
`,
          },
        ],
      });

      setAiQuestions(
        completion.choices[0]?.message?.content ||
          "Nie udało się wygenerować pytań."
      );
    } catch (error) {
      console.log(error);
      Alert.alert("Błąd", "Nie udało się wygenerować pytań AI.");
    } finally {
      setLoadingQuestions(false);
    }
  };

  const generateFinalMail = async () => {
    if (!aiQuestions.trim()) {
      Alert.alert("Brak pytań", "Najpierw wygeneruj pytania doprecyzowujące.");
      return;
    }

    try {
      setLoadingMail(true);

      const completion = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content: `
Jesteś asystentem piszącym formalne maile do polskich urzędów.

Na podstawie:
- krótkiej frazy użytkownika,
- pytań doprecyzowujących AI,
- doprecyzowania użytkownika,
napisz gotowy mail do urzędu.

Zasady:
- pisz formalnie po polsku,
- nie dawaj porady prawnej ani podatkowej,
- poproś urząd o stanowisko,
- poproś o podstawę prawną,
- użyj konkretnych pytań,
- nie dodawaj komentarzy poza treścią maila.
`,
          },
          {
            role: "user",
            content: `
Wybrany urząd:
${selectedInstitution?.name}

Fraza początkowa:
${phrase}

Robocze pytania/intencje:
${aiQuestions}

Doprecyzowanie użytkownika:
${userClarification || "Brak dodatkowego doprecyzowania."}

Napisz gotowy mail.
`,
          },
        ],
      });

      setGeneratedMail(
        completion.choices[0]?.message?.content ||
          "Nie udało się wygenerować maila."
      );
    } catch (error) {
      console.log(error);
      Alert.alert("Błąd", "Nie udało się wygenerować maila.");
    } finally {
      setLoadingMail(false);
    }
  };

  const saveMail = async () => {
    if (!generatedMail.trim()) {
      Alert.alert("Brak treści", "Najpierw wygeneruj mail.");
      return;
    }

    const subject = `Zapytanie do urzędu: ${phrase}`;

    const newItem = {
      id: Date.now().toString(),
      institutionName: selectedInstitution?.name || "",
      institutionEmail: selectedInstitution?.email || "",
      institutionCategory: selectedInstitution?.category || "",
      keywords: phrase,
      content: generatedMail,
      subject,
      createdAt: new Date().toISOString(),
      status: "draft",
    };

    const existing = await AsyncStorage.getItem("mail_history");
    const history = existing ? JSON.parse(existing) : [];

    await AsyncStorage.setItem(
      "mail_history",
      JSON.stringify([newItem, ...history])
    );

    Alert.alert("Zapisano", "Mail zapisano jako szkic.");
  };

  const openMailApp = async () => {
    if (!generatedMail.trim()) {
      Alert.alert("Brak treści", "Najpierw wygeneruj mail.");
      return;
    }

    if (!selectedInstitution?.email) {
      Alert.alert(
        "Brak adresu",
        "Ten urząd wymaga ręcznego wpisania adresu e-mail. Dodamy to w kolejnym kroku."
      );
      return;
    }

    const subject = `Zapytanie do urzędu: ${phrase}`;

    const url = `mailto:${selectedInstitution.email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(generatedMail)}`;

    await Linking.openURL(url);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Generator zapytań AI</Text>

      <Text style={styles.description}>
        Wpisz krótką frazę. AI najpierw zgadnie, o co może Ci chodzić i zada
        pytania doprecyzowujące. Potem z tego wygenerujesz maila.
      </Text>

      <Text style={styles.label}>Wybierz typ urzędu</Text>

      <View style={styles.institutionList}>
        {institutions.map((item) => {
          const selected = item.id === selectedInstitutionId;

          return (
            <Pressable
              key={item.id}
              style={[
                styles.institutionButton,
                selected && styles.institutionButtonActive,
              ]}
              onPress={() => setSelectedInstitutionId(item.id)}
            >
              <Text
                style={[
                  styles.institutionName,
                  selected && styles.institutionTextActive,
                ]}
              >
                {item.name}
              </Text>

              <Text
                style={[
                  styles.institutionCategory,
                  selected && styles.institutionTextActive,
                ]}
              >
                {item.category}
              </Text>

              <Text
                style={[
                  styles.institutionEmail,
                  selected && styles.institutionTextActive,
                ]}
              >
                {item.email || "adres e-mail do uzupełnienia"}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.step}>Krok 1</Text>
      <Text style={styles.label}>Krótka fraza</Text>

      <TextInput
        style={styles.inputSmall}
        placeholder="np. Bitcoin podatki"
        value={phrase}
        onChangeText={setPhrase}
      />

      <Pressable style={styles.generateButton} onPress={generateQuestions}>
        <Text style={styles.buttonText}>AI: wymyśl możliwe pytania</Text>
      </Pressable>

      {loadingQuestions ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : null}

      <Text style={styles.step}>Krok 2</Text>
      <Text style={styles.label}>Robocze pytania od AI</Text>

      <TextInput
        style={styles.aiBox}
        multiline
        placeholder="Tutaj AI wypisze możliwe intencje i pytania. Możesz je edytować."
        value={aiQuestions}
        onChangeText={setAiQuestions}
      />

      <Text style={styles.label}>Twoje doprecyzowanie</Text>

      <TextInput
        style={styles.input}
        multiline
        placeholder="np. Chodzi mi tylko o sprzedaż BTC za PLN w 2024 roku, kupione w 2021."
        value={userClarification}
        onChangeText={setUserClarification}
      />

      <Pressable style={styles.mailGenerateButton} onPress={generateFinalMail}>
        <Text style={styles.buttonText}>AI: napisz gotowy mail</Text>
      </Pressable>

      {loadingMail ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : null}

      <Text style={styles.step}>Krok 3</Text>
      <Text style={styles.label}>Gotowy mail do edycji</Text>

      <TextInput
        style={styles.output}
        multiline
        placeholder="Tutaj pojawi się finalny mail."
        value={generatedMail}
        onChangeText={setGeneratedMail}
      />

      <Pressable style={styles.saveButton} onPress={saveMail}>
        <Text style={styles.buttonText}>Zapisz jako szkic</Text>
      </Pressable>

      <Pressable style={styles.mailButton} onPress={openMailApp}>
        <Text style={styles.buttonText}>Otwórz w aplikacji mailowej</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: "#fff", flexGrow: 1 },
  title: { fontSize: 30, fontWeight: "700", marginBottom: 8 },
  description: { color: "#555", fontSize: 15, lineHeight: 22, marginBottom: 24 },
  step: {
    color: "#2563eb",
    fontWeight: "800",
    fontSize: 13,
    marginTop: 8,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  label: { fontSize: 16, fontWeight: "700", marginBottom: 8 },
  institutionList: { marginBottom: 20 },
  institutionButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  institutionButtonActive: { backgroundColor: "#111", borderColor: "#111" },
  institutionName: { fontWeight: "700", fontSize: 16, marginBottom: 4 },
  institutionCategory: { color: "#666", marginBottom: 4 },
  institutionEmail: { color: "#666", fontSize: 12 },
  institutionTextActive: { color: "#fff" },
  inputSmall: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 14,
    padding: 16,
    minHeight: 110,
    marginBottom: 16,
    textAlignVertical: "top",
  },
  aiBox: {
    borderWidth: 1,
    borderColor: "#93c5fd",
    borderRadius: 14,
    padding: 16,
    minHeight: 260,
    marginBottom: 16,
    textAlignVertical: "top",
    backgroundColor: "#eff6ff",
  },
  output: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 14,
    padding: 16,
    minHeight: 360,
    marginBottom: 16,
    textAlignVertical: "top",
  },
  generateButton: {
    backgroundColor: "#111",
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
  },
  mailGenerateButton: {
    backgroundColor: "#7c3aed",
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: "#2563eb",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
  },
  mailButton: {
    backgroundColor: "#16a34a",
    padding: 16,
    borderRadius: 14,
  },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "700" },
  loader: { marginVertical: 20 },
});
