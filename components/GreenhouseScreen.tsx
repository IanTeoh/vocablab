import { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, Fonts, Radius, Spacing } from "../constants/theme";
import {
    getAllLogbookEntries,
    getGardenPlots,
    getLogbook,
    getPlotGrowth,
    harvestPlot,
    waterPlot,
} from "../logic/garden";
import PlantDetailModal from "./PlantDetailModal";
import PlantSprite from "./PlantSprite";
import PressableScale from "./PressableScale";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function GreenhouseScreen({
  visible,
  onClose,
  onChanged,
}: {
  visible: boolean;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [plots, setPlots] = useState<any[]>([]);
  const [logbook, setLogbook] = useState<string[]>([]);
  const [selectedPlot, setSelectedPlot] = useState<number | null>(null);
  const [shouldRender, setShouldRender] = useState(false);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      loadEverything();
      slideAnim.setValue(SCREEN_HEIGHT);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 220,
        useNativeDriver: true,
      }).start(() => setShouldRender(false));
    }
  }, [visible]);

  async function loadEverything() {
    setPlots(await getGardenPlots());
    setLogbook(await getLogbook());
  }

  async function handleWater(index: number) {
    const updated = await waterPlot(index);
    setPlots(updated);
  }

  async function handleHarvest(index: number) {
    const { plots: updated } = await harvestPlot(index);
    setPlots(updated);
    setLogbook(await getLogbook());
    setSelectedPlot(null);
    onChanged();
  }

  if (!shouldRender) return null;
  const allEntries = getAllLogbookEntries();

  return (
    <Animated.View
      style={[styles.overlay, { transform: [{ translateY: slideAnim }] }]}
    >
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.title}>🏡 Greenhouse</Text>
          <PressableScale style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </PressableScale>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
          <Text style={styles.sectionTitle}>Growing</Text>
          <View style={styles.grid}>
            {plots.map((plot, i) => {
              const growth = plot ? getPlotGrowth(plot) : null;
              return (
                <PressableScale
                  key={i}
                  style={styles.plotCard}
                  onPress={() => plot && setSelectedPlot(i)}
                >
                  {plot ? (
                    <>
                      <PlantSprite
                        cropId={plot.cropId}
                        stage={growth?.stage ?? 0}
                        tier={plot.tier}
                        size={56}
                      />
                      <View style={styles.progressTrack}>
                        <View
                          style={[
                            styles.progressFill,
                            { width: `${(growth?.progress ?? 0) * 100}%` },
                          ]}
                        />
                      </View>
                    </>
                  ) : (
                    <Text style={styles.emptyPlot}>+</Text>
                  )}
                </PressableScale>
              );
            })}
          </View>

          <Text style={styles.sectionTitle}>Logbook</Text>
          <Text style={styles.logbookSubtitle}>
            {logbook.length}/{allEntries.length} discovered — every crop you've
            ever harvested
          </Text>
          <View style={styles.grid}>
            {allEntries.map((entry) => {
              const discovered = logbook.includes(entry.key);
              return (
                <View
                  key={entry.key}
                  style={[styles.logCard, !discovered && styles.logCardLocked]}
                >
                  {discovered ? (
                    <PlantSprite
                      cropId={entry.cropId}
                      stage={3}
                      tier={entry.tier}
                      size={44}
                    />
                  ) : (
                    <Text style={styles.logLockedIcon}>🔒</Text>
                  )}
                  <Text style={styles.logName}>
                    {discovered ? entry.name : "???"}
                  </Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </SafeAreaView>

      <PlantDetailModal
        visible={selectedPlot !== null && !!plots[selectedPlot]}
        plot={selectedPlot !== null ? plots[selectedPlot] : null}
        onClose={() => setSelectedPlot(null)}
        onWater={() => selectedPlot !== null && handleWater(selectedPlot)}
        onHarvest={() => selectedPlot !== null && handleHarvest(selectedPlot)}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.background,
    zIndex: 900,
    elevation: 900,
  },
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  title: { fontFamily: Fonts.displayBold, fontSize: 24, color: Colors.ink },
  closeButton: { paddingVertical: 8, paddingHorizontal: 4 },
  closeButtonText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.inkMuted,
  },
  sectionTitle: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 15,
    color: Colors.ink,
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    marginBottom: 4,
  },
  logbookSubtitle: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.inkMuted,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: Spacing.md,
  },
  plotCard: {
    width: "30%",
    margin: "1.5%",
    aspectRatio: 1,
    backgroundColor: "#DCC49A",
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyPlot: { fontSize: 20, color: "rgba(255,255,255,0.7)" },
  progressTrack: {
    width: 36,
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.5)",
    marginTop: 4,
  },
  progressFill: { height: 3, borderRadius: 2, backgroundColor: Colors.success },
  logCard: {
    width: "22%",
    margin: "1.5%",
    aspectRatio: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
  },
  logCardLocked: { borderColor: Colors.border },
  logLockedIcon: { fontSize: 20, opacity: 0.5 },
  logName: {
    fontFamily: Fonts.body,
    fontSize: 9,
    color: Colors.inkMuted,
    marginTop: 4,
    textAlign: "center",
  },
});
