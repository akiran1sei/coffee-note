import React from "react";
import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
// import * as FileSystem from 'expo-file-system'; // Web環境では不要
// import * as Sharing from 'expo-sharing'; // Web環境では異なる処理が必要
import { Platform } from "react-native";
import { saveAs } from "file-saver"; // Web環境でのファイル保存用ライブラリ

// 必要に応じてフォントを登録
// Font.register({ family: 'YourFont', src: 'path/to/your/font.ttf' });

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: "Helvetica", // デフォルトフォント
    fontSize: 12,
    lineHeight: 1.5,
  },
  container: {
    maxWidth: 800,
    margin: "0 auto",
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: "#d4a76a",
    color: "#333",
  },
  section: {
    marginBottom: 30,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2, // Android用
  },
  h2: {
    fontSize: 18,
    marginTop: 20,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: "#d4a76a",
    paddingLeft: 8,
    color: "#5d4037",
  },
  flexRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  infoColumn: {
    flex: 1,
    minWidth: 250,
    marginRight: 20,
  },
  imageColumn: {
    width: 120,
    marginLeft: "auto",
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    objectFit: "cover",
  },
  noImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#e0e0e0",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  noImageText: {
    fontSize: 12,
  },
  detailItem: {
    marginBottom: 10,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  detailLabel: {
    fontWeight: "bold",
    color: "#5d4037",
    marginRight: 10,
    minWidth: 100,
  },
  detailValue: {
    flex: 1,
  },
  chartContainer: {
    margin: "20 auto",
    width: 200,
    height: 200,
  },
  memoBox: {
    backgroundColor: "#f9f5f0",
    borderRadius: 8,
    padding: 15,
    whiteSpace: "pre-wrap",
    borderLeftWidth: 4,
    borderLeftColor: "#d4a76a",
  },
  memoContent: {
    fontSize: 12,
  },
  footer: {
    marginTop: 30,
    textAlign: "center",
    fontSize: 10,
    color: "#888",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 15,
  },
  ratingGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  ratingItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "50%", // 2列表示
    marginBottom: 5,
  },
  ratingLabel: {
    fontWeight: "bold",
    color: "#5d4037",
    marginRight: 10,
    minWidth: 60,
  },
  ratingValue: {
    fontWeight: "bold",
  },
});

