import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
     <Stack.Screen name="index" options={{headerTitle: "wassup freddie mane"}}/> 
     <Stack.Screen name="about" options={{headerTitle: "kill da freddie mane"}}/> 
    </Stack>
  );
}
