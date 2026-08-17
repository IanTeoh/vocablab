import * as Haptics from "expo-haptics";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Ellipse, Rect } from "react-native-svg";
import { Colors, Fonts, Radius, Spacing } from "../constants/theme";
import { getCoins } from "../logic/coins";
import {
  DECORATIONS,
  getOwnedDecorations,
  purchaseDecoration,
} from "../logic/garden";
import PressableScale from "./PressableScale";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const TREE_IMAGES: Record<string, any> = {
  pine: require("../assets/images/pine1.png"),
  tallPine: require("../assets/images/pine2.png"),
  oak: require("../assets/images/oak.png"),
};

export function DecorationIcon({
  id,
  category,
  size = 44,
}: {
  id?: string;
  category: string;
  size?: number;
}) {
  if (id && TREE_IMAGES[id]) {
    return (
      <Image
        source={TREE_IMAGES[id]}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 60 60">
      {category === "tree" && (
        <>
          <Rect x="27" y="38" width="6" height="16" fill="#8B5E3C" />
          <Circle cx="30" cy="28" r="18" fill="#6FA84A" />
        </>
      )}
      {category === "bush" && (
        <>
          <Ellipse cx="20" cy="38" rx="12" ry="10" fill="#7CBB55" />
          <Ellipse cx="38" cy="36" rx="14" ry="12" fill="#6FA84A" />
          <Circle cx="24" cy="32" r="4" fill="#E8A0A8" />
          <Circle cx="40" cy="30" r="4" fill="#F2C94C" />
        </>
      )}
      {category === "path" && (
        <>
          {[10, 24, 38, 52].map((x) => (
            <Rect
              key={x}
              x={x}
              y="20"
              width="6"
              height="24"
              rx="2"
              fill="#B99A6E"
            />
          ))}
          <Rect x="8" y="22" width="46" height="3" fill="#B99A6E" />
        </>
      )}
      {category === "decor" && (
        <>
          <Rect x="27" y="20" width="4" height="24" fill="#5C4530" />
          <Circle cx="29" cy="16" r="9" fill="#F2C94C" opacity="0.85" />
        </>
      )}
    </Svg>
  );
}

export default function TruckScreen({
  visible,
  onClose,
  onPurchased,
}: {
  visible: boolean;
  onClose: () => void;
  onPurchased: () => void;
}) {
  const [coins, setCoins] = useState(0);
  const [owned, setOwned] = useState<string[]>([]);
  const [flash, setFlash] = useState<string | null>(null);
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
    setCoins(await getCoins());
    setOwned(await getOwnedDecorations());
  }

  async function handleBuy(id: string) {
    const result = await purchaseDecoration(id);
    if (result.success) {
      setCoins(result.coins);
      setOwned(result.owned);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onPurchased();
    } else {
      setFlash("Not enough coins!");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setTimeout(() => setFlash(null), 1500);
    }
  }

  if (!shouldRender) return null;

  return (
    <Animated.View
      style={[styles.overlay, { transform: [{ translateY: slideAnim }] }]}
    >
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <Text style={styles.title}>🚚 Truck</Text>
          <View style={styles.coinsPill}>
            <Text style={styles.coinsIcon}>🪙</Text>
            <Text style={styles.coinsText}>{coins}</Text>
          </View>
        </View>
        <Text style={styles.subtitle}>
          Decorate your farm with what you've earned
        </Text>

        {flash && (
          <View style={styles.flashBanner}>
            <Text style={styles.flashText}>{flash}</Text>
          </View>
        )}

        <ScrollView contentContainerStyle={styles.list}>
          {DECORATIONS.map((dec) => {
            const isOwned = owned.includes(dec.id);
            return (
              <View key={dec.id} style={styles.decorationRow}>
                <DecorationIcon id={dec.id} category={dec.category} />
                <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                  <Text style={styles.decorationName}>{dec.name}</Text>
                  <Text style={styles.decorationCategory}>{dec.category}</Text>
                </View>
                {isOwned ? (
                  <View style={styles.ownedBadge}>
                    <Text style={styles.ownedBadgeText}>✅ Owned</Text>
                  </View>
                ) : (
                  <PressableScale
                    style={styles.buyButton}
                    onPress={() => handleBuy(dec.id)}
                  >
                    <Text style={styles.buyButtonText}>🪙{dec.price}</Text>
                  </PressableScale>
                )}
              </View>
            );
          })}
        </ScrollView>

        <PressableScale style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Close</Text>
        </PressableScale>
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
  coinsPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: Radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  coinsIcon: { fontSize: 14, marginRight: 4 },
  coinsText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: Colors.ink,
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.inkMuted,
    paddingHorizontal: Spacing.lg,
    marginTop: 4,
    marginBottom: Spacing.sm,
  },
  flashBanner: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.error,
    borderRadius: Radius.pill,
    paddingVertical: 8,
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  flashText: { fontFamily: Fonts.bodySemiBold, fontSize: 13, color: "#fff" },
  list: { paddingHorizontal: Spacing.lg, paddingBottom: 20 },
  decorationRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  decorationName: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.ink,
  },
  decorationCategory: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: Colors.inkMuted,
    textTransform: "capitalize",
  },
  buyButton: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.pill,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  buyButtonText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    color: "#fff",
  },
  ownedBadge: {
    backgroundColor: Colors.background,
    borderRadius: Radius.pill,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  ownedBadgeText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 11,
    color: Colors.success,
  },
  closeButton: {
    alignItems: "center",
    paddingVertical: Spacing.sm,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surface,
  },
  closeButtonText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.ink,
  },
});
