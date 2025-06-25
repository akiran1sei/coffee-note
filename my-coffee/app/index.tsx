import React, { useEffect, useState } from "react";
import { Text, View, StyleSheet } from "react-native";
import { Link } from "expo-router";
import { IconButton } from "react-native-paper";
import * as Font from "expo-font"; // expo-fontをインポート
import "react-native-get-random-values";
import { LoadingComponent } from "@/components/MessageComponent";
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
    return <LoadingComponent />;
  } else {
    return (
      <View style={styles.container}>
        <View style={styles.contents}>
          <View style={styles.mainContents}>
            <View style={styles.pageTitle}>
              <View style={styles.title}>
                <Text style={styles.titleText}>Coffee Note</Text>
              </View>
            </View>
            <View style={styles.homeButtons}>
              <Link href="/create" style={styles.button}>
                <IconButton icon="plus" size={50} iconColor="#D2B48C" />
              </Link>
              <Link href="/list" style={styles.button}>
                <IconButton icon="view-list" size={50} iconColor="#D2B48C" />
              </Link>
            </View>
            <View style={styles.settingButtonContainer}>
              <Link
                href="/settings/PrivacyPolicyJP"
                style={styles.settingButton}
              >
                <IconButton icon="cog" size={30} iconColor="#D2B48C" />
              </Link>
            </View>
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
  },
  mainContents: {
    flex: 1,
    justifyContent: "center", // 縦方向の中心に配置
    alignItems: "center", // 横方向の中心に配置
  },
  title: {
    width: "100%",
    alignItems: "center",
  },
  titleText: {
    width: "100%",
    textAlign: "center",
    fontFamily: "Caveat",
    color: "#D2B48C",
    fontSize: 48,
  },

  homeButtons: { flexDirection: "column" },
  button: {
    textDecorationLine: "underline",
    backgroundColor: "#6f4e37",
    borderRadius: 10,
    marginVertical: 10,
  },
  settingButtonContainer: {
    position: "absolute",
    alignItems: "center",
    bottom: 10,
    right: 10,
    justifyContent: "center",
  },
  settingButton: {
    textDecorationLine: "underline",

    borderRadius: 10,
    marginVertical: 5,
    marginTop: 20,
  },

  pageTitle: { width: "100%", height: 80 },
});
