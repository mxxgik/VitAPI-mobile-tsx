import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUser } from '../src/contexts/UserContext';

const AdminScreen: React.FC = () => {
  const { user, setUser } = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('users');

  if (!user || user.role !== 'admin') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Access Denied</Text>
        <Text style={styles.subtitle}>Administrator access required</Text>
      </View>
    );
  }

  const tabs = [
    { key: 'users', label: 'Users', icon: 'people' },
    { key: 'appointments', label: 'Appointments', icon: 'calendar' },
    { key: 'specialties', label: 'Specialties', icon: 'list' },
    { key: 'healthcare-providers', label: 'Entities', icon: 'medkit' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return <Text style={styles.contentText}>Users Management</Text>;
      case 'appointments':
        return <Text style={styles.contentText}>Appointments Management</Text>;
      case 'specialties':
        return <Text style={styles.contentText}>Specialties Management</Text>;
      case 'healthcare-providers':
        return <Text style={styles.contentText}>Healthcare Providers Management</Text>;
      default:
        return <Text style={styles.contentText}>Select a tab</Text>;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { setUser(null); router.replace('/'); }} style={styles.logoutButton}>
          <Ionicons name="log-out" size={24} color="#006d77" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.content}>
        {renderContent()}
      </ScrollView>
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => setActiveTab(tab.key)}
          >
            <Ionicons
              name={tab.icon as any}
              size={24}
              color={activeTab === tab.key ? '#00a896' : '#888'}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.activeTabText,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6fbfc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 10,
    backgroundColor: '#f6fbfc',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    color: '#006d77',
    marginLeft: 5,
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#f6fbfc',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 15,
  },
  tabText: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  activeTabText: {
    color: '#00a896',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  contentText: {
    fontSize: 18,
    color: '#006d77',
    textAlign: 'center',
  },
});

export default AdminScreen;