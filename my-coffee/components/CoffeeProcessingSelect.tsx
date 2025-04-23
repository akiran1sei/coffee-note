import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { Picker } from "@react-native-picker/picker"; // Picker をインポート

interface SelectProps {
  dataTitle: string;
  onChange: (value: string) => void;
  value: string;
}

const CoffeeProcessingSelect: React.FC<SelectProps> = ({
  dataTitle,
  onChange,
  value,
}) => {
  const methods = () => {
    if (dataTitle === "焙煎度") {
      return [
        { label: "ライトロースト (浅煎り)", value: "lightroast" },
        { label: "シナモンロースト (浅煎り)", value: "cinnamonroast" },
        { label: "ミディアムロースト (中浅煎り)", value: "mediumroast" },
        { label: "ハイロースト (中煎り)", value: "highroast" },
        { label: "シティロースト (中深煎り)", value: "cityroast" },
        { label: "フルシティロースト (深煎り)", value: "fullcityroast" },
        { label: "フレンチロースト (深煎り)", value: "frenchroast" },
        { label: "イタリアンロースト (深煎り)", value: "italianroast" },
      ];
    } else if (dataTitle === "挽き目") {
      return [
        { label: "極細挽き", value: "extrafine" },
        { label: "細挽き", value: "fine" },
        { label: "中細挽き", value: "mediumfine" },
        { label: "中挽き", value: "medium" },
        { label: "粗挽き", value: "coarse" },
        { label: "極粗挽き", value: "extracourse" },
      ];
    }
    return []; // デフォルトで空の配列を返す
  };

  return (
    <View style={styles.selectContainer}>
      <Text style={styles.label}>{dataTitle}</Text>
      <Picker
        selectedValue={value}
        onValueChange={(itemValue) => {
          onChange(itemValue); // 選択された値を親コンポーネントに渡す
        }}
        style={styles.select}
      >
        <Picker.Item label="選択してください" value="" />
        {methods().map((method) => (
          <Picker.Item
            key={method.value}
            label={method.label}
            value={method.value}
          />
        ))}
      </Picker>
    </View>
  );
};

const styles = StyleSheet.create({
  selectContainer: {
    width: "90%",
    marginBottom: 10,
    marginHorizontal: "auto",
  },
  label: {
    width: "100%",
    backgroundColor: "#D2B48C",
    color: "#000",
    padding: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    textAlign: "center",
  },
  select: {
    width: "100%",
    backgroundColor: "#FFF",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderWidth: 1,
    borderColor: "#D2B48C",
    marginTop: -1,
    paddingVertical: 16, // 1rem をピクセルに変換 (1rem = 16px)
    paddingHorizontal: 0,
    fontSize: 18,
  },
});

export default CoffeeProcessingSelect;
