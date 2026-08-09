import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, ScrollView, StyleSheet, Text, View } from "react-native";
import Svg, {
    Defs,
    Ellipse,
    LinearGradient,
    Path,
    Rect,
    Stop
} from "react-native-svg";
import { Colors, Fonts, Radius, Spacing } from "../constants/theme";
import { getCoins, spendCoins } from "../logic/coins";
import { getDictionary } from "../logic/dictionary";
import {
    COMPANIONS,
    getCropStats,
    getGardenPlots,
    getPlotGrowth,
    getSeedInventory,
    getSelectedCompanion,
    getUnlockedCompanionIds,
    harvestPlot,
    plantSeed,
    reconcileNewSeeds,
    setSelectedCompanion,
    unlockCompanion,
    waterPlot
} from "../logic/garden";
import { getIdiomDictionary } from "../logic/idiomDictionary";
import { getRootDictionary } from "../logic/rootDictionary";
import { getTimeOfDayBucket, TIME_OF_DAY_THEMES } from "../logic/timeOfDay";
import CompanionSprite from "./CompanionSprite";
import PlantDetailModal from "./PlantDetailModal";
import PlantSprite from "./PlantSprite";
import PressableScale from "./PressableScale";

// Hand-placed, organic (non-grid) plot positions as percentages of
// the scene, matching the dirt patches drawn in the SVG background.
const PLOT_POSITIONS = [
  { left: "13%", top: "50%" },
  { left: "40%", top: "44%" },
  { left: "67%", top: "52%" },
  { left: "20%", top: "68%" },
  { left: "48%", top: "73%" },
  { left: "76%", top: "66%" },
];

const DIRT_CENTERS = [
  { cx: 70, cy: 320 },
  { cx: 170, cy: 280 },
  { cx: 280, cy: 330 },
  { cx: 100, cy: 420 },
  { cx: 210, cy: 450 },
  { cx: 320, cy: 410 },
];

const WALK_WAYPOINTS = [
  { x: 0.2, y: 0.85 },
  { x: 0.6, y: 0.9 },
  { x: 0.75, y: 0.8 },
  { x: 0.35, y: 0.82 },
];

