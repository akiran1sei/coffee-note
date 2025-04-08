import React, { useEffect, useState } from "react";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as Print from "expo-print"; // 追加
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
import { useRoute } from "@react-navigation/native";
import { useRouter } from "expo-router";
import HeaderComponent from "../../../components/HeaderComponent";
import PageTitleComponent from "../../../components/PageTitleComponent";
import CoffeeStorageService from "../../../services/CoffeeStorageService";
import { CoffeeRecord } from "../../../types/CoffeeTypes";
import RadarChart from "../../../components/RadarChart/RadarChart";
// PDF生成用のライブラリをインポート (Webのみで使用)
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

// Webの場合のみpdfMakeの設定
if (Platform.OS === "web") {
  // @ts-ignore 型定義問題を回避
  pdfMake.vfs = pdfFonts.pdfMake?.vfs;
}
// pdfMakeにフォントを設定（Web環境向け）
// if (Platform.OS === "web") {
//   // 明示的な型アサーション
//   pdfMake.vfs = (pdfFonts as any).pdfMake?.vfs;
// }

type RouteParams = {
  id: string;
};

export default function CoffeeItemScreen() {
  const route = useRoute();
  const router = useRouter();
  const { id } = route.params as RouteParams;

  const [coffeeRecord, setCoffeeRecord] = useState<CoffeeRecord | null>(null);
  const [loading, setLoading] = useState(true);

  // 画像URIを環境に応じて適切に処理する関数
  const getImageSource = (uri?: string | null): ImageSourcePropType => {
    if (!uri) {
      return require("../../../assets/images/no-image.png");
    }

    if (Platform.OS === "web") {
      // Base64形式かどうかをチェック
      if (uri.startsWith("data:image")) {
        return { uri };
      }
      // web環境でfileプロトコルは使用できないため、デフォルトの画像を表示する
      return require("../../../assets/images/no-image.png");
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

  // downloadPdf関数を変更
  // const downloadPdf = async () => {
  //   if (!coffeeRecord) {
  //     Alert.alert("エラー", "コーヒーデータがありません。");
  //     return;
  //   }

  //   try {
  //     if (Platform.OS === "web") {
  //       // Web環境でのPDF生成
  //       const docDefinition = {
  //         content: [
  //           { text: coffeeRecord.name, style: "header" },
  //           { text: "\n" },
  //           {
  //             table: {
  //               headerRows: 0,
  //               widths: ["30%", "70%"],
  //               body: [
  //                 ["種類", coffeeRecord.variety || "未記入"],
  //                 ["産地", coffeeRecord.productionArea || "未記入"],
  //                 ["焙煎度", coffeeRecord.roastingDegree || "未記入"],
  //                 ["抽出器具", coffeeRecord.extractionMethod || "未記入"],
  //                 ["抽出メーカー", coffeeRecord.extractionMaker || "未記入"],
  //                 ["挽き目", coffeeRecord.grindSize || "未記入"],
  //                 ["注湯温度", coffeeRecord.temperature || "未記入"],
  //                 ["粉量", coffeeRecord.coffeeAmount || "未記入"],
  //                 ["水量", coffeeRecord.waterAmount || "未記入"],
  //                 ["抽出時間", coffeeRecord.extractionTime || "未記入"],
  //                 ["酸味", coffeeRecord.acidity || "0"],
  //                 ["甘味", coffeeRecord.sweetness || "0"],
  //                 ["苦味", coffeeRecord.bitterness || "0"],
  //                 ["コク", coffeeRecord.body || "0"],
  //                 ["香り", coffeeRecord.aroma || "0"],
  //                 ["後味", coffeeRecord.aftertaste || "0"],
  //                 ["MEMO", coffeeRecord.memo || "未記入"],
  //               ],
  //             },
  //           },
  //         ],
  //         styles: {
  //           header: {
  //             fontSize: 18,
  //             bold: true,
  //           },
  //         },
  //         defaultStyle: {
  //           font: "Helvetica",
  //         },
  //       };

  //       // PDFをダウンロード
  //       pdfMake.createPdf(docDefinition).download(`${coffeeRecord.name}.pdf`);
  //     } else {
  //       // モバイル環境でのPDF生成
  //       const htmlContent = `
  //       <!DOCTYPE html>
  //       <html>
  //         <head>
  //           <meta charset="utf-8">
  //           <title>${coffeeRecord.name}</title>
  //           <style>
  //             body { font-family: 'Helvetica', sans-serif; padding: 20px; }
  //             h1 { text-align: center; color: #333; }
  //             .container { max-width: 600px; margin: 0 auto; }
  //             table { width: 100%; border-collapse: collapse; margin-top: 20px; }
  //             th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
  //             th { background-color: #f2f2f2; width: 30%; }
  //           </style>
  //         </head>
  //         <body>
  //           <div class="container">
  //             <h1>${coffeeRecord.name}</h1>
  //             <table>
  //               <tr><th>種類</th><td>${
  //                 coffeeRecord.variety || "未記入"
  //               }</td></tr>
  //               <tr><th>産地</th><td>${
  //                 coffeeRecord.productionArea || "未記入"
  //               }</td></tr>
  //               <tr><th>焙煎度</th><td>${
  //                 coffeeRecord.roastingDegree || "未記入"
  //               }</td></tr>
  //               <tr><th>抽出器具</th><td>${
  //                 coffeeRecord.extractionMethod || "未記入"
  //               }</td></tr>
  //               <tr><th>抽出メーカー</th><td>${
  //                 coffeeRecord.extractionMaker || "未記入"
  //               }</td></tr>
  //               <tr><th>挽き目</th><td>${
  //                 coffeeRecord.grindSize || "未記入"
  //               }</td></tr>
  //               <tr><th>注湯温度</th><td>${
  //                 coffeeRecord.temperature || "未記入"
  //               }</td></tr>
  //               <tr><th>粉量</th><td>${
  //                 coffeeRecord.coffeeAmount || "未記入"
  //               }</td></tr>
  //               <tr><th>水量</th><td>${
  //                 coffeeRecord.waterAmount || "未記入"
  //               }</td></tr>
  //               <tr><th>抽出時間</th><td>${
  //                 coffeeRecord.extractionTime || "未記入"
  //               }</td></tr>
  //               <tr><th>酸味</th><td>${coffeeRecord.acidity || "0"}</td></tr>
  //               <tr><th>甘味</th><td>${coffeeRecord.sweetness || "0"}</td></tr>
  //               <tr><th>苦味</th><td>${coffeeRecord.bitterness || "0"}</td></tr>
  //               <tr><th>コク</th><td>${coffeeRecord.body || "0"}</td></tr>
  //               <tr><th>香り</th><td>${coffeeRecord.aroma || "0"}</td></tr>
  //               <tr><th>後味</th><td>${coffeeRecord.aftertaste || "0"}</td></tr>
  //               <tr><th colspan="2">MEMO</th></tr>
  //               <tr><td colspan="2">${coffeeRecord.memo || "未記入"}</td></tr>
  //             </table>
  //           </div>
  //         </body>
  //       </html>
  //     `;

  //       // HTMLからPDFを生成
  //       const { uri } = await Print.printToFileAsync({
  //         html: htmlContent,
  //         base64: false,
  //       });

  //       // PDFを共有
  //       await Sharing.shareAsync(uri, {
  //         mimeType: "application/pdf",
  //         dialogTitle: "コーヒー情報をPDFで共有",
  //       });
  //     }
  //   } catch (error) {
  //     console.error("PDF生成エラー:", error);
  //     Alert.alert("エラー", "PDFの生成に失敗しました");
  //   }
  // };
  const downloadPdf = async () => {
    if (!coffeeRecord) {
      Alert.alert("エラー", "コーヒーデータがありません。");
      return;
    }

    try {
      if (Platform.OS === "web") {
        // Web環境でのPDF生成 (テーブルレイアウト維持)
        const docDefinition = {
          content: [
            { text: coffeeRecord.name, style: "header" },
            { text: "\n" },
            {
              table: {
                headerRows: 0,
                widths: ["30%", "70%"],
                body: [
                  ["種類", coffeeRecord.variety || "未記入"],
                  ["産地", coffeeRecord.productionArea || "未記入"],
                  ["焙煎度", coffeeRecord.roastingDegree || "未記入"],
                  ["抽出器具", coffeeRecord.extractionMethod || "未記入"],
                  ["抽出メーカー", coffeeRecord.extractionMaker || "未記入"],
                  ["挽き目", coffeeRecord.grindSize || "未記入"],
                  ["注湯温度", coffeeRecord.temperature || "未記入"],
                  ["粉量", coffeeRecord.coffeeAmount || "未記入"],
                  ["水量", coffeeRecord.waterAmount || "未記入"],
                  ["抽出時間", coffeeRecord.extractionTime || "未記入"],
                  ["酸味", coffeeRecord.acidity || "0"],
                  ["甘味", coffeeRecord.sweetness || "0"],
                  ["苦味", coffeeRecord.bitterness || "0"],
                  ["コク", coffeeRecord.body || "0"],
                  ["香り", coffeeRecord.aroma || "0"],
                  ["後味", coffeeRecord.aftertaste || "0"],
                  ["MEMO", coffeeRecord.memo || "未記入"],
                ],
              },
            },
          ],
          styles: {
            header: { fontSize: 18, bold: true },
          },
          defaultStyle: { font: "Helvetica" },
        };
        pdfMake.createPdf(docDefinition).download(`${coffeeRecord.name}.pdf`);
      } else {
        // モバイル環境でのPDF生成 (リスト形式 + レーダーチャート)
        const radarData = {
          acidity: Number(coffeeRecord.acidity) || 0,
          sweetness: Number(coffeeRecord.sweetness) || 0,
          bitterness: Number(coffeeRecord.bitterness) || 0,
          body: Number(coffeeRecord.body) || 0,
          aroma: Number(coffeeRecord.aroma) || 0,
          aftertaste: Number(coffeeRecord.aftertaste) || 0,
        };

        const htmlContent = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <title>${coffeeRecord.name}</title>
      <style>
        body { font-family: 'Helvetica', sans-serif; padding: 20px; }
        h1 { text-align: center; color: #333; margin-bottom: 20px; }
        .detail-item { margin-bottom: 10px; }
        .label { font-weight: bold; margin-right: 5px; }
        .memo-title { font-weight: bold; margin-top: 20px; margin-bottom: 5px; }
        .radar-container { width: 200px; height: 200px; margin: 20px auto; }
      </style>
    </head>
    <body>
      <h1>${coffeeRecord.name}</h1>
      <div class="detail-item"><span class="label">種類:</span> ${
        coffeeRecord.variety || "未記入"
      }</div>
      <div class="detail-item"><span class="label">産地:</span> ${
        coffeeRecord.productionArea || "未記入"
      }</div>
      <div class="detail-item"><span class="label">焙煎度:</span> ${
        coffeeRecord.roastingDegree || "未記入"
      }</div>
      <div class="detail-item"><span class="label">抽出器具:</span> ${
        coffeeRecord.extractionMethod || "未記入"
      }</div>
      <div class="detail-item"><span class="label">抽出メーカー:</span> ${
        coffeeRecord.extractionMaker || "未記入"
      }</div>
      <div class="detail-item"><span class="label">挽き目:</span> ${
        coffeeRecord.grindSize || "未記入"
      }</div>
      <div class="detail-item"><span class="label">注湯温度:</span> ${
        coffeeRecord.temperature || "未記入"
      }</div>
      <div class="detail-item"><span class="label">粉量:</span> ${
        coffeeRecord.coffeeAmount || "未記入"
      }</div>
      <div class="detail-item"><span class="label">水量:</span> ${
        coffeeRecord.waterAmount || "未記入"
      }</div>
      <div class="detail-item"><span class="label">抽出時間:</span> ${
        coffeeRecord.extractionTime || "未記入"
      }</div>
      <div class="detail-item"><span class="label">酸味:</span> ${
        coffeeRecord.acidity || "0"
      }</div>
      <div class="detail-item"><span class="label">甘味:</span> ${
        coffeeRecord.sweetness || "0"
      }</div>
      <div class="detail-item"><span class="label">苦味:</span> ${
        coffeeRecord.bitterness || "0"
      }</div>
      <div class="detail-item"><span class="label">コク:</span> ${
        coffeeRecord.body || "0"
      }</div>
      <div class="detail-item"><span class="label">香り:</span> ${
        coffeeRecord.aroma || "0"
      }</div>
      <div class="detail-item"><span class="label">後味:</span> ${
        coffeeRecord.aftertaste || "0"
      }</div>

      <h2 style="text-align: center; margin-top: 30px;">味わいの評価</h2>
      <div style="align-items: center; display: flex; justify-content: center;">
        RadarChartデータ: 酸味=${radarData.acidity}, 甘味=${
          radarData.sweetness
        }, 苦味=${radarData.bitterness}, コク=${radarData.body}, 香り=${
          radarData.aroma
        }, 後味=${radarData.aftertaste}
      </div>

      <h2 class="memo-title">MEMO</h2>
      <div>${coffeeRecord.memo || "未記入"}</div>
    </body>
  </html>
`;

        const { uri } = await Print.printToFileAsync({
          html: htmlContent,
          base64: false,
        });

        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: "コーヒー情報をPDFで共有",
        });
      }
    } catch (error) {
      console.error("PDF生成エラー:", error);
      Alert.alert("エラー", "PDFの生成に失敗しました");
    }
  };
  //↓.txtバージョン
  // const downloadPdf = async () => {
  //   if (!coffeeRecord) {
  //     Alert.alert("エラー", "コーヒーデータがありません。");
  //     return;
  //   }

  //   try {
  //     if (Platform.OS === "web") {
  //       // Web環境でのPDF生成
  //       const docDefinition = {
  //         content: [
  //           { text: coffeeRecord.name, style: 'header' },
  //           { text: '\n' },
  //           {
  //             table: {
  //               headerRows: 0,
  //               widths: ['30%', '70%'],
  //               body: [
  //                 ['種類', coffeeRecord.variety || "未記入"],
  //                 ['産地', coffeeRecord.productionArea || "未記入"],
  //                 ['焙煎度', coffeeRecord.roastingDegree || "未記入"],
  //                 ['抽出器具', coffeeRecord.extractionMethod || "未記入"],
  //                 ['抽出メーカー', coffeeRecord.extractionMaker || "未記入"],
  //                 ['挽き目', coffeeRecord.grindSize || "未記入"],
  //                 ['注湯温度', coffeeRecord.temperature || "未記入"],
  //                 ['粉量', coffeeRecord.coffeeAmount || "未記入"],
  //                 ['水量', coffeeRecord.waterAmount || "未記入"],
  //                 ['抽出時間', coffeeRecord.extractionTime || "未記入"],
  //                 ['酸味', coffeeRecord.acidity || "0"],
  //                 ['甘味', coffeeRecord.sweetness || "0"],
  //                 ['苦味', coffeeRecord.bitterness || "0"],
  //                 ['コク', coffeeRecord.body || "0"],
  //                 ['香り', coffeeRecord.aroma || "0"],
  //                 ['後味', coffeeRecord.aftertaste || "0"],
  //                 ['MEMO', coffeeRecord.memo || "未記入"],
  //               ]
  //             }
  //           }
  //         ],
  //         styles: {
  //           header: {
  //             fontSize: 18,
  //             bold: true
  //           }
  //         },
  //         defaultStyle: {
  //           font: 'Helvetica'
  //         }
  //       };

  //       // PDFをダウンロード
  //       pdfMake.createPdf(docDefinition).download(`${coffeeRecord.name}.pdf`);
  //     } else {
  //       // モバイル環境でのテキストファイル作成
  //       const textContent = `
  // コーヒー名: ${coffeeRecord.name}
  // 種類: ${coffeeRecord.variety || "未記入"}
  // 産地: ${coffeeRecord.productionArea || "未記入"}
  // 焙煎度: ${coffeeRecord.roastingDegree || "未記入"}
  // 抽出器具: ${coffeeRecord.extractionMethod || "未記入"}
  // 抽出メーカー: ${coffeeRecord.extractionMaker || "未記入"}
  // 挽き目: ${coffeeRecord.grindSize || "未記入"}
  // 注湯温度: ${coffeeRecord.temperature || "未記入"}
  // 粉量: ${coffeeRecord.coffeeAmount || "未記入"}
  // 水量: ${coffeeRecord.waterAmount || "未記入"}
  // 抽出時間: ${coffeeRecord.extractionTime || "未記入"}
  // 酸味: ${coffeeRecord.acidity || "0"}
  // 甘味: ${coffeeRecord.sweetness || "0"}
  // 苦味: ${coffeeRecord.bitterness || "0"}
  // コク: ${coffeeRecord.body || "0"}
  // 香り: ${coffeeRecord.aroma || "0"}
  // 後味: ${coffeeRecord.aftertaste || "0"}
  // MEMO: ${coffeeRecord.memo || "未記入"}
  //       `;

  //       // 一時ファイルに保存
  //       const fileUri = `${FileSystem.cacheDirectory}${coffeeRecord.name}.txt`;
  //       await FileSystem.writeAsStringAsync(fileUri, textContent);

  //       // 共有
  //       await Sharing.shareAsync(fileUri, {
  //         mimeType: "text/plain",
  //         dialogTitle: "コーヒー情報を共有",
  //       });
  //     }
  //   } catch (error) {
  //     console.error("ファイル生成エラー:", error);
  //     Alert.alert("エラー", "ファイルの生成に失敗しました");
  //   }
  // };

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
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!coffeeRecord) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>コーヒーレコードが見つかりません</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contents}>
        <HeaderComponent />
        <PageTitleComponent TextData={coffeeRecord.name} />
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
  loadingText: {
    fontSize: 20,
    color: "#555",
  },
  errorText: {
    fontSize: 18,
    color: "#dc3545",
  },
  downloadPdfButton: {
    backgroundColor: "#28a745",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    width: "90%",
    alignItems: "center",
  },
});
