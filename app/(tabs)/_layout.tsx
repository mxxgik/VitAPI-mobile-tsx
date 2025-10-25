import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AuthGuard from '../../src/components/AuthGuard';
import { theme } from '../../src/styles/theme';

export default function TabLayout() {
  return (
    <AuthGuard>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textLight,
          tabBarStyle: {
            backgroundColor: theme.colors.background,
            borderTopColor: theme.colors.border,
            borderTopWidth: 1,
          },
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
          headerTintColor: theme.colors.text,
          headerTitleStyle: {
            fontWeight: theme.fontWeight.bold,
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
    </AuthGuard>
  );
}