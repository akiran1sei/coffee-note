import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Text,
  Alert,
  Platform,
} from "react-native";
import HeaderComponent from "../../components/HeaderComponent";
import PageTitleComponent from "../../components/PageTitleComponent";
import SelectComponent from "../../components/SelectComponent";
import InputComponent from "../../components/InputComponent";
import RangeComponent from "../../components/RangeComponent";
import NumberComponent from "../../components/NumberComponent";
import ImageUploadComponent from "../../components/ImageUploadComponent";
import TextAreaComponent from "../../components/TextAreaComponent";
import MeasuredTimeInputComponent from "../../components/MeasuredTimeInputComponent ";
import RadarChart from "../../components/RadarChart/RadarChart";
import CoffeeStorageService from "../../services/CoffeeStorageService"; // ストレージサービスをインポート

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
  waterAmount: number;
  extractionTime: string;
  acidity: number;
  bitterness: number;
  sweetness: number;
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
  waterAmount: 0,
  extractionTime: "",
  acidity: 0,
  bitterness: 0,
  sweetness: 0,
  body: 0,
  aroma: 0,
  aftertaste: 0,
  textArea: "",
};

const initialRangeValues = {
  acidity: 0,
  bitterness: 0,
  sweetness: 0,
  body: 0,
  aroma: 0,
  aftertaste: 0,
};
export default function CreateScreen() {
  const TextData = "Coffee Create"; // ページタイトルに表示するテキスト
  const [resetKey, setResetKey] = useState(0);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isWeb] = useState(Platform.OS === "web");
  const [InputLabel, setInputLabel] = useState({
    beansName: "名称",
    variety: "品種",
    productionArea: "産地",
  });
  const [SelectLabel, setSelectLabel] = useState({
    roastingDegree: "焙煎度",
    extractionMaker: "抽出メーカー",
    extractionMethod: "抽出方法",
    grindSize: "挽き目",
  });
  const [RangeLabel, setRangeLabel] = useState({
    acidity: "酸味",
    bitterness: "苦味",
    sweetness: "甘味",
    body: "コク",
    aroma: "香り",
    aftertaste: "後味",
  });
  const [NumberLabel, setNumberLabel] = useState({
    temperature: "温度（℃）",
    coffeeAmount: "紛量（g）",
    waterAmount: "湯量（g）",
  });

  const [imageData, setImageData] = useState("");
  const [formData, setFormData] = useState({ ...initialFormData });
  const [rangeValues, setRangeValues] = useState({ ...initialRangeValues });
  console.log(formData);
  // Web環境でフォーム送信後の状態をリセット
  useEffect(() => {
    if (formSubmitted && isWeb) {
      // 短い遅延後にフォームをリセット
      const timer = setTimeout(() => {
        setFormSubmitted(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [formSubmitted, isWeb]);
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

  const handleSelectChange = (label: string, value: string) => {
    setFormData({ ...formData, [label]: value });
  };

  const handleRangeChange = (label: string, value: number) => {
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

  // 新しい送信ハンドラー
  const handleSubmit = async () => {
    // 型安全な方法で必須フィールドをチェック

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
      if (isWeb) {
        alert(
          `入力エラー\n以下の必須項目が未入力です：\n${requiredFields.join(
            ", "
          )}`
        );
      } else {
        Alert.alert(
          "入力エラー",
          `以下の必須項目が未入力です：\n${requiredFields.join(", ")}`
        );
      }
      return;
    }

    try {
      // バリデーション関数の修正
      function validateRoastingDegree(
        level: string
      ):
        | "lightroast"
        | "cinnamonroast"
        | "mediumroast"
        | "highroast"
        | "cityroast"
        | "fullcityroast"
        | "frenchroast"
        | "italianroast" {
        const validLevels = [
          "lightroast",
          "cinnamonroast",
          "mediumroast",
          "highroast",
          "cityroast",
          "fullcityroast",
          "frenchroast",
          "italianroast",
        ];
        if (!validLevels.includes(level)) {
          throw new Error(`Invalid roast level: ${level}`);
        }
        return level as
          | "lightroast"
          | "cinnamonroast"
          | "mediumroast"
          | "highroast"
          | "cityroast"
          | "fullcityroast"
          | "frenchroast"
          | "italianroast";
      }

      function validateExtractionMethod(
        method: string
      ):
        | "paperdrip"
        | "neldrip"
        | "metalfilterdrip"
        | "frenchpress"
        | "aeropress"
        | "coffeemakerdrip"
        | "syphon"
        | "espresso"
        | "mokapotextraction"
        | "icedrip" {
        const validMethods = [
          "paperdrip",
          "neldrip",
          "metalfilterdrip",
          "frenchpress",
          "aeropress",
          "coffeemakerdrip",
          "syphon",
          "espresso",
          "mokapotextraction",
          "icedrip",
        ];
        if (!validMethods.includes(method)) {
          throw new Error(`Invalid extraction method: ${method}`);
        }
        return method as
          | "paperdrip"
          | "neldrip"
          | "metalfilterdrip"
          | "frenchpress"
          | "aeropress"
          | "coffeemakerdrip"
          | "syphon"
          | "espresso"
          | "mokapotextraction"
          | "icedrip";
      }

      function validateGrindSize(
        size: string
      ):
        | "extrafine"
        | "fine"
        | "mediumfine"
        | "medium"
        | "coarse"
        | "extracourse" {
        const validSizes = [
          "extrafine",
          "fine",
          "mediumfine",
          "medium",
          "coarse",
          "extracourse",
        ];
        if (!validSizes.includes(size)) {
          throw new Error(`Invalid grind size: ${size}`);
        }
        return size as
          | "extrafine"
          | "fine"
          | "mediumfine"
          | "medium"
          | "coarse"
          | "extracourse";
      }

      // 型安全な変換
      const coffeeRecord: Omit<CoffeeRecord, "id"> = {
        imageUri: formData.imageUri || "../../assets/images/no-image.png", // デフォルト画像を設定
        name: formData.beansName,
        variety: formData.variety,
        productionArea: formData.productionArea,
        roastingDegree: validateRoastingDegree(formData.roastingDegree),
        extractionMethod: validateExtractionMethod(formData.extractionMethod),
        extractionMaker: formData.extractionMaker,
        grindSize: validateGrindSize(formData.grindSize),
        temperature: formData.temperature,
        coffeeAmount: formData.coffeeAmount,
        waterAmount: formData.waterAmount,
        extractionTime: formData.extractionTime,
        acidity: formData.acidity,
        bitterness: formData.bitterness,
        sweetness: formData.sweetness,
        body: formData.body,
        aroma: formData.aroma,
        aftertaste: formData.aftertaste,
        memo: formData.textArea,
      };

      const recordId = await CoffeeStorageService.saveCoffeeRecord(
        coffeeRecord,
        formData.imageUri
      );

      showWebAlert(
        "保存成功",
        `コーヒーレコードが保存されました。ID: ${recordId}`,
        resetForm
      );
    } catch (error) {
      if (isWeb) {
        alert(
          `保存エラー\n${
            error instanceof Error
              ? error.message
              : "コーヒーレコードの保存中にエラーが発生しました。"
          }`
        );
      } else {
        Alert.alert(
          "保存エラー",
          error instanceof Error
            ? error.message
            : "コーヒーレコードの保存中にエラーが発生しました。"
        );
      }
      console.error("保存エラー:", error);
    }
  };
  // Web向けのアラートコンポーネント
  const showWebAlert = (
    title: string,
    message: string,
    onConfirm: () => void
  ) => {
    if (isWeb) {
      alert(`${title}\n${message}`);
      onConfirm();
    } else {
      Alert.alert(title, message, [{ text: "OK", onPress: onConfirm }]);
    }
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
          >
            <ImageUploadComponent
              key={`imageUpload-${resetKey}`} // 追加
              onChange={handleImageChange}
              value={imageData}
            />
            <InputComponent
              key={`beansName-${resetKey}`} // 追加
              dataTitle={InputLabel.beansName}
              onChange={(value: string) =>
                handleInputChange("beansName", value)
              }
              value={formData.beansName}
            />
            <InputComponent
              key={`variety-${resetKey}`} // 追加
              dataTitle={InputLabel.variety}
              onChange={(value: string) => handleInputChange("variety", value)}
              value={formData.variety}
            />
            <InputComponent
              key={`productionArea-${resetKey}`} // 追加
              dataTitle={InputLabel.productionArea}
              onChange={(value: string) =>
                handleInputChange("productionArea", value)
              }
              value={formData.productionArea}
            />
            <SelectComponent
              key={`roastingDegree-${resetKey}`} // 追加
              dataTitle={SelectLabel.roastingDegree}
              onChange={(value: string) =>
                handleSelectChange("roastingDegree", value)
              }
              value={formData.roastingDegree}
            />
            <SelectComponent
              key={`extractionMethod-${resetKey}`} // 追加
              dataTitle={SelectLabel.extractionMethod}
              onChange={(value: string) =>
                handleSelectChange("extractionMethod", value)
              }
              value={formData.extractionMethod}
            />
            <SelectComponent
              key={`extractionMaker-${resetKey}`} // 追加
              dataTitle={SelectLabel.extractionMaker}
              onChange={(value: string) =>
                handleSelectChange("extractionMaker", value)
              }
              value={formData.extractionMaker}
            />
            <SelectComponent
              key={`grindSize-${resetKey}`} // 追加
              dataTitle={SelectLabel.grindSize}
              onChange={(value: string) =>
                handleSelectChange("grindSize", value)
              }
              value={formData.grindSize}
            />
            <NumberComponent
              key={`temperature-${resetKey}`} // 追加
              dataTitle={NumberLabel.temperature}
              onChange={(value: number) =>
                handleInputChange("temperature", value)
              }
              value={formData.temperature}
            />
            <NumberComponent
              key={`coffeeAmount-${resetKey}`} // 追加
              dataTitle={NumberLabel.coffeeAmount}
              onChange={(value: number) =>
                handleInputChange("coffeeAmount", value)
              }
              value={formData.coffeeAmount}
            />
            <NumberComponent
              key={`waterAmount-${resetKey}`} // 追加
              dataTitle={NumberLabel.waterAmount}
              onChange={(value: number) =>
                handleInputChange("waterAmount", value)
              }
              value={formData.waterAmount}
            />
            <MeasuredTimeInputComponent
              key={`extractionTime-${resetKey}`} // 追加
              onChange={handleMeasuredTimeChange}
              value={formData.extractionTime}
            />
            <RangeComponent
              key={`acidity-${resetKey}`} // 追加
              dataTitle={RangeLabel.acidity}
              onChange={(value: number) => handleRangeChange("acidity", value)}
              value={rangeValues.acidity}
            />
            <RangeComponent
              key={`bitterness-${resetKey}`} // 追加
              dataTitle={RangeLabel.bitterness}
              onChange={(value: number) =>
                handleRangeChange("bitterness", value)
              }
              value={rangeValues.bitterness}
            />
            <RangeComponent
              key={`sweetness-${resetKey}`} // 追加
              dataTitle={RangeLabel.sweetness}
              onChange={(value: number) =>
                handleRangeChange("sweetness", value)
              }
              value={rangeValues.sweetness}
            />
            <RangeComponent
              key={`body-${resetKey}`} // 追加
              dataTitle={RangeLabel.body}
              onChange={(value: number) => handleRangeChange("body", value)}
              value={rangeValues.body}
            />
            <RangeComponent
              key={`aroma-${resetKey}`} // 追加
              dataTitle={RangeLabel.aroma}
              onChange={(value: number) => handleRangeChange("aroma", value)}
              value={rangeValues.aroma}
            />
            <RangeComponent
              key={`aftertaste-${resetKey}`} // 追加
              dataTitle={RangeLabel.aftertaste}
              onChange={(value: number) =>
                handleRangeChange("aftertaste", value)
              }
              value={rangeValues.aftertaste}
            />
            <RadarChart data={rangeValues} />
            <TextAreaComponent
              key={`textArea-${resetKey}`} // 追加
              onChange={handleTextAreaChange}
              value={formData.textArea}
            />
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>保存</Text>
            </TouchableOpacity>

            {isWeb && (
              <View style={styles.statusIndicator}>
                <Text style={styles.statusText}>
                  {formSubmitted ? "保存成功！" : ""}
                </Text>
              </View>
            )}
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
    justifyContent: "center", // 縦方向の中心に配置
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
    width: "100%",
    maxWidth: 500,
    marginHorizontal: "auto",
    top: 210,
    bottom: 0, // 画面の下部まで拡張
  },
  scrollContainer: {
    alignItems: "center", // 子要素を中央揃え
    paddingVertical: 20,
    paddingBottom: 40, // スクロール時の下部余白を追加
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
    marginTop: 20,
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
