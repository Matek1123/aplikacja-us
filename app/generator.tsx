cd ~/aplikacja-us 2>/dev/null || cd ~/urzad-ai-mailer

cat > app/generator.tsx <<'EOF'
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Clipboard from "expo-clipboard";
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

import { generateWithAI } from "../lib/openai";

type Message = {
  role: "user" | "ai";
  content: string;
};

export default function GeneratorScreen() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [finalMail, setFinalMail] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMail, setLoadingMail] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const nextMessages: Message[] = [...messages, { role: "user", content: input }];
    setMessages(nextMessages);

    const currentInput = input;
    setInput("");

    try {
      setLoading(true);

      const conversation = nextMessages
        .map((m) => `${m.role === "user" ? "Użytkownik" : "AI"}: ${m.content}`)
        .join("\n\n");

      const prompt = `
Jesteś polskim asystentem pomagającym przygotować zapytanie do urzędu.

Prowadź rozmowę naturalnie.
Na podstawie wiadomości użytkownika:
- domyśl się możliwej intencji,
- zadaj 1-3 krótkie pytania doprecyzowujące,
- nie pisz jeszcze finalnego maila,
- nie używaj sztywnego szablonu,
- mów po polsku.

Historia rozmowy:
${conversation}

Ostatnia wiadomość użytkownika:
${currentInput}
`;

      const response = await generateWithAI(prompt);
      setMessages((prev) => [...prev, { role: "ai", content: response }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "Nie udało się wygenerować odpowiedzi lokalnego AI." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const generateFinalMail = async () => {
    if (messages.length === 0) {
      Alert.alert("Brak rozmowy", "Najpierw opisz sprawę.");
      return;
    }

    try {
      setLoadingMail(true);

      const conversation = messages
        .map((m) => `${m.role === "user" ? "Użytkownik" : "AI"}: ${m.content}`)
        .join("\n\n");

      const prompt = `
Na podstawie poniższej rozmowy napisz gotowy formalny mail do polskiego urzędu.

Zasady:
- mail ma być gotowy do wysłania,
- użyj formalnego języka,
- zawrzyj konkretne pytania,
- poproś o wskazanie podstawy prawnej,
- nie twórz porady prawnej ani podatkowej,
- nie dodawaj komentarzy poza treścią maila.

Rozmowa:
${conversation}
`;

      const mail = await generateWithAI(prompt);
      setFinalMail(mail);
    } catch (error) {
      Alert.alert("Błąd", "Nie udało się wygenerować finalnego maila.");
    } finally {
      setLoadingMail(false);
    }
  };

  const copyMail = async () => {
    if (!finalMail.trim()) return;
    await Clipboard.setStringAsync(finalMail);
    Alert.alert("Skopiowano", "Mail został skopiowany.");
  };

  const saveMail = async () => {
    if (!finalMail.trim()) {
      Alert.alert("Brak maila", "Najpierw wygeneruj finalny mail.");
      return;
    }

    const item = {
      id: Date.now().toString(),
      institutionName: "Do uzupełnienia",
      institutionEmail: "",
      institutionCategory: "",
      keywords: messages[0]?.content || "",
      content: finalMail,
      subject: "Zapytanie do urzędu",
      createdAt: new Date().toISOString(),
      status: "draft",
    };

    const existing = await AsyncStorage.getItem("mail_history");
    const history = existing ? JSON.parse(existing) : [];

    await AsyncStorage.setItem("mail_history", JSON.stringify([item, ...history]));
    Alert.alert("Zapisano", "Mail zapisano w historii jako szkic.");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>US AI</Text>
      <Text style={styles.subtitle}>Opisz sprawę, doprecyzuj ją w rozmowie, a potem wygeneruj mail do urzędu.</Text>

      <ScrollView style={styles.chat}>
        {messages.map((message, index) => (
          <View
            key={index}
            style={[
              styles.message,
              message.role === "user" ? styles.userMessage : styles.aiMessage,
            ]}
          >
            <Text style={message.role === "user" ? styles.userText : styles.aiText}>
              {message.content}
            </Text>
          </View>
        ))}

        {loading ? <ActivityIndicator size="large" style={styles.loader} /> : null}

        {finalMail ? (
          <View style={styles.finalBox}>
            <Text style={styles.finalTitle}>Finalny mail</Text>
            <TextInput
              style={styles.finalInput}
              multiline
              value={finalMail}
              onChangeText={setFinalMail}
            />

            <Pressable style={styles.copyButton} onPress={copyMail}>
              <Text style={styles.buttonText}>Kopiuj mail</Text>
            </Pressable>

            <Pressable style={styles.saveButton} onPress={saveMail}>
              <Text style={styles.buttonText}>Zapisz do historii</Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.bottom}>
        <TextInput
          style={styles.input}
          placeholder="np. bitcoin podatki, sprzedaż BTC w 2024..."
          value={input}
          onChangeText={setInput}
          multiline
        />

        <Pressable style={styles.button} onPress={sendMessage}>
          <Text style={styles.buttonText}>Wyślij</Text>
        </Pressable>

        <Pressable style={styles.mailButton} onPress={generateFinalMail}>
          <Text style={styles.buttonText}>
            {loadingMail ? "Generuję..." : "Generuj finalny mail"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingTop: 60 },
  title: { fontSize: 34, fontWeight: "800", paddingHorizontal: 20 },
  subtitle: { color: "#666", paddingHorizontal: 20, marginTop: 6, marginBottom: 20, lineHeight: 21 },
  chat: { flex: 1, paddingHorizontal: 16 },
  message: { padding: 16, borderRadius: 18, marginBottom: 12, maxWidth: "90%" },
  userMessage: { backgroundColor: "#111", alignSelf: "flex-end" },
  aiMessage: { backgroundColor: "#f1f5f9", alignSelf: "flex-start" },
  userText: { color: "#fff", fontSize: 16, lineHeight: 24 },
  aiText: { color: "#111", fontSize: 16, lineHeight: 24 },
  loader: { marginTop: 20 },
  bottom: { borderTopWidth: 1, borderColor: "#eee", padding: 16, backgroundColor: "#fff" },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 16, padding: 16, minHeight: 64, maxHeight: 130, marginBottom: 12 },
  button: { backgroundColor: "#111", padding: 16, borderRadius: 16, marginBottom: 10 },
  mailButton: { backgroundColor: "#7c3aed", padding: 16, borderRadius: 16 },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "700", fontSize: 16 },
  finalBox: { borderWidth: 1, borderColor: "#ddd", borderRadius: 18, padding: 16, marginBottom: 24, backgroundColor: "#fafafa" },
  finalTitle: { fontSize: 20, fontWeight: "800", marginBottom: 10 },
  finalInput: { borderWidth: 1, borderColor: "#ddd", borderRadius: 14, padding: 14, minHeight: 280, backgroundColor: "#fff", textAlignVertical: "top", marginBottom: 12 },
  copyButton: { backgroundColor: "#2563eb", padding: 14, borderRadius: 14, marginBottom: 10 },
  saveButton: { backgroundColor: "#16a34a", padding: 14, borderRadius: 14 },
});
EOF
