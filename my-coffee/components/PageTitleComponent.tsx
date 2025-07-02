import React from "react";
import { Text, View, StyleSheet } from "react-native";

const PageTitleComponent = (props: { TextData: string }) => {
  return (
    <View style={[styles.absoluteBox, styles.pageTitle]}>
      <View style={styles.title}>
        <Text style={styles.titleText}>{props.TextData}</Text>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  absoluteBox: {
    flex: 1,
    justifyContent: "center", // 縦方向の中心に配置
    alignItems: "center", // 横方向の中心に配置
    position: "absolute",
    left: 0,
    right: 0,
  },
  pageTitle: {
    width: "100%",
    height: "100%",
    maxHeight: 120,
    top: 80,
  },
  title: {
    width: "100%",
    height: "100%",
    textAlign: "center",
    flexDirection: "column",
    justifyContent: "center",
  },
  titleText: {
    width: "100%",
    height: "auto",
    textAlign: "center",
    fontFamily: "Caveat",
    color: "#D2B48C",
    fontSize: 32,
  },
});
export default PageTitleComponent;
