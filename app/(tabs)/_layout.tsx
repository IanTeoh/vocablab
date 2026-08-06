import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Fonts } from "../../constants/theme";

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

  return (
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
        name="coming-soon1"
        options={{
          title: "Soon",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              iconOutline="leaf-outline"
              iconFilled="leaf"
              label="Soon"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="coming-soon2"
        options={{
          title: "Soon",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              iconOutline="extension-puzzle-outline"
              iconFilled="extension-puzzle"
              label="Soon"
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
