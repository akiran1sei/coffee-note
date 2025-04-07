import React, { useEffect, useState } from "react";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
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
import { Link, useRoute } from "@react-navigation/native";
import { useRouter } from "expo-router"; // useRouter をインポート
import HeaderComponent from "../../../components/HeaderComponent";
import PageTitleComponent from "../../../components/PageTitleComponent";
import CoffeeStorageService from "../../../services/CoffeeStorageService";
import { CoffeeRecord } from "../../../types/CoffeeTypes";
import RadarChart from "../../../components/RadarChart/RadarChart";
// インポートの修正
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

// 型アサーションを使って型エラーを回避
(pdfMake as any).vfs = (pdfFonts as any).pdfMake?.vfs || pdfFonts;
type RouteParams = {
  id: string;
};

export default function CoffeeItemScreen() {
  const route = useRoute();
  const router = useRouter();
  const { id } = route.params as RouteParams;

  const [coffeeRecord, setCoffeeRecord] = useState<CoffeeRecord | null>(null);
  const [loading, setLoading] = useState(true);
  // 画像URIを環境に応じて適切に処理する関数 - Fixed return type
  const getImageSource = (uri?: string | null): ImageSourcePropType => {
    if (!uri) {
      return require("../../../assets/images/no-image.png");
    }

    if (Platform.OS === "web") {
      // Base64形式かどうかをチェック
      if (uri.startsWith("data:image")) {
        return { uri };
      }
      // web環境でfileプロトコルは使用できないため、デフォルトの画像を表示する。
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
  const downloadPdf = async () => {
    if (!coffeeRecord) {
      Alert.alert("エラー", "コーヒーデータがありません。");
      return;
    }

    const documentDefinition = {
      content: [
        { text: coffeeRecord.name, style: "header" },
        { text: `種類: ${coffeeRecord.variety}` },
        { text: `産地: ${coffeeRecord.productionArea}` },
        { text: `焙煎度: ${coffeeRecord.roastingDegree}` },
        { text: `抽出器具: ${coffeeRecord.extractionMethod}` },
        { text: `抽出メーカー: ${coffeeRecord.extractionMaker}` },
        { text: `挽き目: ${coffeeRecord.grindSize}` },
        { text: `注湯温度: ${coffeeRecord.temperature}` },
        { text: `粉量: ${coffeeRecord.coffeeAmount}` },
        { text: `水量: ${coffeeRecord.waterAmount}` },
        { text: `抽出時間: ${coffeeRecord.extractionTime}` },
        { text: `酸味: ${coffeeRecord.acidity}` },
        { text: `甘味: ${coffeeRecord.sweetness}` },
        { text: `苦味: ${coffeeRecord.bitterness}` },
        { text: `コク: ${coffeeRecord.body}` },
        { text: `香り: ${coffeeRecord.aroma}` },
        { text: `後味: ${coffeeRecord.aftertaste}` },
        { text: `MEMO: ${coffeeRecord.memo}` },
      ],
      styles: {
        header: { fontSize: 18, bold: true, marginBottom: 10 },
      },
    };

    try {
      // ここで型アサーションを使用して型エラーを回避
      const pdfDoc = (pdfMake as any).createPdfKitDocument(documentDefinition);
      const chunks: Uint8Array[] = [];

      pdfDoc.on("data", (chunk: Uint8Array) => {
        chunks.push(chunk);
      });

      pdfDoc.on("end", async () => {
        // Node.js のBufferがWeb環境では使えない可能性があるため条件分岐
        let base64Pdf: string;

        if (Platform.OS === "web") {
          // Web環境では、Uint8Arrayを直接処理
          const pdfBlob = new Blob(chunks, { type: "application/pdf" });
          const reader = new FileReader();

          // FileReaderでBase64に変換するためのPromiseを作成
          const getBase64 = () =>
            new Promise<string>((resolve) => {
              reader.onloadend = () => {
                const base64data = reader.result as string;
                // data:application/pdf;base64, プレフィックスを削除
                resolve(base64data.substr(base64data.indexOf(",") + 1));
              };
              reader.readAsDataURL(pdfBlob);
            });

          base64Pdf = await getBase64();
        } else {
          // ネイティブ環境ではBufferを使用
          const pdfData = Buffer.concat(chunks);
          base64Pdf = pdfData.toString("base64");
        }

        if (Platform.OS === "web") {
          const link = document.createElement("a");
          link.href = `data:application/pdf;base64,${base64Pdf}`;
          link.download = `${coffeeRecord.name}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          const fileUri =
            FileSystem.documentDirectory + `${coffeeRecord.name}.pdf`;
          await FileSystem.writeAsStringAsync(fileUri, base64Pdf, {
            encoding: FileSystem.EncodingType.Base64,
          });
          await Sharing.shareAsync(fileUri, {
            mimeType: "application/pdf",
            dialogTitle: "PDF を共有",
          });
        }
      });

      pdfDoc.end();
    } catch (error) {
      console.error("PDF 生成エラー:", error);
      Alert.alert("エラー", "PDF の生成に失敗しました。");
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
                  defaultSource={require("../../../assets/images/no-image.png")} // Optional fallback
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
    maxWidth: 600, // 少し広めに
    marginHorizontal: "auto",
    top: 160, // ヘッダーとタイトルに合わせて調整
    bottom: 0,
  },
  scrollContainer: {
    alignItems: "center",
    paddingVertical: 20,
    paddingBottom: 60, // 下部のボタンのために余白
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
    backgroundColor: "#dc3545", // Bootstrap danger color
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    width: "100%",
    alignItems: "center",
  },
  updateButton: {
    backgroundColor: "#007bff", // Bootstrap primary color
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
