import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Clipboard from "expo-clipboard";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type HistoryItem = {
  id: string;
  institutionName?: string;
  institutionEmail?: string;
  institutionCategory?: string;
  keywords: string;
  content: string;
  subject?: string;
  answer?: string;
  createdAt: string;
  updatedAt?: string;
  status: string;
};

export default function HistoryScreen() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const loadHistory = async () => {
    const existing = await AsyncStorage.getItem("mail_history");
    setItems(existing ? JSON.parse(existing) : []);
  };

  const saveAnswer = async (id: string) => {
    const answer = answers[id];

    if (!answer || !answer.trim()) {
      Alert.alert("Brak odpowiedzi", "Wpisz odpowiedź urzędu.");
      return;
    }

    const updated = items.map((item) =>
      item.id === id
        ? {
            ...item,
            answer,
            status: "answered",
            updatedAt: new Date().toISOString(),
          }
        : item
    );

    await AsyncStorage.setItem("mail_history", JSON.stringify(updated));
    setItems(updated);
    Alert.alert("Zapisano", "Odpowiedź została dodana do biblioteki.");
  };

  const copyContent = async (content: string) => {
    await Clipboard.setStringAsync(content);
    Alert.alert("Skopiowano", "Treść została skopiowana.");
  };

  const clearHistory = async () => {
    await AsyncStorage.removeItem("mail_history");
    setItems([]);
    Alert.alert("Wyczyszczono", "Historia została usunięta.");
  };

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Historia spraw</Text>

      <Pressable style={styles.clearButton} onPress={clearHistory}>
        <Text style={styles.clearText}>Wyczyść historię</Text>
      </Pressable>

      {items.length === 0 ? (
        <Text style={styles.empty}>Brak zapisanych zapytań.</Text>
      ) : (
        items.map((item) => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.date}>
              {new Date(item.createdAt).toLocaleString("pl-PL")}
            </Text>

            <Text style={styles.institution}>
              {item.institutionName || "Nie wybrano urzędu"}
            </Text>

            {item.institutionEmail ? (
              <Text style={styles.email}>{item.institutionEmail}</Text>
            ) : null}

            <Text style={styles.status}>Status: {item.status}</Text>

            {item.subject ? (
              <>
                <Text style={styles.sectionTitle}>Temat</Text>
                <Text style={styles.subject}>{item.subject}</Text>
              </>
            ) : null}

            <Text style={styles.sectionTitle}>Słowa kluczowe</Text>
            <Text style={styles.keywords}>{item.keywords || "Brak"}</Text>

            <Text style={styles.sectionTitle}>Treść pytania</Text>
            <Text style={styles.content}>{item.content}</Text>

            <Pressable
              style={styles.copyButton}
              onPress={() => copyContent(item.content)}
            >
              <Text style={styles.copyText}>Kopiuj treść pytania</Text>
            </Pressable>

            <Text style={styles.sectionTitle}>Odpowiedź urzędu</Text>

            {item.answer ? (
              <Text style={styles.answer}>{item.answer}</Text>
            ) : (
              <>
                <TextInput
                  style={styles.answerInput}
                  multiline
                  placeholder="Wklej tutaj odpowiedź urzędu..."
                  value={answers[item.id] || ""}
                  onChangeText={(text) =>
                    setAnswers((prev) => ({
                      ...prev,
                      [item.id]: text,
                    }))
                  }
                />

                <Pressable
                  style={styles.saveAnswerButton}
                  onPress={() => saveAnswer(item.id)}
                >
                  <Text style={styles.buttonText}>Zapisz odpowiedź</Text>
                </Pressable>
              </>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: "#fff", flexGrow: 1 },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 16 },
  clearButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  clearText: { textAlign: "center", fontWeight: "600" },
  empty: { color: "#666", marginTop: 24 },
  card: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    backgroundColor: "#fafafa",
  },
  date: { color: "#666", marginBottom: 8, fontSize: 12 },
  institution: { fontWeight: "700", fontSize: 18, marginBottom: 4 },
  email: { color: "#2563eb", marginBottom: 8 },
  status: { fontWeight: "700", color: "#16a34a", marginBottom: 12 },
  sectionTitle: { fontWeight: "700", marginBottom: 4, marginTop: 10 },
  subject: { color: "#111", marginBottom: 8 },
  keywords: { color: "#111", marginBottom: 8 },
  content: { color: "#333", lineHeight: 22 },
  copyButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  copyText: { textAlign: "center", fontWeight: "600" },
  answerInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 14,
    minHeight: 120,
    textAlignVertical: "top",
    backgroundColor: "#fff",
    marginBottom: 12,
  },
  saveAnswerButton: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 12,
  },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "700" },
  answer: { color: "#111", lineHeight: 22 },
});
