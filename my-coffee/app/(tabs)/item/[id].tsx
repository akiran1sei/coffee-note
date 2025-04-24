import React, { useEffect, useState } from "react";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as Print from "expo-print";
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Image,
  ImageSourcePropType,
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { useRouter } from "expo-router";
import HeaderComponent from "../../../components/HeaderComponent";
import PageTitleComponent from "../../../components/PageTitleComponent";
import CoffeeStorageService from "../../../services/CoffeeStorageService";
import { CoffeeRecord } from "../../../types/CoffeeTypes";
import RadarChart from "../../../components/RadarChart/RadarChart";
import {
  LoadingComponent,
  NoRecordComponent,
} from "@/components/MessageComponent";

type RouteParams = {
  id: string;
};

export default function CoffeeItemScreen() {
  const route = useRoute();
  const router = useRouter();
  const { id } = route.params as RouteParams;

  const [coffeeRecord, setCoffeeRecord] = useState<CoffeeRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const labels = ["酸味", "甘味", "苦味", "コク", "香り", "後味"];
  const angles = [0, 60, 120, 180, 240, 300].map(
    (angle) => (angle * Math.PI) / 180
  );
  const radius = 40;

  // 画像URIを処理する関数
  const getImageSource = (uri?: string | null): ImageSourcePropType => {
    if (!uri) {
      return require("../../../assets/images/no-image.png");
    }
    // モバイル環境の場合
    return { uri: uri.startsWith("file://") ? uri : `file://${uri}` };
  };

  const handleDeleteRecord = async (id: string) => {
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
  };

  const downloadPdf = async () => {
    if (!coffeeRecord) {
      Alert.alert("エラー", "コーヒーデータがありません。");
      return;
    }

    try {
      setIsGeneratingPdf(true);

      // 画像処理
      let imageHtml = "";
      if (coffeeRecord.imageUri) {
        try {
          // モバイル環境ではBase64に変換
          const base64 = await FileSystem.readAsStringAsync(
            coffeeRecord.imageUri,
            {
              encoding: FileSystem.EncodingType.Base64,
            }
          );
          imageHtml = `<img src="data:image/jpeg;base64,${base64}" style="width: 100px; height: 100px; border-radius: 50px; object-fit: cover; float: right; margin: 0 0 10px 10px;" />`;
        } catch (err) {
          console.error("画像の読み込みエラー:", err);
          // エラー時は画像なしで続行
          imageHtml = `<div style="width: 100px; height: 100px; border-radius: 50px; background-color: #e0e0e0; display: flex; justify-content: center; align-items: center;">No Image</div>`;
        }
      }

      const radarData = {
        acidity: Number(coffeeRecord.acidity) || 0,
        sweetness: Number(coffeeRecord.sweetness) || 0,
        bitterness: Number(coffeeRecord.bitterness) || 0,
        body: Number(coffeeRecord.body) || 0,
        aroma: Number(coffeeRecord.aroma) || 0,
        aftertaste: Number(coffeeRecord.aftertaste) || 0,
      };

      // レーダーチャートをSVGとして直接HTMLに埋め込む
      const svgChart = `
    <svg width="150" height="150" viewBox="0 0 100 100">
      <line x1="50" y1="50" x2="70" y2="15" stroke="#ccc" /> 
      <line x1="50" y1="50" x2="90" y2="50" stroke="#ccc" /> 
      <line x1="50" y1="50" x2="70" y2="85" stroke="#ccc" /> 
      <line x1="50" y1="50" x2="30" y2="85" stroke="#ccc" /> 
      <line x1="50" y1="50" x2="10" y2="50" stroke="#ccc" /> 
      <line x1="50" y1="50" x2="30" y2="15" stroke="#ccc" /> 
      <polygon
        points="
          ${50 + (radarData.acidity / 5) * 40 * Math.cos((Math.PI * 0) / 3)},${
        50 + (radarData.acidity / 5) * 40 * Math.sin((Math.PI * 0) / 3)
      }
          ${
            50 + (radarData.sweetness / 5) * 40 * Math.cos((Math.PI * 1) / 3)
          },${50 + (radarData.sweetness / 5) * 40 * Math.sin((Math.PI * 1) / 3)}
          ${
            50 + (radarData.bitterness / 5) * 40 * Math.cos((Math.PI * 2) / 3)
          },${
        50 + (radarData.bitterness / 5) * 40 * Math.sin((Math.PI * 2) / 3)
      }
          ${50 + (radarData.body / 5) * 40 * Math.cos((Math.PI * 3) / 3)},${
        50 + (radarData.body / 5) * 40 * Math.sin((Math.PI * 3) / 3)
      }
          ${50 + (radarData.aroma / 5) * 40 * Math.cos((Math.PI * 4) / 3)},${
        50 + (radarData.aroma / 5) * 40 * Math.sin((Math.PI * 4) / 3)
      }
          ${
            50 + (radarData.aftertaste / 5) * 40 * Math.cos((Math.PI * 5) / 3)
          },${
        50 + (radarData.aftertaste / 5) * 40 * Math.sin((Math.PI * 5) / 3)
      }
        "
        fill="rgba(210, 180, 140, 0.5)"
        stroke="rgba(210, 180, 140, 1)"
        stroke-width="1"
      />
        <text x="80" y="15" text-anchor="middle" font-size="5">酸味</text>
        <text x="25" y="15" text-anchor="end" font-size="5">甘味</text>
        <text x="80" y="85" text-anchor="middle" font-size="5">苦味</text>
        <text x="5" y="45" text-anchor="middle" font-size="5">コク</text>
        <text x="15" y="85" text-anchor="start" font-size="5">香り</text>
        <text x="95" y="45" text-anchor="middle" font-size="5">後味</text>
    </svg>`;

      const htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>${coffeeRecord.name}</title>
    <style>
    @page {
          size: A4 portrait;
          margin: 10mm;
        }
        body {
          width: 100%;
          max-width: 595px;
          height: auto;
          font-family: "Helvetica", sans-serif;
          font-size: 15pt;
          line-height: 1.3;
          color: #333;
          margin: 10mm;
          padding: 0;
        }

      h1 {
        font-size: 20pt;
        color: #333;
        margin-bottom: 10px;
        border-bottom: 1px solid #ccc;
        padding-bottom: 5px;
      }

      h2 {
        font-size: 18pt;
        color: #555;
        margin-top: 15px;
        margin-bottom: 8px;
      }

      .bean-extraction-container {
        width: 100%;
        max-width: 590px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        margin-bottom: 15px;
      }

      .bean-info {
        display: flex;
        align-items: center;
        margin-bottom: 15px;
        flex-direction: column;
        flex-wrap: nowrap;
        justify-content: center;
      }

      .bean-info-contents {
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }

      .bean-txt {}

      .bean-img {
        width: 120px;
        height: 120px;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 8pt;
      }

      .image-container {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      .extraction-info {
        flex: 1;
        display: flex;
        align-items: center;
        margin-bottom: 15px;
        flex-direction: column;
        flex-wrap: nowrap;
        justify-content: center;
      }
      .extraction-info-contents {
        display: flex;
        flex-direction: column;
        flex-wrap: nowrap;
        justify-content: center;
        align-items: stretch;
      }
      .flavor-chart-container {
        display: flex;
        align-items: center;
        margin-bottom: 15px;
        flex-direction: column;
        flex-wrap: nowrap;
        justify-content: center;
      }
      .flavor-chart-contents {
        width: auto;
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
      }
      .flavor-rating {
        flex: 1;
      }

      .chart-container {
        width: 120px;
        height: 120px;
        background-color: #fff;
        display: flex;
        justify-content: center;
        align-items: center;
        color: #777;
        font-size: 8pt; 
        border-radius: 50%;
        border: 1px solid #bbb;
        box-shadow:1px 1px 1px #33333333;
      }

      .detail-item {
        margin-bottom: 6px;
        font-size: 15pt;
      }

      .detail-label {
        font-weight: bold;
        color: #555;
        margin-right: 8px;
      }

      .rating-item {
        font-size: 15pt;
      }

      .rating-label {
        font-weight: bold;
        color: #555;
      }

      .memo-section {
        display: flex;
        flex-direction: column;
        flex-wrap: nowrap;
        justify-content: center;
        align-items: center;
        border-top: 1px solid #ccc;
        padding-top: 10px;
      }

      .memo-content {
        font-size: 13pt;
        white-space: pre-wrap;
        padding: 8px;
        background-color: #f9f9f9;
        border: 1px solid #eee;
        border-radius: 4px;
      }
    </style>
  </head>
  <body>
    <h1>${coffeeRecord.name}</h1>

    <div class="bean-extraction-container">
      <div class="bean-info">
        <h2>豆の情報</h2>
        <div class="bean-info-contents">
          <div class="bean-txt">
            <div class="detail-item"><span class="detail-label">種類:</span> ${
              coffeeRecord.variety || "未記入"
            }</div>
            <div class="detail-item"><span class="detail-label">産地:</span> ${
              coffeeRecord.productionArea || "未記入"
            }</div>
            <div class="detail-item"><span class="detail-label">焙煎度:</span> ${
              coffeeRecord.roastingDegree || "未記入"
            }</div>
          </div>
          <div class="bean-img">
            <div class="image-container">
              ${imageHtml}
            </div>
          </div>
        </div>
      </div>

      <div class="extraction-info">
        <h2>抽出情報</h2>
        <div class="extraction-info-contents">
          <div class="detail-item"><span class="detail-label">抽出器具:</span> ${
            coffeeRecord.extractionMethod || "未記入"
          }</div>
          <div class="detail-item"><span class="detail-label">抽出メーカー:</span> ${
            coffeeRecord.extractionMaker || "未記入"
          }</div>
          <div class="detail-item"><span class="detail-label">挽き目:</span> ${
            coffeeRecord.grindSize || "未記入"
          }</div>
          <div class="detail-item"><span class="detail-label">注湯温度:</span> ${
            coffeeRecord.temperature || "未記入"
          }</div>
          <div class="detail-item"><span class="detail-label">粉量:</span> ${
            coffeeRecord.coffeeAmount || "未記入"
          }</div>
          <div class="detail-item"><span class="detail-label">水量:</span> ${
            coffeeRecord.waterAmount || "未記入"
          }</div>
          <div class="detail-item"><span class="detail-label">抽出時間:</span> ${
            coffeeRecord.extractionTime || "未記入"
          }</div>
        </div>
      </div>
    </div>

    <div class="flavor-chart-container">
      <h2>味わいの評価</h2>
      <div class="flavor-chart-contents">
        <div class="flavor-rating">
          <div class="rating-item"><span class="rating-label">酸味:</span> ${
            coffeeRecord.acidity || "0"
          }</div>
          <div class="rating-item"><span class="rating-label">甘味:</span> ${
            coffeeRecord.sweetness || "0"
          }</div>
          <div class="rating-item"><span class="rating-label">苦味:</span> ${
            coffeeRecord.bitterness || "0"
          }</div>
          <div class="rating-item"><span class="rating-label">コク:</span> ${
            coffeeRecord.body || "0"
          }</div>
          <div class="rating-item"><span class="rating-label">香り:</span> ${
            coffeeRecord.aroma || "0"
          }</div>
          <div class="rating-item"><span class="rating-label">後味:</span> ${
            coffeeRecord.aftertaste || "0"
          }</div>
        </div>
        <div class="chart-container">
          ${svgChart}
        </div>
      </div>
    </div>

    <div class="memo-section">
      <h2>MEMO</h2>
      <div class="memo-content">
  ${coffeeRecord.memo || "未記入"}
      </div>
    </div>
  </body>
  </html>
`;

      // Print APIを使用してPDFを生成
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      // モバイル環境ではシェア機能を使用
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: "コーヒー情報をPDFで共有",
      });

      console.log("PDF共有完了");
    } catch (error) {
      console.error("PDF生成エラー:", error);

      // エラーメッセージの取得を安全に行う
      const errorMessage =
        error instanceof Error ? error.message : "不明なエラーが発生しました";

      Alert.alert("エラー", `PDFの生成に失敗しました: ${errorMessage}`);
    } finally {
      setIsGeneratingPdf(false);
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
            <View style={styles.itemContainer}>
              <View style={styles.imageContents}>
                <Image
                  source={getImageSource(coffeeRecord.imageUri)}
                  style={styles.recordImagePreview}
                  defaultSource={require("../../../assets/images/no-image.png")}
                />
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.labelText}>種類</Text>
                <Text style={styles.valueText}>{coffeeRecord.variety}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.labelText}>産地</Text>
                <Text style={styles.valueText}>
                  {coffeeRecord.productionArea}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.labelText}>焙煎度</Text>
                <Text style={styles.valueText}>
                  {coffeeRecord.roastingDegree}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.labelText}>抽出器具</Text>
                <Text style={styles.valueText}>
                  {coffeeRecord.extractionMethod}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.labelText}>抽出メーカー</Text>
                <Text style={styles.valueText}>
                  {coffeeRecord.extractionMaker}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.labelText}>挽き目</Text>
                <Text style={styles.valueText}>{coffeeRecord.grindSize}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.labelText}>注湯温度</Text>
                <Text style={styles.valueText}>{coffeeRecord.temperature}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.labelText}>粉量</Text>
                <Text style={styles.valueText}>
                  {coffeeRecord.coffeeAmount}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.labelText}>水量</Text>
                <Text style={styles.valueText}>{coffeeRecord.waterAmount}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.labelText}>抽出時間</Text>
                <Text style={styles.valueText}>
                  {coffeeRecord.extractionTime}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.labelText}>酸味</Text>
                <Text style={styles.valueText}>{coffeeRecord.acidity}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.labelText}>甘味</Text>
                <Text style={styles.valueText}>{coffeeRecord.sweetness}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.labelText}>苦味</Text>
                <Text style={styles.valueText}>{coffeeRecord.bitterness}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.labelText}>コク</Text>
                <Text style={styles.valueText}>{coffeeRecord.body}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.labelText}>香り</Text>
                <Text style={styles.valueText}>{coffeeRecord.aroma}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.labelText}>後味</Text>
                <Text style={styles.valueText}>{coffeeRecord.aftertaste}</Text>
              </View>

              <View style={styles.radarChartContainer}>
                <Text style={styles.sectionTitle}>レーダーチャート</Text>
                <View style={styles.recordRadarChart}>
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

              <View style={styles.memoContainer}>
                <Text style={styles.sectionTitle}>MEMO</Text>
                <Text style={styles.memoText}>{coffeeRecord.memo}</Text>
              </View>

              <TouchableOpacity
                style={styles.updateButton}
                onPress={() =>
                  router.push({ pathname: `../update/${coffeeRecord.id}` })
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
            </View>
            <TouchableOpacity
              style={styles.downloadPdfButton}
              onPress={downloadPdf}
            >
              <Text style={styles.buttonText}>PDF をダウンロード</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

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
    maxWidth: 600,
    marginHorizontal: "auto",
    top: 160,
    bottom: 0,
  },
  scrollContainer: {
    alignItems: "center",
    paddingVertical: 20,
    paddingBottom: 60,
    width: "100%",
  },
  itemContainer: {
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
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  recordImagePreview: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#e0e0e0",
    marginBottom: 15,
  },
  detailItem: {
    width: "100%",
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  labelText: {
    color: "#777",
    fontSize: 16,
    marginBottom: 5,
  },
  valueText: {
    color: "#333",
    fontSize: 18,
  },
  sectionTitle: {
    color: "#555",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    textAlign: "center",
  },
  radarChartContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 20,
  },
  recordRadarChart: {
    width: 250,
    height: 250,
  },
  memoContainer: {
    width: "100%",
    marginTop: 20,
  },
  memoText: {
    color: "#333",
    fontSize: 16,
    lineHeight: 24,
  },
  deleteButton: {
    backgroundColor: "#dc3545",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    width: "100%",
    alignItems: "center",
  },
  updateButton: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },

  downloadPdfButton: {
    backgroundColor: "#28a745",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    width: "90%",
    alignItems: "center",
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
