import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, {
    Circle,
    Defs,
    Ellipse,
    LinearGradient,
    Path,
    Rect,
    Stop,
} from "react-native-svg";
import { Colors, Fonts, Radius, Spacing } from "../constants/theme";
import { getCoins } from "../logic/coins";
import { DECORATIONS, getOwnedDecorations } from "../logic/garden";
import { getTimeOfDayBucket, TIME_OF_DAY_THEMES } from "../logic/timeOfDay";
import GreenhouseScreen from "./GreenhouseScreen";
import PressableScale from "./PressableScale";
import SiloScreen from "./SiloScreen";
import TruckScreen, { DecorationIcon } from "./TruckScreen";

const DECORATION_SLOTS = [
  { left: "6%", top: "62%" },
  { left: "88%", top: "58%" },
  { left: "12%", top: "80%" },
  { left: "82%", top: "80%" },
  { left: "4%", top: "40%" },
  { left: "92%", top: "38%" },
];

export default function GardenHub() {
  const [coins, setCoins] = useState(0);
  const [ownedDecorations, setOwnedDecorations] = useState<string[]>([]);
  const [activeScreen, setActiveScreen] = useState<
    "silo" | "greenhouse" | "truck" | null
  >(null);

  const bucket = getTimeOfDayBucket();
  const theme = TIME_OF_DAY_THEMES[bucket];

  useFocusEffect(
    useCallback(() => {
      loadEverything();
    }, []),
  );

  async function loadEverything() {
    setCoins(await getCoins());
    setOwnedDecorations(await getOwnedDecorations());
  }

  return (
    <View style={styles.scene}>
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 400 600"
        preserveAspectRatio="xMidYMid slice"
        style={StyleSheet.absoluteFill}
      >
        <Defs>
          <LinearGradient id="hubSky" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={theme.sky[0]} stopOpacity="1" />
            <Stop offset="1" stopColor={theme.sky[1]} stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="400" height="280" fill="url(#hubSky)" />
        {/* bare, flat landscape — deliberately simple for now */}
        <Rect x="0" y="280" width="400" height="320" fill="#A9C97E" />
        <Path
          d="M0 280 Q200 265 400 280 L400 300 L0 300 Z"
          fill="#97BC6C"
          opacity="0.6"
        />
      </Svg>

      {/* decoration slots, filled in purchase order */}
      {DECORATION_SLOTS.map((slot, i) => {
        const decId = ownedDecorations[i];
        const dec = decId ? DECORATIONS.find((d) => d.id === decId) : null;
        if (!dec) return null;
        return (
          <View key={i} style={[styles.decorationSlot, slot as any]}>
            <DecorationIcon category={dec.category} size={44} />
          </View>
        );
      })}

      <View style={styles.hudTop}>
        <View style={styles.coinsPill}>
          <Text style={styles.coinsIcon}>🪙</Text>
          <Text style={styles.coinsText}>{coins}</Text>
        </View>
      </View>

      {/* three buildings */}
      <PressableScale
        style={[styles.building, { left: "16%", top: "52%" }]}
        onPress={() => setActiveScreen("silo")}
      >
        <SiloBuilding />
        <Text style={styles.buildingLabel}>Silo</Text>
      </PressableScale>

      <PressableScale
        style={[styles.building, { left: "50%", top: "48%", marginLeft: -40 }]}
        onPress={() => setActiveScreen("greenhouse")}
      >
        <GreenhouseBuilding />
        <Text style={styles.buildingLabel}>Greenhouse</Text>
      </PressableScale>

      <PressableScale
        style={[styles.building, { left: "78%", top: "58%" }]}
        onPress={() => setActiveScreen("truck")}
      >
        <TruckBuilding />
        <Text style={styles.buildingLabel}>Truck</Text>
      </PressableScale>

      <SiloScreen
        visible={activeScreen === "silo"}
        onClose={() => setActiveScreen(null)}
        onPlanted={loadEverything}
      />
      <GreenhouseScreen
        visible={activeScreen === "greenhouse"}
        onClose={() => setActiveScreen(null)}
        onChanged={loadEverything}
      />
      <TruckScreen
        visible={activeScreen === "truck"}
        onClose={() => setActiveScreen(null)}
        onPurchased={loadEverything}
      />
    </View>
  );
}

function SiloBuilding() {
  return (
    <Svg width="72" height="90" viewBox="0 0 72 90">
      <Ellipse cx="36" cy="18" rx="20" ry="8" fill="#D9A441" />
      <Rect x="16" y="18" width="40" height="55" fill="#E8C27A" />
      <Path d="M16 18 Q36 4 56 18" fill="#C1683A" />
      <Ellipse cx="36" cy="73" rx="20" ry="7" fill="#C48A3A" />
      {[30, 45, 60].map((y) => (
        <Path
          key={y}
          d={`M16 ${y} Q36 ${y + 6} 56 ${y}`}
          stroke="#C48A3A"
          strokeWidth="2"
          fill="none"
          opacity="0.5"
        />
      ))}
    </Svg>
  );
}

function GreenhouseBuilding() {
  return (
    <Svg width="90" height="90" viewBox="0 0 90 90">
      <Path d="M10 40 L45 15 L80 40 Z" fill="#B9D99A" opacity="0.9" />
      <Rect x="14" y="40" width="62" height="42" fill="#CDE8B8" opacity="0.7" />
      <Path
        d="M10 40 L45 15 L80 40 M14 40 L14 82 M76 40 L76 82 M14 82 L76 82 M45 15 L45 40"
        stroke="#7CA95A"
        strokeWidth="2"
        fill="none"
      />
      <Rect x="38" y="60" width="14" height="22" fill="#8B5E3C" />
    </Svg>
  );
}

function TruckBuilding() {
  return (
    <Svg width="90" height="70" viewBox="0 0 90 70">
      <Rect x="8" y="28" width="46" height="24" rx="3" fill="#C1683A" />
      <Path d="M54 32 L74 32 L82 44 L82 52 L54 52 Z" fill="#D9A441" />
      <Rect x="58" y="36" width="14" height="10" fill="#CDE8FF" opacity="0.7" />
      <Circle cx="24" cy="56" r="8" fill="#3D2B1F" />
      <Circle cx="24" cy="56" r="3" fill="#8A7860" />
      <Circle cx="68" cy="56" r="8" fill="#3D2B1F" />
      <Circle cx="68" cy="56" r="3" fill="#8A7860" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  scene: { flex: 1 },
  hudTop: { position: "absolute", top: Spacing.sm, right: Spacing.sm },
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
  building: { position: "absolute", alignItems: "center" },
  buildingLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    color: Colors.ink,
    backgroundColor: "rgba(255,255,255,0.85)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.pill,
    marginTop: 2,
  },
  decorationSlot: { position: "absolute", marginLeft: -22, marginTop: -22 },
});
