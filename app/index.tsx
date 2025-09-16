import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function Index() {
  return (
    <View style = {styles.container}>
      <Text> dafreddiemane  </Text>
      <Link href={"/about"} style = {styles.button}>
        go to killdafreddiemane
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f2b4ff",
  },
  
  button:{
   fontSize: 20,
   textDecorationLine: "underline", 
   color: "#fff"
  }
});
