import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Ellipse, Path, Rect } from "react-native-svg";
import { Colors, Fonts, Radius, Spacing } from "../constants/theme";
import { getCoins } from "../logic/coins";
import { DECORATIONS, getOwnedDecorations } from "../logic/garden";
import GardenBackground from "./GardenBackground";
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
      <GardenBackground />

      {/* fixed landscape scenery — always present, not tied to purchases */}
      <Image
        source={require("../assets/images/pine1.png")}
        style={[styles.sceneryTree, { left: "1%", top: "34%", width: 46, height: 46 }]}
        resizeMode="contain"
      />
      <Image
        source={require("../assets/images/pine2.png")}
        style={[styles.sceneryTree, { left: "10%", top: "38%", width: 34, height: 34 }]}
        resizeMode="contain"
      />
      <Image
        source={require("../assets/images/oak.png")}
        style={[styles.sceneryTree, { left: "85%", top: "32%", width: 58, height: 58 }]}
        resizeMode="contain"
      />
      <Image
        source={require("../assets/images/pine1.png")}
        style={[styles.sceneryTree, { left: "94%", top: "40%", width: 32, height: 32 }]}
        resizeMode="contain"
      />

      {/* decoration slots, filled in purchase order */}
      {DECORATION_SLOTS.map((slot, i) => {
        const decId = ownedDecorations[i];
        const dec = decId ? DECORATIONS.find((d) => d.id === decId) : null;
        if (!dec) return null;
        return (
          <View key={i} style={[styles.decorationSlot, slot as any]}>
            <DecorationIcon id={dec.id} category={dec.category} size={44} />
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
        style={[styles.building, { left: "50%", top: "48%", marginLeft: -48 }]}
        onPress={() => setActiveScreen("greenhouse")}
      >
        <Image
          source={require("../assets/images/barn.png")}
          style={{ width: 96, height: 96 }}
          resizeMode="contain"
        />
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
  sceneryTree: { position: "absolute" },
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