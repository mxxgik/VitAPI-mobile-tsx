import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#00a896',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          backgroundColor: '#f6fbfc',
          borderTopColor: '#ccc',
          borderTopWidth: 1,
        },
        headerStyle: {
          backgroundColor: '#f6fbfc',
        },
        headerTintColor: '#006d77',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerStatusBarHeight: 0,
      }}
    >
      <Tabs.Screen
        name="appointments"
        options={{
          title: 'Appointments',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="past-appointments"
        options={{
          title: 'Past',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}