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
import ImageUploadComponent from "../../components/ImageUploadComponent"; // ImageUploadComponentをインポート

import RadarChart from "../../components/RadarChart/RadarChart";
import CoffeeStorageService from "../../services/CoffeeStorageService"; // ストレージサービスをインポート
import * as FileSystem from "expo-file-system"; // expo-file-systemをインポート

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
  imageUri: string; // Base64またはWebアクセス可能なURIを格納
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
    productionArea: "産地",
  });
  const [SelectLabel, setSelectLabel] = useState({
    roastingDegree: "焙煎度",
    extractionMaker: "抽出メーカー",
    extractionMethod: "抽出方法",
    grindSize: "挽き目",
    variety: "品種",
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
    waterAmount: "湯量（ml）", // 湯量は通常mlで測ることが多いですが、gでも可
  });

  const [imageData, setImageData] = useState("");
  const [formData, setFormData] = useState({ ...initialFormData });
  const [rangeValues, setRangeValues] = useState({ ...initialRangeValues });

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
    setImageData(""); // 画像データもリセット
    setFormData({ ...initialFormData });
    setRangeValues({ ...initialRangeValues });
    setResetKey((prevKey) => prevKey + 1);
    setFormSubmitted(true);
  }, []);

  const handleInputChange = (label: string, value: string | number) => {
    setFormData({ ...formData, [label]: value });
  };

  const handleSelectChange = (label: string, value: string) => {
    setFormData((prevFormData) => ({ ...prevFormData, [label]: value }));
  };

  const handleRangeChange = (label: string, value: number) => {
    // RangeComponentからは数値が来ることを想定
    setFormData({ ...formData, [label]: value });
    setRangeValues({ ...rangeValues, [label]: value });
  };

  const handleTextAreaChange = (value: string) => {
    setFormData({ ...formData, textArea: value });
  };

  const handleMeasuredTimeChange = (value: string) => {
    setFormData({ ...formData, extractionTime: value });
  };

  // 画像変更ハンドラ - Base64変換処理を追加
  const handleImageChange = async (uri: string | null) => {
    if (!uri) {
      // URIがない場合はデフォルト画像または空を設定
      setImageData(""); // 画像データは空に
      setFormData({ ...formData, imageUri: "" }); // imageUriも空に
      return;
    }

    let processedUri = uri;

    // モバイル環境で、かつローカルファイルURIの場合のみBase64に変換
    if (Platform.OS !== "web" && uri.startsWith("file://")) {
      try {
        // ファイルをBase64形式で読み込む
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        // Base64 URI形式に変換 (データタイプを付加)
        // ImagePicker.MediaTypeOptions.Images の結果などから MIME タイプを取得できるとより良いですが、
        // ここでは単純にjpegと仮定しています。適切なMIMEタイプに修正してください。
        processedUri = `data:image/jpeg;base64,${base64}`;
        console.log(
          "Image converted to Base64:",
          processedUri.substring(0, 50) + "..."
        ); // ログ出力 (Base64は長いため短縮)
      } catch (error) {
        console.error("Failed to convert image to Base64:", error);
        Alert.alert("エラー", "画像の読み込みに失敗しました。");
        // Base64変換に失敗した場合はURIをクリア
        processedUri = "";
      }
    } else {
      // Web環境、またはモバイルだがローカルファイルURIでない場合はそのまま使用
      console.log(
        "Using original image URI:",
        processedUri.substring(0, 50) + "..."
      );
    }

    setImageData(processedUri); // 処理後のURIをimageDataにセット
    setFormData({ ...formData, imageUri: processedUri }); // 処理後のURIをformDataにセット
  };

  // 新しい送信ハンドラー
  const handleSubmit = async () => {
    // 必須フィールドのチェック
    const missingFields = (
      Object.keys(formData) as Array<keyof typeof formData>
    ).filter((field) => {
      const value = formData[field];
      // imageUriとtextAreaは必須ではないので除外
      if (field === "imageUri" || field === "textArea") {
        return false;
      }
      return (
        value === null ||
        value === undefined ||
        (typeof value === "string" && value === "") ||
        // 数値フィールドで0を許容しない場合はここを修正
        (typeof value === "number" &&
          value === 0 &&
          field !== "temperature" &&
          field !== "coffeeAmount" &&
          field !== "waterAmount")
      );
    });

    if (missingFields.length > 0) {
      const fieldNames = missingFields.map((field) => {
        // ユーザーフレンドリーなフィールド名に変換（必要に応じて）
        switch (field) {
          case "beansName":
            return "名称";
          case "variety":
            return "品種";
          case "productionArea":
            return "産地";
          case "roastingDegree":
            return "焙煎度";
          case "extractionMethod":
            return "抽出方法";
          case "extractionMaker":
            return "抽出メーカー";
          case "grindSize":
            return "挽き目";
          // 数値フィールドは必須から除外しているため通常ここには来ないはずですが、念のため
          case "temperature":
            return NumberLabel.temperature;
          case "coffeeAmount":
            return NumberLabel.coffeeAmount;
          case "waterAmount":
            return NumberLabel.waterAmount;
          case "extractionTime":
            return "抽出時間";
          case "acidity":
            return RangeLabel.acidity;
          case "bitterness":
            return RangeLabel.bitterness;
          case "sweetness":
            return RangeLabel.sweetness;
          case "body":
            return RangeLabel.body;
          case "aroma":
            return RangeLabel.aroma;
          case "aftertaste":
            return RangeLabel.aftertaste;
          default:
            return field;
        }
      });
      if (isWeb) {
        alert(
          `入力エラー\n以下の必須項目が未入力です：\n${fieldNames.join(", ")}`
        );
      } else {
        Alert.alert(
          "入力エラー",
          `以下の必須項目が未入力です：\n${fieldNames.join(", ")}`
        );
      }
      return;
    }

    try {
      const coffeeRecordForSave: Omit<CoffeeRecord, "id"> = {
        // imageUriはBase64変換されたものがformDataに格納されている
        imageUri: formData.imageUri || "", // 画像が選択されなかった場合は空文字列を保存
        name: formData.beansName,
        variety: formData.variety,
        productionArea: formData.productionArea,
        roastingDegree: formData.roastingDegree || "",
        extractionMethod: formData.extractionMethod || "",
        extractionMaker: formData.extractionMaker || "",
        grindSize: formData.grindSize || "",
        temperature: formData.temperature,
        coffeeAmount: formData.coffeeAmount,
        waterAmount: formData.waterAmount,
        extractionTime: formData.extractionTime,
        acidity: formData.acidity, // formDataに直接数値が格納されている
        bitterness: formData.bitterness, // formDataに直接数値が格納されている
        sweetness: formData.sweetness, // formDataに直接数値が格納されている
        body: formData.body, // formDataに直接数値が格納されている
        aroma: formData.aroma, // formDataに直接数値が格納されている
        aftertaste: formData.aftertaste, // formDataに直接数値が格納されている
        memo: formData.textArea,
      };

      // saveCoffeeRecord 関数は CoffeeRecordForSave オブジェクトと画像URIを引数に取るように修正
      const recordId = await CoffeeStorageService.saveCoffeeRecord(
        coffeeRecordForSave,
        formData.imageUri // imageUriを第2引数として渡す
      );

      showWebAlert(
        "保存成功",
        `コーヒーレコードが保存されました。ID: ${recordId}`,
        resetForm // 保存成功後にフォームをリセット
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

  // Web向けのアラートコンポーネント（モバイルでも動作するようにAlert.alertを使用）
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
          >
            {/* ImageUploadComponent に Base64 変換後のURIが渡されるようになる */}
            <ImageUploadComponent
              key={`imageUpload-${resetKey}`}
              onChange={handleImageChange} // 修正したハンドラを渡す
              value={imageData} // Base64変換されたURIまたは空文字列が渡される
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
              secondaryTitle="抽出メーカー"
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
            {/* RangeComponentからのonChangeは数値を受け取り、直接formDataを更新 */}
            <RangeComponent
              key={`acidity-${resetKey}`}
              dataTitle={RangeLabel.acidity}
              onChange={(value: number) => handleRangeChange("acidity", value)}
              value={formData.acidity} // formDataから値を参照
            />
            <RangeComponent
              key={`bitterness-${resetKey}`}
              dataTitle={RangeLabel.bitterness}
              onChange={(value: number) =>
                handleRangeChange("bitterness", value)
              }
              value={formData.bitterness} // formDataから値を参照
            />
            <RangeComponent
              key={`sweetness-${resetKey}`}
              dataTitle={RangeLabel.sweetness}
              onChange={(value: number) =>
                handleRangeChange("sweetness", value)
              }
              value={formData.sweetness} // formDataから値を参照
            />
            <RangeComponent
              key={`body-${resetKey}`}
              dataTitle={RangeLabel.body}
              onChange={(value: number) => handleRangeChange("body", value)}
              value={formData.body} // formDataから値を参照
            />
            <RangeComponent
              key={`aroma-${resetKey}`}
              dataTitle={RangeLabel.aroma}
              onChange={(value: number) => handleRangeChange("aroma", value)}
              value={formData.aroma} // formDataから値を参照
            />
            <RangeComponent
              key={`aftertaste-${resetKey}`}
              dataTitle={RangeLabel.aftertaste}
              onChange={(value: number) =>
                handleRangeChange("aftertaste", value)
              }
              value={formData.aftertaste} // formDataから値を参照
            />
            {/* RadarChart には rangeValues ではなく formData の値を渡す */}
            <RadarChart
              data={{
                acidity: Number(formData.acidity) || 0,
                bitterness: Number(formData.bitterness) || 0,
                sweetness: Number(formData.sweetness) || 0,
                body: Number(formData.body) || 0,
                aroma: Number(formData.aroma) || 0,
                aftertaste: Number(formData.aftertaste) || 0,
              }}
            />
            <TextAreaComponent
              key={`textArea-${resetKey}`}
              onChange={handleTextAreaChange}
              value={formData.textArea}
            />
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit} // 修正したハンドラを渡す
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
