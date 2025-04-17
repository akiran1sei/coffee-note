import React, { useState, useEffect } from "react";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as Print from "expo-print";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Text,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { CoffeeRecord } from "../../types/CoffeeTypes";
import CoffeeStorageService from "../../services/CoffeeStorageService";

interface jsPDF {
  new (): jsPDF;
  setFontSize: (size: number) => this;
  text: (
    txt: string | string[],
    x: number,
    y: number,
    maxWidth?: number,
    align?: "left" | "center" | "right",
    charSpace?: number
  ) => this;
  addImage: (
    imageData: string,
    format: string,
    x: number,
    y: number,
    width?: number,
    height?: number,
    alias?: string,
    compression?: "NONE" | "FAST" | "MEDIUM" | "SLOW"
  ) => this;
  save: (filename: string) => void;
  splitTextToSize: (txt: string, maxWidth: number) => string[]; // splitTextToSize の型定義を追加
  // 他に必要なメソッドの型定義を追加
}

// ウェブ専用のPDFライブラリを条件付きでインポート
const jsPDF: jsPDF | undefined =
  Platform.OS === "web" ? require("jspdf").jsPDF : undefined;

interface PdfItemProps {
  data: {
    acidity: number;
    aftertaste: number;
    aroma: number;
    bitterness: number;
    body: number;
    coffeeAmount: number;
    extractionMaker: string;
    extractionMethod: string;
    extractionTime: string;
    grindSize: string;
    id: string;
    imageUri: string;
    memo: string;
    name: string;
    productionArea: string;
    roastingDegree: string;
    sweetness: number;
    temperature: number;
    variety: string;
    waterAmount: number;
  };
}

type RouteParams = {
  id: string;
};

