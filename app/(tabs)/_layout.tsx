import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useEffect, useState } from "react";
import { AppState, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AchievementToast from "../../components/AchievementToast";
import { Colors, Fonts } from "../../constants/theme";
import { checkForNewAchievements } from "../../logic/achievements";
import { getCurrentUser } from "../../logic/auth";
import { pushProgressToCloud } from "../../logic/fullProgressSync";
import { syncStatsToCloud } from "../../logic/profileSync";

const CHECK_INTERVAL_MS = 3000;
const SYNC_INTERVAL_MS = 60000;

function TabIcon({
  iconOutline,
  iconFilled,
  label,
  focused,
}: {
  iconOutline: keyof typeof Ionicons.glyphMap;
  iconFilled: keyof typeof Ionicons.glyphMap;
  label: string;
  focused: boolean;
}) {
  return (
    <View style={styles.wrap}>
      <View style={[styles.overline, focused && styles.overlineActive]} />
      <Ionicons
        name={focused ? iconFilled : iconOutline}
        size={22}
        color={focused ? Colors.primary : Colors.inkMuted}
      />
      <Text style={[styles.label, focused && styles.labelActive]}>{label}</Text>
    </View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const [newAchievements, setNewAchievements] = useState<any[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      checkForNewAchievements().then((found) => {
        if (found.length > 0) setNewAchievements((prev) => [...prev, ...found]);
      });
    }, CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function autoSync() {
      const user = getCurrentUser();
      if (!user) return;
      await pushProgressToCloud(user.uid);
      await syncStatsToCloud(user.uid);
    }

    const syncInterval = setInterval(autoSync, SYNC_INTERVAL_MS);

    // Also sync right as the app leaves the foreground, so closing
    // the app doesn't leave a gap until the next periodic tick.
    const appStateSub = AppState.addEventListener("change", (state) => {
      if (state === "background" || state === "inactive") {
        autoSync();
      }
    });

    return () => {
      clearInterval(syncInterval);
      appStateSub.remove();
    };
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: Colors.surface,
            borderTopWidth: 0,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            height: 64 + insets.bottom,
            paddingTop: 10,
            paddingBottom: insets.bottom,
            shadowColor: Colors.ink,
            shadowOffset: { width: 0, height: -3 },
            shadowOpacity: 0.1,
            shadowRadius: 10,
            elevation: 12,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ focused }) => (
              <TabIcon
                iconOutline="home-outline"
                iconFilled="home"
                label="Home"
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="idioms"
          options={{
            title: "Idioms",
            tabBarIcon: ({ focused }) => (
              <TabIcon
                iconOutline="chatbubble-ellipses-outline"
                iconFilled="chatbubble-ellipses"
                label="Idioms"
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="etymology"
          options={{
            title: "Roots",
            tabBarIcon: ({ focused }) => (
              <TabIcon
                iconOutline="leaf-outline"
                iconFilled="leaf"
                label="Roots"
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="garden"
          options={{
            title: "Garden",
            tabBarIcon: ({ focused }) => (
              <TabIcon
                iconOutline="flower-outline"
                iconFilled="flower"
                label="Garden"
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Me",
            tabBarIcon: ({ focused }) => (
              <TabIcon
                iconOutline="person-circle-outline"
                iconFilled="person-circle"
                label="Me"
                focused={focused}
              />
            ),
          }}
        />
      </Tabs>

      <AchievementToast
        achievements={newAchievements}
        onDismiss={() => setNewAchievements([])}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
    width: 56,
    paddingTop: 4,
  },
  overline: {
    width: 24,
    height: 3,
    borderRadius: 2,
    backgroundColor: "transparent",
    marginBottom: 6,
  },
  overlineActive: {
    backgroundColor: Colors.primary,
  },
  label: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 10,
    marginTop: 3,
    color: Colors.inkMuted,
  },
  labelActive: {
    color: Colors.primary,
  },
});
