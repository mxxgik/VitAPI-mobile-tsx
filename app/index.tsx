import { useUser } from '@/src/contexts/UserContext';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { apiService } from '../src/services/api';
import { handleApiError, showSuccessMessage } from '../src/utils/errorHandler';
import { theme } from '../src/styles/theme';
import { validateEmail, validateRequired } from '../src/utils/validation';

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setUser } = useUser();

  useEffect(() => {
    Notifications.setNotificationHandler({

      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldShowBanner: true,

        shouldShowList: true,

        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    const getPermisos = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Se requieren los permisos para recibir notificaciones');
      }
    }
    getPermisos();
  }, []);

  const handleLogin = async () => {
    if (!validateRequired(email) || !validateRequired(password)) {
      Alert.alert("Missing fields", "Please enter email and password");
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert("Invalid email", "Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const response = await apiService.login(email, password);
      setLoading(false);
      if (response.success) {
        console.log('Login response user_info:', response.user_info);
        setUser(response.user_info);
        showSuccessMessage(`Welcome back, ${response.user_info.name}`);
        if (response.user_info.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/appointments');
        }
      } else {
        Alert.alert("Login failed", response.message);
      }
    } catch (error) {
      setLoading(false);
      handleApiError(error, "Login failed");
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
    backgroundColor: theme.colors.background,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
  },
  input: {
    width: "100%",
    height: 48,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    fontSize: theme.fontSize.md,
  },
  button: {
    width: "100%",
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.xl,
  },
  buttonText: {
    color: theme.colors.surface,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
  },
  link: {
    color: theme.colors.secondary,
    fontSize: theme.fontSize.sm,
    marginTop: theme.spacing.xs,
  },
});

export default LoginScreen;
