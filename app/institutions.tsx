import { institutions } from "../data/institutions";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function InstitutionsScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Baza urzędów</Text>

      {institutions.map((item) => (
        <View key={item.id} style={styles.card}>
          <Text style={styles.name}>{item.name}</Text>
          <Text>Kategoria: {item.category}</Text>
          <Text>Email: {item.email}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: "#fff", flexGrow: 1 },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 16 },
  card: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  name: { fontWeight: "700", fontSize: 16, marginBottom: 8 },
});
