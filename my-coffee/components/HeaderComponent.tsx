import React from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native"; // TouchableOpacity をインポート
import { useRouter } from "expo-router"; // useRouter をインポート
import { IconButton } from "react-native-paper";

// ヘッダーコンポーネントを定義
const HeaderComponent = () => {
  const router = useRouter(); // useRouter フックを使用

  return (
    <View style={[styles.absoluteBox, styles.header]}>
      <View style={[styles.buttons, styles.headerButtons]}>
        {/* Home ボタン */}
        {/* Link を TouchableOpacity に変更し、onPress で router.replace を呼び出す */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace("/")}
        >
          <IconButton icon="home" size={50} iconColor="#D2B48C" />
          {/* 必要に応じてテキストを追加する場合はここに */}
          {/* <Text style={styles.buttonText}>Home</Text> */}
        </TouchableOpacity>

        <View style={styles.border}></View>

        {/* Create ボタン */}
        {/* Link を TouchableOpacity に変更し、onPress で router.replace を呼び出す */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace("/create")}
        >
          <IconButton icon="plus" size={50} iconColor="#D2B48C" />
          {/* 必要に応じてテキストを追加する場合はここに */}
          {/* <Text style={styles.buttonText}>Create</Text> */}
        </TouchableOpacity>

        <View style={styles.border}></View>

        {/* List ボタン */}
        {/* Link を TouchableOpacity に変更し、onPress で router.replace を呼び出す */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace("/list")}
        >
          <IconButton icon="view-list" size={50} iconColor="#D2B48C" />
          {/* 必要に応じてテキストを追加する場合はここに */}
          {/* <Text style={styles.buttonText}>List</Text> */}
        </TouchableOpacity>
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
  // TouchableOpacity にも適用できるスタイル
  button: {
    width: 100,
    textAlign: "center",
    // textDecorationLine は Text コンポーネントに適用するため、TouchableOpacity には不要
    // textDecorationLine: "underline",
    justifyContent: "center", // アイコンを中央に配置
    alignItems: "center", // アイコンを中央に配置
  },
  // ボタン内にテキストを追加する場合のスタイル例
  buttonText: {
    color: "#D2B48C",
    fontSize: 12,
    marginTop: 2, // アイコンとテキストの間隔
    textDecorationLine: "underline", // テキストに下線を追加
  },
  border: { width: 1, height: 60, backgroundColor: "#D2B48C" },
});

export default HeaderComponent;
