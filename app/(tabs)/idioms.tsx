import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FadeInView from "../../components/FadeInView";
import GardenBackground from "../../components/GardenBackground";
import IdiomOfDayCard from "../../components/IdiomOfDayCard";
import IdiomojiCard from "../../components/IdiomojiCard";
import IdiomojiGameScreen from "../../components/IdiomojiGameScreen";
import IdiomPracticeCard from "../../components/IdiomPracticeCard";
import IdiomReviewCard from "../../components/IdiomReviewCard";
import SegmentedTabs from "../../components/SegmentedTabs";
import { Colors, Fonts, Spacing } from "../../constants/theme";

const SEGMENTS = ["Learn", "Games"];

export default function Idioms() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [idiomojiActive, setIdiomojiActive] = useState(false);
  const [idiomojiRefreshKey, setIdiomojiRefreshKey] = useState(0);
  const [segment, setSegment] = useState("Learn");

  function handleCaught() {
    setRefreshKey((k) => k + 1);
  }

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={styles.screen} edges={["top"]}>
        <GardenBackground />
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Idioms</Text>

          <SegmentedTabs
            segments={SEGMENTS}
            active={segment}
            onChange={setSegment}
          />

          {segment === "Learn" && (
            <>
              <FadeInView delay={0}>
                <IdiomOfDayCard onCaught={handleCaught} />
              </FadeInView>
              <FadeInView delay={80}>
                <IdiomPracticeCard onCaught={handleCaught} />
              </FadeInView>
              <FadeInView delay={160}>
                <IdiomReviewCard refreshKey={refreshKey} />
              </FadeInView>
            </>
          )}

          {segment === "Games" && (
            <FadeInView delay={0}>
              <IdiomojiCard
                onPlay={() => setIdiomojiActive(true)}
                refreshKey={idiomojiRefreshKey}
              />
            </FadeInView>
          )}
        </ScrollView>
      </SafeAreaView>

      <IdiomojiGameScreen
        visible={idiomojiActive}
        onClose={() => setIdiomojiActive(false)}
        onGameEnd={() => setIdiomojiRefreshKey((k) => k + 1)}
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
});
