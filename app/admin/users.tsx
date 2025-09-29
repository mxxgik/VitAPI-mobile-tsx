import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const UsersScreen: React.FC = () => {
  return (
    <ScrollView style={styles.content}>
      <Text style={styles.contentText}>Users Management</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
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

export default UsersScreen;