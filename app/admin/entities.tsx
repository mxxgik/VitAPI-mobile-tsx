import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Modal, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { apiService } from '../../src/services/api';

interface Entity {
  id: number;
  name: string;
  code: string;
}

const EntitiesScreen: React.FC = () => {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<Entity | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
  });

  const fetchEntities = async () => {
    try {
      const response = await apiService.getEntities();
      if (response.success) {
        setEntities(response.data as Entity[]);
      } else {
        setError(response.message || 'Failed to fetch entities');
      }
    } catch (error) {
      setError('Error fetching entities' + error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchEntities();
    }, [])
  );

  const handleSubmitEntity = async () => {
    try {
      const response = isEditing && editingItem
        ? await apiService.updateEntity(editingItem.id.toString(), formData)
        : await apiService.createEntity(formData);
      if (response.success) {
        Alert.alert('Success', `Entity ${isEditing ? 'updated' : 'created'} successfully`);
        setModalVisible(false);
        setIsEditing(false);
        setEditingItem(null);
        setFormData({ name: '', code: '' });
        fetchEntities();
      } else {
        Alert.alert('Error', response.message || `Failed to ${isEditing ? 'update' : 'create'} entity`);
      }
    } catch (error) {
      Alert.alert('Error', `Failed to ${isEditing ? 'update' : 'create'} entity ` + error);
    }
  };

  const handleEditEntity = (item: Entity) => {
    setIsEditing(true);
    setEditingItem(item);
    setFormData({
      name: item.name,
      code: item.code,
    });
    setModalVisible(true);
  };

  const handleDeleteEntity = async (id: number) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this entity?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await apiService.deleteEntity(id.toString());
              if (response.success) {
                Alert.alert('Success', 'Entity deleted successfully');
                fetchEntities();
              } else {
                Alert.alert('Error', response.message || 'Failed to delete entity');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete entity' + error);
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

  const renderItem = ({ item }: { item: Entity }) => (
    <View style={styles.item}>
      <Text style={styles.itemTitle}>{item.name}</Text>
      <Text>Code: {item.code}</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.editButton} onPress={() => handleEditEntity(item)}>
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteEntity(item.id)}>
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
        setFormData({ name: '', code: '' });
        setModalVisible(true);
      }}>
        <Text style={styles.addButtonText}>Add New Entity</Text>
      </TouchableOpacity>
      <FlatList
        data={entities}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.emptyText}>No entities found</Text>}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>{isEditing ? 'Edit Entity' : 'Add New Entity'}</Text>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Code"
              value={formData.code}
              onChangeText={(text) => setFormData({ ...formData, code: text })}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={handleSubmitEntity}>
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

export default EntitiesScreen;