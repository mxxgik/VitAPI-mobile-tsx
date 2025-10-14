import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { apiService } from '../../src/services/api';
import { useUser } from '../../src/contexts/UserContext';

const ProfileScreen: React.FC = () => {
  const { user, setUser } = useUser();
  const router = useRouter();
  
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