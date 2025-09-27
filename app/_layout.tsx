import { Stack } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
    <SafeAreaView style={{flex:1, backgroundColor: "#f6fbfc",}}>
    <Stack screenOptions={{headerShown: false}}>
     <Stack.Screen name="index" options={{headerTitle: "Login"}}/>
     <Stack.Screen name="appointments" options={{headerTitle: "Appointments"}}/>
     <Stack.Screen name="create-appointment" options={{headerTitle: "Create Appointment"}}/>
     <Stack.Screen name="auth/login" options={{headerTitle: "Login"}}/>
     <Stack.Screen name="auth/register" options={{headerTitle: "Register"}}/>
    </Stack>
    </SafeAreaView>
    </SafeAreaProvider>
  );
}
