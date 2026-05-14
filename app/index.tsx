import { Link } from "expo-router";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Urząd AI Mailer
      </Text>

      <Text style={styles.subtitle}>
        Generuj zapytania do urzędów,
        zapisuj historię spraw
        i buduj bibliotekę odpowiedzi.
      </Text>

      <Link href="/generator" asChild>
        <Pressable style={styles.primaryButton}>
          <Text style={styles.primaryText}>
            Generator zapytania
          </Text>
        </Pressable>
      </Link>

      <Link href="/history" asChild>
        <Pressable style={styles.secondaryButton}>
          <Text style={styles.secondaryText}>
            Historia spraw
          </Text>
        </Pressable>
      </Link>

      <Link href="/answers" asChild>
        <Pressable style={styles.secondaryButton}>
          <Text style={styles.secondaryText}>
            Biblioteka odpowiedzi
          </Text>
        </Pressable>
      </Link>

      <Link href="/institutions" asChild>
        <Pressable style={styles.secondaryButton}>
          <Text style={styles.secondaryText}>
            Baza urzędów
          </Text>
        </Pressable>
      </Link>

      <Link href="/automations" asChild>
        <Pressable style={styles.secondaryButton}>
          <Text style={styles.secondaryText}>
            Automatyzacje
          </Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 12,
  },

  subtitle: {
    fontSize: 16,
    color: "#555",
    marginBottom: 32,
    lineHeight: 22,
  },

  primaryButton: {
    backgroundColor: "#111",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
  },

  primaryText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
  },

  secondaryButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
  },

  secondaryText: {
    textAlign: "center",
    fontWeight: "600",
  },
});