const CoffeeRecordDocument = ({ coffeeRecord }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.container}>
        <Text style={styles.title}>{coffeeRecord.name || "コーヒー記録"}</Text>

        <View style={styles.section}>
          <Text style={styles.h2}>豆の情報</Text>
          <View style={styles.flexRow}>
            <View style={styles.infoColumn}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>種類:</Text>
                <Text style={styles.detailValue}>
                  {coffeeRecord.variety || "未記入"}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>産地:</Text>
                <Text style={styles.detailValue}>
                  {coffeeRecord.productionArea || "未記入"}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>焙煎度:</Text>
                <Text style={styles.detailValue}>
                  {coffeeRecord.roastingDegree || "未記入"}
                </Text>
              </View>
            </View>
            <View style={styles.imageColumn}>
              {coffeeRecord.imageUri ? (
                <Image style={styles.image} src={coffeeRecord.imageUri} />
              ) : (
                <View style={styles.noImageContainer}>
                  <Text style={styles.noImageText}>No Image</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>抽出情報</Text>
          <View style={styles.flexRow}>
            <View style={styles.infoColumn}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>抽出器具:</Text>
                <Text style={styles.detailValue}>
                  {coffeeRecord.extractionMethod || "未記入"}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>抽出メーカー:</Text>
                <Text style={styles.detailValue}>
                  {coffeeRecord.extractionMaker || "未記入"}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>挽き目:</Text>
                <Text style={styles.detailValue}>
                  {coffeeRecord.grindSize || "未記入"}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>注湯温度:</Text>
                <Text style={styles.detailValue}>
                  {coffeeRecord.temperature || "0"}℃
                </Text>
              </View>
            </View>
            <View style={styles.infoColumn}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>粉量:</Text>
                <Text style={styles.detailValue}>
                  {coffeeRecord.coffeeAmount || "0"}g
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>水量:</Text>
                <Text style={styles.detailValue}>
                  {coffeeRecord.waterAmount || "0"}ml
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>抽出時間:</Text>
                <Text style={styles.detailValue}>
                  {coffeeRecord.extractionTime || "未記入"}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>豆/水比率:</Text>
                <Text style={styles.detailValue}>
                  {coffeeRecord.coffeeAmount && coffeeRecord.waterAmount
                    ? `1:${
                        Math.round(
                          (coffeeRecord.waterAmount /
                            coffeeRecord.coffeeAmount) *
                            10
                        ) / 10
                      }`
                    : "計算不可"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>味わいの評価</Text>
          <View style={styles.flexRow}>
            <View style={styles.infoColumn}>
              <View style={styles.ratingGrid}>
                <View style={styles.ratingItem}>
                  <Text style={styles.ratingLabel}>酸味:</Text>
                  <Text style={styles.ratingValue}>
                    {coffeeRecord.acidity || "0"}/5
                  </Text>
                </View>
                <View style={styles.ratingItem}>
                  <Text style={styles.ratingLabel}>甘味:</Text>
                  <Text style={styles.ratingValue}>
                    {coffeeRecord.sweetness || "0"}/5
                  </Text>
                </View>
                <View style={styles.ratingItem}>
                  <Text style={styles.ratingLabel}>苦味:</Text>
                  <Text style={styles.ratingValue}>
                    {coffeeRecord.bitterness || "0"}/5
                  </Text>
                </View>
                <View style={styles.ratingItem}>
                  <Text style={styles.ratingLabel}>コク:</Text>
                  <Text style={styles.ratingValue}>
                    {coffeeRecord.body || "0"}/5
                  </Text>
                </View>
                <View style={styles.ratingItem}>
                  <Text style={styles.ratingLabel}>香り:</Text>
                  <Text style={styles.ratingValue}>
                    {coffeeRecord.aroma || "0"}/5
                  </Text>
                </View>
                <View style={styles.ratingItem}>
                  <Text style={styles.ratingLabel}>後味:</Text>
                  <Text style={styles.ratingValue}>
                    {coffeeRecord.aftertaste || "0"}/5
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.chartContainer}>
              {/* SVGチャートは @react-pdf/renderer では直接サポートされていません */}
              {/* 代わりに Canvas などの要素を使ってグラフを描画する必要がある場合があります */}
              <Text>
                （レーダーチャートは Canvas などで描画する必要があります）
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>MEMO</Text>
          <View style={styles.memoBox}>
            <Text style={styles.memoContent}>
              {coffeeRecord.memo || "未記入"}
            </Text>
          </View>
        </View>

        <Text style={styles.footer}>
          作成日: {new Date().toLocaleDateString("ja-JP")}
        </Text>
      </View>
    </Page>
  </Document>
);

const downloadPdf = async (coffeeRecord, setIsGeneratingPdf) => {
  if (!coffeeRecord) {
    Alert.alert("エラー", "コーヒーデータがありません。");
    return;
  }

  setIsGeneratingPdf(true);

  try {
    // PDFをBlobとして生成
    const blob = await PDFRenderer(
      <CoffeeRecordDocument coffeeRecord={coffeeRecord} />
    ).toBlob();

    if (Platform.OS === "web") {
      // Web環境では file-saver を使用してダウンロード
      saveAs(blob, `${coffeeRecord.name || "coffee-record"}.pdf`);
      console.log("PDFダウンロード完了");
    } else {
      // モバイル環境 (Expo) では Sharing を使用
      const uri = URL.createObjectURL(blob);
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: "コーヒー情報をPDFで共有",
        UTI: "com.adobe.pdf", // iOS用のUTI
      });
      URL.revokeObjectURL(uri); // URIの解放
      console.log("PDF共有完了");
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

export default downloadPdf;
