import { View, StyleSheet } from "react-native";
import { Link, Stack } from "expo-router";
import React from "react";
export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops! Not Found" }} />
      <View style={styles.container}>
        <Link href="/" style={styles.button}>
          Go back to Home screen!
        </Link>
      </View>
    </>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#7D4A31",
  },
  button: {
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
    marginTop: 20,
  },
});