const PdfButtonComponent: React.FC<PdfItemProps> = () => {
  const [coffeeRecord, setCoffeeRecord] = useState<CoffeeRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const route = useRoute();

  const { id } = route.params as RouteParams;

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

  const downloadPdf = async () => {
    if (!coffeeRecord) {
      Alert.alert("エラー", "コーヒーデータがありません。");
      return;
    }

    try {
      setIsGeneratingPdf(true);

      if (Platform.OS === "web" && jsPDF) {
        // **ウェブ環境でのPDF生成 (jsPDFを使用)**
        console.log("Web: jsPDFでのPDF生成を開始します");
        const pdf = new jsPDF();
        pdf.setFontSize(16);
        pdf.text(coffeeRecord.name || "コーヒー記録", 10, 20);
        pdf.setFontSize(12);

        let yPosition = 30;
        const lineHeight = 7;

        const addDetail = (label: string, value: string) => {
          pdf.text(`${label}: ${value}`, 10, yPosition);
          yPosition += lineHeight;
        };

        addDetail("種類", coffeeRecord.variety || "未記入");
        addDetail("産地", coffeeRecord.productionArea || "未記入");
        addDetail("焙煎度", coffeeRecord.roastingDegree || "未記入");
        addDetail("抽出器具", coffeeRecord.extractionMethod || "未記入");
        addDetail("抽出メーカー", coffeeRecord.extractionMaker || "未記入");
        addDetail("挽き目", coffeeRecord.grindSize || "未記入");
        addDetail("注湯温度", `${coffeeRecord.temperature || "0"}℃`);
        addDetail("粉量", `${coffeeRecord.coffeeAmount || "0"}g`);
        addDetail("水量", `${coffeeRecord.waterAmount || "0"}ml`);
        addDetail("抽出時間", coffeeRecord.extractionTime || "未記入");
        addDetail(
          "豆/水比率",
          coffeeRecord.coffeeAmount && coffeeRecord.waterAmount
            ? `1:${
                Math.round(
                  (coffeeRecord.waterAmount / coffeeRecord.coffeeAmount) * 10
                ) / 10
              }`
            : "計算不可"
        );
        addDetail("酸味", `${coffeeRecord.acidity || "0"}/5`);
        addDetail("甘味", `${coffeeRecord.sweetness || "0"}/5`);
        addDetail("苦味", `${coffeeRecord.bitterness || "0"}/5`);
        addDetail("コク", `${coffeeRecord.body || "0"}/5`);
        addDetail("香り", `${coffeeRecord.aroma || "0"}/5`);
        addDetail("後味", `${coffeeRecord.aftertaste || "0"}/5`);

        yPosition += 10;
        pdf.setFontSize(14);
        pdf.text("メモ:", 10, yPosition);
        pdf.setFontSize(12);
        yPosition += lineHeight;

        // メモを改行しながら追加
        // メモを改行しながら追加
        const memoLines = pdf.splitTextToSize(
          coffeeRecord.memo || "未記入",
          180
        ); // 幅180ptで改行
        memoLines.forEach((line: string) => {
          // line パラメータに string 型注釈を追加
          pdf.text(line, 10, yPosition);
          yPosition += lineHeight;
        });

        pdf.save(`${coffeeRecord.name || "coffee-record"}.pdf`);
        console.log("Web: jsPDFでPDF生成とダウンロードが完了しました");
      } else {
        // **モバイル環境でのPDF生成 (expo-printを使用)**
        console.log("Mobile: expo-printでのPDF生成を開始します");

        // 画像処理を環境に応じて分岐
        let imageHtml = "";
        if (coffeeRecord.imageUri) {
          try {
            if (Platform.OS === "web") {
              imageHtml = `<div style="width: 100px; height: 100px; border-radius: 50px; background-color: #e0e0e0; display: flex; justify-content: center; align-items: center;">No Image</div>`;
            } else {
              const base64 = await FileSystem.readAsStringAsync(
                coffeeRecord.imageUri,
                {
                  encoding: FileSystem.EncodingType.Base64,
                }
              );
              imageHtml = `<img src="data:image/jpeg;base64,${base64}" style="width: 100px; height: 100px; border-radius: 50px; object-fit: cover;" />`;
            }
          } catch (err) {
            console.error("画像の読み込みエラー:", err);
            imageHtml = `<div style="width: 100px; height: 100px; border-radius: 50px; background-color: #e0e0e0; text-align: center; line-height: 100px;">No Image</div>`;
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

        const svgChart = `
          <svg width="200" height="200" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="80" fill="none" stroke="#eee" stroke-width="1" />
            <circle cx="100" cy="100" r="60" fill="none" stroke="#eee" stroke-width="1" />
            <circle cx="100" cy="100" r="40" fill="none" stroke="#eee" stroke-width="1" />
            <circle cx="100" cy="100" r="20" fill="none" stroke="#eee" stroke-width="1" />
            <line x1="100" y1="100" x2="100" y2="20" stroke="#ccc" stroke-width="1" />
            <line x1="100" y1="100" x2="170" y2="100" stroke="#ccc" stroke-width="1" />
            <line x1="100" y1="100" x2="100" y2="180" stroke="#ccc" stroke-width="1" />
            <line x1="100" y1="100" x2="30" y2="100" stroke="#ccc" stroke-width="1" />
            <line x1="100" y1="100" x2="135" y2="40" stroke="#ccc" stroke-width="1" />
            <line x1="100" y1="100" x2="65" y2="40" stroke="#ccc" stroke-width="1" />
            <line x1="100" y1="100" x2="135" y2="160" stroke="#ccc" stroke-width="1" />
            <line x1="100" y1="100" x2="65" y2="160" stroke="#ccc" stroke-width="1" />
            <polygon
              points="
                ${
                  100 +
                  (radarData.acidity / 5) * 80 * Math.sin((Math.PI * 2 * 0) / 6)
                }, ${
          100 - (radarData.acidity / 5) * 80 * Math.cos((Math.PI * 2 * 0) / 6)
        }
                ${
                  100 +
                  (radarData.sweetness / 5) *
                    80 *
                    Math.sin((Math.PI * 2 * 1) / 6)
                }, ${
          100 - (radarData.sweetness / 5) * 80 * Math.cos((Math.PI * 2 * 1) / 6)
        }
                ${
                  100 +
                  (radarData.bitterness / 5) *
                    80 *
                    Math.sin((Math.PI * 2 * 2) / 6)
                }, ${
          100 -
          (radarData.bitterness / 5) * 80 * Math.cos((Math.PI * 2 * 2) / 6)
        }
                ${
                  100 +
                  (radarData.body / 5) * 80 * Math.sin((Math.PI * 2 * 3) / 6)
                }, ${
          100 - (radarData.body / 5) * 80 * Math.cos((Math.PI * 2 * 3) / 6)
        }
                ${
                  100 +
                  (radarData.aroma / 5) * 80 * Math.sin((Math.PI * 2 * 4) / 6)
                }, ${
          100 - (radarData.aroma / 5) * 80 * Math.cos((Math.PI * 2 * 4) / 6)
        }
                ${
                  100 +
                  (radarData.aftertaste / 5) *
                    80 *
                    Math.sin((Math.PI * 2 * 5) / 6)
                }, ${
          100 -
          (radarData.aftertaste / 5) * 80 * Math.cos((Math.PI * 2 * 5) / 6)
        }
              "
              fill="rgba(210, 180, 140, 0.5)"
              stroke="rgba(160, 120, 80, 1)"
              stroke-width="2"
            />
            <text x="100" y="10" text-anchor="middle" font-size="12" fill="#555">酸味</text>
            <text x="180" y="100" text-anchor="start" font-size="12" fill="#555">甘味</text>
            <text x="100" y="190" text-anchor="middle" font-size="12" fill="#555">苦味</text>
            <text x="20" y="100" text-anchor="end" font-size="12" fill="#555">コク</text>
            <text x="140" y="40" text-anchor="middle" font-size="12" fill="#555">香り</text>
            <text x="60" y="40" text-anchor="middle" font-size="12" fill="#555">後味</text>
          </svg>`;

        const htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title><span class="math-inline">\{coffeeRecord\.name \|\| "コーヒー記録"\}</title\>
<style\>
@page \{ size\: A4; margin\: 1cm; \}
html, body \{ font\-family\: \-apple\-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans\-serif; line\-height\: 1\.5; color\: \#333; background\-color\: \#fff; margin\: 0; padding\: 0; font\-size\: 12pt; \}
\.container \{ max\-width\: 800px; margin\: 0 auto; padding\: 20px; \}
h1 \{ color\: \#333; font\-size\: 24pt; margin\-bottom\: 20px; padding\-bottom\: 10px; border\-bottom\: 2px solid \#d4a76a; \}
h2 \{ color\: \#5d4037; font\-size\: 18pt; margin\-top\: 20px; margin\-bottom\: 15px; border\-left\: 4px solid \#d4a76a; padding\-left\: 8px; \}
\.section \{ margin\-bottom\: 30px; background\-color\: \#fff; border\-radius\: 8px; padding\: 15px; box\-shadow\: 0 2px 4px rgba\(0,0,0,0\.1\); \}
\.flex\-row \{ display\: flex; flex\-direction\: row; justify\-content\: space\-between; align\-items\: flex\-start; flex\-wrap\: wrap; \}
\.info\-column \{ flex\: 1; min\-width\: 250px; margin\-right\: 20px; \}
\.image\-column \{ width\: 120px; margin\-left\: auto; \}
\.detail\-item \{ margin\-bottom\: 10px; display\: flex; flex\-wrap\: wrap; \}
\.detail\-label \{ font\-weight\: bold; color\: \#5d4037; margin\-right\: 10px; min\-width\: 100px; \}
\.detail\-value \{ flex\: 1; \}
\.chart\-container \{ margin\: 20px auto; width\: 200px; height\: 200px; \}
\.ratings\-grid \{ display\: grid; grid\-template\-columns\: repeat\(2, 1fr\); gap\: 10px; margin\-bottom\: 20px; \}
\.rating\-item \{ display\: flex; align\-items\: center; \}
\.rating\-label \{ font\-weight\: bold; color\: \#5d4037; margin\-right\: 10px; min\-width\: 60px; \}
\.rating\-value \{ font\-weight\: bold; \}
\.memo\-box \{ background\-color\: \#f9f5f0; border\-radius\: 8px; padding\: 15px; white\-space\: pre\-wrap; border\-left\: 4px solid \#d4a76a; \}
\.memo\-content \{ font\-size\: 12pt; \}
\.footer \{ margin\-top\: 30px; text\-align\: center; font\-size\: 10pt; color\: \#888; border\-top\: 1px solid \#eee; padding\-top\: 15px; \}
</style\>
</head\>
<body\>
<div class\="container"\>
<h1\></span>{coffeeRecord.name || "コーヒー記録"}</h1>
              <divclass="section">
                <h2>豆の情報</h2>
                <div class="flex-row">
                  <div class="info-column">
                    <div class="detail-item">
                      <span class="detail-label">種類:</span>
                      <span class="detail-value">${
                        coffeeRecord.variety || "未記入"
                      }</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">産地:</span>
                      <span class="detail-value">${
                        coffeeRecord.productionArea || "未記入"
                      }</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">焙煎度:</span>
                      <span class="detail-value">${
                        coffeeRecord.roastingDegree || "未記入"
                      }</span>
                    </div>
                  </div>
                  <div class="image-column">
                    ${imageHtml}
                  </div>
                </div>
              </divclass=>

              <div class="section">
                <h2>抽出情報</h2>
                <div class="flex-row">
                  <div class="info-column">
                    <div class="detail-item">
                      <span class="detail-label">抽出器具:</span>
                      <span class="detail-value">${
                        coffeeRecord.extractionMethod || "未記入"
                      }</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">抽出メーカー:</span>
                      <span class="detail-value">${
                        coffeeRecord.extractionMaker || "未記入"
                      }</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">挽き目:</span>
                      <span class="detail-value">${
                        coffeeRecord.grindSize || "未記入"
                      }</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">注湯温度:</span>
                      <span class="detail-value">${
                        coffeeRecord.temperature || "0"
                      }℃</span>
                    </div>
                  </div>
                  <div class="info-column">
                    <div class="detail-item">
                      <span class="detail-label">粉量:</span>
                      <span class="detail-value">${
                        coffeeRecord.coffeeAmount || "0"
                      }g</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">水量:</span>
                      <span class="detail-value">${
                        coffeeRecord.waterAmount || "0"
                      }ml</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">抽出時間:</span>
                      <span class="detail-value">${
                        coffeeRecord.extractionTime || "未記入"
                      }</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">豆/水比率:</span>
                      <span class="detail-value">${
                        coffeeRecord.coffeeAmount && coffeeRecord.waterAmount
                          ? `1:${
                              Math.round(
                                (coffeeRecord.waterAmount /
                                  coffeeRecord.coffeeAmount) *
                                  10
                              ) / 10
                            }`
                          : "計算不可"
                      }</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="section">
                <h2>味わいの評価</h2>
                <div class="flex-row">
                  <div class="info-column">
                    <div class="ratings-grid">
                      <div class="rating-item">
                        <span class="rating-label">酸味:</span>
                        <span class="rating-value">${
                          coffeeRecord.acidity || "0"
                        }/5</span>
                      </div>
                      <div class="rating-item">
                        <span class="rating-label">甘味:</span>
                        <span class="rating-value">${
                          coffeeRecord.sweetness || "0"
                        }/5</span>
                      </div>
                      <div class="rating-item">
                        <span class="rating-label">苦味:</span>
                        <span class="rating-value">${
                          coffeeRecord.bitterness || "0"
                        }/5</span>
                      </div>
                      <div class="rating-item">
                        <span class="rating-label">コク:</span>
                        <span class="rating-value">${
                          coffeeRecord.body || "0"
                        }/5</span>
                      </div>
                      <div class="rating-item">
                        <span class="rating-label">香り:</span>
                        <span class="rating-value">${
                          coffeeRecord.aroma || "0"
                        }/5</span>
                      </div>
                      <div class="rating-item">
                        <span class="rating-label">後味:</span>
                        <span class="rating-value">${
                          coffeeRecord.aftertaste || "0"
                        }/5</span>
                      </div>
                    </div>
                  </div>
                  <div class="chart-container">
                    ${svgChart}
                  </div>
                </div>
              </div>

              <div class="section">
                <h2>MEMO</h2>
                <div class="memo-box">
                  <div class="memo-content">${
                    coffeeRecord.memo || "未記入"
                  }</div>
                </div>
              </div>

              <div class="footer">
                作成日: ${new Date().toLocaleDateString("ja-JP")}
              </div>
            </div>
          </body>
          </html>
        `;

        const { uri } = await Print.printToFileAsync({
          html: htmlContent,
          base64: false,
          width: 595, // A4サイズの幅 (pt)
          height: 842, // A4サイズの高さ (pt)
        });

        console.log("Mobile: expo-printでのPDF生成完了:", uri);

        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: "コーヒー情報をPDFで共有",
          UTI: "com.adobe.pdf", // iOS用のUTI
        });

        console.log("Mobile: PDF共有完了");
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

  return (
    <TouchableOpacity
      style={[
        styles.downloadPdfButton,
        isGeneratingPdf && styles.disabledButton,
      ]}
      onPress={downloadPdf}
      disabled={isGeneratingPdf || loading || !coffeeRecord}
    >
      {isGeneratingPdf ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <Text style={styles.buttonText}>PDF をダウンロード</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  downloadPdfButton: {
    backgroundColor: "#8b5a2b", // コーヒーらしい茶色に変更
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    width: "90%",
    maxWidth: 300,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#cccccc",
    opacity: 0.7,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default PdfButtonComponent;
