import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Text,
  Alert,
  Dimensions,
  Button,
} from "react-native";
import HeaderComponent from "../../components/HeaderComponent";
import PageTitleComponent from "../../components/PageTitleComponent";

import {
  HierarchicalCoffeeSelect,
  CoffeeProcessingSelect,
  CoffeeTypesSelect,
} from "../../components/SelectComponent";
import {
  InputComponent,
  NumberComponent,
  TextAreaComponent,
  MeasuredTimeInputComponent,
} from "../../components/InputComponent";
import RangeComponent from "../../components/RangeComponent";
import ImageUploadComponent from "../../components/ImageUploadComponent";

import RadarChart from "../../components/RadarChart/RadarChart";
import CoffeeStorageService from "../../services/CoffeeStorageService"; // ストレージサービスをインポート
import OverallPreferenceRangeComponent from "../../components/OverallComponent";
import { MeasurementSelector } from "../../components/RadioComponent";
// 画面サイズを取得
const { width: screenWidth } = Dimensions.get("window");
interface CoffeeRecord {
  id: string;
  name: string;
  variety: string;
  productionArea: string;
  roastingDegree: string;
  extractionMethod: string;
  extractionMaker: string;
  grindSize: string;
  temperature: number;
  coffeeAmount: number;
  measurementMethod: string; // "注湯量" または "抽出量"
  waterAmount: number;
  extractionTime: string;
  acidity: number;
  bitterness: number;
  overall: number;
  body: number;
  aroma: number;
  aftertaste: number;
  memo: string;
  imageUri: string;
}
// 初期状態を定数として定義
const initialFormData = {
  imageUri: "",
  beansName: "",
  variety: "",
  productionArea: "",
  roastingDegree: "",
  extractionMethod: "",
  extractionMaker: "",
  grindSize: "",
  temperature: 0,
  coffeeAmount: 0,
  measurementMethod: "",
  waterAmount: 0,
  extractionTime: "",
  acidity: 0,
  bitterness: 0,
  overall: 0,
  body: 0,
  aroma: 0,
  aftertaste: 0,
  textArea: "",
};

const initialRangeValues = {
  acidity: 0,
  bitterness: 0,
  body: 0,
  aroma: 0,
  aftertaste: 0,
  overall: 0,
};

