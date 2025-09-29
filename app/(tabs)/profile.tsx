import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { apiService } from '../../src/services/api';

const ProfileScreen: React.FC = () => {
  const { role, userId, name, lastName, email } = useLocalSearchParams<{ role: string; userId: string; name: string; lastName: string; email: string }>();
  const router = useRouter();
  
  const handleLogout = async () => {
    console.log('ProfileScreen: Logout initiated');
    try {
      await apiService.logout();
      console.log('ProfileScreen: Logout successful');
      router.replace('/');
    } catch (error) {
      console.error('Logout failed', error);
      router.replace('/');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileItem}>
        <Text style={styles.label}>Name:</Text>
        <Text style={styles.value}>{name}</Text>
      </View>
      <View style={styles.profileItem}>
        <Text style={styles.label}>Last Name:</Text>
        <Text style={styles.value}>{lastName}</Text>
      </View>
      <View style={styles.profileItem}>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{email}</Text>
      </View>
      <View style={styles.profileItem}>
        <Text style={styles.label}>Role:</Text>
        <Text style={styles.value}>{role}</Text>
      </View>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6fbfc',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#006d77',
    marginBottom: 24,
    textAlign: 'center',
  },
  profileItem: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#006d77',
  },
  value: {
    fontSize: 16,
    color: '#555',
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;