import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  Alert, // alert() の代わりに Alert.alert() を使用
} from "react-native";
import * as ImagePicker from "expo-image-picker";

interface ImagePickerProps {
  onChange: (value: string) => void;
  value: string; // 親コンポーネントからの値をリセットするために受け取るプロパティ
}

const ImageUploadComponent: React.FC<ImagePickerProps> = ({
  onChange,
  value,
}) => {
  // デフォルト画像のURIを設定
  const defaultImage = require("../assets/images/no-image.png");

  // 現在表示されている画像のURIを管理するステート
  const [image, setImage] = useState<string | undefined>();

  // 親コンポーネントから渡された値 (value) が変更されたときに、image ステートを更新
  // これにより、親コンポーネントからのリセットなどが反映される
  useEffect(() => {
    setImage(value);
  }, [value]);

  // 画像選択の処理を行う非同期関数
  const pickImage = useCallback(async () => {
    // メディアライブラリへのアクセス許可をリクエスト
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    // 許可が得られなかった場合
    if (status !== "granted") {
      // ユーザーに許可が必要であることをアラートで通知
      Alert.alert(
        "許可が必要です",
        "画像を選択するには、カメラロールへのアクセス許可が必要です。",
        [{ text: "OK" }]
      );
      return; // 処理を中断
    }

    try {
      // 画像ライブラリから画像を起動し、選択させる
      let result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true, // 選択後に編集（トリミングなど）を許可
        aspect: [4, 3], // 画像のアスペクト比を4:3に設定
        quality: 1, // 画像の品質を最高に設定
      });

      // 画像選択がキャンセルされず、アセットが存在する場合
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedUri = result.assets[0].uri; // 選択された画像のURIを取得
        setImage(selectedUri); // ローカルステートを更新
        onChange(selectedUri); // 親コンポーネントの onChange コールバックを呼び出し、URIを渡す
      }
    } catch (error) {
      // 画像選択中にエラーが発生した場合
      console.error("画像の選択中にエラーが発生しました:", error);
      Alert.alert("エラー", "画像の選択中にエラーが発生しました。", [
        { text: "OK" },
      ]);
    }
  }, [onChange]); // onChange が変更された場合にのみ再作成されるように useCallback を使用

  // 表示する画像のソースを決定する
  // image が存在すればそのURIを使用し、そうでなければデフォルト画像を使用
  // Webプラットフォームの判定はモバイル版のみに特化するため削除
  const imageSource = image ? { uri: image } : defaultImage;

  return (
    <View style={styles.uploadContainer}>
      <View style={styles.imageContents}>
        {/* 画像選択ボタン */}
        <TouchableOpacity onPress={pickImage} style={styles.imageButton}>
          <Text style={styles.buttonText}>画像を選択</Text>
        </TouchableOpacity>
        {/* 選択された画像またはデフォルト画像のプレビュー */}
        <Image source={imageSource} style={styles.imagePreview} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  uploadContainer: {
    width: "95%",
    height: "auto",
    backgroundColor: "#D2B48C",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    alignSelf: "center", // コンテナを中央揃え
  },
  imageContents: {
    width: "90%",
    marginBottom: 10,
    alignSelf: "center", // コンテンツを中央揃え
  },
  imageButton: {
    width: "100%",
    backgroundColor: "#F5F5F5",
    padding: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginTop: 5,
    marginBottom: 10,
  },
  buttonText: {
    color: "#333",
  },
  imagePreview: {
    width: "100%",
    height: 250,
    borderRadius: 10,
    backgroundColor: "#F0F0F0",
    resizeMode: "contain", // 画像が適切に表示されるように調整
  },
});

export default ImageUploadComponent;
