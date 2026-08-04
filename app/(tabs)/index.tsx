import { ScrollView, StyleSheet, Text, View } from "react-native";
import WordOfDayCard from "../../components/WordOfDayCard";

export default function Index() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <WordOfDayCard />

      <View style={styles.placeholderCard}>
        <Text style={styles.placeholderTitle}>More coming soon</Text>
        <Text style={styles.placeholderSubtitle}>
          New challenges will show up here.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#f5f5f5", flexGrow: 1 },
  placeholderCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    opacity: 0.6,
  },
  placeholderTitle: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  placeholderSubtitle: { fontSize: 14, color: "#888" },
});
