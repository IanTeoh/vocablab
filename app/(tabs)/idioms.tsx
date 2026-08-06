import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BackgroundPattern from "../../components/BackgroundPattern";
import IdiomOfDayCard from "../../components/IdiomOfDayCard";
import IdiomojiCard from "../../components/IdiomojiCard";
import IdiomPracticeCard from "../../components/IdiomPracticeCard";
import IdiomReviewCard from "../../components/IdiomReviewCard";
import { Colors, Fonts, Radius, Spacing } from "../../constants/theme";
import idioms from "../../data/idioms.json";
import { getIdiomStats } from "../../logic/idiomDictionary";

export default function Idioms() {
  const [stats, setStats] = useState<any | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      getIdiomStats(idioms.length).then(setStats);
    }, []),
  );

  useEffect(() => {
    getIdiomStats(idioms.length).then(setStats);
  }, [refreshKey]);

  function handleCaught() {
    setRefreshKey((k) => k + 1);
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <BackgroundPattern />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Idioms</Text>

        {stats && (
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{stats.idiomsCollected}</Text>
              <Text style={styles.statLabel}>Caught</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{stats.percentComplete}%</Text>
              <Text style={styles.statLabel}>Complete</Text>
            </View>
          </View>
        )}

        <IdiomOfDayCard onCaught={handleCaught} />
        <IdiomojiCard />
        <IdiomPracticeCard onCaught={handleCaught} />
        <IdiomReviewCard refreshKey={refreshKey} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  container: { padding: Spacing.md, paddingTop: Spacing.lg, flexGrow: 1 },
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
