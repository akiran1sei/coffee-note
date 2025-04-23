import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text } from "react-native";
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
  { label: "ペーパードリップ", value: "ペーパードリップ" },
  { label: "ネルドリップ", value: "ネルドリップ" },
  { label: "金属フィルタードリップ", value: "金属フィルタードリップ" },
  { label: "フレンチプレス", value: "フレンチプレス" },
  { label: "エアロプレス", value: "エアロプレス" },
  {
    label: "コーヒーメーカー (ドリップ式)",
    value: "コーヒーメーカー (ドリップ式)",
  },
  { label: "サイフォン", value: "サイフォン" },
  { label: "エスプレッソ", value: "エスプレッソ" },
  { label: "モカポット抽出", value: "モカポット抽出" },
  { label: "水出し", value: "水出し" },
];

// メーカーデータの型定義
interface ManufacturerData {
  [key: string]: { label: string; value: string }[];
}

// 抽出方法ごとのメーカーデータ
const manufacturerData: ManufacturerData = {
  ペーパードリップ: [
    { label: "ハリオ (Hario)", value: "ハリオ" },
    { label: "カリタ (Kalita)", value: "カリタ" },
    { label: "メリタ (Melitta)", value: "メリタ" },
    { label: "キントー (KINTO)", value: "キントー" },
    { label: "オリガミ (ORIGAMI)", value: "オリガミ" },
    { label: "カフェック (CAFEC)", value: "カフェック" },
  ],
  ネルドリップ: [
    { label: "ハリオ (Hario)", value: "ハリオ" },
    { label: "カリタ (Kalita)", value: "カリタ" },
    { label: "コーノ (KONO)", value: "コーノ" },
  ],
  金属フィルタードリップ: [
    { label: "コレス (cores)", value: "コレス" },
    { label: "キントー (KINTO)", value: "キントー" },
    { label: "エイブル ブリューイング (Able Brewing)", value: "エイブル" },
    { label: "フリリング (Frieling)", value: "フリリング" },
  ],
  フレンチプレス: [
    { label: "ボダム (Bodum)", value: "ボダム" },
    { label: "ハリオ (Hario)", value: "ハリオ" },
    { label: "キントー (KINTO)", value: "キントー" },
    { label: "フリリング (Frieling)", value: "フリリング" },
  ],
  エアロプレス: [{ label: "エアロプレス (Aeropress)", value: "エアロプレス" }],
  "コーヒーメーカー (ドリップ式)": [
    { label: "デロンギ (DeLonghi)", value: "デロンギ" },
    { label: "メリタ (Melitta)", value: "メリタ" },
    { label: "カリタ (Kalita)", value: "カリタ" },
    { label: "象印 (ZOJIRUSHI)", value: "象印" },
    { label: "タイガー (TIGER)", value: "タイガー" },
    { label: "バルミューダ (BALMUDA)", value: "バルミューダ" },
  ],
  サイフォン: [
    { label: "ハリオ (Hario)", value: "ハリオ" },
    { label: "コーノ (KONO)", value: "コーノ" },
    { label: "ヤマグラス (Yama Glass)", value: "ヤマグラス" },
    { label: "ボダム (Bodum)", value: "ボダム" },
  ],
  エスプレッソ: [
    { label: "デロンギ (DeLonghi)", value: "デロンギ" },
    { label: "ガジア (Gaggia)", value: "ガジア" },
    { label: "ランチリオ (Rancilio)", value: "ランチリオ" },
    { label: "ブレビル (Breville)", value: "ブレビル" },
    { label: "ラ・パヴォーニ (La Pavoni)", value: "ラ・パヴォーニ" },
  ],
  モカポット抽出: [
    { label: "ビアレッティ (Bialetti)", value: "ビアレッティ" },
    { label: "イリー (illy)", value: "イリー" },
  ],
  水出し: [
    { label: "ハリオ (Hario)", value: "ハリオ" },
    { label: "カリタ (Kalita)", value: "カリタ" },
    { label: "ボダム (Bodum)", value: "ボダム" },
    { label: "オクソー (OXO)", value: "オクソー" },
    { label: "ヤマグラス (Yama Glass)", value: "ヤマグラス" },
  ],
};

/**
 * 階層的選択が可能なコーヒー抽出方法と関連メーカーの選択コンポーネント
 */
const HierarchicalCoffeeSelect: React.FC<HierarchicalSelectProps> = ({
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

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
  },
  selectContainer: {
    width: "90%",
    marginBottom: 20,
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
});

export default HierarchicalCoffeeSelect;
