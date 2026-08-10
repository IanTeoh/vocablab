import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Colors, Fonts, Radius, Spacing } from "../constants/theme";
import { getPlotGrowth } from "../logic/garden";
import PlantSprite from "./PlantSprite";
import PressableScale from "./PressableScale";

// How large the plant renders at each stage, relative to its full
// mature size — this is what makes a freshly-planted seed genuinely
// look tiny rather than just a different icon.
const STAGE_SCALE = [0.35, 0.55, 0.8, 1];
const STAGE_NAMES = ["Seed", "Sprout", "Growing", "Ready"];

function formatRemaining(ms: number) {
  if (ms <= 0) return "Ready now!";
  const totalMinutes = Math.ceil(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m left`;
  return `${hours}h ${minutes}m left`;
}

export default function PlantDetailModal({
  visible,
  plot,
  onClose,
  onWater,
  onHarvest,
}: {
  visible: boolean;
  plot: any;
  onClose: () => void;
  onWater: () => void;
  onHarvest: () => void;
}) {
  if (!plot) return null;
  const growth = getPlotGrowth(plot);
  if (!growth) return null;
  const stats = growth.stats;
  const remainingMs = Math.max(
    0,
    stats.growHours * 60 * 60 * 1000 - (Date.now() - plot.plantedAt),
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          <Text style={styles.name}>{stats.name}</Text>

          <View style={styles.hero}>
            <View style={styles.heroSprite}>
              <PlantSprite
                cropId={plot.cropId}
                stage={growth.stage}
                tier={plot.tier}
                size={140 * STAGE_SCALE[growth.stage]}
              />
            </View>
          </View>

          <View style={styles.stageTimeline}>
            {STAGE_NAMES.map((label, i) => (
              <View key={label} style={styles.stageDotWrap}>
                <View
                  style={[
                    styles.stageDot,
                    i === growth.stage && styles.stageDotActive,
                    i < growth.stage && styles.stageDotDone,
                  ]}
                />
                <Text
                  style={[
                    styles.stageLabel,
                    i === growth.stage && styles.stageLabelActive,
                  ]}
                >
                  {label}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${growth.progress * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.remaining}>
            {growth.stage === 3
              ? "Ready to harvest!"
              : formatRemaining(remainingMs)}
          </Text>

          {growth.stage === 3 ? (
            <PressableScale style={styles.harvestButton} onPress={onHarvest}>
              <Text style={styles.harvestButtonText}>
                🧺 Harvest for {stats.coins} coins
              </Text>
            </PressableScale>
          ) : (
            <PressableScale
              style={
                growth.canWater
                  ? styles.waterButton
                  : [styles.waterButton, styles.waterButtonDisabled]
              }
              onPress={onWater}
            >
              <Text style={styles.waterButtonText}>
                {growth.canWater
                  ? "💧 Water this plant"
                  : "💧 Already watered — check back later"}
              </Text>
            </PressableScale>
          )}

          <PressableScale style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </PressableScale>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 28,
    padding: Spacing.lg,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
  },
  name: {
    fontFamily: Fonts.displayBold,
    fontSize: 22,
    color: Colors.ink,
    marginBottom: Spacing.sm,
  },
  hero: {
    width: "100%",
    height: 160,
    backgroundColor: Colors.background,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  heroSprite: { alignItems: "center", justifyContent: "center" },
  stageTimeline: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: Spacing.sm,
  },
  stageDotWrap: { alignItems: "center", flex: 1 },
  stageDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.border,
    marginBottom: 4,
  },
  stageDotActive: {
    backgroundColor: Colors.accent,
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  stageDotDone: { backgroundColor: Colors.success },
  stageLabel: { fontFamily: Fonts.body, fontSize: 10, color: Colors.inkMuted },
  stageLabelActive: { fontFamily: Fonts.bodySemiBold, color: Colors.accent },
  progressTrack: {
    width: "100%",
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.background,
    marginBottom: 6,
    overflow: "hidden",
  },
  progressFill: { height: 8, borderRadius: 4, backgroundColor: Colors.success },
  remaining: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    color: Colors.inkMuted,
    marginBottom: Spacing.md,
  },
  waterButton: {
    backgroundColor: "#5B9BD5",
    borderRadius: Radius.pill,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: "100%",
    alignItems: "center",
  },
  waterButtonDisabled: { backgroundColor: "#A9B9C4" },
  waterButtonText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: "#fff",
  },
  harvestButton: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.pill,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: "100%",
    alignItems: "center",
  },
  harvestButtonText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: "#fff",
  },
  closeButton: { marginTop: Spacing.sm, paddingVertical: 8 },
  closeButtonText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: Colors.inkMuted,
  },
});
