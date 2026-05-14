import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

type HistoryItem = {
  id: string;
  institutionName?: string;
  subject?: string;
  content: string;
  answer?: string;
};

export default function AnswersScreen() {
  const [items, setItems] = useState<HistoryItem[]>([]);

  const loadAnswers = async () => {
    const existing = await AsyncStorage.getItem("mail_history");

    const history: HistoryItem[] = existing
      ? JSON.parse(existing)
      : [];

    setItems(history.filter((item) => item.answer));
  };

  useFocusEffect(
    useCallback(() => {
      loadAnswers();
    }, [])
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Biblioteka odpowiedzi</Text>

      {items.length === 0 ? (
        <Text style={styles.empty}>
          Brak zapisanych odpowiedzi.
        </Text>
      ) : (
        items.map((item) => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.institution}>
              {item.institutionName}
            </Text>

            <Text style={styles.subject}>
              {item.subject}
            </Text>

            <Text style={styles.sectionTitle}>
              Pytanie
            </Text>

            <Text style={styles.content}>
              {item.content}
            </Text>

            <Text style={styles.sectionTitle}>
              Odpowiedź
            </Text>

            <Text style={styles.answer}>
              {item.answer}
            </Text>
          </View>
        ))
      )}
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
    marginBottom: 16,
  },

  empty: {
    color: "#666",
    marginTop: 24,
  },

  card: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    backgroundColor: "#fafafa",
  },

  institution: {
    fontWeight: "700",
    fontSize: 18,
    marginBottom: 4,
  },

  subject: {
    color: "#2563eb",
    marginBottom: 12,
  },

  sectionTitle: {
    fontWeight: "700",
    marginTop: 10,
    marginBottom: 4,
  },

  content: {
    color: "#333",
    lineHeight: 22,
  },

  answer: {
    color: "#111",
    lineHeight: 22,
  },
});
