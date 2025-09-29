import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
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

  useEffect(() => {
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

    fetchEntities();
  }, []);

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
    </View>
  );

  return (
    <View style={styles.content}>
      <Text style={styles.header}>Entities</Text>
      <FlatList
        data={entities}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.emptyText}>No entities found</Text>}
      />
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
});

export default EntitiesScreen;