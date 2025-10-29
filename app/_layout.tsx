import { Stack } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { UserProvider } from "../src/contexts/UserContext";
import { theme } from "../src/styles/theme";
import { initializeNotifications } from "../src/utils/notificationService";
import { useEffect } from "react";

export default function RootLayout() {
  useEffect(() => {
    initializeNotifications();
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <UserProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{ headerTitle: "Login" }} />
            <Stack.Screen name="admin" options={{ headerTitle: "Admin" }} />
            <Stack.Screen name="create-appointment" options={{ headerTitle: "Create Appointment" }} />
            <Stack.Screen name="auth/login" options={{ headerTitle: "Login" }} />
            <Stack.Screen name="auth/register" options={{ headerTitle: "Register" }} />
          </Stack>
        </UserProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
