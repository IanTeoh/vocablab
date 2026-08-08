import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AchievementToast from "../../components/AchievementToast";
import BackgroundPattern from "../../components/BackgroundPattern";
import LoanwordGuessCard from "../../components/LoanwordGuessCard";
import RootDerivativesCard from "../../components/RootDerivativesCard";
import RootDerivativesGameScreen from "../../components/RootDerivativesGameScreen";
import RootOfDayCard from "../../components/RootOfDayCard";
import RootPracticeCard from "../../components/RootPracticeCard";
import { Colors, Fonts, Radius, Spacing } from "../../constants/theme";
import roots from "../../data/roots.json";
import { checkForNewAchievements } from "../../logic/achievements";
import { getRootStats } from "../../logic/rootDictionary";

export default function Etymology() {
  const [stats, setStats] = useState<any | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeDerivativesRoot, setActiveDerivativesRoot] = useState<
    any | null
  >(null);
  const [newAchievements, setNewAchievements] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      getRootStats(roots.length).then(setStats);
      checkForNewAchievements().then(setNewAchievements);
    }, []),
  );

  useEffect(() => {
    getRootStats(roots.length).then(setStats);
  }, [refreshKey]);

  function handleCaught() {
    setRefreshKey((k) => k + 1);
    checkForNewAchievements().then(setNewAchievements);
  }

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={styles.screen} edges={["top"]}>
        <BackgroundPattern />
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Etymology</Text>

          {stats && (
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{stats.rootsCollected}</Text>
                <Text style={styles.statLabel}>Roots Caught</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{stats.percentComplete}%</Text>
                <Text style={styles.statLabel}>Complete</Text>
              </View>
            </View>
          )}

          <RootOfDayCard onCaught={handleCaught} />
          <RootPracticeCard onCaught={handleCaught} />
          <RootDerivativesCard
            onStart={(root) => setActiveDerivativesRoot(root)}
            refreshKey={refreshKey}
          />
          <LoanwordGuessCard />
        </ScrollView>
      </SafeAreaView>

      <RootDerivativesGameScreen
        root={activeDerivativesRoot}
        onClose={() => setActiveDerivativesRoot(null)}
        onRoundEnd={() => checkForNewAchievements().then(setNewAchievements)}
      />

      <AchievementToast
        achievements={newAchievements}
        onDismiss={() => setNewAchievements([])}
      />
    </View>
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
  title: {
    fontFamily: Fonts.displayBold,
    fontSize: 26,
    color: Colors.ink,
    marginBottom: Spacing.md,
  },
  statsRow: { flexDirection: "row", marginBottom: Spacing.md },
  statBox: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: 14,
    alignItems: "center",
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statNumber: {
    fontFamily: Fonts.displayBold,
    fontSize: 20,
    color: Colors.accent,
  },
  statLabel: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.inkMuted,
    marginTop: 4,
  },
});
