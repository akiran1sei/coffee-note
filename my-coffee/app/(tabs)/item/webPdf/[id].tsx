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
  Modal,
} from "react-native";
import {
  LoadingComponent,
  NoRecordComponent,
} from "../../../../components/MessageComponent";
import { useRoute } from "@react-navigation/native";
import { useRouter, Link } from "expo-router";
import RadarChart from "../../../../components/RadarChart/RadarChart";
import { CoffeeRecord } from "../../../../types/CoffeeTypes";
import CoffeeStorageService from "../../../../services/CoffeeStorageService";
import * as FileSystem from "expo-file-system"; // 追加: PDFで画像処理に必要

// useRouteで受け取るパラメータの型定義
type RouteParams = {
  id: string;
};

const CoffeePdfDisplayScreen = () => {
  const route = useRoute();
  const router = useRouter();
  const { id } = route.params as RouteParams;
  const [coffeeRecord, setCoffeeRecord] = useState<CoffeeRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPdfConfirmModal, setShowPdfConfirmModal] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [imageBase64, setImageBase64] = useState<string | null>(null); // 追加: Base64画像を保持するステート

  // コンポーネントマウント時にコーヒーレコードを取得
  useEffect(() => {
    const fetchCoffeeRecord = async () => {
      try {
        const record = await CoffeeStorageService.getCoffeeRecordById(id);
        if (record) {
          setCoffeeRecord(record);

          // 画像URIがあり、Base64形式でない場合は変換を試みる
          if (record.imageUri && !record.imageUri.startsWith("data:image")) {
            await convertImageToBase64(record.imageUri);
          } else if (
            record.imageUri &&
            record.imageUri.startsWith("data:image")
          ) {
            // 既にBase64形式の場合はそのまま使用
            setImageBase64(record.imageUri);
          }

          setShowPdfConfirmModal(true);
        } else {
          console.warn(`コーヒーレコードID ${id} が見つかりませんでした。`);
          Alert.alert(
            "エラー",
            "指定されたコーヒーデータが見つかりませんでした。"
          );
          router.back();
        }
      } catch (error) {
        console.error("コーヒーレコードの取得に失敗しました:", error);
        Alert.alert("エラー", "コーヒーデータの読み込みに失敗しました。");
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchCoffeeRecord();
  }, [id]);

  // 追加: 画像をBase64に変換する関数
  const convertImageToBase64 = async (uri: string) => {
    if (Platform.OS === "web") {
      // Web環境での画像変換処理
      try {
        // Web環境では fetch API を使って画像をBase64に変換
        const response = await fetch(uri);
        const blob = await response.blob();
        const reader = new FileReader();

        reader.onload = () => {
          const base64data = reader.result as string;
          setImageBase64(base64data);
        };

        await reader.readAsDataURL(blob);
      } catch (error) {
        console.error("Web環境での画像Base64変換エラー:", error);
        setImageBase64(null);
      }
    } else if (uri.startsWith("file://")) {
      // モバイル環境での画像変換処理
      try {
        // Expo FileSystemを使って画像をBase64に変換
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        // MIME typeを付加してBase64 URI形式に変換
        const base64Uri = `data:image/jpeg;base64,${base64}`;
        setImageBase64(base64Uri);
      } catch (error) {
        console.error("モバイル環境での画像Base64変換エラー:", error);
        setImageBase64(null);
      }
    } else {
      console.warn("サポートされていない画像URI形式:", uri);
      setImageBase64(null);
    }
  };

  // Web環境での印刷イベントリスナー設定
  useEffect(() => {
    if (Platform.OS === "web") {
      console.log("imageBase64", imageBase64);
      const beforePrint = () => {
        setIsPrinting(true);
        console.log("Printing starts");
      };

      const afterPrint = () => {
        setIsPrinting(false);
        console.log("Printing ends");
      };

      window.addEventListener("beforeprint", beforePrint);
      window.addEventListener("afterprint", afterPrint);

      return () => {
        window.removeEventListener("beforeprint", beforePrint);
        window.removeEventListener("afterprint", afterPrint);
      };
    }
    return undefined;
  }, []);

  // 修正: 画像ソースを取得する関数
  const getImageSource = (): ImageSourcePropType => {
    // 変換したBase64画像があればそれを優先使用
    if (imageBase64) {
      return { uri: imageBase64 };
    }

    // coffeeRecordの画像URIがあり、Base64形式ならそれを使用
    if (
      coffeeRecord?.imageUri &&
      coffeeRecord.imageUri.startsWith("data:image")
    ) {
      return { uri: coffeeRecord.imageUri };
    }

    // モバイル環境でファイルURIの場合
    if (
      Platform.OS !== "web" &&
      coffeeRecord?.imageUri &&
      coffeeRecord.imageUri.startsWith("file://")
    ) {
      return { uri: coffeeRecord.imageUri };
    }

    // それ以外の場合はデフォルト画像を表示
    return require("../../../../assets/images/no-image.png");
  };

  // PDF生成処理
  const handleGeneratePdf = () => {
    try {
      if (Platform.OS === "web") {
        setShowPdfConfirmModal(false);
        setTimeout(() => {
          window.print();
          router.back();
        }, 100);
      } else {
        Alert.alert("PDF生成", "このプラットフォームではPDF生成は未実装です。");
        setShowPdfConfirmModal(false);
        router.back();
      }
    } catch (error) {
      console.error("PDF生成中にエラーが発生しました:", error);
      Alert.alert("エラー", "PDF生成中にエラーが発生しました。");
      setShowPdfConfirmModal(false);
      router.back();
    }
  };

  // 閉じるボタンの処理
  const handleClose = () => {
    router.back();
  };

  // モーダルでキャンセルが押された時の処理
  const handleCancelPdf = () => {
    setShowPdfConfirmModal(false);
    router.back();
  };

  // ローディング中の表示
  if (loading) {
    return <LoadingComponent />;
  }

  // レコードが存在しない場合の表示
  if (!coffeeRecord) {
    return <NoRecordComponent />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contents}>
        <Text style={styles.pageTitle}>
          <Link href={`../web/${coffeeRecord.id}`} style={styles.pageTitleLink}>
            {coffeeRecord.name || "コーヒー記録詳細 (PDFプレビュー)"}
          </Link>
        </Text>

        <View style={styles.mainContents}>
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.pdfRecordDetail}>
              <View style={styles.pdfHorizontalLayout}>
                <View style={styles.pdfLeftColumn}>
                  <View style={styles.pdfImageContainer}>
                    <Image
                      source={getImageSource()}
                      style={styles.pdfRecordImage}
                      defaultSource={require("../../../../assets/images/no-image.png")}
                    />
                  </View>

                  <View style={styles.pdfInfoSection}>
                    <View style={styles.pdfInfoItem}>
                      <Text style={styles.pdfLabel}>種類:</Text>
                      <Text style={styles.pdfValue}>
                        {coffeeRecord.variety || "未記入"}
                      </Text>
                    </View>
                    <View style={styles.pdfInfoItem}>
                      <Text style={styles.pdfLabel}>産地:</Text>
                      <Text style={styles.pdfValue}>
                        {coffeeRecord.productionArea || "未記入"}
                      </Text>
                    </View>
                    <View style={styles.pdfInfoItem}>
                      <Text style={styles.pdfLabel}>焙煎度:</Text>
                      <Text style={styles.pdfValue}>
                        {coffeeRecord.roastingDegree || "未記入"}
                      </Text>
                    </View>
                    <View style={styles.pdfInfoItem}>
                      <Text style={styles.pdfLabel}>抽出器具:</Text>
                      <Text style={styles.pdfValue}>
                        {coffeeRecord.extractionMethod || "未記入"}
                      </Text>
                    </View>
                    <View style={styles.pdfInfoItem}>
                      <Text style={styles.pdfLabel}>メーカー:</Text>
                      <Text style={styles.pdfValue}>
                        {coffeeRecord.extractionMaker || "未記入"}
                      </Text>
                    </View>
                    <View style={styles.pdfInfoItem}>
                      <Text style={styles.pdfLabel}>挽き目:</Text>
                      <Text style={styles.pdfValue}>
                        {coffeeRecord.grindSize || "未記入"}
                      </Text>
                    </View>
                    <View style={styles.pdfInfoItem}>
                      <Text style={styles.pdfLabel}>注湯温度:</Text>
                      <Text style={styles.pdfValue}>
                        {coffeeRecord.temperature || "0"}℃
                      </Text>
                    </View>
                    <View style={styles.pdfInfoItem}>
                      <Text style={styles.pdfLabel}>粉量:</Text>
                      <Text style={styles.pdfValue}>
                        {coffeeRecord.coffeeAmount || "0"}g
                      </Text>
                    </View>
                    <View style={styles.pdfInfoItem}>
                      <Text style={styles.pdfLabel}>水量:</Text>
                      <Text style={styles.pdfValue}>
                        {coffeeRecord.waterAmount || "0"}ml
                      </Text>
                    </View>
                    <View style={styles.pdfInfoItem}>
                      <Text style={styles.pdfLabel}>抽出時間:</Text>
                      <Text style={styles.pdfValue}>
                        {coffeeRecord.extractionTime || "未記入"}
                      </Text>
                    </View>
                    <View style={styles.pdfInfoItem}>
                      <Text style={styles.pdfLabel}>豆/水比率:</Text>
                      <Text style={styles.pdfValue}>
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

                <View style={styles.pdfRightColumn}>
                  <View style={styles.pdfTastingInfo}>
                    <Text style={styles.pdfTastingTitle}>テイスティング</Text>
                    <View style={styles.pdfInfoItem}>
                      <Text style={styles.pdfLabel}>酸味:</Text>
                      <Text style={styles.pdfValue}>
                        {coffeeRecord.acidity || "0"}
                      </Text>
                    </View>

                    <View style={styles.pdfInfoItem}>
                      <Text style={styles.pdfLabel}>苦味:</Text>
                      <Text style={styles.pdfValue}>
                        {coffeeRecord.bitterness || "0"}
                      </Text>
                    </View>
                    <View style={styles.pdfInfoItem}>
                      <Text style={styles.pdfLabel}>コク:</Text>
                      <Text style={styles.pdfValue}>
                        {coffeeRecord.body || "0"}
                      </Text>
                    </View>
                    <View style={styles.pdfInfoItem}>
                      <Text style={styles.pdfLabel}>香り:</Text>
                      <Text style={styles.pdfValue}>
                        {coffeeRecord.aroma || "0"}
                      </Text>
                    </View>
                    <View style={styles.pdfInfoItem}>
                      <Text style={styles.pdfLabel}>キレ:</Text>
                      <Text style={styles.pdfValue}>
                        {coffeeRecord.aftertaste || "0"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.pdfRadarChartSection}>
                    <Text style={styles.pdfChartTitle}>レーダーチャート</Text>
                    <View style={styles.pdfRadarChart}>
                      <RadarChart
                        data={{
                          acidity: Number(coffeeRecord.acidity) || 0,
                          bitterness: Number(coffeeRecord.bitterness) || 0,
                          body: Number(coffeeRecord.body) || 0,
                          aroma: Number(coffeeRecord.aroma) || 0,
                          aftertaste: Number(coffeeRecord.aftertaste) || 0,
                        }}
                      />
                    </View>
                  </View>
                </View>
                <View style={styles.pdfMemoSection}>
                  <Text style={styles.pdfMemoTitle}>メモ</Text>
                  <Text style={styles.pdfMemo}>
                    {coffeeRecord.memo || "未記入"}
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={showPdfConfirmModal}
        onRequestClose={() => {
          handleCancelPdf();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalMessage}>
              この内容をPDFとして出力しますか？
            </Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={styles.modalGeneratePdfButton}
                onPress={handleGeneratePdf}
              >
                <Text style={styles.buttonText}>PDFとして印刷</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={handleCancelPdf}
              >
                <Text style={styles.buttonText}>キャンセル</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    alignItems: "center",
  },
  contents: {
    flex: 1,
    width: "100%",
    maxWidth: 1000,
    alignItems: "center",
    paddingTop: 20,
  },
  pageTitle: {
    fontSize: 27,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    fontFamily: "Caveat",
    color: "#D2B48C",
  },
  pageTitleLink: { textDecorationLine: "underline" },
  mainContents: {
    flex: 1,
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 20,
  },
  scrollContainer: {
    paddingVertical: 10,
    width: "100%",
  },
  pdfRecordDetail: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 0,
    marginBottom: 0,
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    width: "100%",
  },
  pdfHorizontalLayout: {
    flexDirection: "row",
    gap: 15,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  pdfLeftColumn: {
    flex: 2,
    minWidth: 250,
    maxWidth: 350,
    flexDirection: "column",
    gap: 15,
  },
  pdfRightColumn: {
    flex: 2,
    minWidth: 300,
    maxWidth: 300,
    flexDirection: "column",
    gap: 15,
  },
  pdfImageContainer: {
    marginBottom: 0,
    alignItems: "center",
  },
  pdfRecordImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#e0e0e0",
  },
  pdfInfoSection: {
    marginBottom: 0,
    width: "100%",
  },
  pdfInfoItem: {
    display: "flex",
    flexDirection: "row",
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 5,
    alignItems: "baseline",
  },
  pdfLabel: {
    fontWeight: "bold",
    width: 80,
    color: "#777",
    flexShrink: 0,
  },
  pdfValue: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  pdfTastingInfo: {
    marginBottom: 0,
    width: "100%",
  },
  pdfTastingTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    textAlign: "center",
    color: "#555",
  },
  pdfRadarChartSection: {
    marginBottom: 0,
    alignItems: "center",
    width: "100%",
  },
  pdfChartTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#555",
  },
  pdfRadarChart: {
    width: 200,
    height: 200,
  },
  pdfMemoSection: {
    marginBottom: 0,
    width: "100%",
    marginTop: 15,
  },
  pdfMemoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#555",
  },
  pdfMemo: {
    lineHeight: 20,
    color: "#333",
  },
  bottomButtonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
    width: "100%",
    maxWidth: 300,
  },
  closeButton: {
    backgroundColor: "#6c757d",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: "#dc3545",
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    width: "80%",
    maxWidth: 400,
    alignItems: "center",
  },
  modalMessage: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  modalGeneratePdfButton: {
    backgroundColor: "#28a745",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseButton: {
    backgroundColor: "#6c757d",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  hidden: {
    display: "none",
  },
});

export default CoffeePdfDisplayScreen;
