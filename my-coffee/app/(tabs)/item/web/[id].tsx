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
  ActivityIndicator,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { useRouter } from "expo-router";
import HeaderComponent from "../../../../components/HeaderComponent";
import PageTitleComponent from "../../../../components/PageTitleComponent";
import CoffeeStorageService from "../../../../services/CoffeeStorageService";
import { CoffeeRecord } from "../../../../types/CoffeeTypes";
import RadarChart from "../../../../components/RadarChart/RadarChart";
import {
  LoadingComponent,
  NoRecordComponent,
} from "@/components/MessageComponent";
// import PdfButtonComponent from "@/components/button/Pdf"; //WEB版では使用しないためコメントアウト

type RouteParams = {
  id: string;
};

const CoffeeItemScreen = () => {
  const route = useRoute();
  const router = useRouter();
  const { id } = route.params as RouteParams;

  const [coffeeRecord, setCoffeeRecord] = useState<CoffeeRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false); // 画像URIを環境に応じて適切に処理する関数

  const getImageSource = (uri?: string | null): ImageSourcePropType => {
    if (!uri) {
      return require("../../../../assets/images/no-image.png");
    }

    if (Platform.OS === "web") {
      // Base64形式かどうかをチェック
      if (uri.startsWith("data:image")) {
        return { uri };
      } // web環境でfileプロトコルは使用できないため、デフォルトの画像を表示する
      return require("../../../../assets/images/no-image.png");
    } else {
      // モバイル環境の場合
      return { uri: uri.startsWith("file://") ? uri : `file://${uri}` };
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
        setCoffeeRecord(record);
      } catch (error) {
        console.error("コーヒーレコードの取得に失敗しました:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoffeeRecord();
  }, [id]);

  if (loading) {
    return <LoadingComponent />;
  }

  if (!coffeeRecord) {
    return <NoRecordComponent />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contents}>
        <HeaderComponent />
        <PageTitleComponent TextData={coffeeRecord.name} />
        {isGeneratingPdf && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#007bff" />
            <Text style={styles.loadingText}>PDFを作成中...</Text>
          </View>
        )}

        <View style={[styles.absoluteBox, styles.mainContents]}>
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.recordDetail}>
              <View style={styles.imageContainer}>
                <Image
                  source={getImageSource(coffeeRecord.imageUri)}
                  style={styles.recordImage}
                  defaultSource={require("../../../../assets/images/no-image.png")}
                />
              </View>

              <View style={styles.infoSection}>
                <View style={styles.infoItem}>
                  <Text style={styles.label}>種類:</Text>

                  <Text style={styles.value}>{coffeeRecord.variety}</Text>
                </View>

                <View style={styles.infoItem}>
                  <Text style={styles.label}>産地:</Text>

                  <Text style={styles.value}>
                    {coffeeRecord.productionArea}
                  </Text>
                </View>

                <View style={styles.infoItem}>
                  <Text style={styles.label}>焙煎度:</Text>

                  <Text style={styles.value}>
                    {coffeeRecord.roastingDegree}
                  </Text>
                </View>

                <View style={styles.infoItem}>
                  <Text style={styles.label}>抽出器具:</Text>

                  <Text style={styles.value}>
                    {coffeeRecord.extractionMethod}
                  </Text>
                </View>

                <View style={styles.infoItem}>
                  <Text style={styles.label}>抽出メーカー:</Text>

                  <Text style={styles.value}>
                    {coffeeRecord.extractionMaker}
                  </Text>
                </View>

                <View style={styles.infoItem}>
                  <Text style={styles.label}>挽き目:</Text>

                  <Text style={styles.value}>{coffeeRecord.grindSize}</Text>
                </View>

                <View style={styles.infoItem}>
                  <Text style={styles.label}>注湯温度:</Text>

                  <Text style={styles.value}>{coffeeRecord.temperature}</Text>
                </View>

                <View style={styles.infoItem}>
                  <Text style={styles.label}>粉量:</Text>

                  <Text style={styles.value}>{coffeeRecord.coffeeAmount}</Text>
                </View>

                <View style={styles.infoItem}>
                  <Text style={styles.label}>水量:</Text>

                  <Text style={styles.value}>{coffeeRecord.waterAmount}</Text>
                </View>

                <View style={styles.infoItem}>
                  <Text style={styles.label}>抽出時間:</Text>

                  <Text style={styles.value}>
                    {coffeeRecord.extractionTime}
                  </Text>
                </View>
              </View>

              <View style={styles.tastingInfo}>
                <Text style={styles.tastingTitle}>テイスティング</Text>

                <View style={styles.infoItem}>
                  <Text style={styles.label}>酸味:</Text>

                  <Text style={styles.value}>{coffeeRecord.acidity}</Text>
                </View>

                <View style={styles.infoItem}>
                  <Text style={styles.label}>甘味:</Text>

                  <Text style={styles.value}>{coffeeRecord.sweetness}</Text>
                </View>

                <View style={styles.infoItem}>
                  <Text style={styles.label}>苦味:</Text>

                  <Text style={styles.value}>{coffeeRecord.bitterness}</Text>
                </View>

                <View style={styles.infoItem}>
                  <Text style={styles.label}>コク:</Text>

                  <Text style={styles.value}>{coffeeRecord.body}</Text>
                </View>

                <View style={styles.infoItem}>
                  <Text style={styles.label}>香り:</Text>

                  <Text style={styles.value}>{coffeeRecord.aroma}</Text>
                </View>

                <View style={styles.infoItem}>
                  <Text style={styles.label}>後味:</Text>

                  <Text style={styles.value}>{coffeeRecord.aftertaste}</Text>
                </View>
              </View>

              <View style={styles.radarChartSection}>
                <Text style={styles.chartTitle}>レーダーチャート</Text>

                <View style={styles.radarChart}>
                  <RadarChart
                    data={{
                      acidity: Number(coffeeRecord.acidity) || 0,
                      bitterness: Number(coffeeRecord.bitterness) || 0,
                      sweetness: Number(coffeeRecord.sweetness) || 0,
                      body: Number(coffeeRecord.body) || 0,
                      aroma: Number(coffeeRecord.aroma) || 0,
                      aftertaste: Number(coffeeRecord.aftertaste) || 0,
                    }}
                  />
                </View>
              </View>

              <View style={styles.memoSection}>
                <Text style={styles.memoTitle}>メモ</Text>
                <Text style={styles.memo}>{coffeeRecord.memo}</Text>
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() =>
                  router.push({
                    pathname: `../../update/web/${coffeeRecord.id}`,
                  })
                }
              >
                <Text style={styles.buttonText}>編集</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteRecord(coffeeRecord.id)}
              >
                <Text style={styles.buttonText}>削除</Text>
              </TouchableOpacity>
              {/* WEB版ではPDFダウンロードは利用できないため、PdfButtonComponentを削除 */}
              {Platform.OS === "web" && (
                <Text style={{ color: "red", marginTop: 10 }}>
                  ※WEB版ではPDFダウンロードはご利用いただけません。
                </Text>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
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
    maxWidth: 1000,
    marginHorizontal: "auto",
    top: 160,
    bottom: 0,
  },
  scrollContainer: {
    alignItems: "center",
    paddingVertical: 20,
    paddingBottom: 80,
    width: "100%",
  },

  recordDetail: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    width: "100%",
    maxWidth: 600,
  },

  imageContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  recordImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#e0e0e0",
  },

  infoSection: {
    marginBottom: 20,
  },
  infoItem: {
    display: "flex",
    flexDirection: "row",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 10,
  },
  label: {
    fontWeight: "bold",
    width: 100,
    color: "#777",
  },
  value: {
    flex: 1,
    color: "#333",
  },
  tastingInfo: {
    marginBottom: 20,
  },
  tastingTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#555",
  },
  radarChartSection: {
    marginBottom: 20,
    alignItems: "center",
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#555",
  },
  radarChart: {
    width: 300,
    height: 300,
  },
  memoSection: {
    marginBottom: 20,
  },
  memoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#555",
  },
  memo: {
    lineHeight: 24,
    color: "#333",
  },
  buttonContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    maxWidth: 300,
    marginHorizontal: "auto",
  },
  editButton: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButton: {
    backgroundColor: "#dc3545",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  errorText: {
    fontSize: 18,
    color: "#dc3545",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  loadingText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 10,
  },
});

export default CoffeeItemScreen;
