import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Tabs, useRouter} from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../../src/contexts/UserContext';
import { apiService } from '../../src/services/api';

export default function AdminTabLayout() {
  const { user, setUser } = useUser();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await apiService.logout();
      setUser(null);
      router.replace('/');
    } catch (error) {
      console.error('Logout failed', error);
      setUser(null);
      router.replace('/');
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Access Denied</Text>
        <Text style={styles.subtitle}>Administrator access required</Text>
      </View>
    );
  }

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
        headerRight: () => (
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out" size={24} color="#006d77" />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6fbfc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#006d77',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 10,
  },
  logoutButton: {
    marginRight: 15,
  },
});