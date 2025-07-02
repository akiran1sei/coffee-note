import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Picker } from "@react-native-picker/picker";

// 階層的選択のためのインターフェース
interface HierarchicalSelectProps {
  primaryTitle: string; // 最初の選択肢のタイトル（例：抽出方法）
  secondaryTitle: string; // 二番目の選択肢のタイトル（例：抽出器具）
  onPrimaryChange: (value: string) => void; // 最初の選択肢の変更ハンドラ
  onSecondaryChange: (value: string) => void; // 二番目の選択肢の変更ハンドラ
  primaryValue: string; // 最初の選択肢の値
  secondaryValue: string; // 二番目の選択肢の値
  primaryOptions?: { label: string; value: string }[]; // 最初の選択肢のオプション
}

// 抽出方法のデータ構造
const extractionMethodsData = [
  { label: "ペーパードリップ", value: "ペーパードリップ" },
  { label: "ネルドリップ", value: "ネルドリップ" },
  { label: "ペーパーレスドリッパー", value: "ペーパーレスドリッパー" },
  { label: "フレンチプレス", value: "フレンチプレス" },
  { label: "エアロプレス", value: "エアロプレス" },
  {
    label: "コーヒーメーカー(ドリップ式)",
    value: "コーヒーメーカー(ドリップ式)",
  },
  { label: "サイフォン", value: "サイフォン" },
  { label: "エスプレッソ", value: "エスプレッソ" },
  { label: "モカポット抽出", value: "モカポット抽出" },
  { label: "水出し", value: "水出し" },
];

// 抽出方法ごとの器具データ
const equipmentData: { [key: string]: { label: string; value: string }[] } = {
  ペーパードリップ: [
    { label: "ハリオ V60", value: "ハリオ V60" },
    { label: "ハリオ ペガサス", value: "ハリオ ペガサス" },
    { label: "カリタ ウェーブ", value: "カリタ ウェーブ" },
    { label: "カリタ 3つ穴", value: "カリタ 3つ穴" },
    { label: "メリタ 1つ穴", value: "メリタ 1つ穴" },
    { label: "コーノ式", value: "コーノ式" },
    { label: "ORIGAMI", value: "ORIGAMI" },
    { label: "CAFEC フラワー", value: "CAFEC フラワー" },
    { label: "その他", value: "その他" },
  ],
  ネルドリップ: [{ label: "ネルドリップ", value: "ネルドリップ" }],
  ペーパーレスドリッパー: [
    { label: "金属フィルター", value: "金属フィルター" },
    { label: "セラミックフィルター", value: "セラミックフィルター" },
    { label: "その他", value: "その他" },
  ],
  フレンチプレス: [
    { label: "フレンチプレス", value: "フレンチプレス" },
    { label: "その他", value: "その他" },
  ],
  エアロプレス: [{ label: "エアロプレス", value: "エアロプレス" }],
  "コーヒーメーカー(ドリップ式)": [
    { label: "デロンギ ドリップ", value: "デロンギ ドリップ" },
    { label: "メリタ ドリップ", value: "メリタ ドリップ" },
    { label: "カリタ ドリップ", value: "カリタ ドリップ" },
    { label: "象印", value: "象印" },
    { label: "タイガー", value: "タイガー" },
    { label: "バルミューダ The Pot", value: "バルミューダ The Pot" },
    { label: "その他", value: "その他" },
  ],
  サイフォン: [
    { label: "ハリオ", value: "ハリオ" },
    { label: "コーノ", value: "コーノ" },
    { label: "ヤマグラス", value: "ヤマグラス" },
    { label: "その他", value: "その他" },
  ],
  エスプレッソ: [
    { label: "デロンギ", value: "デロンギ" },
    { label: "ガジア", value: "ガジア" },
    { label: "ランチリオ", value: "ランチリオ" },
    { label: "ブレビル", value: "ブレビル" },
    { label: "ラ・パヴォーニ レバー", value: "ラ・パヴォーニ レバー" },
    { label: "その他", value: "その他" },
  ],
  モカポット抽出: [{ label: "マキネッタ", value: "マキネッタ" }],
  水出し: [
    { label: "ハリオ", value: "ハリオ" },
    { label: "キントー", value: "キントー" },
    { label: "ボダム", value: "ボダム" },
    { label: "オクソー", value: "オクソー" },
    { label: "その他", value: "その他" },
  ],
};

