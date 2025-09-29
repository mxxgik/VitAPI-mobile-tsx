import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const AppointmentsScreen: React.FC = () => {
  return (
    <ScrollView style={styles.content}>
      <Text style={styles.contentText}>Appointments Management</Text>
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

export default AppointmentsScreen;