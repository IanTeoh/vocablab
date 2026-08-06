import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BackgroundPattern from "../../components/BackgroundPattern";
import ReviewCard from "../../components/ReviewCard";
import WordAdventureCard from "../../components/WordAdventureCard";
import WordOfDayCard from "../../components/WordOfDayCard";
import { Colors, Spacing } from "../../constants/theme";

export default function Index() {
  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <BackgroundPattern />
      <ScrollView contentContainerStyle={styles.container}>
        <WordOfDayCard />
        <WordAdventureCard />
        <ReviewCard />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  container: {
    padding: Spacing.md,
    paddingTop: Spacing.lg,
    paddingBottom: 100,
    flexGrow: 1,
  },
});
