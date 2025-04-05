import React, { useEffect, useState } from "react";
import { Text, View, StyleSheet } from "react-native";
import { Link } from "expo-router";
import { IconButton } from "react-native-paper";
import * as Font from "expo-font"; // expo-fontをインポート
import "react-native-get-random-values";
export default function Index() {
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    // 副作用の処理
    async function loadFonts() {
      // 非同期関数に変更
      await Font.loadAsync({
        // フォントを読み込む
        Caveat: require("../assets/fonts/Caveat-VariableFont_wght.ttf"), // フォントファイルのパスを修正
      });
      setLoading(true); // フォント読み込み後にローディング状態をtrueにする
    }
    loadFonts(); // 関数を実行
  }, []);

  if (!loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  } else {
    return (
      <View style={styles.container}>
        <View style={styles.contents}>
          <View style={[styles.absoluteBox, styles.pageTitle]}>
            <View style={styles.title}>
              <Text style={styles.titleText}>Coffee Note</Text>
            </View>
          </View>
          <View style={[styles.buttons, styles.homeButtons]}>
            <Link href="/create" style={[styles.button, styles.homeButton]}>
              <IconButton icon="plus" size={50} iconColor="#D2B48C" />
            </Link>
            <Link href="/list" style={[styles.button, styles.homeButton]}>
              <IconButton icon="view-list" size={50} iconColor="#D2B48C" />
            </Link>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  contents: {
    flex: 1,
    justifyContent: "center", // 縦方向の中心に配置
    alignItems: "center", // 横方向の中心に配置
  },
  absoluteBox: {
    flex: 1,
    justifyContent: "center", // 縦方向の中心に配置
    position: "absolute",
    left: 0,
    right: 0,
  },
  title: {
    alignItems: "center",
  },
  titleText: {
    fontFamily: "Caveat",
    color: "#D2B48C",
    fontSize: 48,
  },
  buttons: {},
  homeButtons: { flexDirection: "column" },
  button: {
    textDecorationLine: "underline",

    marginVertical: 10,
  },
  pageTitle: { top: 80, height: 80 },
  homeButton: {
    // color: "#007BFF",
    backgroundColor: "#6f4e37",
    borderRadius: 10,
  },
});
