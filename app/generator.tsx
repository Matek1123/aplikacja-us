import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";
import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { institutions } from "../data/institutions";

export default function GeneratorScreen() {
  const [keywords, setKeywords] = useState("");
  const [generatedMail, setGeneratedMail] = useState("");
  const [selectedInstitutionId, setSelectedInstitutionId] = useState(
    institutions[0].id
  );

  const selectedInstitution = institutions.find(
    (item) => item.id === selectedInstitutionId
  );

  const generateMail = () => {
    const mail = `Szanowni Państwo,

zwracam się z prośbą o udzielenie informacji dotyczącej następującego zagadnienia:

${keywords}

Proszę o wyjaśnienie, w jaki sposób obowiązujące przepisy odnoszą się do wskazanej sytuacji.

Proszę również o wskazanie, czy w opisanej sytuacji powstają obowiązki podatkowe, ewidencyjne lub sprawozdawcze po stronie podatnika.

Z góry dziękuję za odpowiedź.

Z poważaniem
[Imię i nazwisko]`;

    setGeneratedMail(mail);
  };

  const saveMail = async () => {
    if (!generatedMail.trim()) {
      Alert.alert("Brak treści", "Najpierw wygeneruj albo wpisz treść maila.");
      return;
    }

    const subject = `Zapytanie do urzędu: ${keywords || "sprawa podatkowa"}`;

    const newItem = {
      id: Date.now().toString(),
      institutionName: selectedInstitution?.name || "",
      institutionEmail: selectedInstitution?.email || "",
      institutionCategory: selectedInstitution?.category || "",
      keywords,
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

    Alert.alert("Zapisano", "Mail został zapisany w historii jako szkic.");
  };

  const openMailApp = async () => {
    if (!selectedInstitution?.email) {
      Alert.alert("Brak adresu", "Wybrany urząd nie ma adresu e-mail.");
      return;
    }

    if (!generatedMail.trim()) {
      Alert.alert("Brak treści", "Najpierw wygeneruj albo wpisz treść maila.");
      return;
    }

    const subject = `Zapytanie do urzędu: ${keywords || "sprawa podatkowa"}`;

    const newItem = {
      id: Date.now().toString(),
      institutionName: selectedInstitution.name,
      institutionEmail: selectedInstitution.email,
      institutionCategory: selectedInstitution.category,
      keywords,
      content: generatedMail,
      subject,
      createdAt: new Date().toISOString(),
      status: "ready_to_send",
    };

    const existing = await AsyncStorage.getItem("mail_history");
    const history = existing ? JSON.parse(existing) : [];

    await AsyncStorage.setItem(
      "mail_history",
      JSON.stringify([newItem, ...history])
    );

    const url = `mailto:${selectedInstitution.email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(generatedMail)}`;

    await Linking.openURL(url);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Generator zapytań</Text>

      <Text style={styles.label}>Wybierz urząd</Text>

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
                  styles.institutionEmail,
                  selected && styles.institutionTextActive,
                ]}
              >
                {item.email}
              </Text>

              <Text
                style={[
                  styles.institutionCategory,
                  selected && styles.institutionTextActive,
                ]}
              >
                {item.category}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.label}>Słowa kluczowe lub opis sprawy</Text>

      <TextInput
        style={styles.input}
        multiline
        placeholder="np. staking ETH, sprzedaż BTC, airdrop, podatek od kryptowalut"
        value={keywords}
        onChangeText={setKeywords}
      />

      <Pressable style={styles.generateButton} onPress={generateMail}>
        <Text style={styles.buttonText}>Generuj treść</Text>
      </Pressable>

      <Text style={styles.label}>Treść maila</Text>

      <TextInput
        style={styles.output}
        multiline
        placeholder="Tu pojawi się wygenerowana treść. Możesz ją edytować przed zapisem lub wysyłką."
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
  container: {
    padding: 24,
    backgroundColor: "#fff",
    flexGrow: 1,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 24,
  },

  label: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },

  institutionList: {
    marginBottom: 20,
  },

  institutionButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    backgroundColor: "#fff",
  },

  institutionButtonActive: {
    backgroundColor: "#111",
    borderColor: "#111",
  },

  institutionName: {
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 4,
  },

  institutionEmail: {
    color: "#666",
    marginBottom: 4,
  },

  institutionCategory: {
    color: "#666",
    fontSize: 12,
  },

  institutionTextActive: {
    color: "#fff",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 14,
    padding: 16,
    minHeight: 120,
    marginBottom: 16,
    textAlignVertical: "top",
  },

  output: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 14,
    padding: 16,
    minHeight: 320,
    marginBottom: 16,
    textAlignVertical: "top",
  },

  generateButton: {
    backgroundColor: "#111",
    padding: 16,
    borderRadius: 14,
    marginBottom: 20,
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

  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
  },
});
