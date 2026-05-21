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

export default function GeneratorScreen() {
  const [description, setDescription] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [mail, setMail] = useState("");
  const [loading, setLoading] = useState(false);

  const askQuestion = async () => {
    if (!description.trim()) {
      Alert.alert("Błąd", "Opisz sprawę.");
      return;
    }

    try {
      setLoading(true);
      setQuestion("");
      setMail("");

      const response = await fetch("http://127.0.0.1:3001/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userInput: description,
        }),
      });

      const data = await response.json();

      if (data.needsClarification) {
        setQuestion(data.question);
      } else {
        setMail(data.message);
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Błąd", "Nie udało się połączyć z AI.");
    } finally {
      setLoading(false);
    }
  };

  const generateMail = async () => {
    if (!description.trim()) {
      Alert.alert("Błąd", "Opisz sprawę.");
      return;
    }

    if (!answer.trim()) {
      Alert.alert("Błąd", "Odpowiedz na pytanie AI.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("http://127.0.0.1:3001/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userInput: description,
          clarificationAnswer: answer,
        }),
      });

      const data = await response.json();

      setMail(data.message);
      setQuestion("");
    } catch (error) {
      console.log(error);
      Alert.alert("Błąd", "Nie udało się wygenerować wiadomości.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setDescription("");
    setQuestion("");
    setAnswer("");
    setMail("");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>US AI</Text>

      <Text style={styles.subtitle}>
        Opisz sprawę. AI zada jedno pytanie pomocnicze i przygotuje gotową
        wiadomość.
      </Text>

      <Text style={styles.label}>Opis sprawy</Text>

      <TextInput
        style={styles.input}
        multiline
        placeholder="np. kupiłem bitcoina w 2025"
        value={description}
        onChangeText={setDescription}
      />

      <Pressable style={styles.button} onPress={askQuestion}>
        <Text style={styles.buttonText}>AI: zadaj pytanie</Text>
      </Pressable>

      {loading ? <ActivityIndicator size="large" style={styles.loader} /> : null}

      {question ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Pytanie AI</Text>

          <Text style={styles.question}>{question}</Text>

          <TextInput
            style={styles.input}
            multiline
            placeholder="Twoja odpowiedź..."
            value={answer}
            onChangeText={setAnswer}
          />

          <Pressable style={styles.mailButton} onPress={generateMail}>
            <Text style={styles.buttonText}>AI: wygeneruj wiadomość</Text>
          </Pressable>
        </View>
      ) : null}

      {mail ? (
        <View style={styles.mailBox}>
          <Text style={styles.cardTitle}>Gotowa wiadomość</Text>

          <TextInput
            style={styles.mailInput}
            multiline
            value={mail}
            onChangeText={setMail}
          />

          <Pressable style={styles.resetButton} onPress={reset}>
            <Text style={styles.resetText}>Nowa sprawa</Text>
          </Pressable>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: "#f8fafc",
    flexGrow: 1,
  },
  title: {
    fontSize: 36,
    fontWeight: "900",
    marginBottom: 10,
    color: "#0f172a",
  },
  subtitle: {
    color: "#475569",
    lineHeight: 24,
    marginBottom: 28,
    fontSize: 16,
  },
  label: {
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 10,
    color: "#0f172a",
  },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 18,
    padding: 16,
    minHeight: 120,
    marginBottom: 16,
    textAlignVertical: "top",
    backgroundColor: "#fff",
    fontSize: 15,
    lineHeight: 22,
  },
  button: {
    backgroundColor: "#0f172a",
    padding: 18,
    borderRadius: 18,
    marginBottom: 24,
  },
  mailButton: {
    backgroundColor: "#7c3aed",
    padding: 18,
    borderRadius: 18,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "800",
    fontSize: 16,
  },
  loader: {
    marginVertical: 20,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 20,
    marginBottom: 22,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 12,
    color: "#0f172a",
  },
  question: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
    color: "#111827",
  },
  mailBox: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 22,
    padding: 20,
    marginBottom: 30,
  },
  mailInput: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 18,
    padding: 16,
    minHeight: 340,
    textAlignVertical: "top",
    backgroundColor: "#fff",
    fontSize: 15,
    lineHeight: 22,
  },
  resetButton: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#fff",
  },
  resetText: {
    textAlign: "center",
    fontWeight: "800",
    color: "#0f172a",
  },
});