/**
 * 階層的選択が可能なコーヒー抽出方法と関連器具の選択コンポーネント
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
  // 選択された抽出方法に基づいて利用可能な器具を取得
  const getSecondaryOptions = (primaryValue: string) => {
    if (!primaryValue) return [];
    return equipmentData[primaryValue] || [];
  };

  // 最初の選択肢変更ハンドラ（抽出方法）
  const handlePrimaryChange = (value: string) => {
    onPrimaryChange(value);
    // 抽出方法が変更されたら、必ず器具選択をリセット
    onSecondaryChange("");
  };

  // primaryValueが変更された時に、secondaryValueが有効かどうかを確認し
  // 無効な場合はリセットする
  useEffect(() => {
    const availableEquipment = getSecondaryOptions(primaryValue);
    const isCurrentEquipmentValid =
      secondaryValue === "" ||
      availableEquipment.some(
        (equipment) => equipment.value === secondaryValue
      );

    if (secondaryValue && !isCurrentEquipmentValid) {
      onSecondaryChange("");
    }
  }, [primaryValue, secondaryValue, onSecondaryChange]);

  const secondaryOptions = getSecondaryOptions(primaryValue);

  return (
    <View style={styles.container}>
      {/* 最初の選択肢（抽出方法） */}
      <View style={styles.selectContainer}>
        <Text style={styles.label}>{primaryTitle}</Text>
        <View style={styles.pickerWrapper}>
          {/* Pickerを囲む新しいView */}
          <Picker
            selectedValue={primaryValue}
            onValueChange={handlePrimaryChange}
            style={styles.picker} // style.selectから変更
            itemStyle={styles.pickerItem} // iOSのテキストスタイル調整
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
      </View>

      {/* 二番目の選択肢（器具）- 最初の選択がある場合のみ表示 */}
      {primaryValue && (
        <View style={styles.selectContainer}>
          <Text style={styles.label}>{secondaryTitle}</Text>
          <View style={styles.pickerWrapper}>
            {/* Pickerを囲む新しいView */}
            <Picker
              selectedValue={secondaryValue}
              onValueChange={onSecondaryChange}
              style={styles.picker} // style.selectから変更
              itemStyle={styles.pickerItem} // iOSのテキストスタイル調整
            >
              <Picker.Item label="選択してください" value="" />
              {secondaryOptions.map((equipment) => (
                <Picker.Item
                  key={equipment.value}
                  label={equipment.label}
                  value={equipment.value}
                />
              ))}
            </Picker>
          </View>
        </View>
      )}
    </View>
  );
};

// 選択肢の型を定義
type MeasurementType = "注湯量" | "抽出量";

interface ConditionalMeasurementProps {
  onChange: (value: string) => void;
  dataTitle: string;
  value: string | undefined;
  extractionMethod?: string; // 抽出方法を受け取るプロパティを追加
}

export const ConditionalMeasurementSelector: React.FC<
  ConditionalMeasurementProps
