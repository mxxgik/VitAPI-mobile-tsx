import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useUser } from '../../src/contexts/UserContext';
import { apiService } from '../../src/services/api';

const ProfileScreen: React.FC = () => {
  const { user, setUser } = useUser();
  const router = useRouter();
  const [permisoNotificaciones, setPermisoNotificaciones] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkPermisos = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    const preferencia = await AsyncStorage.getItem('notificaciones_activas');
    setPermisoNotificaciones(status === 'granted' && preferencia === 'true');
    setLoading(false);
  }

  useEffect(() => {
    checkPermisos();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      checkPermisos();
    }, [])
  )


  const toggleSwitch = async (valor: boolean) => {
    if (valor) {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') {
        await AsyncStorage.setItem('notificaciones_activas', 'true');
        setPermisoNotificaciones(true);
        alert('Permiso concedido');
      } else {
        await AsyncStorage.setItem('notificaciones_activas', 'false');
        setPermisoNotificaciones(false);
        alert('Permiso denegado');
      }
    } else {
      await AsyncStorage.setItem('notificaciones_activas', 'true');
      setPermisoNotificaciones(false);
      alert('Notificaciones desactivadas');

    }

  }

  const handleLogout = async () => {
    console.log('ProfileScreen: Logout initiated');
    try {
      await apiService.logout();
      console.log('ProfileScreen: Logout successful');
      setUser(null);
      router.replace('/');
    } catch (error) {
      console.error('Logout failed', error);
      setUser(null);
      router.replace('/');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileItem}>
        <Text style={styles.label}>Name:</Text>
        <Text style={styles.value}>{user?.name}</Text>
      </View>
      <View style={styles.profileItem}>
        <Text style={styles.label}>Last Name:</Text>
        <Text style={styles.value}>{user?.last_name}</Text>
      </View>
      <View style={styles.profileItem}>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{user?.email}</Text>
      </View>
      <View style={styles.profileItem}>
        <Text style={styles.label}>Role:</Text>
        <Text style={styles.value}>{user?.role}</Text>
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