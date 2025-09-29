import { useUser } from '@/src/contexts/UserContext';
import { useRouter } from 'expo-router';
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { apiService } from '../src/services/api';

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setUser } = useUser();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing fields", "Please enter email and password");
      return;
    }
    setLoading(true);

    try {
      const response = await apiService.login(email, password);
      setLoading(false);
      if (response.success) {
        console.log('Login response user_info:', response.user_info);
        setUser(response.user_info);
        Alert.alert("Login successful", `Welcome back, ${response.user_info.name}`);
        if (response.user_info.role === 'admin') {
          router.push('/admin');
        } else {
          router.push(`/appointments?role=${response.user_info.role}&userId=${response.user_info.id}`);
        }
      } else {
        Alert.alert("Login failed", response.message);
      }
    } catch (error) {
      setLoading(false);
      Alert.alert("Login failed", "An error occurred" + error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Healthcare Login</Text>
      <Text style={styles.subtitle}>Access your appointments</Text>

      <TextInput
        style={styles.input}
        placeholder="Email Address"
        placeholderTextColor="#888"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        style={[styles.button, loading && { backgroundColor: "#9ac5cc" }]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? "Signing in..." : "Login"}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/auth/register')}>
        <Text style={styles.link}>Dont have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6fbfc",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#006d77",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    marginBottom: 24,
  },
  input: {
    width: "100%",
    height: 48,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  button: {
    width: "100%",
    backgroundColor: "#00a896",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 4,
    marginBottom: 18,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  link: {
    color: "#0077b6",
    fontSize: 15,
    marginTop: 6,
  },
});

export default LoginScreen;