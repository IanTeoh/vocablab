import * as Haptics from "expo-haptics";
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
    getCropStats,
    getGardenPlots,
    getSeedInventory,
    plantSeed,
} from "../logic/garden";
import PlantSprite from "./PlantSprite";
import PressableScale from "./PressableScale";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function SiloScreen({
  visible,
  onClose,
  onPlanted,
}: {
  visible: boolean;
  onClose: () => void;
  onPlanted: () => void;
}) {
  const [inventory, setInventory] = useState<Record<string, number>>({});
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [plantFlash, setPlantFlash] = useState<string | null>(null);
  const [shouldRender, setShouldRender] = useState(false);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      loadInventory();
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

  async function loadInventory() {
    setInventory(await getSeedInventory());
    setSelectedKey(null);
  }

  async function handlePlant(key: string) {
    const [cropId, tier] = key.includes("_") ? key.split("_") : [key, null];
    const plots = await getGardenPlots();
    const emptyIndex = plots.findIndex((p) => !p);
    if (emptyIndex === -1) {
      setPlantFlash("Your greenhouse is full!");
      setTimeout(() => setPlantFlash(null), 1800);
      return;
    }
    const updated = await plantSeed(emptyIndex, cropId, tier);
    if (!updated) return;
    setInventory(await getSeedInventory());
    setSelectedKey(null);
    setPlantFlash(`Planted in the greenhouse! 🌱`);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onPlanted();
    setTimeout(() => setPlantFlash(null), 1800);
  }

  if (!shouldRender) return null;
  const seedKeys = Object.keys(inventory).filter((k) => inventory[k] > 0);

  return (
    <Animated.View
      style={[styles.overlay, { transform: [{ translateY: slideAnim }] }]}
    >
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.title}>🌾 Silo</Text>
          <PressableScale style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </PressableScale>
        </View>
        <Text style={styles.subtitle}>Seeds you've earned, ready to plant</Text>

        {plantFlash && (
          <View style={styles.flashBanner}>
            <Text style={styles.flashText}>{plantFlash}</Text>
          </View>
        )}

        <ScrollView contentContainerStyle={styles.grid}>
          {seedKeys.length === 0 ? (
            <Text style={styles.empty}>
              Catch a new word, idiom, or root to earn a seed!
            </Text>
          ) : (
            seedKeys.map((key) => {
              const [cropId, tier] = key.includes("_")
                ? key.split("_")
                : [key, null];
              const stats = getCropStats(cropId, tier);
              const selected = selectedKey === key;
              return (
                <PressableScale
                  key={key}
                  style={[styles.seedCard, selected && styles.seedCardSelected]}
                  onPress={() => setSelectedKey(selected ? null : key)}
                >
                  <PlantSprite
                    cropId={cropId}
                    stage={3}
                    tier={tier}
                    size={56}
                  />
                  <Text style={styles.seedName}>{stats.name}</Text>
                  <Text style={styles.seedCount}>×{inventory[key]}</Text>
                  {selected && (
                    <PressableScale
                      style={styles.plantButton}
                      onPress={() => handlePlant(key)}
                    >
                      <Text style={styles.plantButtonText}>Plant</Text>
                    </PressableScale>
                  )}
                </PressableScale>
              );
            })
          )}
        </ScrollView>
      </SafeAreaView>
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
  },
  title: { fontFamily: Fonts.displayBold, fontSize: 24, color: Colors.ink },
  closeButton: { paddingVertical: 8, paddingHorizontal: 4 },
  closeButtonText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.inkMuted,
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.inkMuted,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  flashBanner: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.accent,
    borderRadius: Radius.pill,
    paddingVertical: 8,
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  flashText: { fontFamily: Fonts.bodySemiBold, fontSize: 13, color: "#fff" },
  empty: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.inkMuted,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: Spacing.xl,
    width: "100%",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: Spacing.lg,
    justifyContent: "flex-start",
  },
  seedCard: {
    width: "30%",
    margin: "1.5%",
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.sm,
    alignItems: "center",
  },
  seedCardSelected: { borderColor: Colors.accent, borderWidth: 2 },
  seedName: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 11,
    color: Colors.ink,
    marginTop: 4,
    textAlign: "center",
  },
  seedCount: { fontFamily: Fonts.body, fontSize: 11, color: Colors.inkMuted },
  plantButton: {
    marginTop: 6,
    backgroundColor: Colors.primary,
    borderRadius: Radius.pill,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  plantButtonText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 11,
    color: "#fff",
  },
});
