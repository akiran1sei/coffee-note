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
}

// 抽出方法とメーカーのデータ構造
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

const manufacturerData = {
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
const HierarchicalCoffeeSelect: React.FC<HierarchicalSelectProps> = ({
  primaryTitle,
  secondaryTitle,
  onPrimaryChange,
  onSecondaryChange,
  primaryValue,
  secondaryValue,
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
  // 無効な場合はリセットする追加の保証
  useEffect(() => {
    // 現在の抽出方法に対応するメーカー一覧を取得
    const availableManufacturers = getSecondaryOptions(primaryValue);

    // 現在選択されているメーカーが有効かチェック
    const isCurrentManufacturerValid = availableManufacturers.some(
      (manufacturer) => manufacturer.value === secondaryValue
    );

    // 選択されているメーカーが有効でない場合、リセット
    if (secondaryValue && !isCurrentManufacturerValid) {
      onSecondaryChange("");
    }
  }, [primaryValue, secondaryValue]);
  // primaryValueが変更された時に、secondaryValueが有効かどうかを確認する
  useEffect(() => {
    // 現在の抽出方法に対応するメーカー一覧を取得
    const availableManufacturers = getSecondaryOptions(primaryValue);

    // 現在選択されているメーカーが有効かチェック
    const isCurrentManufacturerValid =
      secondaryValue === "" ||
      availableManufacturers.some(
        (manufacturer) => manufacturer.value === secondaryValue
      );

    // 選択されているメーカーが有効でない場合、リセット
    if (secondaryValue && !isCurrentManufacturerValid) {
      onSecondaryChange("");
    }
  }, [primaryValue, secondaryValue, onSecondaryChange]);
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
          {extractionMethodsData.map((method) => (
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
            {getSecondaryOptions(primaryValue).map((manufacturer) => (
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
