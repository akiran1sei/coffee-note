import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text, TextInput } from "react-native";
import { Picker } from "@react-native-picker/picker";

// 階層的選択のためのインターフェース
interface HierarchicalSelectProps {
  primaryTitle: string; // 最初の選択肢のタイトル（例：抽出方法）
  secondaryTitle: string; // 二番目の選択肢のタイトル（例：抽出メーカー）
  onPrimaryChange: (value: string) => void; // 最初の選択肢の変更ハンドラ
  onSecondaryChange: (value: string) => void; // 二番目の選択肢の変更ハンドラ
  primaryValue: string; // 最初の選択肢の値
  secondaryValue: string; // 二番目の選択肢の値
  primaryOptions?: { label: string; value: string }[]; // 最初の選択肢のオプション
  secondaryOptions?: { label: string; value: string }[]; // 二番目の選択肢のオプション
}

// 抽出方法のデータ構造
const extractionMethodsData = [
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

// メーカーデータの型定義
interface ManufacturerData {
  [key: string]: { label: string; value: string }[];
}

// 抽出方法ごとのメーカーデータ
const manufacturerData: ManufacturerData = {
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
};
/**
 * 階層的選択が可能なコーヒー抽出方法と関連メーカーの選択コンポーネント
 */
export const HierarchicalCoffeeSelect: React.FC<HierarchicalSelectProps> = ({
  primaryTitle,
  secondaryTitle,
  onPrimaryChange,
  onSecondaryChange,
  primaryValue,
  secondaryValue,
  primaryOptions = extractionMethodsData, // デフォルトで抽出方法データを設定
}) => {
  // 選択された抽出方法に基づいて利用可能なメーカーを取得
  const getSecondaryOptions = (primaryValue: string) => {
    if (!primaryValue) return [];
    return (
      manufacturerData[primaryValue as keyof typeof manufacturerData] || []
    );
  };

  // 最初の選択肢変更ハンドラ（抽出方法）
  const handlePrimaryChange = (value: string) => {
    onPrimaryChange(value);
    // 抽出方法が変更されたら、必ずメーカー選択をリセット
    onSecondaryChange("");
  };

  // primaryValueが変更された時に、secondaryValueが有効かどうかを確認し
  // 無効な場合はリセットする
  useEffect(() => {
    const availableManufacturers = getSecondaryOptions(primaryValue);
    const isCurrentManufacturerValid =
      secondaryValue === "" ||
      availableManufacturers.some(
        (manufacturer) => manufacturer.value === secondaryValue
      );

    if (secondaryValue && !isCurrentManufacturerValid) {
      onSecondaryChange("");
    }
  }, [primaryValue, secondaryValue, onSecondaryChange]);

  // secondaryOptions をローカルステートとして管理しないように修正
  const secondaryOptions = getSecondaryOptions(primaryValue);

  return (
    <View style={styles.container}>
      {/* 最初の選択肢（抽出方法） */}
      <View style={styles.selectContainer}>
        <Text style={styles.label}>{primaryTitle}</Text>
        <Picker
          selectedValue={primaryValue}
          onValueChange={handlePrimaryChange}
          style={styles.select}
        >
          <Picker.Item label="選択してください" value="" />
          {primaryOptions.map((method) => (
            <Picker.Item
              key={method.value}
              label={method.label}
              value={method.value}
            />
          ))}
        </Picker>
      </View>

      {/* 二番目の選択肢（メーカー）- 最初の選択がある場合のみ表示 */}
      {primaryValue && (
        <View style={styles.selectContainer}>
          <Text style={styles.label}>{secondaryTitle}</Text>
          <Picker
            selectedValue={secondaryValue}
            onValueChange={onSecondaryChange}
            style={styles.select}
          >
            <Picker.Item label="選択してください" value="" />
            {secondaryOptions.map((manufacturer) => (
              <Picker.Item
                key={manufacturer.value}
                label={manufacturer.label}
                value={manufacturer.value}
              />
            ))}
          </Picker>
        </View>
      )}
    </View>
  );
};

interface SelectProps {
  dataTitle: string;
  onChange: (value: string) => void;
  value: string;
}
export const CoffeeProcessingSelect: React.FC<SelectProps> = ({
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
    return [];
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
export const CoffeeTypesSelect: React.FC<SelectProps> = ({
  dataTitle,
  onChange,
  value,
}) => {
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherInputValue, setOtherInputValue] = useState("");
  const [selectedValue, setSelectedValue] = useState(value || "");

  const options = [
    { label: "アラビカ種", value: "arabica" },
    { label: "カネフォラ種", value: "canephora" },
    { label: "リベリカ種", value: "liberica" },
  ];

  // selectedValueが変更されたときに、「その他」が選択されたかどうかを判定
  useEffect(() => {
    const isOtherSelected = selectedValue === "その他";
    setShowOtherInput(isOtherSelected);

    // 「その他」以外が選択された場合はその値を親に渡す
    if (!isOtherSelected) {
      setOtherInputValue("");
      onChange(selectedValue);
    }
  }, [selectedValue]);

  // 初期値から状態を設定
  useEffect(() => {
    if (value) {
      const isStandardOption = options.some((option) => option.value === value);
      if (isStandardOption) {
        setSelectedValue(value);
      } else if (value !== "") {
        setSelectedValue("その他");
        setOtherInputValue(value);
      }
    }
  }, []);

  // Picker の値が変更されたときのハンドラ
  const handlePickerChange = (selectedValue: string) => {
    setSelectedValue(selectedValue);
  };

  // テキスト入力フィールドの値が変更されたときのハンドラ
  const handleOtherInputChange = (text: string) => {
    setOtherInputValue(text);
    // 「その他」が選択されている場合のみ、入力テキストを親に渡す
    if (selectedValue === "その他") {
      onChange(text);
    }
  };

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{dataTitle}</Text>
      <Picker
        selectedValue={selectedValue}
        onValueChange={handlePickerChange}
        style={styles.select}
      >
        <Picker.Item label="選択してください" value="" />
        {options.map((option) => (
          <Picker.Item
            key={option.value}
            label={option.label}
            value={option.value}
          />
        ))}
        <Picker.Item label="その他" value="その他" />
      </Picker>

      {showOtherInput && (
        <TextInput
          style={styles.otherInput}
          placeholder="コーヒー豆の種類を入力してください"
          value={otherInputValue}
          onChangeText={handleOtherInputChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
  },
  selectContainer: {
    width: "90%",
    marginBottom: 20,
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
    paddingVertical: 16,
    paddingHorizontal: 0,
    fontSize: 18,
  },
  inputContainer: {
    width: "90%",
    marginBottom: 20,
    marginHorizontal: "auto",
  },
  otherInput: {
    width: "100%",
    backgroundColor: "#FFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D2B48C",
    padding: 15,
    fontSize: 18,
    marginTop: 10,
  },
  selectedText: {
    marginTop: 20,
    fontSize: 16,
  },
});
