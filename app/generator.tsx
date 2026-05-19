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
  const [office, setOffice] = useState("");
  const [loading, setLoading] = useState(false);

  // 1 pytanie AI
  const askQuestion = async () => {
    if (!description.trim()) {
      Alert.alert("Błąd", "Opisz sprawę.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://127.0.0.1:3001/ask-question",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: description,
          }),
        }
      );

      const data = await response.json();

      setQuestion(data.question);
      setOffice(data.office);
    } catch (error) {
      console.log(error);

      Alert.alert(
        "Błąd",
        "Nie udało się wygenerować pytania."
      );
    } finally {
      setLoading(false);
    }
  };

  // FINALNY MAIL
  const generateMail = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "http://127.0.0.1:3001/generate-mail",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            originalText: description,
            answer,
          }),
        }
      );

      const data = await response.json();

      setMail(data.mail);
      setOffice(data.office);
    } catch (error) {
      console.log(error);

      Alert.alert(
        "Błąd",
        "Nie udało się wygenerować maila."
      );
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setDescription("");
    setQuestion("");
    setAnswer("");
    setMail("");
    setOffice("");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>US AI</Text>

      <Text style={styles.subtitle}>
        Opisz sprawę. AI zada jedno pytanie i wygeneruje profesjonalny mail do urzędu.
      </Text>

      <Text style={styles.label}>Opis sprawy</Text>

      <TextInput
        style={styles.input}
        multiline
        placeholder="np. sprzedałem BTC mieszkając częściowo na Litwie..."
        value={description}
        onChangeText={setDescription}
      />

      <Pressable
        style={styles.button}
        onPress={askQuestion}
      >
        <Text style={styles.buttonText}>
          AI: zadaj pytanie
        </Text>
      </Pressable>

      {loading ? (
        <ActivityIndicator
          size="large"
          style={{ marginVertical: 20 }}
        />
      ) : null}

      {office ? (
        <View style={styles.officeBox}>
          <Text style={styles.officeTitle}>
            Sugerowany urząd
          </Text>

          <Text style={styles.officeText}>
            {office}
          </Text>
        </View>
      ) : null}

      {question ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Pytanie AI
          </Text>

          <Text style={styles.question}>
            {question}
          </Text>

          <TextInput
            style={styles.input}
            multiline
            placeholder="Twoja odpowiedź..."
            value={answer}
            onChangeText={setAnswer}
          />

          <Pressable
            style={styles.mailButton}
            onPress={generateMail}
          >
            <Text style={styles.buttonText}>
              AI: wygeneruj mail
            </Text>
          </Pressable>
        </View>
      ) : null}

      {mail ? (
        <View style={styles.mailBox}>
          <Text style={styles.cardTitle}>
            Finalny mail
          </Text>

          <TextInput
            style={styles.mailInput}
            multiline
            value={mail}
            onChangeText={setMail}
          />

          <Pressable
            style={styles.resetButton}
            onPress={reset}
          >
            <Text style={styles.resetText}>
              Nowa sprawa
            </Text>
          </Pressable>
        </View>
      ) : null}
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
  fontSize: 36,
  fontWeight: "900",
  marginBottom: 10,
  color: "#0f172a",
  },

  subtitle: {
    color: "#666",
    lineHeight: 22,
    marginBottom: 24,
  },

  label: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 10,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 16,
    padding: 16,
    minHeight: 120,
    marginBottom: 16,
    textAlignVertical: "top",
  },

  button: {
    backgroundColor: "#111",
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },

  mailButton: {
    backgroundColor: "#7c3aed",
    padding: 16,
    borderRadius: 16,
    marginTop: 10,
  },

  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 16,
  },

  officeBox: {
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
  },

  officeTitle: {
    fontWeight: "800",
    fontSize: 16,
    marginBottom: 8,
  },

  officeText: {
    fontSize: 16,
    color: "#111",
  },

  card: {
    backgroundColor: "#f5f5f5",
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 12,
  },

  question: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },

  mailBox: {
    backgroundColor: "#fafafa",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 18,
    padding: 18,
    marginBottom: 30,
  },

  mailInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 16,
    padding: 16,
    minHeight: 320,
    textAlignVertical: "top",
    backgroundColor: "#f8fafc",
  },

  resetButton: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 14,
    borderRadius: 14,
  },

  resetText: {
    textAlign: "center",
    fontWeight: "700",
    color: "#111",
  },
});
