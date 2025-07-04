import React from "react";
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Link } from "expo-router";
import { IconButton } from "react-native-paper";
export const LoadingComponent = () => {
  return (
    <View style={styles.Overlay}>
      <ActivityIndicator size="large" color="#007bff" />
      <Text style={styles.loadingText}>ロード中...</Text>
    </View>
  );
};
export const NoRecordComponent = () => {
  return (
    <View style={styles.Overlay}>
      <Text style={styles.noRecordText}>コーヒーレコードが見つかりません</Text>
      <TouchableOpacity>
        <Link href="/" style={styles.button}>
          <IconButton icon="home" size={50} iconColor="#D2B48C" />
        </Link>
      </TouchableOpacity>
    </View>
  );
};
const styles = StyleSheet.create({
  Overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  noRecordText: {
    fontSize: 20, // 少し大きく
    color: "#ffffff", // 白に変更
    fontWeight: "bold", // 太字を追加
    marginBottom: 20, // ボタンとの間隔を空ける
    textAlign: "center", // 中央揃えにすると配置が整う
  },
  button: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 12, // 少しpaddingを大きく
    paddingHorizontal: 20, // 少しpaddingを大きく
    // marginLeft: 10, // 不要かもしれません。Overlayで中央揃えにしているので
    // width: 100, // アイコンに合わせて調整するか、テキストラベルを追加
    alignItems: "center", // アイコンを中央に配置
  },
  loadingText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 10,
  },
});