export default function GardenView() {
  const [plots, setPlots] = useState<any[]>([]);
  const [inventory, setInventory] = useState<Record<string, number>>({});
  const [selectedSeedKey, setSelectedSeedKey] = useState<string | null>(null);
  const [companion, setCompanion] = useState("fox");
  const [unlockedCompanions, setUnlockedCompanions] = useState<string[]>([]);
  const [companionPickerOpen, setCompanionPickerOpen] = useState(false);
  const [seedTrayOpen, setSeedTrayOpen] = useState(false);
  const [selectedPlot, setSelectedPlot] = useState<number | null>(null);
  const [coins, setCoins] = useState(0);
  const [ambientSoundOn, setAmbientSoundOn] = useState(false);
  const [harvestFlash, setHarvestFlash] = useState<string | null>(null);
  const [newSeedFlash, setNewSeedFlash] = useState<number>(0);

  const walkX = useRef(new Animated.Value(WALK_WAYPOINTS[0].x)).current;
  const walkY = useRef(new Animated.Value(WALK_WAYPOINTS[0].y)).current;
  const walkFlip = useRef(new Animated.Value(1)).current;

  const bucket = getTimeOfDayBucket();
  const theme = TIME_OF_DAY_THEMES[bucket];

  useFocusEffect(
    useCallback(() => {
      loadEverything();
    }, []),
  );

  useEffect(() => {
    let cancelled = false;
    let waypointIndex = 0;

    function walkNext() {
      if (cancelled) return;
      const current = WALK_WAYPOINTS[waypointIndex];
      const next = WALK_WAYPOINTS[(waypointIndex + 1) % WALK_WAYPOINTS.length];
      const goingRight = next.x > current.x;

      Animated.timing(walkFlip, {
        toValue: goingRight ? 1 : -1,
        duration: 200,
        useNativeDriver: false,
      }).start();

      Animated.parallel([
        Animated.timing(walkX, {
          toValue: next.x,
          duration: 4500,
          useNativeDriver: false,
        }),
        Animated.timing(walkY, {
          toValue: next.y,
          duration: 4500,
          useNativeDriver: false,
        }),
      ]).start(() => {
        waypointIndex = (waypointIndex + 1) % WALK_WAYPOINTS.length;
        setTimeout(walkNext, 900);
      });
    }

    walkNext();
    return () => {
      cancelled = true;
    };
  }, []);

  async function loadEverything() {
    const [
      gardenPlots,
      words,
      idioms,
      roots,
      comp,
      unlocked,
      coinBalance,
      soundPref,
    ] = await Promise.all([
      getGardenPlots(),
      getDictionary(),
      getIdiomDictionary(),
      getRootDictionary(),
      getSelectedCompanion(),
      getUnlockedCompanionIds(),
      getCoins(),
      AsyncStorage.getItem("vocablab_ambient_sound"),
    ]);

    const newSeeds = await reconcileNewSeeds(words, idioms, roots);
    if (newSeeds.length > 0) {
      setNewSeedFlash(newSeeds.length);
      setTimeout(() => setNewSeedFlash(0), 3200);
    }

    setPlots(gardenPlots);
    setInventory(await getSeedInventory());
    setCompanion(comp);
    setUnlockedCompanions(unlocked);
    setCoins(coinBalance);
    setAmbientSoundOn(soundPref === "true");
  }

  async function toggleAmbientSound() {
    const next = !ambientSoundOn;
    setAmbientSoundOn(next);
    await AsyncStorage.setItem("vocablab_ambient_sound", String(next));
  }

  async function handlePlotPress(index: number) {
    const plot = plots[index];
    if (plot) {
      setSelectedPlot(selectedPlot === index ? null : index);
      return;
    }
    if (!selectedSeedKey) return;
    const [cropId, tier] = selectedSeedKey.includes("_")
      ? selectedSeedKey.split("_")
      : [selectedSeedKey, null];
    const updated = await plantSeed(index, cropId, tier);
    if (!updated) return;
    setPlots(updated);
    setInventory(await getSeedInventory());
    setSelectedSeedKey(null);
    setSeedTrayOpen(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  async function handleWater(index: number) {
    const updated = await waterPlot(index);
    setPlots(updated);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  async function handleHarvest(index: number) {
    const { plots: updated, coinsEarned } = await harvestPlot(index);
    if (coinsEarned > 0) {
      setPlots(updated);
      setCoins((c) => c + coinsEarned);
      setSelectedPlot(null);
      setHarvestFlash(`+${coinsEarned} coins`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => setHarvestFlash(null), 1800);
    }
  }

  async function handleCompanionSelect(id: string) {
    if (unlockedCompanions.includes(id)) {
      await setSelectedCompanion(id);
      setCompanion(id);
      setCompanionPickerOpen(false);
      return;
    }
    const data = COMPANIONS.find((c) => c.id === id);
    if (!data) return;
    const result = await spendCoins(data.price);
    if (result.success) {
      const updated = await unlockCompanion(id);
      setUnlockedCompanions(updated);
      setCoins(result.coins);
      await setSelectedCompanion(id);
      setCompanion(id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }

  const companionData =
    COMPANIONS.find((c) => c.id === companion) || COMPANIONS[0];
  const seedKeys = Object.keys(inventory).filter((k) => inventory[k] > 0);
  const totalSeeds = Object.values(inventory).reduce((a, b) => a + b, 0);

  return (
    <View style={styles.scene}>
      {/* Full-bleed illustrated background */}
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 400 600"
        preserveAspectRatio="xMidYMid slice"
        style={StyleSheet.absoluteFill}
      >
        <Defs>
          <LinearGradient id="farmSky" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={theme.sky[0]} stopOpacity="1" />
            <Stop offset="1" stopColor={theme.sky[1]} stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="400" height="240" fill="url(#farmSky)" />
        <Path
          d="M0 240 Q100 210 200 235 T400 225 L400 600 L0 600 Z"
          fill="#A9C97E"
        />
        <Path
          d="M0 270 Q120 245 220 265 T400 260 L400 600 L0 600 Z"
          fill="#97BC6C"
        />

        {/* framing trees */}
        <Ellipse cx="30" cy="230" rx="34" ry="30" fill="#7CA95A" />
        <Rect x="24" y="250" width="12" height="24" fill="#8B5E3C" />
        <Ellipse cx="375" cy="215" rx="30" ry="26" fill="#84B064" />
        <Rect x="369" y="232" width="10" height="22" fill="#8B5E3C" />

        {/* simple fence line */}
        {[40, 90, 140, 190, 240, 290, 340].map((x) => (
          <Rect
            key={x}
            x={x}
            y="255"
            width="6"
            height="20"
            rx="2"
            fill="#B99A6E"
          />
        ))}
        <Rect x="35" y="258" width="320" height="4" fill="#B99A6E" />

        {/* six dirt patches, matching PLOT_POSITIONS */}
        {DIRT_CENTERS.map((d, i) => (
          <Ellipse
            key={i}
            cx={d.cx}
            cy={d.cy}
            rx="34"
            ry="16"
            fill="#8B6B47"
            opacity="0.9"
          />
        ))}

        {/* winding path */}
        <Path
          d="M0 560 Q100 540 180 555 Q260 570 400 545 L400 600 L0 600 Z"
          fill="#D8C79E"
          opacity="0.6"
        />
      </Svg>

      {/* wandering companion */}
      <Animated.View
        style={[
          styles.companionSprite,
          {
            left: walkX.interpolate({
              inputRange: [0, 1],
              outputRange: ["0%", "100%"],
            }),
            top: walkY.interpolate({
              inputRange: [0, 1],
              outputRange: ["0%", "100%"],
            }),
            transform: [{ scaleX: walkFlip }],
          },
        ]}
      >
        <CompanionSprite id={companion} size={40} />
      </Animated.View>

      {/* plots */}
      {plots.map((plot, i) => (
        <View key={i} style={[styles.plotZone, PLOT_POSITIONS[i] as any]}>
          <PressableScale onPress={() => handlePlotPress(i)}>
            {plot ? (
              <PlantSprite
                cropId={plot.cropId}
                stage={getPlotGrowth(plot).stage}
                tier={plot.tier}
                size={64}
              />
            ) : (
              <View style={styles.emptyPlotHint}>
                <Text style={styles.emptyPlotPlus}>+</Text>
              </View>
            )}
          </PressableScale>
          {plot && getPlotGrowth(plot).stage === 3 && (
            <View style={styles.readyGlow} />
          )}
        </View>
      ))}

      <PlantDetailModal
        visible={selectedPlot !== null && !!plots[selectedPlot]}
        plot={selectedPlot !== null ? plots[selectedPlot] : null}
        onClose={() => setSelectedPlot(null)}
        onWater={() => selectedPlot !== null && handleWater(selectedPlot)}
        onHarvest={() => selectedPlot !== null && handleHarvest(selectedPlot)}
      />

      {/* HUD: top row */}
      <View style={styles.hudTop}>
        <View style={styles.coinsPill}>
          <Text style={styles.coinsIcon}>🪙</Text>
          <Text style={styles.coinsText}>{coins}</Text>
        </View>
        <View style={{ flexDirection: "row" }}>
          <PressableScale style={styles.hudButton} onPress={toggleAmbientSound}>
            <Text style={styles.hudButtonIcon}>
              {ambientSoundOn ? "🔊" : "🔇"}
            </Text>
          </PressableScale>
          <PressableScale
            style={[styles.hudButton, { marginLeft: 8 }]}
            onPress={() => setCompanionPickerOpen(true)}
          >
            <CompanionSprite id={companion} size={22} />
          </PressableScale>
        </View>
      </View>

      {newSeedFlash > 0 && (
        <View style={styles.seedFlashBanner}>
          <Text style={styles.seedFlashText}>
            🌱 You earned {newSeedFlash} new{" "}
            {newSeedFlash === 1 ? "seed" : "seeds"}!
          </Text>
        </View>
      )}

      {harvestFlash && (
        <View style={styles.harvestFlashBanner}>
          <Text style={styles.harvestFlashText}>{harvestFlash}</Text>
        </View>
      )}

      {/* seed pouch pill, bottom */}
      <PressableScale
        style={styles.seedPouchButton}
        onPress={() => setSeedTrayOpen(!seedTrayOpen)}
      >
        <Text style={styles.seedPouchText}>
          🌱 Seed Pouch {totalSeeds > 0 ? `(${totalSeeds})` : ""}
        </Text>
      </PressableScale>

      {seedTrayOpen && (
        <View style={styles.seedTray}>
          {seedKeys.length === 0 ? (
            <Text style={styles.seedTrayEmpty}>
              Catch words, idioms, or roots to earn seeds!
            </Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {seedKeys.map((key) => {
                const [cropId, tier] = key.includes("_")
                  ? key.split("_")
                  : [key, null];
                const stats = getCropStats(cropId, tier);
                return (
                  <PressableScale
                    key={key}
                    style={[
                      styles.seedChip,
                      selectedSeedKey === key && styles.seedChipSelected,
                    ]}
                    onPress={() =>
                      setSelectedSeedKey(selectedSeedKey === key ? null : key)
                    }
                  >
                    <PlantSprite
                      cropId={cropId}
                      stage={3}
                      tier={tier}
                      size={36}
                    />
                    <View style={styles.seedChipCountBadge}>
                      <Text style={styles.seedChipCountText}>
                        {inventory[key]}
                      </Text>
                    </View>
                  </PressableScale>
                );
              })}
            </ScrollView>
          )}
          {selectedSeedKey && (
            <Text style={styles.seedHint}>
              Tap an empty patch of soil to plant it 🌱
            </Text>
          )}
        </View>
      )}

      {companionPickerOpen && (
        <View style={styles.companionPicker}>
          <Text style={styles.companionPickerTitle}>Garden companions</Text>
          <View style={styles.companionGrid}>
            {COMPANIONS.map((c) => {
              const isUnlocked = unlockedCompanions.includes(c.id);
              return (
                <PressableScale
                  key={c.id}
                  style={[
                    styles.companionOption,
                    c.id === companion && styles.companionOptionSelected,
                  ]}
                  onPress={() => handleCompanionSelect(c.id)}
                >
                  <View style={{ opacity: isUnlocked ? 1 : 0.4 }}>
                    <CompanionSprite id={c.id} size={30} />
                  </View>
                  <Text style={styles.companionOptionName}>{c.name}</Text>
                  {!isUnlocked && (
                    <Text style={styles.companionOptionPrice}>🪙{c.price}</Text>
                  )}
                </PressableScale>
              );
            })}
          </View>
          <PressableScale
            style={styles.companionCloseButton}
            onPress={() => setCompanionPickerOpen(false)}
          >
            <Text style={styles.companionCloseText}>Done</Text>
          </PressableScale>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  scene: { flex: 1, minHeight: 560, borderRadius: 28, overflow: "hidden" },
  companionSprite: {
    position: "absolute",
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -18,
    marginTop: -18,
  },
  companionSpriteIcon: { fontSize: 26 },
  plotZone: { position: "absolute", marginLeft: -32, marginTop: -32 },
  emptyPlotHint: {
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyPlotPlus: {
    fontSize: 22,
    color: "rgba(255,255,255,0.6)",
    fontWeight: "600" as any,
  },
  readyGlow: {
    position: "absolute",
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: Colors.accent,
    opacity: 0.7,
  },
  plotDetail: { position: "absolute", marginLeft: -70, marginTop: -110 },
  plotDetailCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.sm,
    width: 140,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  plotDetailName: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: Colors.ink,
  },
  plotDetailStage: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: Colors.inkMuted,
    marginBottom: 6,
  },
  waterButton: {
    backgroundColor: "#5B9BD5",
    borderRadius: Radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  waterButtonDisabled: { backgroundColor: "#A9B9C4" },
  waterButtonText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 11,
    color: "#fff",
  },
  harvestButton: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  harvestButtonText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 11,
    color: "#fff",
  },
  hudTop: {
    position: "absolute",
    top: Spacing.sm,
    left: Spacing.sm,
    right: Spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  coinsPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: Radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  coinsIcon: { fontSize: 14, marginRight: 4 },
  coinsText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: Colors.ink,
  },
  hudButton: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: Radius.pill,
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  hudButtonIcon: { fontSize: 16 },
  seedFlashBanner: {
    position: "absolute",
    top: 52,
    left: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: Colors.accent,
    borderRadius: Radius.pill,
    paddingVertical: 8,
    alignItems: "center",
  },
  seedFlashText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    color: "#fff",
  },
  harvestFlashBanner: {
    position: "absolute",
    top: 52,
    alignSelf: "center",
    backgroundColor: Colors.success,
    borderRadius: Radius.pill,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  harvestFlashText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: "#fff",
  },
  seedPouchButton: {
    position: "absolute",
    bottom: 90,
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: Radius.pill,
    paddingHorizontal: 18,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 3,
  },
  seedPouchText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: Colors.ink,
  },
  seedTray: {
    position: "absolute",
    bottom: 140,
    left: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  seedTrayEmpty: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.inkMuted,
    fontStyle: "italic",
  },
  seedChip: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  seedChipSelected: { borderColor: Colors.accent, borderWidth: 2 },
  seedChipCountBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  seedChipCountText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 10,
    color: "#fff",
  },
  seedHint: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: Colors.accent,
    marginTop: 6,
    fontStyle: "italic",
  },
  companionPicker: {
    position: "absolute",
    bottom: 140,
    left: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  companionPickerTitle: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.ink,
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  companionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  companionOption: {
    width: "22%",
    alignItems: "center",
    padding: 8,
    margin: "1.5%",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  companionOptionSelected: {
    borderColor: Colors.accent,
    backgroundColor: Colors.background,
  },
  companionOptionIcon: { fontSize: 24 },
  companionOptionName: {
    fontFamily: Fonts.body,
    fontSize: 10,
    color: Colors.inkMuted,
    marginTop: 2,
  },
  companionOptionPrice: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 10,
    color: Colors.accent,
    marginTop: 2,
  },
  companionCloseButton: {
    marginTop: Spacing.sm,
    alignItems: "center",
    paddingVertical: 8,
  },
  companionCloseText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: Colors.accent,
  },
});
