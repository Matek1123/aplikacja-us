import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function AutomationsScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Automatyzacje</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          Automatyczne ponaglenia
        </Text>

        <Text style={styles.text}>
          W przyszłości aplikacja będzie mogła
          wysyłać przypomnienia oraz ponaglenia,
          jeśli urząd nie odpowie w określonym czasie.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          Wysyłka cykliczna
        </Text>

        <Text style={styles.text}>
          Planowana jest możliwość harmonogramu
          wysyłki zapytań do wielu urzędów.
        </Text>
      </View>

      <View style={styles.warningCard}>
        <Text style={styles.warningTitle}>
          Ważne
        </Text>

        <Text style={styles.text}>
          Automatyczna wysyłka będzie wymagała
          backendu, limitów bezpieczeństwa,
          logów oraz autoryzacji użytkownika.
        </Text>
      </View>
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

  card: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    backgroundColor: "#fafafa",
  },

  warningCard: {
    borderWidth: 1,
    borderColor: "#f59e0b",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    backgroundColor: "#fffbeb",
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },

  warningTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },

  text: {
    color: "#333",
    lineHeight: 22,
  },
});
