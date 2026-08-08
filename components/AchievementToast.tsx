import * as Haptics from "expo-haptics";
import { useEffect, useRef, useState } from "react";
import { Animated, PanResponder, StyleSheet, Text, View } from "react-native";
import { Colors, Fonts, Radius, Spacing } from "../constants/theme";

type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
};

export default function AchievementToast({
  achievements,
  onDismiss,
}: {
  achievements: Achievement[];
  onDismiss: () => void;
}) {
  const [index, setIndex] = useState(0);
  const slideAnim = useRef(new Animated.Value(-120)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function advanceOrDismiss() {
    if (index + 1 < achievements.length) {
      setIndex((i) => i + 1);
    } else {
      onDismiss();
    }
  }

  function dismissCurrent(toValue = -200) {
    if (timerRef.current) clearTimeout(timerRef.current);
    Animated.timing(slideAnim, {
      toValue,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      advanceOrDismiss();
    });
  }

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => gesture.dy < -6,
      onPanResponderMove: (_, gesture) => {
        if (gesture.dy < 0) slideAnim.setValue(gesture.dy);
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy < -30 || gesture.vy < -0.5) {
          dismissCurrent(gesture.dy - 100);
        } else {
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            speed: 14,
          }).start();
        }
      },
    }),
  ).current;

  useEffect(() => {
    if (achievements.length === 0) return;
    setIndex(0);
  }, [achievements]);

  useEffect(() => {
    if (achievements.length === 0 || index >= achievements.length) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    slideAnim.setValue(-120);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      speed: 14,
    }).start();

    timerRef.current = setTimeout(() => dismissCurrent(), 2800);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [index, achievements]);

  if (achievements.length === 0 || index >= achievements.length) return null;
  const current = achievements[index];

  return (
    <Animated.View
      style={[styles.toast, { transform: [{ translateY: slideAnim }] }]}
      {...panResponder.panHandlers}
    >
      <Text style={styles.icon}>{current.icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>🏆 Achievement Unlocked!</Text>
        <Text style={styles.title}>{current.title}</Text>
        <Text style={styles.description}>{current.description}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    top: 0,
    left: Spacing.md,
    right: Spacing.md,
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 999,
    marginTop: 8,
  },
  icon: { fontSize: 34, marginRight: Spacing.sm },
  label: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 11,
    color: Colors.accent,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  title: {
    fontFamily: Fonts.displayBold,
    fontSize: 16,
    color: "#fff",
    marginTop: 2,
  },
  description: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: "rgba(255,255,255,0.85)",
    marginTop: 2,
  },
});
