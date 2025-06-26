import React, { useEffect, useState } from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import { IconButton } from "react-native-paper";
import * as Font from "expo-font"; // expo-fontをインポート
import "react-native-get-random-values";
import { LoadingComponent } from "@/components/MessageComponent";
export default function Index() {
  const [loading, setLoading] = useState(false);
  const [switchState, setSwitchState] = useState(false); // switchの状態を管理するためのuseStateフックを追加
  const handleSwitch = () => {
    setSwitchState(!switchState); // switchの状態を反転させる
  };

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
            <View style={styles.settingContainer}>
              {switchState ? (
                <View style={styles.settingContainerWrap}>
                  <TouchableOpacity>
                    <Link
                      href="/settings/PrivacyPolicyJP"
                      style={styles.settingButton}
                    >
                      <Text style={styles.settingButtonText}>
                        プライバシーポリシー
                      </Text>
                    </Link>
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Link
                      href="/settings/TermsAndConditionsJP"
                      style={styles.settingButton}
                    >
                      <Text style={styles.settingButtonText}>利用規約</Text>
                    </Link>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.settingButtonClose}
                    onPress={() => {
                      handleSwitch();
                    }}
                  >
                    <IconButton icon="close" size={30} iconColor="#f5f5f5" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => {
                    handleSwitch();
                  }}
                >
                  <IconButton icon="cog" size={30} iconColor="#D2B48C" />
                </TouchableOpacity>
              )}
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
  settingContainer: {
    position: "absolute",
    alignItems: "center",
    bottom: 0,
    right: 0,
    justifyContent: "center",
  },

  settingContainerWrap: {
    backgroundColor: "#D2B48C",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    flexDirection: "column",
    alignItems: "center",
    position: "relative",
    width: "auto",
    height: "auto",
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 60,
  },
  settingButton: {
    textDecorationLine: "underline",
    borderRadius: 10,
    marginVertical: 5,
    marginTop: 20,
  },
  settingButtonClose: {
    position: "absolute",
    bottom: 0,
    right: 10,
  },
  settingButtonText: {
    color: "#f5f5f5",
    fontSize: 16,
  },

  pageTitle: { width: "100%", height: 80 },
});
