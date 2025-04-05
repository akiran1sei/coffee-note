import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Image,
  ImageSourcePropType,
  TouchableOpacity,
  Platform,
  Text,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useRoute } from "@react-navigation/native";
import HeaderComponent from "../../../components/HeaderComponent";
import PageTitleComponent from "../../../components/PageTitleComponent";
import CoffeeStorageService from "../../../services/CoffeeStorageService";
import { CoffeeRecord } from "../../../types/CoffeeTypes";
import SelectComponent from "../../../components/SelectComponent";
import InputComponent from "../../../components/InputComponent";
import RangeComponent from "../../../components/RangeComponent";
import NumberComponent from "../../../components/NumberComponent";
import ImageUploadComponent from "../../../components/ImageUploadComponent";
import TextAreaComponent from "../../../components/TextAreaComponent";
import MeasuredTimeInputComponent from "../../../components/MeasuredTimeInputComponent ";
import RadarChart from "../../../components/RadarChart/RadarChart";

type RouteParams = {
  id: string;
};

export default function CoffeeItemScreen() {
  const route = useRoute();
  const router = useRouter();
  const { id } = route.params as RouteParams;
  const [InputLabel, setInputLabel] = useState({
    name: "名称",
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
    coffeeAmount: "粉量（g）",
    waterAmount: "湯量（g）",
  });
  const [coffeeRecord, setCoffeeRecord] = useState<CoffeeRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageData, setImageData] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<CoffeeRecord>>({});
  const [rangeValues, setRangeValues] = useState<Partial<CoffeeRecord>>({});
  const [updating, setUpdating] = useState(false);

  const handleInputChange = (label: string, value: string | number) => {
    setFormData({ ...formData, [label]: value });
  };

  const handleImageChange = (value: string) => {
    setImageData(value);
    setFormData({ ...formData, imageUri: value });
  };

  const handleSelectChange = (label: string, value: string) => {
    setFormData({ ...formData, [label]: value });
  };

  const handleRangeChange = (label: string, value: number) => {
    setFormData({ ...formData, [label]: value });
    setRangeValues({
      ...rangeValues,
      [label]: value,
    });
  };

  const handleTextAreaChange = (value: string) => {
    setFormData({ ...formData, memo: value });
  };

  const handleMeasuredTimeChange = (value: string) => {
    setFormData({ ...formData, extractionTime: value });
  };

  // Update coffee record function
  const handleUpdateRecord = async () => {
    setUpdating(true);
    try {
      // formDataの値を優先し、未定義の場合のみcoffeeRecordの値を使用
      const updateData: Partial<CoffeeRecord> = {
        name: formData.name !== undefined ? formData.name : coffeeRecord?.name,
        variety:
          formData.variety !== undefined
            ? formData.variety
            : coffeeRecord?.variety,
        productionArea:
          formData.productionArea !== undefined
            ? formData.productionArea
            : coffeeRecord?.productionArea,
        roastingDegree:
          formData.roastingDegree !== undefined
            ? formData.roastingDegree
            : coffeeRecord?.roastingDegree,
        extractionMethod:
          formData.extractionMethod !== undefined
            ? formData.extractionMethod
            : coffeeRecord?.extractionMethod,
        extractionMaker:
          formData.extractionMaker !== undefined
            ? formData.extractionMaker
            : coffeeRecord?.extractionMaker,
        grindSize:
          formData.grindSize !== undefined
            ? formData.grindSize
            : coffeeRecord?.grindSize,
        temperature:
          formData.temperature !== undefined
            ? formData.temperature
            : coffeeRecord?.temperature,
        coffeeAmount:
          formData.coffeeAmount !== undefined
            ? formData.coffeeAmount
            : coffeeRecord?.coffeeAmount,
        waterAmount:
          formData.waterAmount !== undefined
            ? formData.waterAmount
            : coffeeRecord?.waterAmount,
        extractionTime:
          formData.extractionTime !== undefined
            ? formData.extractionTime
            : coffeeRecord?.extractionTime,
        acidity:
          formData.acidity !== undefined
            ? formData.acidity
            : coffeeRecord?.acidity,
        bitterness:
          formData.bitterness !== undefined
            ? formData.bitterness
            : coffeeRecord?.bitterness,
        sweetness:
          formData.sweetness !== undefined
            ? formData.sweetness
            : coffeeRecord?.sweetness,
        body: formData.body !== undefined ? formData.body : coffeeRecord?.body,
        aroma:
          formData.aroma !== undefined ? formData.aroma : coffeeRecord?.aroma,
        aftertaste:
          formData.aftertaste !== undefined
            ? formData.aftertaste
            : coffeeRecord?.aftertaste,
        memo: formData.memo !== undefined ? formData.memo : coffeeRecord?.memo,
        imageUri:
          formData.imageUri !== undefined
            ? formData.imageUri
            : coffeeRecord?.imageUri,
      };

      const success = await CoffeeStorageService.updateCoffeeRecord(
        id,
        updateData
      );

      if (success) {
        if (Platform.OS === "web") {
          alert("コーヒーレコードが更新されました！");
        } else {
          Alert.alert("成功", "コーヒーレコードが更新されました！");
        }
        // Refresh data
        const updatedRecord = await CoffeeStorageService.getCoffeeRecordById(
          id
        );
        if (updatedRecord) {
          setCoffeeRecord(updatedRecord);
          // 更新された値をformDataにも反映
          setFormData({
            name: updatedRecord.name,
            variety: updatedRecord.variety,
            productionArea: updatedRecord.productionArea,
            roastingDegree: updatedRecord.roastingDegree,
            extractionMethod: updatedRecord.extractionMethod,
            extractionMaker: updatedRecord.extractionMaker,
            grindSize: updatedRecord.grindSize,
            temperature: updatedRecord.temperature,
            coffeeAmount: updatedRecord.coffeeAmount,
            waterAmount: updatedRecord.waterAmount,
            extractionTime: updatedRecord.extractionTime,
            acidity: updatedRecord.acidity,
            bitterness: updatedRecord.bitterness,
            sweetness: updatedRecord.sweetness,
            body: updatedRecord.body,
            aroma: updatedRecord.aroma,
            aftertaste: updatedRecord.aftertaste,
            memo: updatedRecord.memo,
            imageUri: updatedRecord.imageUri,
          });

          setRangeValues({
            acidity: updatedRecord.acidity,
            bitterness: updatedRecord.bitterness,
            sweetness: updatedRecord.sweetness,
            body: updatedRecord.body,
            aroma: updatedRecord.aroma,
            aftertaste: updatedRecord.aftertaste,
          });
        }
      } else {
        if (Platform.OS === "web") {
          alert("更新に失敗しました。もう一度お試しください。");
        } else {
          Alert.alert("エラー", "更新に失敗しました。もう一度お試しください。");
        }
      }
    } catch (error) {
      console.error("レコードの更新に失敗しました:", error);
      if (Platform.OS === "web") {
        alert("更新中にエラーが発生しました。");
      } else {
        Alert.alert("エラー", "更新中にエラーが発生しました。");
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (Platform.OS === "web") {
      // Web環境の場合、window.confirm を使用
      if (window.confirm("このレコードを削除しますか？")) {
        try {
          await CoffeeStorageService.deleteCoffeeRecord(id);
          router.push("/list");
        } catch (error) {
          console.error("レコードの削除に失敗しました:", error);
        }
      }
    } else {
      // モバイル環境の場合、Alert.alert を使用
      Alert.alert(
        "削除確認",
        "このレコードを削除しますか？",
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
                await CoffeeStorageService.deleteCoffeeRecord(id);
                router.push("/list");
              } catch (error) {
                console.error("レコードの削除に失敗しました:", error);
              }
            },
          },
        ],
        { cancelable: false }
      );
    }
  };

  useEffect(() => {
    const fetchCoffeeRecord = async () => {
      try {
        const record = await CoffeeStorageService.getCoffeeRecordById(id);
        if (record) {
          // formDataに直接設定するだけで、二重管理を避ける
          setFormData({
            name: record.name,
            variety: record.variety,
            productionArea: record.productionArea,
            roastingDegree: record.roastingDegree,
            extractionMethod: record.extractionMethod,
            extractionMaker: record.extractionMaker,
            grindSize: record.grindSize,
            temperature: record.temperature,
            coffeeAmount: record.coffeeAmount,
            waterAmount: record.waterAmount,
            extractionTime: record.extractionTime,
            acidity: record.acidity,
            bitterness: record.bitterness,
            sweetness: record.sweetness,
            body: record.body,
            aroma: record.aroma,
            aftertaste: record.aftertaste,
            memo: record.memo,
            imageUri: record.imageUri,
          });

          setRangeValues({
            acidity: record.acidity,
            bitterness: record.bitterness,
            sweetness: record.sweetness,
            body: record.body,
            aroma: record.aroma,
            aftertaste: record.aftertaste,
          });

          setCoffeeRecord(record);
        }
      } catch (error) {
        console.error("コーヒーレコードの取得に失敗しました:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoffeeRecord();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!coffeeRecord) {
    return (
      <View style={styles.container}>
        <Text>コーヒーレコードが見つかりません</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contents}>
        <HeaderComponent />
        <PageTitleComponent TextData={"コーヒー情報を編集"} />
        <View style={[styles.absoluteBox, styles.mainContents]}>
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.formContainer}>
              <InputComponent
                dataTitle={InputLabel.name}
                onChange={(value: string) => handleInputChange("name", value)}
                value={formData.name !== undefined ? formData.name : ""}
              />
              <ImageUploadComponent
                onChange={handleImageChange}
                value={formData.imageUri !== undefined ? formData.imageUri : ""}
              />
              <InputComponent
                dataTitle={InputLabel.variety}
                onChange={(value: string) =>
                  handleInputChange("variety", value)
                }
                value={formData.variety !== undefined ? formData.variety : ""}
              />
              <InputComponent
                dataTitle={InputLabel.productionArea}
                onChange={(value: string) =>
                  handleInputChange("productionArea", value)
                }
                value={
                  formData.productionArea !== undefined
                    ? formData.productionArea
                    : ""
                }
              />
              <SelectComponent
                dataTitle={SelectLabel.roastingDegree}
                onChange={(value: string) =>
                  handleSelectChange("roastingDegree", value)
                }
                value={
                  formData.roastingDegree !== undefined
                    ? formData.roastingDegree
                    : ""
                }
              />
              <SelectComponent
                dataTitle={SelectLabel.extractionMethod}
                onChange={(value: string) =>
                  handleSelectChange("extractionMethod", value)
                }
                value={
                  formData.extractionMethod !== undefined
                    ? formData.extractionMethod
                    : ""
                }
              />
              <SelectComponent
                dataTitle={SelectLabel.extractionMaker}
                onChange={(value: string) =>
                  handleSelectChange("extractionMaker", value)
                }
                value={
                  formData.extractionMaker !== undefined
                    ? formData.extractionMaker
                    : ""
                }
              />
              <SelectComponent
                dataTitle={SelectLabel.grindSize}
                onChange={(value: string) =>
                  handleSelectChange("grindSize", value)
                }
                value={
                  formData.grindSize !== undefined ? formData.grindSize : ""
                }
              />
              <NumberComponent
                dataTitle={NumberLabel.temperature}
                onChange={(value: number) =>
                  handleInputChange("temperature", value)
                }
                value={
                  formData.temperature !== undefined ? formData.temperature : 0
                }
              />
              <NumberComponent
                dataTitle={NumberLabel.coffeeAmount}
                onChange={(value: number) =>
                  handleInputChange("coffeeAmount", value)
                }
                value={
                  formData.coffeeAmount !== undefined
                    ? formData.coffeeAmount
                    : 0
                }
              />
              <NumberComponent
                dataTitle={NumberLabel.waterAmount}
                onChange={(value: number) =>
                  handleInputChange("waterAmount", value)
                }
                value={
                  formData.waterAmount !== undefined ? formData.waterAmount : 0
                }
              />
              <MeasuredTimeInputComponent
                onChange={handleMeasuredTimeChange}
                value={
                  formData.extractionTime !== undefined
                    ? formData.extractionTime
                    : ""
                }
              />
              <RangeComponent
                dataTitle={RangeLabel.acidity}
                onChange={(value: number) =>
                  handleRangeChange("acidity", value)
                }
                value={
                  rangeValues.acidity !== undefined ? rangeValues.acidity : 0
                }
              />
              <RangeComponent
                dataTitle={RangeLabel.bitterness}
                onChange={(value: number) =>
                  handleRangeChange("bitterness", value)
                }
                value={
                  rangeValues.bitterness !== undefined
                    ? rangeValues.bitterness
                    : 0
                }
              />
              <RangeComponent
                dataTitle={RangeLabel.sweetness}
                onChange={(value: number) =>
                  handleRangeChange("sweetness", value)
                }
                value={
                  rangeValues.sweetness !== undefined
                    ? rangeValues.sweetness
                    : 0
                }
              />
              <RangeComponent
                dataTitle={RangeLabel.body}
                onChange={(value: number) => handleRangeChange("body", value)}
                value={rangeValues.body !== undefined ? rangeValues.body : 0}
              />
              <RangeComponent
                dataTitle={RangeLabel.aroma}
                onChange={(value: number) => handleRangeChange("aroma", value)}
                value={rangeValues.aroma !== undefined ? rangeValues.aroma : 0}
              />
              <RangeComponent
                dataTitle={RangeLabel.aftertaste}
                onChange={(value: number) =>
                  handleRangeChange("aftertaste", value)
                }
                value={
                  rangeValues.aftertaste !== undefined
                    ? rangeValues.aftertaste
                    : 0
                }
              />
              <View style={styles.radarChartContainer}>
                <Text style={styles.radarChartTitle}>風味の評価</Text>
                <RadarChart
                  data={{
                    acidity:
                      rangeValues.acidity !== undefined
                        ? rangeValues.acidity
                        : 0,
                    bitterness:
                      rangeValues.bitterness !== undefined
                        ? rangeValues.bitterness
                        : 0,
                    sweetness:
                      rangeValues.sweetness !== undefined
                        ? rangeValues.sweetness
                        : 0,
                    body: rangeValues.body !== undefined ? rangeValues.body : 0,
                    aroma:
                      rangeValues.aroma !== undefined ? rangeValues.aroma : 0,
                    aftertaste:
                      rangeValues.aftertaste !== undefined
                        ? rangeValues.aftertaste
                        : 0,
                  }}
                />
              </View>

              <TextAreaComponent
                onChange={handleTextAreaChange}
                value={formData.memo !== undefined ? formData.memo : ""}
              />

              {/* Update Button */}
              <TouchableOpacity
                style={styles.updateButton}
                onPress={handleUpdateRecord}
                disabled={updating}
              >
                <Text style={styles.updateButtonText}>
                  {updating ? "更新中..." : "コーヒー情報を更新する"}
                </Text>
              </TouchableOpacity>

              {/* Delete Button */}
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteRecord(id)}
                disabled={updating}
              >
                <Text style={styles.deleteButtonText}>
                  コーヒー情報を削除する
                </Text>
              </TouchableOpacity>

              {/* Return to List Button */}
              <TouchableOpacity
                style={styles.returnButton}
                onPress={() => router.push("/list")}
              >
                <Text style={styles.returnButtonText}>リストに戻る</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
  },
  contents: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
    maxWidth: 600,
    marginHorizontal: "auto",
    top: 160, // ヘッダーとタイトルに合わせて調整
    bottom: 0,
  },
  scrollContainer: {
    paddingVertical: 20,
    paddingBottom: 80, // Increased padding to accommodate buttons
    width: "100%",
    alignItems: "center",
  },
  formContainer: {
    width: "90%",
    maxWidth: 500,
    padding: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  imageContents: {
    width: "90%",
    marginBottom: 10,
    alignSelf: "center", // Center the contents
  },
  recordImagePreview: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginHorizontal: "auto",
    backgroundColor: "#F0F0F0", // デフォルト画像がない場合の背景色
  },
  text: {
    color: "#333",
    fontSize: 16,
  },
  labelText: {
    color: "#777",
    marginBottom: 5,
    fontSize: 14,
  },
  valueText: {
    fontSize: 16,
    color: "#555",
  },
  deleteButton: {
    backgroundColor: "#dc3545", // Bootstrap danger color
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    width: "100%",
    alignItems: "center",
  },
  deleteButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  updateButton: {
    backgroundColor: "#007bff", // Bootstrap primary color
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 25,
    width: "100%",
    alignItems: "center",
  },
  updateButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  returnButton: {
    backgroundColor: "#6c757d", // Bootstrap secondary color
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    width: "100%",
    alignItems: "center",
  },
  returnButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  radarChartContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 25,
    marginBottom: 15,
    padding: 15,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#eee",
  },
  radarChartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#555",
    marginBottom: 10,
  },
});
