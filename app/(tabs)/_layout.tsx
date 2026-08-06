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
        minWidth: 56,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 6,
        paddingHorizontal: 8,
        borderRadius: Radius.sm,
        backgroundColor: focused ? Colors.primary + "26" : "transparent",
      }}
    >
      <Text style={{ fontSize: 18 }}>{emoji}</Text>
      <Text
        style={{
          fontFamily: Fonts.bodySemiBold,
          fontSize: 10,
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
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🏠" label="Home" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="idioms"
        options={{
          title: "Idioms",
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="💬" label="Idioms" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="coming-soon1"
        options={{
          title: "Soon",
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🌱" label="Soon" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="coming-soon2"
        options={{
          title: "Soon",
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🧩" label="Soon" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Me",
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="👤" label="Me" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
