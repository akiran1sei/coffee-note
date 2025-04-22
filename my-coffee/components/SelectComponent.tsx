import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text } from "react-native";
import { Picker } from "@react-native-picker/picker"; // Picker をインポート

interface SelectProps {
  dataTitle: string;
  onChange: (value: string) => void;
  value: string;
}

const initialManufacturerData = {
  // 抽出方法とメーカーの対応データ
  paperdrip: [
    { label: "ハリオ (Hario)", value: "hario" },
    { label: "カリタ (Kalita)", value: "kalita" },
    { label: "メリタ (Melitta)", value: "melitta" },
    { label: "キントー (KINTO)", value: "kinto" },
    { label: "オリガミ (ORIGAMI)", value: "origami" },
    { label: "カフェック (CAFEC)", value: "cafec" },
  ],
  neldrip: [
    { label: "ハリオ (Hario)", value: "hario" },
    { label: "カリタ (Kalita)", value: "kalita" },
    { label: "コーノ (KONO)", value: "kono" },
  ],
  metalfilterdrip: [
    { label: "コレス (cores)", value: "cores" },
    { label: "キントー (KINTO)", value: "kinto" },
    { label: "エイブル ブリューイング (Able Brewing)", value: "ablebrewing" },
    { label: "フリリング (Frieling)", value: "frieling" },
  ],
  frenchpress: [
    { label: "ボダム (Bodum)", value: "bodum" },
    { label: "ハリオ (Hario)", value: "hario" },
    { label: "キントー (KINTO)", value: "kinto" },
    { label: "フリリング (Frieling)", value: "frieling" },
  ],
  aeropress: [{ label: "エアロプレス (Aeropress)", value: "aeropress" }],
  coffeemakerdrip: [
    { label: "デロンギ (DeLonghi)", value: "delonghi" },
    { label: "メリタ (Melitta)", value: "melitta" },
    { label: "カリタ (Kalita)", value: "kalita" },
    { label: "象印 (ZOJIRUSHI)", value: "zojirushi" },
    { label: "タイガー (TIGER)", value: "tiger" },
    { label: "バルミューダ (BALMUDA)", value: "balmuda" },
  ],
  syphon: [
    { label: "ハリオ (Hario)", value: "hario" },
    { label: "コーノ (KONO)", value: "kono" },
    { label: "ヤマグラス (Yama Glass)", value: "yamaglass" },
    { label: "ボダム (Bodum)", value: "bodum" },
  ],
  espresso: [
    { label: "デロンギ (DeLonghi)", value: "delonghi" },
    { label: "ガジア (Gaggia)", value: "gaggia" },
    { label: "ランチリオ (Rancilio)", value: "rancilio" },
    { label: "ブレビル (Breville)", value: "breville" },
    { label: "ラ・パヴォーニ (La Pavoni)", value: "lapavoni" },
  ],
  mokapotextraction: [
    { label: "ビアレッティ (Bialetti)", value: "bialetti" },
    { label: "イリー (illy)", value: "illy" },
  ],
  icedrip: [
    { label: "ハリオ (Hario)", value: "hario" },
    { label: "カリタ (Kalita)", value: "kalita" },
    { label: "ボダム (Bodum)", value: "bodum" },
    { label: "オクソー (OXO)", value: "oxo" },
    { label: "ヤマグラス (Yama Glass)", value: "yamaglass" },
  ],
  // other: [{ label: "その他", value: "other" }],
};

const SelectComponent: React.FC<SelectProps> = ({
  dataTitle,
  onChange,
  value,
}) => {
  const [manufacturerData, setLocalManufacturerData] = useState(
    initialManufacturerData
  );
  const [selectedExtractionMethod, setSelectedExtractionMethod] =
    useState<string>(value || ""); // 初期値を空文字にする
  const [manufacturerOptions, setManufacturerOptions] = useState<
    { label: string; value: string }[]
  >([]);

  useEffect(() => {
    if (dataTitle === "抽出方法") {
      setSelectedExtractionMethod(value || "");
    }
  }, [dataTitle, value]);

  useEffect(() => {
    if (dataTitle === "抽出メーカー") {
      if (
        selectedExtractionMethod === "paperdrip" ||
        selectedExtractionMethod === "neldrip" ||
        selectedExtractionMethod === "metalfilterdrip" ||
        selectedExtractionMethod === "frenchpress" ||
        selectedExtractionMethod === "aeropress" ||
        selectedExtractionMethod === "coffeemakerdrip" ||
        selectedExtractionMethod === "syphon" ||
        selectedExtractionMethod === "espresso" ||
        selectedExtractionMethod === "mokapotextraction" ||
        selectedExtractionMethod === "icedrip"
      ) {
        console.log(
          "selectedExtractionMethod",
          selectedExtractionMethod === "paperdrip"
        );
        const options =
          manufacturerData[
            selectedExtractionMethod as keyof typeof manufacturerData
          ] || [];
        setManufacturerOptions(options);
        console.log("manufacturerOptions１", manufacturerOptions);
      } else {
        setManufacturerOptions([]);
        console.log("manufacturerOptions２", manufacturerOptions);
      }
    }
  }, [selectedExtractionMethod, manufacturerData, dataTitle]);

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
    } else if (dataTitle === "抽出方法") {
      return [
        { label: "ペーパードリップ", value: "paperdrip" },
        { label: "ネルドリップ", value: "neldrip" },
        { label: "金属フィルタードリップ", value: "metalfilterdrip" },
        { label: "フレンチプレス", value: "frenchpress" },
        { label: "エアロプレス", value: "aeropress" },
        { label: "コーヒーメーカー (ドリップ式)", value: "coffeemakerdrip" },
        { label: "サイフォン", value: "syphon" },
        { label: "エスプレッソ", value: "espresso" },
        { label: "モカポット抽出", value: "mokapotextraction" },
        { label: "水出し", value: "icedrip" },
      ];
    } else if (dataTitle === "抽出メーカー") {
      return manufacturerOptions;
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
          if (dataTitle === "抽出方法") {
            setSelectedExtractionMethod(itemValue);
          }
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

export default SelectComponent;
