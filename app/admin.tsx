import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AdminScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>hello administrator</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f6fbfc',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#006d77',
  },
});

export default AdminScreen;