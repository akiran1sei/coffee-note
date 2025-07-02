// src/styles/GlobalStyles.ts
import { StyleSheet, Dimensions } from "react-native";

const { width: screenWidth } = Dimensions.get("window");

export const GlobalStyles = StyleSheet.create({
  // 基本レイアウト
  container: {
    flex: 1,
  },
  contents: {
    flex: 1,
  },
  absoluteBox: {
    flex: 1,
    position: "absolute",
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
  },
  mainContents: {
    width: "100%",
    maxWidth: screenWidth > 768 ? 700 : "100%",
    marginHorizontal: "auto",
    top: 200, // HeaderComponent + PageTitleComponent の高さに応じて調整
    bottom: 0,
  },
  scrollContainer: {
    // スクロール可能なコンテンツのコンテナスタイル
    alignItems: "stretch", // 通常は横幅いっぱいに広げる
  },
  sectionTitle: {
    color: "#5D4037",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    textAlign: "center",
  },
});