export default function CreateScreen() {
  const TextData = "Coffee Create"; // ページタイトルに表示するテキスト
  const [resetKey, setResetKey] = useState(0);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const [InputLabel, setInputLabel] = useState({
    beansName: "名称",
    productionArea: "産地",
  });
  const [SelectLabel, setSelectLabel] = useState({
    roastingDegree: "焙煎度",
    extractionMaker: "抽出器具",
    extractionMethod: "抽出方法",
    grindSize: "挽き目",
    variety: "品種",
  });
  const [RangeLabel, setRangeLabel] = useState({
    acidity: "酸味",
    bitterness: "苦味",
    body: "コク",
    aroma: "香り",
    aftertaste: "キレ",
    overall: "全体の好み",
  });
  const [NumberLabel, setNumberLabel] = useState({
    temperature: "温度（℃）",
    coffeeAmount: "紛量（g）",
    waterAmount: "湯量（g）",
  });
  const [measurementLabel, setMeasurement] = useState("測定方法");
  const [imageData, setImageData] = useState("");
  const [formData, setFormData] = useState({ ...initialFormData });
  const [rangeValues, setRangeValues] = useState({ ...initialRangeValues });
  // Web環境でフォーム送信後の状態をリセット

  // フォームリセット関数
  const resetForm = useCallback(() => {
    setImageData("../../assets/images/no-image.png");
    setFormData({ ...initialFormData });
    setRangeValues({ ...initialRangeValues });
    setResetKey((prevKey) => prevKey + 1);
    setFormSubmitted(true);
  }, []);
  const handleInputChange = (label: string, value: string | number) => {
    setFormData({ ...formData, [label]: value });
  };
  const handleMeasurementSelect = (label: string, value: string) => {
    setFormData({ ...formData, [label]: value });
  };

  const handleSelectChange = (label: string, value: string) => {
    setFormData((prevFormData) => ({ ...prevFormData, [label]: value }));
  };
  const handleRangeChange = (label: string, value: number) => {
    setFormData({ ...formData, [label]: value });
    setRangeValues({ ...rangeValues, [label]: value });
  };
  const handleOverallPreferenceChange = (label: string, value: number) => {
    setFormData({ ...formData, [label]: value });
    setRangeValues({ ...rangeValues, [label]: value });
  };

  const handleTextAreaChange = (value: string) => {
    setFormData({ ...formData, textArea: value });
  };

  const handleMeasuredTimeChange = (value: string) => {
    setFormData({ ...formData, extractionTime: value });
  };
  const handleImageChange = (value: string) => {
    setImageData(value);
    setFormData({ ...formData, imageUri: value }); // imageData の更新後に formData を更新
  };
  const scrollViewRef = useRef<ScrollView>(null);
  const handleScrollToTop = async () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };
  // 新しい送信ハンドラー
  const handleSubmit = async () => {
    // 必須フィールドのチェック
    const missingFields = (
      Object.keys(formData) as Array<keyof typeof formData>
    ).filter((field) => {
      const value = formData[field];
      return (
        value === null ||
        value === undefined ||
        (typeof value === "string" && value === "") ||
        (typeof value === "number" && value === 0)
      );
    });

    // textArea と imageUri を必須フィールドから除外
    const requiredFields = missingFields.filter(
      (field) => field !== "textArea" && field !== "imageUri"
    );

    if (requiredFields.length > 0) {
      return Alert.alert(
        "入力エラー",
        `以下の必須項目が未入力です：\n${requiredFields.join(", ")}`
      );
    }

    try {
      const coffeeRecordForSave: Omit<CoffeeRecord, "id"> = {
        imageUri: formData.imageUri || "../../assets/images/no-image.png",
        name: formData.beansName,
        variety: formData.variety,
        productionArea: formData.productionArea,
        roastingDegree: formData.roastingDegree || "",
        extractionMethod: formData.extractionMethod || "",
        extractionMaker: formData.extractionMaker || "", // メーカー名を日本語に変換
        grindSize: formData.grindSize || "",
        temperature: formData.temperature,
        coffeeAmount: formData.coffeeAmount,
        measurementMethod: formData.measurementMethod,
        waterAmount: formData.waterAmount,
        extractionTime: formData.extractionTime,
        acidity: formData.acidity,
        bitterness: formData.bitterness,
        overall: formData.overall,
        body: formData.body,
        aroma: formData.aroma,
        aftertaste: formData.aftertaste,
        memo: formData.textArea,
      };

      const recordId = await CoffeeStorageService.saveCoffeeRecord(
        coffeeRecordForSave,
        formData.imageUri
      );

      showWebAlert("保存成功", `コーヒーレコードが保存されました。`, resetForm);
    } catch (error) {
      Alert.alert(
        "保存エラー",
        error instanceof Error
          ? error.message
          : "コーヒーレコードの保存中にエラーが発生しました。"
      );

      console.error("保存エラー:", error);
    }
  };
  // Web向けのアラートコンポーネント
  const showWebAlert = (
    title: string,
    message: string,
    onConfirm: () => void
  ) => {
    Alert.alert(title, message, [{ text: "OK", onPress: onConfirm }]);
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contents}>
        {/* ヘッダーコンポーネントを配置 */}
        <HeaderComponent />
        <PageTitleComponent TextData={TextData} />

        <View style={[styles.absoluteBox, styles.mainContents]}>
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={true}
            ref={scrollViewRef}
          >
            <ImageUploadComponent
              key={`imageUpload-${resetKey}`}
              onChange={handleImageChange}
              value={imageData}
            />
            <InputComponent
              key={`beansName-${resetKey}`}
              dataTitle={InputLabel.beansName}
              onChange={(value: string) =>
                handleInputChange("beansName", value)
              }
              value={formData.beansName}
            />
            <CoffeeTypesSelect
              key={`variety-${resetKey}`}
              dataTitle={SelectLabel.variety}
              onChange={(value: string) => handleSelectChange("variety", value)}
              value={formData.variety}
            />
            <InputComponent
              key={`productionArea-${resetKey}`}
              dataTitle={InputLabel.productionArea}
              onChange={(value: string) =>
                handleInputChange("productionArea", value)
              }
              value={formData.productionArea}
            />
            <CoffeeProcessingSelect
              key={`roastingDegree-${resetKey}`}
              dataTitle={SelectLabel.roastingDegree}
              onChange={(value: string) =>
                handleSelectChange("roastingDegree", value)
              }
              value={formData.roastingDegree}
            />
            <HierarchicalCoffeeSelect
              primaryTitle="抽出方法"
              secondaryTitle="抽出器具"
              onPrimaryChange={(value) =>
                handleSelectChange("extractionMethod", value)
              }
              onSecondaryChange={(value) =>
                handleSelectChange("extractionMaker", value)
              }
              primaryValue={formData.extractionMethod}
              secondaryValue={formData.extractionMaker}
            />
            <CoffeeProcessingSelect
              key={`grindSize-${resetKey}`}
              dataTitle={SelectLabel.grindSize}
              onChange={(value: string) =>
                handleSelectChange("grindSize", value)
              }
              value={formData.grindSize}
            />
            <NumberComponent
              key={`temperature-${resetKey}`}
              dataTitle={NumberLabel.temperature}
              onChange={(value: number) =>
                handleInputChange("temperature", value)
              }
              value={formData.temperature}
            />
            <NumberComponent
              key={`coffeeAmount-${resetKey}`}
              dataTitle={NumberLabel.coffeeAmount}
              onChange={(value: number) =>
                handleInputChange("coffeeAmount", value)
              }
              value={formData.coffeeAmount}
            />
            <MeasurementSelector
              key={`measurementMethod-${resetKey}`}
              dataTitle={measurementLabel}
              onChange={(value: string) =>
                handleMeasurementSelect("measurementMethod", value)
              }
              value={formData.measurementMethod}
            />
            <NumberComponent
              key={`waterAmount-${resetKey}`}
              dataTitle={NumberLabel.waterAmount}
              onChange={(value: number) =>
                handleInputChange("waterAmount", value)
              }
              value={formData.waterAmount}
            />
            <MeasuredTimeInputComponent
              key={`extractionTime-${resetKey}`}
              onChange={handleMeasuredTimeChange}
              value={formData.extractionTime}
            />
            <RangeComponent
              key={`acidity-${resetKey}`}
              dataTitle={RangeLabel.acidity}
              onChange={(value: number) => handleRangeChange("acidity", value)}
              value={rangeValues.acidity}
            />
            <RangeComponent
              key={`bitterness-${resetKey}`}
              dataTitle={RangeLabel.bitterness}
              onChange={(value: number) =>
                handleRangeChange("bitterness", value)
              }
              value={rangeValues.bitterness}
            />
            <RangeComponent
              key={`body-${resetKey}`}
              dataTitle={RangeLabel.body}
              onChange={(value: number) => handleRangeChange("body", value)}
              value={rangeValues.body}
            />
            <RangeComponent
              key={`aroma-${resetKey}`}
              dataTitle={RangeLabel.aroma}
              onChange={(value: number) => handleRangeChange("aroma", value)}
              value={rangeValues.aroma}
            />
            <RangeComponent
              key={`aftertaste-${resetKey}`}
              dataTitle={RangeLabel.aftertaste}
              onChange={(value: number) =>
                handleRangeChange("aftertaste", value)
              }
              value={rangeValues.aftertaste}
            />
            <RadarChart data={rangeValues} />
            <OverallPreferenceRangeComponent
              key={`overall-${resetKey}`}
              onChange={(value: number) =>
                handleOverallPreferenceChange("overall", value)
              }
              value={rangeValues.overall}
            />
            <TextAreaComponent
              key={`textArea-${resetKey}`}
              onChange={handleTextAreaChange}
              value={formData.textArea}
            />
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>保存</Text>
            </TouchableOpacity>

            <Button
              title="上へ"
              color={"#5D4037"}
              onPress={handleScrollToTop}
              accessibilityLabel="上へ"
            />
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  contents: {
    flex: 1,

    alignItems: "center", // 横方向の中心に配置
  },
  absoluteBox: {
    flex: 1,
    position: "absolute",
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
  },
  mainContents: {
    maxWidth: screenWidth > 768 ? 700 : "100%", // 例: タブレット以上で最大幅を設定
    marginHorizontal: "auto", // これが水平方向の中央寄せの肝
    top: 210,
    bottom: 0,
  },
  scrollContainer: {
    alignItems: "stretch",
  },

  text: {
    color: "#000",
    fontSize: 18,
  },

  submitButton: {
    backgroundColor: "#4A90E2",
    padding: 15,
    borderRadius: 10,
    width: "90%",
    alignItems: "center",
    marginVertical: 20,
    marginHorizontal: "auto", // 水平方向の中央寄せ
  },
  submitButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  statusIndicator: {
    marginTop: 15,
    padding: 10,
    alignItems: "center",
  },
  statusText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4CAF50",
  },
});
