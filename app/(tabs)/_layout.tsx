import { Tabs } from "expo-router";
import { Text } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#e65100",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Today",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>📖</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="coming-soon"
        options={{
          title: "Coming Soon",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>✨</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>👤</Text>
          ),
        }}
      />
    </Tabs>
  );
}
