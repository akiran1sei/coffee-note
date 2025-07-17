// [id].tsx

import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Text,
  Alert,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import HeaderComponent from "@/components/HeaderComponent";
import PageTitleComponent from "@/components/PageTitleComponent";

import { CoffeeRecord } from "@/types/CoffeeTypes";

import CoffeeStorageService from "@/services/CoffeeStorageService";
import { GlobalStyles } from "../../styles/GlobalStyles";
import UpperButton from "@/components/button/Upper";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import ShopEditComponent from "@/components/Edit/ShopEdit";
import SelfEditComponent from "@/components/Edit/SelfEdit";

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
  self: true,
  shopDate: "",
  shopAddress: "",
  shopUrl: "",
};

const initialRangeValues = {
  acidity: 0,
  bitterness: 0,
  body: 0,
  aroma: 0,
  aftertaste: 0,
  overall: 0,
};

export default function EditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const TextData = "Coffee Edit"; // ページタイトルに表示するテキスト
  const [resetKey, setResetKey] = useState(0);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [createScreen, setCreateScreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [originalRecord, setOriginalRecord] = useState<CoffeeRecord | null>(
    null
  );

  const [InputLabel, setInputLabel] = useState({
    beansName: "名称",
    productionArea: "産地",
    shopName: "店名",
    shopPrice: "店の価格（円）",
    shopAddress: "店の住所",
    shopUrl: "店のURL",
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
    shopPrice: "店の価格（円）",
  });

  const [createDate, setCreateDate] = useState("");
  const [imageData, setImageData] = useState("");
  const [formData, setFormData] = useState({ ...initialFormData });
  const [rangeValues, setRangeValues] = useState({ ...initialRangeValues });
  const [showScrollToTopButton, setShowScrollToTopButton] = useState(false);

  // 既存レコードの読み込み
  useEffect(() => {
    const loadRecord = async () => {
      if (!id) {
        Alert.alert("エラー", "レコードIDが指定されていません。");
        router.back();
        return;
      }

      try {
        setLoading(true);
        const record = await CoffeeStorageService.getCoffeeRecordById(id);

        if (!record) {
          Alert.alert("エラー", "レコードが見つかりません。");
          router.back();
          return;
        }

        setOriginalRecord(record);

        // フォームデータを既存レコードで初期化
        const loadedFormData = {
          imageUri: record.imageUri || "",
          beansName: record.name || "",
          variety: record.variety || "",
          productionArea: record.productionArea || "",
          roastingDegree: record.roastingDegree || "",
          extractionMethod: record.extractionMethod || "",
          extractionMaker: record.extractionMaker || "",
          grindSize: record.grindSize || "",
          temperature:
            typeof record.temperature === "string"
              ? Number(record.temperature) || 0
              : record.temperature || 0,
          coffeeAmount:
            typeof record.coffeeAmount === "string"
              ? Number(record.coffeeAmount) || 0
              : record.coffeeAmount || 0,
          measurementMethod: record.measurementMethod || "",
          waterAmount:
            typeof record.waterAmount === "string"
              ? Number(record.waterAmount) || 0
              : record.waterAmount || 0,
          extractionTime: record.extractionTime,
          acidity: record.acidity || 0,
          bitterness: record.bitterness || 0,
          overall: record.overall || 0,
          body: record.body || 0,
          aroma: record.aroma || 0,
          aftertaste: record.aftertaste || 0,
          textArea: record.memo || "",
          shopName: record.shopName || "",
          shopPrice:
            typeof record.shopPrice === "string"
              ? Number(record.shopPrice) || 0
              : record.shopPrice || 0,
          self: record.self,
          shopDate: record.shopDate || "",
          shopAddress: record.shopAddress || "",
          shopUrl: record.shopUrl || "",
        };

        const loadedRangeValues = {
          acidity: record.acidity || 0,
          bitterness: record.bitterness || 0,
          body: record.body || 0,
          aroma: record.aroma || 0,
          aftertaste: record.aftertaste || 0,
          overall: record.overall || 0,
        };

        setFormData(loadedFormData);
        setRangeValues(loadedRangeValues);
        setImageData(record.imageUri || "");

        // createScreenを設定（self: true なら false、self: false なら true）
        setCreateScreen(!record.self);

        // 作成日を設定
        if (record.createdAt) {
          const date = new Date(record.createdAt);
          const formattedDate = `${date.getFullYear()}年${
            date.getMonth() + 1
          }月${date.getDate()}日`;
          setCreateDate(formattedDate);
        }
      } catch (error) {
        console.error("レコード読み込みエラー:", error);
        Alert.alert("エラー", "レコードの読み込みに失敗しました。");
        router.back();
      } finally {
        setLoading(false);
      }
    };

    loadRecord();
  }, [id, router]);

  // フォームリセット関数（元のデータに戻す）
  const resetForm = useCallback(() => {
    if (originalRecord) {
      const resetFormData = {
        imageUri: originalRecord.imageUri || "",
        beansName: originalRecord.name || "",
        variety: originalRecord.variety || "",
        productionArea: originalRecord.productionArea || "",
        roastingDegree: originalRecord.roastingDegree || "",
        extractionMethod: originalRecord.extractionMethod || "",
        extractionMaker: originalRecord.extractionMaker || "",
        grindSize: originalRecord.grindSize || "",
        temperature:
          typeof originalRecord.temperature === "string"
            ? Number(originalRecord.temperature) || 0
            : originalRecord.temperature || 0,
        coffeeAmount:
          typeof originalRecord.coffeeAmount === "string"
            ? Number(originalRecord.coffeeAmount) || 0
            : originalRecord.coffeeAmount || 0,
        measurementMethod: originalRecord.measurementMethod || "",
        waterAmount:
          typeof originalRecord.waterAmount === "string"
            ? Number(originalRecord.waterAmount) || 0
            : originalRecord.waterAmount || 0,
        extractionTime: originalRecord.extractionTime,
        acidity: originalRecord.acidity || 0,
        bitterness: originalRecord.bitterness || 0,
        overall: originalRecord.overall || 0,
        body: originalRecord.body || 0,
        aroma: originalRecord.aroma || 0,
        aftertaste: originalRecord.aftertaste || 0,
        textArea: originalRecord.memo || "",
        shopName: originalRecord.shopName || "",
        shopPrice:
          typeof originalRecord.shopPrice === "string"
            ? Number(originalRecord.shopPrice) || 0
            : originalRecord.shopPrice || 0,
        self: originalRecord.self,
        shopDate: originalRecord.shopDate || "",
        shopAddress: originalRecord.shopAddress || "",
        shopUrl: originalRecord.shopUrl || "",
      };

      const resetRangeValues = {
        acidity: originalRecord.acidity || 0,
        bitterness: originalRecord.bitterness || 0,
        body: originalRecord.body || 0,
        aroma: originalRecord.aroma || 0,
        aftertaste: originalRecord.aftertaste || 0,
        overall: originalRecord.overall || 0,
      };

      setFormData(resetFormData);
      setRangeValues(resetRangeValues);
      setImageData(originalRecord.imageUri || "");
      setCreateScreen(!originalRecord.self);
      setResetKey((prevKey) => prevKey + 1);
    }
  }, [originalRecord]);

  // createScreen と formData.self の同期ロジック
  const SwitchScreenButton = () => {
    setCreateScreen((prevCreateScreen) => {
      const newCreateScreen = !prevCreateScreen;
      setFormData((prevFormData) => ({
        ...prevFormData,
        self: !newCreateScreen,
      }));
      console.log(
        "SwitchScreenButton: createScreen の新しい値:",
        newCreateScreen
      );
      console.log(
        "SwitchScreenButton: formData.self の新しい値:",
        !newCreateScreen
      );
      return newCreateScreen;
    });
  };

  const handleInputChange = (label: string, value: string | number) => {
    // formDataが持つプロパティの型定義に基づいて、数値に変換する必要があるか判断
    const numberFields: Array<keyof typeof initialFormData> = [
      // 型アサーションを追加
      "temperature",
      "coffeeAmount",
      "waterAmount",
      "shopPrice",
      "acidity",
      "bitterness",
      "overall",
      "body",
      "aroma",
      "aftertaste",
    ];

    let processedValue: string | number = value;

    if (numberFields.includes(label as keyof typeof initialFormData)) {
      // 型アサーションを追加
      if (typeof value === "string") {
        processedValue = value === "" ? 0 : Number(value);
        if (isNaN(processedValue as number)) {
          processedValue = 0;
        }
      }
    }

    setFormData({ ...formData, [label]: processedValue });
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
    setFormData({ ...formData, imageUri: value });
  };

  const scrollViewRef = useRef<ScrollView>(null);

  // 更新用の送信ハンドラー
  const handleSubmit = async () => {
    if (!originalRecord) {
      Alert.alert("エラー", "元のレコードが見つかりません。");
      return;
    }

    // 必須フィールドのチェック（create.tsxと同じロジック）
    const commonMissingFields = (
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

    let specificMissingFields: string[] = [];

    if (createScreen) {
      // Shop Ver.
      const shopRequiredFields = ["shopName"];
      specificMissingFields = commonMissingFields.filter((field) =>
        shopRequiredFields.includes(field)
      );
    } else {
      // Self Ver.
      const selfRequiredFields = [
        "beansName",
        "variety",
        "roastingDegree",
        "extractionMethod",
        "extractionMaker",
        "grindSize",
        "measurementMethod",
        // "extractionTime",
      ];
      specificMissingFields = commonMissingFields.filter((field) =>
        selfRequiredFields.includes(field)
      );
    }

    const tasteRelatedFields = [
      "acidity",
      "bitterness",
      "overall",
      "body",
      "aroma",
      "aftertaste",
    ];
    specificMissingFields = specificMissingFields.filter(
      (field) => !tasteRelatedFields.includes(field as string)
    );

    if (specificMissingFields.length > 0) {
      const missingLabels = specificMissingFields.map((field) => {
        if (InputLabel[field as keyof typeof InputLabel]) {
          return InputLabel[field as keyof typeof InputLabel];
        } else if (SelectLabel[field as keyof typeof SelectLabel]) {
          return SelectLabel[field as keyof typeof SelectLabel];
        } else if (NumberLabel[field as keyof typeof NumberLabel]) {
          return NumberLabel[field as keyof typeof NumberLabel];
        }
        return field;
      });
      return Alert.alert(
        "入力エラー",
        `以下の必須項目が未入力です：\n${missingLabels.join(", ")}`
      );
    }

    try {
      const updatedRecord: CoffeeRecord = {
        id: originalRecord.id,
        imageUri: formData.imageUri || "../../assets/images/no-image.png",
        name: formData.beansName,
        variety: formData.variety,
        productionArea: formData.productionArea,
        roastingDegree: formData.roastingDegree || "",
        extractionMethod: formData.extractionMethod || "",
        extractionMaker: formData.extractionMaker || "",
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
        createdAt: originalRecord.createdAt, // 元の作成日を保持
        shopName: formData.shopName || "",
        shopPrice: formData.shopPrice || 0,
        self: formData.self,
        shopDate: formData.shopDate || "",
        shopAddress: formData.shopAddress || "",
        shopUrl: formData.shopUrl || "",
      };

      await CoffeeStorageService.updateCoffeeRecord(
        updatedRecord.id,
        updatedRecord
      );

      showWebAlert("更新成功", "コーヒーコードが更新されました。", () => {
        router.back();
      });
    } catch (error) {
      Alert.alert(
        "更新エラー",
        error instanceof Error
          ? error.message
          : "コーヒーレコードの更新中にエラーが発生しました。"
      );
      console.error("更新エラー:", error);
    }
  };

  // 削除ハンドラー
  const handleDelete = () => {
    if (!originalRecord) return;

    Alert.alert(
      "削除確認",
      "このコーヒーレコードを削除してもよろしいですか？",
      [
        {
          text: "キャンセル",
          style: "cancel",
        },
        {
          text: "削除",
          style: "destructive",
          onPress: async () => {
            try {
              await CoffeeStorageService.deleteCoffeeRecord(originalRecord.id);
              console.log("削除成功:", originalRecord.id);
              showWebAlert(
                "削除成功",
                "コーヒーレコードが削除されました。",
                () => {
                  router.back();
                }
              );
            } catch (error) {
              Alert.alert(
                "削除エラー",
                error instanceof Error
                  ? error.message
                  : "コーヒーレコードの削除中にエラーが発生しました。"
              );
              console.error("削除エラー:", error);
            }
          },
        },
      ]
    );
  };

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
      if (scrollY > 200 && !showScrollToTopButton) {
        setShowScrollToTopButton(true);
      } else if (scrollY <= 200 && showScrollToTopButton) {
        setShowScrollToTopButton(false);
      }
    },
    [showScrollToTopButton]
  );

  if (loading) {
    return (
      <SafeAreaView style={[GlobalStyles.container, styles.createContainer]}>
        <View style={GlobalStyles.contents}>
          <HeaderComponent />
          <PageTitleComponent TextData="Loading..." />
          <View style={[GlobalStyles.absoluteBox, GlobalStyles.mainContents]}>
            <Text style={styles.loadingText}>
              レコードを読み込んでいます...
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={[GlobalStyles.container, styles.createContainer]}>
        <View style={GlobalStyles.contents}>
          <HeaderComponent />
          <PageTitleComponent TextData={TextData} />

          <View style={[GlobalStyles.absoluteBox, GlobalStyles.mainContents]}>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.switchButton}
                onPress={SwitchScreenButton}
              >
                <Text style={styles.switchButtonText}>
                  {createScreen ? "Switch to Self Ver." : "Switch to Shop Ver."}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.resetButton} onPress={resetForm}>
                <Text style={styles.resetButtonText}>リセット</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDelete}
              >
                <Text style={styles.deleteButtonText}>削除</Text>
              </TouchableOpacity>
            </View>

            <View>
              <Text style={styles.versionText}>
                {createScreen ? "お店で購入した珈琲" : "自分で淹れた珈琲"}
              </Text>
              <Text style={styles.dateText}>作成日: {createDate}</Text>
            </View>

            <ScrollView
              contentContainerStyle={GlobalStyles.scrollContainer}
              showsVerticalScrollIndicator={true}
              ref={scrollViewRef}
              onScroll={handleScroll}
              scrollEventThrottle={16}
            >
              {createScreen ? (
                <ShopEditComponent
                  resetKey={resetKey}
                  formData={formData}
                  rangeValues={rangeValues}
                  imageData={imageData}
                  InputLabel={InputLabel}
                  RangeLabel={RangeLabel}
                  NumberLabel={NumberLabel}
                  handleInputChange={handleInputChange}
                  handleRangeChange={handleRangeChange}
                  handleOverallPreferenceChange={handleOverallPreferenceChange}
                  handleTextAreaChange={handleTextAreaChange}
                  handleImageChange={handleImageChange}
                  handleSubmit={handleSubmit}
                />
              ) : (
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
              )}
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
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  switchButton: {
    backgroundColor: "#4A90E2",
    padding: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
    marginRight: 5,
  },
  switchButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  resetButton: {
    backgroundColor: "#FFA500",
    padding: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
    marginHorizontal: 5,
  },
  resetButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  deleteButton: {
    backgroundColor: "#FF4444",
    padding: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
    marginLeft: 5,
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  versionText: {
    width: "100%",
    height: "auto",
    textAlign: "center",
    fontFamily: "Caveat",
    color: "#D2B48C",
    fontSize: 32,
  },
  dateText: {
    width: "100%",
    textAlign: "center",
    color: "#666",
    fontSize: 16,
    marginBottom: 10,
  },
  loadingText: {
    textAlign: "center",
    fontSize: 18,
    color: "#666",
    marginTop: 50,
  },
});
