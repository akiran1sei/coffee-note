// DebugComponent.js
import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";

const DebugComponent = (props: { imageUri: string }) => {
  if (!__DEV__) return null; // 開発環境でのみ表示

  return (
    <View style={styles.debugContainer}>
      <Text style={styles.debugTitle}>デバッグ情報</Text>
      <Text>Platform: {Platform.OS}</Text>
      <Text>Image URI Type: {typeof props.imageUri}</Text>
      <Text>Image URI: {props.imageUri?.substring(0, 50)}...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  debugContainer: {
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    marginVertical: 5,
  },
  debugTitle: {
    fontWeight: "bold",
    marginBottom: 5,
  },
});

export default DebugComponent;
