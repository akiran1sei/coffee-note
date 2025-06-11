import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

// 選択肢の型を定義
type MeasurementType = "注湯量" | "抽出量";
interface TextProps {
  onChange: (value: string) => void;
  dataTitle: string;
  value: string | undefined; // value を string | undefined に変更
}

export const MeasurementSelector: React.FC<TextProps> = ({
  dataTitle,
  onChange,
  value,
}) => {
  // value が undefined または空文字列の場合、デフォルト値として空文字列を設定（何も選択されていない状態）
  const [selectedMeasurement, setSelectedMeasurement] = useState<
    MeasurementType | ""
  >(
    (value as MeasurementType) || "" // undefined や null の場合は空文字列にフォールバック
  );

  // 親から渡される value が変更された場合、内部状態も更新
  useEffect(() => {
    setSelectedMeasurement((value as MeasurementType) || ""); // undefined や null の場合は空文字列にフォールバック
  }, [value]); // value の変更を監視

  // ボタンが押されたときのハンドラ
  const handlePress = (type: MeasurementType) => {
    setSelectedMeasurement(type); // 内部状態を更新
    onChange(type); // 親コンポーネントに値を渡す
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{dataTitle}</Text>
      <View style={styles.buttonGroup}>
        {/* 注湯量ボタン */}
        <TouchableOpacity
          style={[
            styles.button,
            selectedMeasurement === "注湯量" && styles.selectedButton,
          ]}
          onPress={() => handlePress("注湯量")}
        >
          <Text
            style={[
              styles.buttonText,
              selectedMeasurement === "注湯量" && styles.selectedButtonText,
            ]}
          >
            注湯量
          </Text>
        </TouchableOpacity>

        {/* 抽出量ボタン */}
        <TouchableOpacity
          style={[
            styles.button,
            styles.rightButton,
            selectedMeasurement === "抽出量" && styles.selectedButton,
          ]}
          onPress={() => handlePress("抽出量")}
        >
          <Text
            style={[
              styles.buttonText,
              selectedMeasurement === "抽出量" && styles.selectedButtonText,
            ]}
          >
            抽出量
          </Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.selectedValueText}>
        選択中のタイプ:{" "}
        {selectedMeasurement === ""
          ? "選択されていません"
          : selectedMeasurement}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    // height: "100%", // 親ビューの高さに制限がある場合、問題を引き起こす可能性があります
    flex: 1, // 利用可能なスペースを占有できるようにするが、コンテンツが収まるようにする
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  label: {
    fontSize: 18,
    marginBottom: 20,
    color: "#333",
  },
  buttonGroup: {
    flexDirection: "row",
    borderRadius: 8,
    borderColor: "#007bff",
    borderWidth: 1,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  rightButton: {
    borderLeftWidth: 1,
    borderLeftColor: "#007bff",
  },
  selectedButton: {
    backgroundColor: "#007bff",
  },
  buttonText: {
    fontSize: 16,
    color: "#007bff",
    fontWeight: "bold",
  },
  selectedButtonText: {
    color: "#fff",
  },
  selectedValueText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: "bold",
    color: "#555",
  },
});
