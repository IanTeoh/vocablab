import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BackgroundPattern from "../../components/BackgroundPattern";
import ContextQuizCard from "../../components/ContextQuizCard";
import FadeInView from "../../components/FadeInView";
import ReviewCard from "../../components/ReviewCard";
import SegmentedTabs from "../../components/SegmentedTabs";
import WordAdventureCard from "../../components/WordAdventureCard";
import WordOfDayCard from "../../components/WordOfDayCard";
import WordUnscrambleCard from "../../components/WordUnscrambleCard";
import WordUnscrambleGameScreen from "../../components/WordUnscrambleGameScreen";
import { Colors, Fonts, Spacing } from "../../constants/theme";

const SEGMENTS = ["Learn", "Games"];

export default function Index() {
  const [segment, setSegment] = useState("Learn");
  const [unscrambleActive, setUnscrambleActive] = useState(false);

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={styles.screen} edges={["top"]}>
        <BackgroundPattern />
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Home</Text>

          <SegmentedTabs
            segments={SEGMENTS}
            active={segment}
            onChange={setSegment}
          />

          {segment === "Learn" && (
            <>
              <FadeInView delay={0}>
                <WordOfDayCard />
              </FadeInView>
              <FadeInView delay={80}>
                <WordAdventureCard />
              </FadeInView>
              <FadeInView delay={160}>
                <ReviewCard />
              </FadeInView>
            </>
          )}

          {segment === "Games" && (
            <>
              <FadeInView delay={0}>
                <WordUnscrambleCard onPlay={() => setUnscrambleActive(true)} />
              </FadeInView>
              <FadeInView delay={80}>
                <ContextQuizCard />
              </FadeInView>
            </>
          )}
        </ScrollView>
      </SafeAreaView>

      <WordUnscrambleGameScreen
        visible={unscrambleActive}
        onClose={() => setUnscrambleActive(false)}
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
