import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { UserInfo, useUser } from '../../src/contexts/UserContext';
import { apiService } from '../../src/services/api';

const ProfileScreen: React.FC = () => {
  const { user, setUser } = useUser();
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [permisoNotificaciones, setPermisoNotificaciones] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [editedUser, setEditedUser] = useState({
    name: user?.name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    identification: user?.identification || '',
    phone: user?.phone || '',
    genero: user?.genero || '',
    dob: user?.dob || '',
  });
  const [selectedDate, setSelectedDate] = useState(new Date());

  const checkPermisos = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    const preferencia = await AsyncStorage.getItem('notificaciones_activas');
    setPermisoNotificaciones(status === 'granted' && preferencia === 'true');
    setLoading(false);
  }

  const loadUserProfile = React.useCallback(async () => {
    try {
      let response;
      if (user?.role === 'patient') {
        response = await apiService.getPatientProfile();
      } else if (user?.role === 'doctor') {
        response = await apiService.getDoctorProfile();
      }
      if (response?.success && response.data) {
        setUser({ ...user, ...response.data } as UserInfo);
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  }, [user, setUser]);

  useEffect(() => {
    checkPermisos();
    if (user) {
      setEditedUser({
        name: user.name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        identification: user.identification || '',
        phone: user.phone || '',
        genero: user.genero || '',
        dob: user.dob || '',
      });
      // Initialize selectedDate from user.dob
      if (user.dob) {
        setSelectedDate(new Date(user.dob));
      } else {
        setSelectedDate(new Date());
      }
    } else {
      // If no user, try to load profile from API
      loadUserProfile();
    }
  }, [user, loadUserProfile]);

  useFocusEffect(
    React.useCallback(() => {
      checkPermisos();
      console.log('User entered profile screen. User information:', user);
    }, [user])
  )


  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  const handleSaveProfile = async () => {
    try {
      // Ensure dob is in string format for API
      const userToSave = {
        ...editedUser,
        dob: selectedDate.toISOString().split('T')[0],
      };

      let response;
      if (user?.role === 'patient') {
        response = await apiService.updateOwnProfile(userToSave);
      } else if (user?.role === 'doctor') {
        response = await apiService.updateOwnDoctorProfile(userToSave);
      } else {
        Alert.alert('Error', 'Unable to update profile for this role');
        return;
      }

      if (response.success) {
        setUser({ ...user, ...userToSave });
        setIsEditing(false);
        Alert.alert('Success', 'Profile updated successfully');
      } else {
        Alert.alert('Error', response.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Update profile failed', error);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleCancelEdit = () => {
    setEditedUser({
      name: user?.name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      identification: user?.identification || '',
      phone: user?.phone || '',
      genero: user?.genero || '',
      dob: user?.dob || '',
    });
    // Reset selectedDate to original user.dob
    if (user?.dob) {
      setSelectedDate(new Date(user.dob));
    } else {
      setSelectedDate(new Date());
    }
    setIsEditing(false);
  };

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={[styles.container, { paddingBottom: 100 }]}>
      <View style={styles.profileItem}>
        <Text style={styles.label}>Name:</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={editedUser.name}
            onChangeText={(text) => setEditedUser({ ...editedUser, name: text })}
          />
        ) : (
          <Text style={styles.value}>{user?.name}</Text>
        )}
      </View>
      <View style={styles.profileItem}>
        <Text style={styles.label}>Last Name:</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={editedUser.last_name}
            onChangeText={(text) => setEditedUser({ ...editedUser, last_name: text })}
          />
        ) : (
          <Text style={styles.value}>{user?.last_name}</Text>
        )}
      </View>
      <View style={styles.profileItem}>
        <Text style={styles.label}>Email:</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={editedUser.email}
            onChangeText={(text) => setEditedUser({ ...editedUser, email: text })}
            keyboardType="email-address"
          />
        ) : (
          <Text style={styles.value}>{user?.email}</Text>
        )}
      </View>
      <View style={styles.profileItem}>
        <Text style={styles.label}>Identification:</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={editedUser.identification}
            onChangeText={(text) => setEditedUser({ ...editedUser, identification: text })}
          />
        ) : (
          <Text style={styles.value}>{user?.identification}</Text>
        )}
      </View>
      <View style={styles.profileItem}>
        <Text style={styles.label}>Phone:</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={editedUser.phone}
            onChangeText={(text) => setEditedUser({ ...editedUser, phone: text })}
            keyboardType="phone-pad"
          />
        ) : (
          <Text style={styles.value}>{user?.phone}</Text>
        )}
      </View>
      <View style={styles.profileItem}>
        <Text style={styles.label}>Gender:</Text>
        {isEditing ? (
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={editedUser.genero}
              onValueChange={(itemValue) => setEditedUser({ ...editedUser, genero: itemValue })}
              style={styles.picker}
            >
              <Picker.Item label="Select Gender" value="" />
              <Picker.Item label="Male" value="M" />
              <Picker.Item label="Female" value="F" />
              <Picker.Item label="Other" value="otro" />
            </Picker>
          </View>
        ) : (
          <Text style={styles.value}>{user?.genero}</Text>
        )}
      </View>
      <View style={styles.profileItem}>
        <Text style={styles.label}>Date of Birth:</Text>
        {isEditing ? (
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.value}>
              {selectedDate.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.value}>{user?.dob}</Text>
        )}
      </View>
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) {
              setSelectedDate(date);
              setEditedUser({ ...editedUser, dob: date.toISOString().split('T')[0] });
            }
          }}
        />
      )}
      <View style={styles.profileItem}>
        <Text style={styles.label}>Role:</Text>
        <Text style={styles.value}>{user?.role}</Text>
      </View>
      {isEditing ? (
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f6fbfc',
    padding: 24,
  },
  scrollView: {
    flex: 1,
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
  input: {
    fontSize: 16,
    color: '#555',
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  saveButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginLeft: 8,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginTop: 4,
  },
  picker: {
    height: 50,
    width: '100%',
  },
});

export default ProfileScreen;