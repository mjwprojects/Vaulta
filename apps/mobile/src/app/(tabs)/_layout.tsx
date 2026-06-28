import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#1469f5",
        tabBarInactiveTintColor: "#94a3b8",
        tabBarStyle: {
          borderTopWidth: 1, borderTopColor: "#e2e8f0",
          paddingBottom: 4, height: 60,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen name="home" options={{
        title: "Home",
        tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
      }} />
      <Tabs.Screen name="checkin" options={{
        title: "Check-in",
        tabBarIcon: ({ color, size }) => <Ionicons name="clipboard-outline" size={size} color={color} />,
      }} />
      <Tabs.Screen name="medications" options={{
        title: "Meds",
        tabBarIcon: ({ color, size }) => <Ionicons name="medical-outline" size={size} color={color} />,
      }} />
      <Tabs.Screen name="sos" options={{
        title: "SOS",
        tabBarIcon: ({ color, size }) => <Ionicons name="alert-circle" size={size} color={color} />,
        tabBarActiveTintColor: "#ef4444",
      }} />
      <Tabs.Screen name="profile" options={{
        title: "Profile",
        tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
      }} />
    </Tabs>
  );
}
