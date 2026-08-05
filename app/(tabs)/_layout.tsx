import { Tabs } from "expo-router";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Fonts, Radius } from "../../constants/theme";

function TabIcon({
  emoji,
  label,
  focused,
}: {
  emoji: string;
  label: string;
  focused: boolean;
}) {
  return (
    <View
      style={{
        minWidth: 64,
        minHeight: 48,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: Radius.sm,
        backgroundColor: focused ? Colors.primary + "26" : "transparent",
      }}
    >
      <Text style={{ fontSize: 20 }}>{emoji}</Text>
      <Text
        style={{
          fontFamily: Fonts.bodySemiBold,
          fontSize: 11,
          marginTop: 2,
          color: focused ? Colors.primary : Colors.inkMuted,
        }}
      >
        {label}
      </Text>
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
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          height: 58 + insets.bottom,
          paddingTop: 8,
          paddingBottom: insets.bottom,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Today",
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📖" label="Today" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="coming-soon"
        options={{
          title: "Coming Soon",
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="✨" label="Soon" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="👤" label="Profile" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
