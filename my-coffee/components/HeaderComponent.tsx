import React from "react";
import { View, StyleSheet } from "react-native";
import { Link } from "expo-router";
import { IconButton } from "react-native-paper";

// ヘッダーコンポーネントを定義
const HeaderComponent = () => {
  return (
    <View style={[styles.absoluteBox, styles.header]}>
      <View style={[styles.buttons, styles.headerButtons]}>
        <Link href="/" style={styles.button}>
          <IconButton icon="home" size={50} iconColor="#D2B48C" />
        </Link>
        <View style={styles.border}></View>
        <Link href="/create" style={styles.button}>
          <IconButton icon="plus" size={50} iconColor="#D2B48C" />
        </Link>
        <View style={styles.border}></View>
        <Link href="/list" style={styles.button}>
          <IconButton icon="view-list" size={50} iconColor="#D2B48C" />
        </Link>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  absoluteBox: {
    flex: 1,
    justifyContent: "center",
    position: "absolute",
    left: 0,
    right: 0,
  },
  header: {
    width: "100%",
    backgroundColor: "#6F4E37",
    top: 0,
    height: 80,
  },
  buttons: {},
  headerButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  button: {
    width: 100,
    textAlign: "center",
    textDecorationLine: "underline",
  },
  border: { width: 1, height: 60, backgroundColor: "#D2B48C" },
});

export default HeaderComponent;
