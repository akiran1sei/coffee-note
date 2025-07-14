import React, { useState, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Text,
  Alert,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import HeaderComponent from "../../components/HeaderComponent";
import PageTitleComponent from "../../components/PageTitleComponent";
import SelfEditComponent from "../../components/Edit/SelfEdit";

import CoffeeStorageService from "../../services/CoffeeStorageService"; // ストレージサービスをインポート
import { GlobalStyles } from "../styles/GlobalStyles"; // ★追加
import UpperButton from "@/components/button/Upper";
import { GestureHandlerRootView } from "react-native-gesture-handler";

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
  createdAt: Date;
  shopName: string; // 店名（店で飲んだ場合のみ）
  shopPrice?: number; // 店の価格（店で飲んだ場合のみ）
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
  shopName: "",
  shopPrice: 0,
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
    shopName: "店名", // 店名のラベルを追加
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
    coffeeAmount: "粉量（g）",
    waterAmount: "湯量（g）",
    shopPrice: "店の価格（円）", // 店の価格のラベルを追加
  });

  const [imageData, setImageData] = useState("");
  const [formData, setFormData] = useState({ ...initialFormData });
  const [rangeValues, setRangeValues] = useState({ ...initialRangeValues });
  const [showScrollToTopButton, setShowScrollToTopButton] = useState(false);
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
  const handleMeasurementSelect = (value: string) => {
    setFormData({ ...formData, measurementMethod: value });
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
        createdAt: new Date(), // 現在の日時を設定
        shopName: formData.shopName || "", // 店名を追加
        shopPrice: formData.shopPrice || 0, // 店の価格を追加
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
  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const scrollY = event.nativeEvent.contentOffset.y;
      // 例えば、200pxスクロールしたらボタンを表示する
      if (scrollY > 200 && !showScrollToTopButton) {
        setShowScrollToTopButton(true);
      } else if (scrollY <= 200 && showScrollToTopButton) {
        setShowScrollToTopButton(false);
      }
    },
    [showScrollToTopButton]
  );
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={[GlobalStyles.container, styles.createContainer]}>
        <View style={GlobalStyles.contents}>
          {/* ヘッダーコンポーネントを配置 */}
          <HeaderComponent />
          <PageTitleComponent TextData={TextData} />

          <View style={[GlobalStyles.absoluteBox, GlobalStyles.mainContents]}>
            <ScrollView
              contentContainerStyle={GlobalStyles.scrollContainer}
              showsVerticalScrollIndicator={true}
              ref={scrollViewRef}
              onScroll={handleScroll} //  スクロールイベントを監視
              scrollEventThrottle={16}
            >
              <SelfEditComponent
                resetKey={resetKey}
                formData={formData}
                rangeValues={rangeValues}
                imageData={imageData}
                InputLabel={InputLabel}
                SelectLabel={SelectLabel}
                RangeLabel={RangeLabel}
                NumberLabel={NumberLabel}
                handleInputChange={handleInputChange}
                handleMeasurementSelect={handleMeasurementSelect}
                handleSelectChange={handleSelectChange}
                handleRangeChange={handleRangeChange}
                handleOverallPreferenceChange={handleOverallPreferenceChange}
                handleTextAreaChange={handleTextAreaChange}
                handleMeasuredTimeChange={handleMeasuredTimeChange}
                handleImageChange={handleImageChange}
                handleSubmit={handleSubmit}
              />
            </ScrollView>
            <UpperButton
              scrollViewRef={scrollViewRef}
              isVisible={showScrollToTopButton}
            />
          </View>
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  createContainer: {
    backgroundColor: "#F5F5F5",
  },
  formContainer: {
    width: "100%",
    paddingTop: 20,
    marginHorizontal: "auto",
    borderRadius: 10,
    backgroundColor: "#fff",
    shadowColor: "#333",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  text: {
    color: "#333",
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
    color: "#fff",
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
