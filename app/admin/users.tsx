import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Modal, TextInput, TouchableOpacity, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from '@react-navigation/native';
import { apiService } from '../../src/services/api';

interface User {
  id: number;
  name: string;
  last_name: string;
  email: string;
  identification: string;
  phone: string;
  role: string;
  genero: string;
}

const UsersScreen: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<User | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [formData, setFormData] = useState({
    entity_id: '',
    name: '',
    last_name: '',
    identification: '',
    dob: '',
    genero: '',
    phone: '',
    email: '',
  });

  const fetchUsers = async () => {
    try {
      const response = await apiService.getPatients();
      if (response.success) {
        setUsers(response.data as User[]);
      } else {
        setError(response.message || 'Failed to fetch users');
      }
    } catch (error) {
      setError('Error fetching users' + error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUsers();
    }, [])
  );

  const handleSubmitPatient = async () => {
    try {
      const patientData = {
        entity_id: parseInt(formData.entity_id),
        name: formData.name,
        last_name: formData.last_name,
        identification: formData.identification,
        dob: formData.dob,
        genero: formData.genero,
        phone: formData.phone,
        email: formData.email,
      };
      const response = isEditing && editingItem
        ? await apiService.updatePatient(editingItem.id.toString(), patientData)
        : await apiService.createPatient(patientData);
      if (response.success) {
        Alert.alert('Success', `Patient ${isEditing ? 'updated' : 'created'} successfully`);
        setModalVisible(false);
        setIsEditing(false);
        setEditingItem(null);
        setFormData({
          entity_id: '',
          name: '',
          last_name: '',
          identification: '',
          dob: '',
          genero: '',
          phone: '',
          email: '',
        });
        fetchUsers(); // Refresh list
      } else {
        Alert.alert('Error', response.message || `Failed to ${isEditing ? 'update' : 'create'} patient`);
      }
    } catch (error) {
      Alert.alert('Error', `Failed to ${isEditing ? 'update' : 'create'} patient ` + error);
    }
  };

  const handleEditPatient = (item: User) => {
    setIsEditing(true);
    setEditingItem(item);
    setFormData({
      entity_id: '', // Not available in item
      name: item.name,
      last_name: item.last_name,
      identification: item.identification,
      dob: '', // Not available
      genero: item.genero,
      phone: item.phone,
      email: item.email,
    });
    setModalVisible(true);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (event.type === 'set' && selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD format
      setFormData({ ...formData, dob: formattedDate });
    }
    setShowDatePicker(false);
  };

  const handleDeletePatient = async (id: number) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this patient?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await apiService.deletePatient(id.toString());
              if (response.success) {
                Alert.alert('Success', 'Patient deleted successfully');
                fetchUsers();
              } else {
                Alert.alert('Error', response.message || 'Failed to delete patient');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete patient' + error);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#006d77" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: User }) => (
    <View style={styles.item}>
      <Text style={styles.itemTitle}>{item.name} {item.last_name}</Text>
      <Text>Email: {item.email}</Text>
      <Text>Phone: {item.phone}</Text>
      <Text>Identification: {item.identification}</Text>
      <Text>Gender: {item.genero}</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.editButton} onPress={() => handleEditPatient(item)}>
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeletePatient(item.id)}>
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.content}>
      <TouchableOpacity style={styles.addButton} onPress={() => {
        setIsEditing(false);
        setEditingItem(null);
        setFormData({
          entity_id: '',
          name: '',
          last_name: '',
          identification: '',
          dob: '',
          genero: '',
          phone: '',
          email: '',
        });
        setModalVisible(true);
      }}>
        <Text style={styles.addButtonText}>Add New Patient</Text>
      </TouchableOpacity>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.emptyText}>No users found</Text>}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>{isEditing ? 'Edit Patient' : 'Add New Patient'}</Text>
            <TextInput
              style={styles.input}
              placeholder="Entity ID"
              value={formData.entity_id}
              onChangeText={(text) => setFormData({ ...formData, entity_id: text })}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Last Name"
              value={formData.last_name}
              onChangeText={(text) => setFormData({ ...formData, last_name: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Identification"
              value={formData.identification}
              onChangeText={(text) => setFormData({ ...formData, identification: text })}
            />
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={{ color: formData.dob ? '#000' : '#999' }}>
                {formData.dob || 'Select Date of Birth'}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={formData.dob ? new Date(formData.dob) : new Date()}
                mode="date"
                display="default"
                onChange={onDateChange}
                maximumDate={new Date()}
              />
            )}
            <Picker
              selectedValue={formData.genero}
              onValueChange={(itemValue) => setFormData({ ...formData, genero: itemValue })}
              style={styles.input}
            >
              <Picker.Item label="Male" value="M" />
              <Picker.Item label="Female" value="F" />
              <Picker.Item label="Other" value="Otro" />
            </Picker>
            <TextInput
              style={styles.input}
              placeholder="Phone"
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={handleSubmitPatient}>
                <Text style={styles.submitButtonText}>{isEditing ? 'Update' : 'Create'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#006d77',
    textAlign: 'center',
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#006d77',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  item: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'black',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#006d77',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  editButton: {
    backgroundColor: '#007bff',
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
    flex: 1,
    marginRight: 5,
  },
  editButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
    flex: 1,
    marginLeft: 5,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default UsersScreen;