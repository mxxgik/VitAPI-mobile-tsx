import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Tabs, useRouter} from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AuthGuard from '../../src/components/AuthGuard';
import { apiService } from '../../src/services/api';
import { useUser } from '../../src/contexts/UserContext';
import { theme } from '../../src/styles/theme';
import { handleApiError } from '../../src/utils/errorHandler';

function AdminTabLayoutContent() {
  const { setUser } = useUser();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await apiService.logout();
      setUser(null);
      router.replace('/');
    } catch (error) {
      handleApiError(error, 'Logout failed');
      setUser(null);
      router.replace('/');
    }
  };

  return (
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
        headerRight: () => (
          <TouchableOpacity
            onPress={handleLogout}
            style={{ marginRight: theme.spacing.md }}
            accessibilityLabel="Logout"
            accessibilityHint="Logs out the current user"
          >
            <Ionicons name="log-out" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        ),
      }}
    >
      <Tabs.Screen
        name="users"
        options={{
          title: 'Users',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />
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
        name="specialties"
        options={{
          title: 'Specialties',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="entities"
        options={{
          title: 'Entities',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="medkit" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

export default function AdminTabLayout() {
  return (
    <AuthGuard requireRole="admin">
      <AdminTabLayoutContent />
    </AuthGuard>
  );
}