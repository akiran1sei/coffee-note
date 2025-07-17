import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  version,
} from "react";
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

import { CoffeeRecord } from "../../types/CoffeeTypes";

import CoffeeStorageService from "../../services/CoffeeStorageService"; // ストレージサービスをインポート
import { GlobalStyles } from "../styles/GlobalStyles"; // ★追加
import UpperButton from "@/components/button/Upper";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import ShopEditComponent from "@/components/Edit/ShopEdit";
import SelfEditComponent from "@/components/Edit/SelfEdit";

// 初期状態を定数として定義
// initialFormData の self は、createScreen の初期値 (false) と一致するように true に設定
// createScreen: false -> SelfEditComponent が表示され、self: true であるため整合性が取れています
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

  self: true, // 初期は自分用の情報 (SelfEditComponentが表示される)
  shopDate: "", // 店で飲んだ日付（店で飲んだ場合のみ）
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
  // createScreen の初期値は false に設定されています。
  // false の場合は SelfEditComponent が表示され、initialFormData.self が true なので整合性があります。
  const [createScreen, setCreateScreen] = useState(false);
  const [InputLabel, setInputLabel] = useState({
    beansName: "名称",
    productionArea: "産地",

    shopName: "店名",
    shopPrice: "店の価格（円）",
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
  const [createDate, setCreateDate] = useState(""); // 作成日を管理するステート
  const [imageData, setImageData] = useState("");
  const [formData, setFormData] = useState({ ...initialFormData });
  const [rangeValues, setRangeValues] = useState({ ...initialRangeValues });
  const [showScrollToTopButton, setShowScrollToTopButton] = useState(false);

  // フォームリセット関数
  const resetForm = useCallback(() => {
    setImageData("../../assets/images/no-image.png");
    setFormData({ ...initialFormData });
    setRangeValues({ ...initialRangeValues });
    setResetKey((prevKey) => prevKey + 1);
    setFormSubmitted(true);
  }, []);

  // 現在の日付を取得し、`createDate` と `formData.shopDate` を設定
  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();

    const formattedDate = `${year}年${month}月${day}日`;
    const formattedDateSlash = `${year}/${month}/${day}`;

    // 作成日と、shopDateの初期値を現在の日付に設定
    setCreateDate(formattedDate);
    setFormData((prevFormData) => ({
      ...prevFormData,
      shopDate: formattedDateSlash, // shopDateをスラッシュ形式で設定
    }));

    console.log("初期化された作成日 (和暦):", formattedDate);
    console.log("初期化された作成日 (スラッシュ):", formattedDateSlash);
  }, []);

  // createScreen と formData.self の同期ロジック
  const SwitchScreenButton = () => {
    setCreateScreen((prevCreateScreen) => {
      const newCreateScreen = !prevCreateScreen; // 新しいcreateScreenの値を計算
      // newCreateScreen が true (Shop Ver.) の場合、self は false
      // newCreateScreen が false (Self Ver.) の場合、self は true
      setFormData((prevFormData) => ({
        ...prevFormData,
        self: !newCreateScreen,
      }));
      // ここに console.log を移動することで、状態更新後の値を確認できます
      console.log(
        "SwitchScreenButton: createScreen の新しい値:",
        newCreateScreen
      );
      console.log(
        "SwitchScreenButton: formData.self の新しい値:",
        !newCreateScreen
      );
      return newCreateScreen; // setCreateScreenに新しい値を返す
    });
  };
  console.log("SwitchScreenButton: createScreen の新しい値:", createScreen);
  console.log("SwitchScreenButton: formData.self の新しい値:", !createScreen);
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
    const commonMissingFields = (
      Object.keys(formData) as Array<keyof typeof formData>
    ).filter((field) => {
      const value = formData[field];
      // 空文字列、null、undefined、数値0を未入力と判断
      return (
        value === null ||
        value === undefined ||
        (typeof value === "string" && value === "") ||
        (typeof value === "number" && value === 0)
      );
    });

    let specificMissingFields: string[] = [];

    if (createScreen) {
      // Shop Ver. (createScreen が true)
      // ShopEditComponent に関連する必須フィールド
      const shopRequiredFields = [
        "shopName",
        "shopPrice",
        // "textArea", // メモは必須ではないので、ここでは除外
        // "imageUri", // 画像は必須ではないので、ここでは除外
      ];
      specificMissingFields = commonMissingFields.filter((field) =>
        shopRequiredFields.includes(field)
      );
    } else {
      // Self Ver. (createScreen が false)
      // SelfEditComponent に関連する必須フィールド
      const selfRequiredFields = [
        "beansName",
        "variety",
        "roastingDegree",
        "extractionMethod",
        "extractionMaker",
        "grindSize",
        "measurementMethod",
        "extractionTime",
      ];
      specificMissingFields = commonMissingFields.filter((field) =>
        selfRequiredFields.includes(field)
      );
    }

    // `acidity` から `aftertaste` までの範囲は、`rangeValues` から来ており、
    // ユーザーが0のままにすることも可能なので、ここでは必須フィールドから除外します。
    // もしこれらの項目も0以外を必須とするなら、上記の `specificMissingFields` に含めてください。
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
      // 日本語のラベルに変換して表示
      const missingLabels = specificMissingFields.map((field) => {
        if (InputLabel[field as keyof typeof InputLabel]) {
          return InputLabel[field as keyof typeof InputLabel];
        } else if (SelectLabel[field as keyof typeof SelectLabel]) {
          return SelectLabel[field as keyof typeof SelectLabel];
        } else if (NumberLabel[field as keyof typeof NumberLabel]) {
          return NumberLabel[field as keyof typeof NumberLabel];
        }
        return field; // ラベルが見つからない場合はそのまま表示
      });
      return Alert.alert(
        "入力エラー",
        `以下の必須項目が未入力です：\n${missingLabels.join(", ")}`
      );
    }

    try {
      // `Omit<CoffeeRecord, "id">` は `CoffeeRecord` から `id` プロパティを除外した型です。
      // CoffeeTypes.ts から CoffeeRecord をインポートする必要があります。
      type CoffeeRecordForSave = Omit<CoffeeRecord, "id">;
      const coffeeRecordForSave: CoffeeRecordForSave = {
        imageUri: formData.imageUri || "../../assets/images/no-image.png",
        name: formData.beansName, // SelfEditの場合に設定
        variety: formData.variety, // SelfEditの場合に設定
        productionArea: formData.productionArea || "--", // SelfEditの場合に設定
        roastingDegree: formData.roastingDegree || "",
        extractionMethod: formData.extractionMethod || "",
        extractionMaker: formData.extractionMaker || "",
        grindSize: formData.grindSize || "",
        temperature: formData.temperature || "--",
        coffeeAmount: formData.coffeeAmount || "--",
        measurementMethod: formData.measurementMethod,
        waterAmount: formData.waterAmount || "--",
        extractionTime: formData.extractionTime, // ここで初期値を設定
        acidity: formData.acidity,
        bitterness: formData.bitterness,
        overall: formData.overall,
        body: formData.body,
        aroma: formData.aroma,
        aftertaste: formData.aftertaste,
        memo: formData.textArea,
        createdAt: new Date(), // 現在の日時を設定
        shopName: formData.shopName || "", // ShopEditの場合に設定
        shopPrice: formData.shopPrice || "--", // ShopEditの場合に設定
        self: formData.self, // 画面切り替えで設定される
        shopDate: formData.shopDate || "", // ShopEditの場合に設定
      };

      const recordId = await CoffeeStorageService.saveCoffeeRecord(
        coffeeRecordForSave,
        formData.imageUri
      );
      console.log("保存成功:", recordId);
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

  // Web向けのアラートコンポーネント (これは既存のもので問題ありません)
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

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={[GlobalStyles.container, styles.createContainer]}>
        <View style={GlobalStyles.contents}>
          <HeaderComponent />
          <PageTitleComponent TextData={TextData} />

          <View style={[GlobalStyles.absoluteBox, GlobalStyles.mainContents]}>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={SwitchScreenButton} // ここを直接関数参照にすることもできます
            >
              <Text style={styles.submitButtonText}>
                {createScreen ? "Switch to Self Ver." : "Switch to Shop Ver."}
              </Text>
            </TouchableOpacity>
            <View>
              {/* createScreen: true なら Shop (お店), false なら Self (自分) */}
              <Text style={styles.versionText}>
                {createScreen ? "お店で購入した珈琲" : "自分で淹れた珈琲"}
              </Text>
            </View>
            <ScrollView
              contentContainerStyle={GlobalStyles.scrollContainer}
              showsVerticalScrollIndicator={true}
              ref={scrollViewRef}
              onScroll={handleScroll}
              scrollEventThrottle={16}
            >
              {createScreen ? ( // createScreen が true なら ShopEditComponent
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
                // createScreen が false なら SelfEditComponent
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
  versionText: {
    width: "100%",
    height: "auto",
    textAlign: "center",
    fontFamily: "Caveat",
    color: "#D2B48C",
    fontSize: 32,
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
