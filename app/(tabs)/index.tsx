import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AchievementToast from "../../components/AchievementToast";
import BackgroundPattern from "../../components/BackgroundPattern";
import ReviewCard from "../../components/ReviewCard";
import WordAdventureCard from "../../components/WordAdventureCard";
import WordOfDayCard from "../../components/WordOfDayCard";
import { Colors, Spacing } from "../../constants/theme";
import { checkForNewAchievements } from "../../logic/achievements";

export default function Index() {
  const [newAchievements, setNewAchievements] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      checkForNewAchievements().then(setNewAchievements);
    }, []),
  );

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <BackgroundPattern />
      <ScrollView contentContainerStyle={styles.container}>
        <WordOfDayCard />
        <WordAdventureCard />
        <ReviewCard />
      </ScrollView>

      <AchievementToast
        achievements={newAchievements}
        onDismiss={() => setNewAchievements([])}
      />
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
