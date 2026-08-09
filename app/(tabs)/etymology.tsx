import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BackgroundPattern from "../../components/BackgroundPattern";
import FadeInView from "../../components/FadeInView";
import LoanwordGuessCard from "../../components/LoanwordGuessCard";
import RootDerivativesCard from "../../components/RootDerivativesCard";
import RootDerivativesGameScreen from "../../components/RootDerivativesGameScreen";
import RootOfDayCard from "../../components/RootOfDayCard";
import RootPracticeCard from "../../components/RootPracticeCard";
import SegmentedTabs from "../../components/SegmentedTabs";
import { Colors, Fonts, Radius, Spacing } from "../../constants/theme";

const SEGMENTS = ["Learn", "Games"];

export default function Etymology() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeDerivativesRoot, setActiveDerivativesRoot] = useState<
    any | null
  >(null);
  const [segment, setSegment] = useState("Learn");

  function handleCaught() {
    setRefreshKey((k) => k + 1);
  }

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={styles.screen} edges={["top"]}>
        <BackgroundPattern />
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Etymology</Text>

          <SegmentedTabs
            segments={SEGMENTS}
            active={segment}
            onChange={setSegment}
          />

          {segment === "Learn" && (
            <>
              <FadeInView delay={0}>
                <RootOfDayCard onCaught={handleCaught} />
              </FadeInView>
              <FadeInView delay={80}>
                <RootPracticeCard onCaught={handleCaught} />
              </FadeInView>
            </>
          )}

          {segment === "Games" && (
            <>
              <FadeInView delay={0}>
                <RootDerivativesCard
                  onStart={(root) => setActiveDerivativesRoot(root)}
                  refreshKey={refreshKey}
                />
              </FadeInView>
              <FadeInView delay={80}>
                <LoanwordGuessCard />
              </FadeInView>
            </>
          )}
        </ScrollView>
      </SafeAreaView>

      <RootDerivativesGameScreen
        root={activeDerivativesRoot}
        onClose={() => setActiveDerivativesRoot(null)}
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
