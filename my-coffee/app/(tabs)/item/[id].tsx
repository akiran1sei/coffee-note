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
        <svg width="200" height="200" viewBox="0 0 120 120">
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
        return `
         <div class="taste-label">${label}</div>
                <div class="taste-input"> ${value}</div>
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
          /* A4サイズ指定 (210mm × 297mm) */
        @page {
            size: A4;
            margin: 0;
        }
        
        @media print {
            html, body {
                width: 210mm;
                height: 297mm;
                margin: 0;
                padding: 0;
            }
                
            .page {
                margin: 0;
                border: initial;
                border-radius: initial;
                width: initial;
                min-height: initial;
                box-shadow: initial;
                background: initial;
                page-break-after: always;
            }
        }
        
        body {
            font-family: "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif;
            width: 210mm;
            height: 297mm;
            margin: 0 auto;
            padding: 15mm;
            color: #333;
            background-color: white;
            box-sizing: border-box;
        }
        
        h1 {
            text-align: center;
            margin-bottom: 10px;
            font-size: 24px;
        }
        
        .container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
        
        .left-column {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        
        .right-column {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        
        .section-title {
            font-weight: bold;
            margin: 10px 0 5px;
            text-align: center;
        }
        
        .field-row {
            display: flex;
            margin-bottom: 8px;
        }
        
        .field-label {
            background-color: #D2B48C;
            padding: 8px;
            width: 120px;
            border-radius: 4px;
            text-align: center;
            color: #000;
        }
        
        .field-input {
            flex-grow: 1;
            padding: 8px;
            border: 1px solid #ccc;
            border-radius: 4px;
            margin-left: 5px;
            background-color: #fff;
        }
        
        .memo-field {
            height: 200px;
        }
        
        .image-container {
            width: 100%;
            text-align: center;
            margin: 15px 0;
        }
        
        .image-item {
            width: 100%;
            max-width: 200px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            font-weight: bold;
            border: 1px solid #ddd;
            margin: 0 auto;
        }
        .image-item img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border: 2px solid #ddd;
          }
        .taste-field {
            display: flex;
            margin-bottom: 8px;
        }
        
        .taste-label {
            background-color: #D2B48C;
            padding: 8px;
            width: 80px;
            border-radius: 4px;
            text-align: center;
            color: #000;
        }
        
        .taste-input {
            flex-grow: 1;
            padding: 8px;
            border: 1px solid #ccc;
            border-radius: 4px;
            margin-left: 5px;
            background-color: #fff;
        }
        
        .radar-chart {
            width: 100%;
            max-width: 300px;
            height: auto;
            margin: 15px auto;
            position: relative;
        }
        .radar-chart-image {
            width: 100%;
            max-width: 300px;
            height: auto;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            font-weight: bold;
            border: 1px solid #ddd;
            margin: 0 auto;
            padding: 10px 0;
        }
       
        
        /* Responsive adjustments */
        @media screen and (max-width: 768px) {
            body {
                width: 100%;
                height: auto;
                padding: 10px;
            }
            .container {
                grid-template-columns: 1fr;
            }
            
            .field-label, .taste-label {
                width: 100px;
                font-size: 14px;
            }
        }
        </style>
      </head>
      <body>
<div class="page">
         <h1>${coffeeRecord.name}</h1>
    
    <div class="container">
        <div class="left-column">
            <div class="section-title">豆の情報</div>
            
            <div class="field-row">
                <div class="field-label">種類</div>
                <div class="field-input">${
                  coffeeRecord.variety || "未記入"
                }</div>
            </div>
            
            <div class="field-row">
                <div class="field-label">産地</div>
                <div class="field-input">${
                  coffeeRecord.productionArea || "未記入"
                }</div>
            </div>
            
            <div class="field-row">
                <div class="field-label">焙煎度</div>
                <div class="field-input">${
                  coffeeRecord.roastingDegree || "未記入"
                }</div>
            </div>
            
            <div class="section-title">抽出情報</div>
            
            <div class="field-row">
                <div class="field-label">抽出器具</div>
                <div class="field-input">${
                  coffeeRecord.extractionMethod || "未記入"
                }</div>
            </div>
            
            <div class="field-row">
                <div class="field-label">抽出メーカー</div>
                <div class="field-input">${
                  coffeeRecord.extractionMaker || "未記入"
                }</div>
            </div>
            
            <div class="field-row">
                <div class="field-label">挽き目</div>
                <div class="field-input">${
                  coffeeRecord.grindSize || "未記入"
                }</div>
            </div>
            
            <div class="field-row">
                <div class="field-label">注出温度</div>
                <div class="field-input">${
                  coffeeRecord.temperature || "未記入"
                }</div>
            </div>
            
            <div class="field-row">
                <div class="field-label">粉量</div>
                <div class="field-input">${
                  coffeeRecord.coffeeAmount || "未記入"
                }</div>
            </div>
            
            <div class="field-row">
                <div class="field-label">水量</div>
                <div class="field-input">${
                  coffeeRecord.waterAmount || "未記入"
                }</div>
            </div>
            
            <div class="field-row">
                <div class="field-label">抽出時間</div>
                <div class="field-input">${
                  coffeeRecord.extractionTime || "未記入"
                }</div>
            </div>
            
            <div class="field-row">
                <div class="field-label">豆/水比率</div>
                <div class="field-input">${
                  coffeeRecord.coffeeAmount && coffeeRecord.waterAmount
                    ? `1:${
                        Math.round(
                          (coffeeRecord.waterAmount /
                            coffeeRecord.coffeeAmount) *
                            10
                        ) / 10
                      }`
                    : "計算不可"
                }</div>
            </div>
            
            <div class="field-row">
                <div class="field-label">メモ</div>
                <div class="field-input memo-field"> ${
                  coffeeRecord.memo || "未記入"
                }</div>
            </div>
        </div>
        
        <div class="right-column">
            <div class="image-container">
                <div class="image-item">${imageHtml}</div>
            </div>
            
            <div class="section-title">味わいの評価（５点満点）</div>
            <div class="taste-field">
                  ${createRatingBarHtml(
                    "酸味",
                    Number(coffeeRecord.acidity) || 0
                  )}
            </div>
           
            
            <div class="taste-field">
               ${createRatingBarHtml(
                 "甘味",
                 Number(coffeeRecord.sweetness) || 0
               )}
            </div>
            
            <div class="taste-field">
                 ${createRatingBarHtml(
                   "苦味",
                   Number(coffeeRecord.bitterness) || 0
                 )}
            </div>
            
            <div class="taste-field">
              ${createRatingBarHtml("コク", Number(coffeeRecord.body) || 0)}
            </div>
            
            <div class="taste-field">
                 ${createRatingBarHtml("香り", Number(coffeeRecord.aroma) || 0)}
            </div>
            
            <div class="taste-field">
                ${createRatingBarHtml(
                  "後味",
                  Number(coffeeRecord.aftertaste) || 0
                )}
            </div>
            
            <div class="radar-chart">
                <!-- Placeholder for radar chart -->
              
                <div class="radar-chart-image">${svgChart}</div>
            
            </div>
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
