
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert("Campos faltantes", "Por favor ingrese nombre y contraseña");
      return;
    }
    setLoading(true);

    // Simulate login API call
    setTimeout(() => {
      setLoading(false);
      Alert.alert("Login successful", `Welcome back, ${email}`);
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}></Text>
      <Text style={styles.subtitle}></Text>

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

      <TouchableOpacity>
        <Text style={styles.link}>¿No tienes una cuenta?, Registrate</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;

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
