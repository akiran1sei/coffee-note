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
    position: "absolute",
    left: 0,
    right: 0,
  },
  pageTitle: { top: 80, height: 80 },
  title: {
    alignItems: "center",
  },
  titleText: {
    fontFamily: "Caveat",
    color: "#D2B48C",
    fontSize: 48,
  },
});
export default PageTitleComponent;
