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
  Platform,
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
  // 以下の labels と angles は RadarChart コンポーネント用で、SVG生成には直接関係しないため変更不要です。
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
              router.replace("/list");
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
          imageHtml = `<img src="data:image/jpeg;base64,${base64}" alt="Coffee Image" />`;
        } catch (err) {
          console.error("画像の読み込みエラー:", err);
          imageHtml = `<div class="no-image-placeholder">No Image</div>`;
        }
      } else {
        imageHtml = `<div class="no-image-placeholder">No Image</div>`;
      }

      // レーダーチャートのデータ
      const radarDataValues = [
        Number(coffeeRecord.acidity) || 0,
        Number(coffeeRecord.sweetness) || 0,
        Number(coffeeRecord.bitterness) || 0,
        Number(coffeeRecord.body) || 0,
        Number(coffeeRecord.aroma) || 0,
        Number(coffeeRecord.aftertaste) || 0,
      ];

      // SVGレーダーチャート生成に必要な関数
      const calculatePointOnCircle = (
        centerX: number,
        centerY: number,
        radius: number,
        angleRadians: number
      ) => {
        const x = centerX + radius * Math.cos(angleRadians);
        const y = centerY + radius * Math.sin(angleRadians);
        return { x, y };
      };

      const centerX = 60;
      const centerY = 60;
      const maxDataRadius = 40; // データが最大値(5)の時のレーダーチャートの半径
      const labelRadius = 48; // ラベルを配置する半径 (maxDataRadiusより少し大きく)

      const anglesDegrees = [270, 330, 30, 90, 150, 210];
      const anglesRadians = anglesDegrees.map(
        (angle) => (angle * Math.PI) / 180
      );

      let polygonPoints = "";
      radarDataValues.forEach((value, index) => {
        const { x, y } = calculatePointOnCircle(
          centerX,
          centerY,
          (value / 5) * maxDataRadius,
          anglesRadians[index]
        );
        polygonPoints += `${x},${y} `;
      });

      const labelsSvg = ["酸味", "甘味", "苦味", "コク", "香り", "後味"];
      const axisLinesHtml: string[] = [];
      const labelTextsHtml: string[] = [];

      anglesRadians.forEach((angle, index) => {
        const axisLineLength = maxDataRadius + 5;
        const { x: lineX, y: lineY } = calculatePointOnCircle(
          centerX,
          centerY,
          axisLineLength,
          angle
        );
        axisLinesHtml.push(
          `<line x1="${centerX}" y1="${centerY}" x2="${lineX}" y2="${lineY}" stroke="#ccc" />`
        );

        let { x: labelX, y: labelY } = calculatePointOnCircle(
          centerX,
          centerY,
          labelRadius,
          angle
        );
        let textAnchor = "middle";

        const angleDeg = anglesDegrees[index];
        if (Math.abs(angleDeg - 270) < 1 || Math.abs(angleDeg - 90) < 1) {
          textAnchor = "middle";
        } else if (angleDeg > 270 || angleDeg < 90) {
          textAnchor = "start";
        } else {
          textAnchor = "end";
        }

        if (Math.abs(angleDeg - 270) < 1) {
          labelY -= 5;
        } else if (Math.abs(angleDeg - 90) < 1) {
          labelY += 5;
        }

        labelTextsHtml.push(
          `<text x="${labelX}" y="${labelY}" text-anchor="${textAnchor}" font-size="8" fill="#555">${labelsSvg[index]}</text>`
        );
      });

      const scaleCirclesHtml = [];
      for (let i = 1; i <= 5; i++) {
        const r = (i / 5) * maxDataRadius;
        scaleCirclesHtml.push(
          `<circle cx="${centerX}" cy="${centerY}" r="${r}" stroke="${
            i === 5 ? "#888" : "#ccc"
          }" fill="none" stroke-dasharray="${i === 5 ? "none" : "2 2"}" />`
        );
      }

      const svgChart = `
        <svg width="150" height="150" viewBox="0 0 120 120">
          ${scaleCirclesHtml.join("\n")}
          ${axisLinesHtml.join("\n")}
          <polygon
            points="${polygonPoints.trim()}"
            fill="rgba(210, 180, 140, 0.5)"
            stroke="rgba(210, 180, 140, 1)"
            stroke-width="1.5"
          />
          ${labelTextsHtml.join("\n")}
        </svg>`;

      // 評価バーを直接HTMLで生成する関数
      const createRatingBarHtml = (label: string, value: number) => {
        const maxRating = 5;
        const percentage = (value / maxRating) * 100;
        return `
          <div class="rating-item">
            <span class="rating-label">${label}:</span>
            <div class="rating-value">
              <span class="rating-bar" style="width: ${percentage}%;"></span>
              <span class="rating-text">${value}</span>
            </div>
          </div>
        `;
      };

      // HTML生成
      const htmlContent = `
      <!DOCTYPE html>
      <html lang="ja">
      <head>
        <meta charset="utf-8">
        <title>${coffeeRecord.name}</title>
        <style>
          /* リセットとベース設定 */
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
      
          /* ページ設定 */
          @page {
            size: A4 portrait;
            margin: 15mm; /* 統一された余白設定 */
          }
          
          body {
            width: 100%;
            font-family: "Helvetica", "Arial", "Hiragino Sans", sans-serif;
            font-size: 11pt;
            line-height: 1.4;
            color: #333;
            background-color: #fff;
          }
          
          /* コンテンツコンテナ */
          .main-contents {
            max-width: 210mm; /* A4の幅 */
            margin: 0 auto;
            padding: 0;
          }
      
          /* 見出し */
          h1 {
            font-size: 18pt;
            color: #222;
            margin-bottom: 15px;
            padding-bottom: 8px;
            text-align: center;
            border-bottom: 2px solid #555;
          }
      
          h2 {
            font-size: 14pt;
            color: #444;
            margin-top: 15px;
            margin-bottom: 10px;
            padding-left: 5px;
            border-left: 4px solid #666;
          }
      
          /* セクションコンテナ */
          .section-container {
            margin-bottom: 20px;
            padding: 10px;
            background-color: #fafafa;
            border-radius: 5px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
      
          /* 豆情報セクション */
          .bean-info-contents {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 15px;
          }
      
          .bean-txt {
            flex: 1;
          }
      
          /* 画像スタイル */
          .image-container {
            width: 120px;
            height: 120px;
            display: flex;
            justify-content: center;
            align-items: center;
          }
      
          .image-container img {
            width: 110px;
            height: 110px;
            border-radius: 55px;
            object-fit: cover;
            border: 2px solid #ddd;
          }
      
          .no-image-placeholder {
            width: 110px;
            height: 110px;
            border-radius: 55px;
            background-color: #eee;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 9pt;
            color: #777;
            text-align: center;
            border: 1px dashed #ccc;
          }
      
          /* 詳細情報項目 */
          .detail-item {
            margin-bottom: 8px;
            font-size: 12pt;
            display: flex;
          }
      
          .detail-label {
            font-weight: bold;
            color: #555;
            min-width: 90px;
            padding-right: 10px;
          }
      
          /* 抽出情報レイアウト */
          .extraction-info-contents {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }
      
          /* フレーバーチャートセクション */
          .flavor-chart-contents {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 20px;
          }
      
          .flavor-rating {
            flex: 1;
          }
      
          .chart-container {
            width: 180px;
            height: 180px;
            background-color: #fff;
            display: flex;
            justify-content: center;
            align-items: center;
            border: 1px solid #eaeaea;
            border-radius: 5px;
          }
      
          /* 評価項目 */
          .rating-item {
            margin-bottom: 8px;
            font-size: 12pt;
            display: flex;
            align-items: center;
          }
      
          .rating-label {
            font-weight: bold;
            color: #555;
            width: 70px;
          }
      
          .rating-value {
            flex: 1;
            display: flex;
            align-items: center;
          }
      
          /* 評価バー表示 */
          .rating-bar {
            display: inline-block;
            height: 10px;
            background-color: #4a86e8;
            border-radius: 2px;
            margin-right: 5px;
          }
      
          .rating-text {
            display: inline-block;
            vertical-align: middle;
          }
      
          /* メモセクション */
          .memo-section {
            margin-top: 25px;
          }
      
          .memo-content {
            font-size: 11pt;
            white-space: pre-wrap;
            padding: 12px;
            background-color: #f5f5f5;
            border: 1px solid #e0e0e0;
            border-radius: 5px;
            min-height: 100px;
          }
        </style>
      </head>
      <body>
      <div class="main-contents">
        <h1>${coffeeRecord.name}</h1>
      
        <div class="section-container">
          <h2>豆の情報</h2>
          <div class="bean-info-contents">
            <div class="bean-txt">
              <div class="detail-item">
                <span class="detail-label">種類:</span> 
                <span>${coffeeRecord.variety || "未記入"}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">産地:</span> 
                <span>${coffeeRecord.productionArea || "未記入"}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">焙煎度:</span> 
                <span>${coffeeRecord.roastingDegree || "未記入"}</span>
              </div>
            </div>
            <div class="image-container">
              ${imageHtml}
            </div>
          </div>
        </div>
      
        <div class="section-container">
          <h2>抽出情報</h2>
          <div class="extraction-info-contents">
            <div class="detail-item">
              <span class="detail-label">抽出器具:</span> 
              <span>${coffeeRecord.extractionMethod || "未記入"}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">抽出メーカー:</span> 
              <span>${coffeeRecord.extractionMaker || "未記入"}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">挽き目:</span> 
              <span>${coffeeRecord.grindSize || "未記入"}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">注湯温度:</span> 
              <span>${coffeeRecord.temperature || "未記入"}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">粉量:</span> 
              <span>${coffeeRecord.coffeeAmount || "未記入"}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">水量:</span> 
              <span>${coffeeRecord.waterAmount || "未記入"}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">抽出時間:</span> 
              <span>${coffeeRecord.extractionTime || "未記入"}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">豆/水比率:</span> 
              <span>${
                coffeeRecord.coffeeAmount && coffeeRecord.waterAmount
                  ? `1:${
                      Math.round(
                        (coffeeRecord.waterAmount / coffeeRecord.coffeeAmount) *
                          10
                      ) / 10
                    }`
                  : "計算不可"
              }</span>
            </div>
          </div>
        </div>
      
        <div class="section-container">
          <h2>味わいの評価</h2>
          <div class="flavor-chart-contents">
            <div class="flavor-rating">
              ${createRatingBarHtml("酸味", Number(coffeeRecord.acidity) || 0)}
              ${createRatingBarHtml(
                "甘味",
                Number(coffeeRecord.sweetness) || 0
              )}
              ${createRatingBarHtml(
                "苦味",
                Number(coffeeRecord.bitterness) || 0
              )}
              ${createRatingBarHtml("コク", Number(coffeeRecord.body) || 0)}
              ${createRatingBarHtml("香り", Number(coffeeRecord.aroma) || 0)}
              ${createRatingBarHtml(
                "後味",
                Number(coffeeRecord.aftertaste) || 0
              )}
            </div>
            <div class="chart-container">
              ${svgChart}
            </div>
          </div>
        </div>
      
        <div class="section-container memo-section">
          <h2>MEMO</h2>
          <div class="memo-content">
      ${coffeeRecord.memo || "未記入"}
          </div>
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

      if (Platform.OS === "web") {
        window.open(uri, "_blank");
      } else {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: "コーヒー情報をPDFで共有",
        });
        console.log("PDF共有完了 (Mobile)");
      }
    } catch (error) {
      console.error("PDF生成エラー:", error);

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
                  router.replace({ pathname: `../update/${coffeeRecord.id}` })
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