> = ({ dataTitle, onChange, value, extractionMethod }) => {
  // 選択肢を表示する抽出方法を定義
  const methodsWithChoice = [
    "ペーパードリップ",
    "ペーパーレスドリッパー",
    "ネルドリップ",
    "コーヒーメーカー(ドリップ式)",
  ];

  // 選択肢を表示するかどうかを判定
  const shouldShowChoice = methodsWithChoice.includes(extractionMethod || "");

  // value が undefined または空文字列の場合、デフォルト値を設定
  const [selectedMeasurement, setSelectedMeasurement] = useState<
    MeasurementType | ""
  >(
    shouldShowChoice ? (value as MeasurementType) || "" : "注湯量" // 選択肢がない場合は固定で注湯量
  );

  // 抽出方法が変更された場合の処理
  useEffect(() => {
    console.log("extractionMethod", extractionMethod);
    if (shouldShowChoice) {
      // 選択肢がある場合は、現在の値を維持するか空にする
      setSelectedMeasurement((value as MeasurementType) || "");
    } else if (extractionMethod === "エスプレッソ") {
      // エスプレッソの場合は強制的に抽出量に設定
      setSelectedMeasurement("抽出量");
      onChange("抽出量");
    } else {
      // 選択肢がない場合は強制的に注湯量に設定
      setSelectedMeasurement("注湯量");
      onChange("注湯量");
    }
  }, [extractionMethod, shouldShowChoice]);

  // 親から渡される value が変更された場合、内部状態も更新
  useEffect(() => {
    if (shouldShowChoice) {
      setSelectedMeasurement((value as MeasurementType) || "");
    } else if (extractionMethod === "エスプレッソ") {
      setSelectedMeasurement("抽出量");
    } else {
      setSelectedMeasurement("注湯量");
    }
  }, [value, shouldShowChoice]);

  // ボタンが押されたときのハンドラ
  const handlePress = (type: MeasurementType) => {
    setSelectedMeasurement(type);
    onChange(type);
  };

  // 選択肢がない場合は固定表示
  if (!shouldShowChoice && extractionMethod === "エスプレッソ") {
    return (
      <View style={styles.radioContainer}>
        <Text style={styles.label}>{dataTitle}</Text>
        <View style={styles.fixedContainer}>
          <Text style={styles.fixedText}>抽出量（固定）</Text>
        </View>
        <Text style={styles.selectedValueText}>選択中のタイプ: 抽出量</Text>
      </View>
    );
  } else if (!shouldShowChoice && extractionMethod !== "エスプレッソ") {
    return (
      <View style={styles.radioContainer}>
        <Text style={styles.label}>{dataTitle}</Text>
        <View style={styles.fixedContainer}>
          <Text style={styles.fixedText}>注湯量（固定）</Text>
        </View>
        <Text style={styles.selectedValueText}>選択中のタイプ: 注湯量</Text>
      </View>
    );
  }

  // 選択肢がある場合は通常の選択UI
  return (
    <View style={styles.radioContainer}>
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
        { label: "ライト (浅)", value: "ライト (浅)" },
        {
          label: "シナモン (浅)",
          value: "シナモン (浅)",
        },
        {
          label: "ミディアム (中浅)",
          value: "ミディアム (中浅)",
        },
        { label: "ハイ (中)", value: "ハイ (中)" },
        {
          label: "シティ (中深)",
          value: "シティ (中深)",
        },
        {
          label: "フルシティ (深)",
          value: "フルシティ (深)",
        },
        {
          label: "フレンチ (深)",
          value: "フレンチ (深)",
        },
        {
          label: "イタリアン (深)",
          value: "イタリアン (深)",
        },
        { label: "複数焙煎度", value: "複数焙煎度" },
      ];
    } else if (dataTitle === "挽き目") {
      return [
        { label: "極細挽き", value: "極細挽き" },
        { label: "細挽き", value: "細挽き" },
        { label: "中細挽き", value: "中細挽き" },
        { label: "中挽き", value: "中挽き" },
        { label: "粗挽き", value: "粗挽き" },
        { label: "極粗挽き", value: "極粗挽き" },
        { label: "複数挽き", value: "複数挽き" },
      ];
    }
    return [];
  };

  return (
    <View style={styles.selectContainer}>
      <Text style={styles.label}>{dataTitle}</Text>
      <View style={styles.pickerWrapper}>
        {/* Pickerを囲む新しいView */}
        <Picker
          selectedValue={value}
          onValueChange={(itemValue) => {
            onChange(itemValue); // 選択された値を親コンポーネントに渡す
          }}
          style={styles.picker} // style.selectから変更
          itemStyle={styles.pickerItem} // iOSのテキストスタイル調整
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
    { label: "アラビカ種", value: "アラビカ種" },
    { label: "カネフォラ種", value: "カネフォラ種" },
    { label: "リベリカ種", value: "リベリカ種" },
    { label: "複数種類", value: "複数種類" },
    { label: "不明", value: "不明" },
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
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={selectedValue}
          onValueChange={handlePickerChange}
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
      </View>
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
  // Picker を囲む新しいラッパーのスタイル
  pickerWrapper: {
    width: "100%",
    backgroundColor: "#FFF",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderWidth: 1,
    borderColor: "#D2B48C",
    marginTop: -1,
    overflow: "hidden", // iOSでborder-radiusとborderが効かない場合に対処
  },
  // Picker 自体にはボーダーを設定しない
  picker: {
    width: "100%",
    backgroundColor: "transparent", // ラッパーの背景色を使う
    // borderWidth や borderColor はここでは設定しない
    paddingVertical: 16,
    paddingHorizontal: 0,
    fontSize: 18,
  },
  // iOSのPickerのテキストスタイルを調整
  pickerItem: {
    fontSize: 18,
    textAlign: "center", // 必要に応じてテキストを中央寄せに
  },
  // selectスタイルはもう使用しないか、既存のコンポーネントに合わせて調整
  // select: { ... },

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
  radioContainer: {
    width: "90%",

    marginHorizontal: "auto",
    alignItems: "center",
  },

  buttonGroup: {
    width: "100%",
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
    marginVertical: 10,
    fontSize: 18,
    fontWeight: "bold",
    color: "#555",
  },
  // 固定表示用のスタイル
  fixedContainer: {
    width: "100%",
    backgroundColor: "#f0f0f0",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderWidth: 1,
    borderColor: "#D2B48C",
    marginTop: -1,
    padding: 15,
    alignItems: "center",
  },
  fixedText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "bold",
  },
});
