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
  Modal, // Modalコンポーネントをインポート
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { useRouter, Link } from "expo-router";
import HeaderComponent from "../../../../components/HeaderComponent";
import PageTitleComponent from "../../../../components/PageTitleComponent";
import CoffeeStorageService from "../../../../services/CoffeeStorageService";
import { CoffeeRecord } from "../../../../types/CoffeeTypes";
import RadarChart from "../../../../components/RadarChart/RadarChart";
import {
  LoadingComponent,
  NoRecordComponent,
} from "../../../../components/MessageComponent";
// PdfButtonComponentはWeb版では使用しないため、ここではコメントアウトを維持または削除します。
// 今回はModal内にボタンを配置するため、このコンポーネントは使用しません。
// import PdfButtonComponent from "../../../../components/button/Pdf";

type RouteParams = {
  id: string;
};

const CoffeeItemScreen = () => {
  const route = useRoute();
  const router = useRouter();
  const { id } = route.params as RouteParams;

  const [coffeeRecord, setCoffeeRecord] = useState<CoffeeRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false); // PDF生成中の状態管理
  const [showPdfModal, setShowPdfModal] = useState(false); // PDFポップアップ表示の状態管理

  // 画像URIを環境に応じて適切に処理する関数
  const getImageSource = (uri?: string | null): ImageSourcePropType => {
    if (!uri) {
      // URIがない場合はデフォルト画像
      return require("../../../../assets/images/no-image.png");
    }

    if (Platform.OS === "web") {
      // Web環境の場合
      if (uri.startsWith("data:image")) {
        // Base64形式の場合はそのままURIとして使用
        return { uri };
      }
      // Web環境でfileプロトコルは使用できないため、ローカルファイルURIの場合はデフォルト画像を表示する
      // もしWeb上の画像URLを扱う場合は、ここにそのロジックを追加する必要があります
      return require("../../../../assets/images/no-image.png");
    } else {
      // モバイル環境の場合
      // file:// スキームがない場合は追加
      return { uri: uri.startsWith("file://") ? uri : `file://${uri}` };
    }
  };

  // レコード削除処理
  const handleDeleteRecord = async (id: string) => {
    if (Platform.OS === "web") {
      // Web環境の場合、window.confirm を使用
      if (window.confirm("このレコードを削除しますか？")) {
        try {
          await CoffeeStorageService.deleteCoffeeRecord(id);
          router.replace("/list"); // 削除成功後リスト画面へ遷移
        } catch (error) {
          console.error("レコードの削除に失敗しました:", error);
          Alert.alert("エラー", "レコードの削除に失敗しました。");
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
                router.replace("/list"); // 削除成功後リスト画面へ遷移
              } catch (error) {
                console.error("レコードの削除に失敗しました:", error);
                Alert.alert("エラー", "レコードの削除に失敗しました。");
              }
            },
          },
        ],
        { cancelable: false } // キャンセルボタン以外をタップしても閉じない
      );
    }
  };

  // コンポーネントマウント時にコーヒーレコードを取得
  useEffect(() => {
    const fetchCoffeeRecord = async () => {
      try {
        const record = await CoffeeStorageService.getCoffeeRecordById(id);
        setCoffeeRecord(record);
      } catch (error) {
        console.error("コーヒーレコードの取得に失敗しました:", error);
        // エラー発生時もローディングを終了
        Alert.alert("エラー", "コーヒーデータの読み込みに失敗しました。");
      } finally {
        setLoading(false);
      }
    };

    fetchCoffeeRecord();
  }, [id]); // idが変わるたびに再実行

  // PDF生成処理 (Web向けにwindow.print()を使用)
  const handleGeneratePdf = () => {
    if (Platform.OS === "web") {
      // Web環境の場合、印刷ダイアログを表示
      // Modalを非表示にしてから印刷を実行することで、Modal以外の部分も印刷対象に含めることができます。
      // もしModalの内容だけを印刷したい場合は、Modal表示中に印刷を実行し、
      // CSSの@media printでModal以外の要素を非表示にするなどの工夫が必要です。
      // ここではシンプルにModalを閉じてからwindow.print()を呼び出します。
      setShowPdfModal(false); // Modalを閉じる
      // 少し遅延させてModalが完全に閉じるのを待つ
      setTimeout(() => {
        window.print();
      }, 100); // 100msの遅延
    } else {
      // モバイル環境の場合、別途PDF生成ライブラリの実装が必要です。
      // 例: react-native-html-to-pdf など
      Alert.alert("PDF生成", "このプラットフォームではPDF生成は未実装です。");
    }
  };

  // ローディング中の表示
  if (loading) {
    return <LoadingComponent />;
  }

  // レコードが存在しない場合の表示
  if (!coffeeRecord) {
    return <NoRecordComponent />;
  }

  // メインコンテンツのレンダリング
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contents}>
        <HeaderComponent />
        {/* ページタイトルはレコード名を表示 */}
        <PageTitleComponent
          TextData={coffeeRecord.name || "コーヒー記録詳細"}
        />

        {/* PDF生成中のオーバーレイ (ここでは使用しないが元のコードから残す) */}
        {isGeneratingPdf && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#007bff" />
            <Text style={styles.loadingText}>PDFを作成中...</Text>
          </View>
        )}

        {/* メインコンテンツエリア */}
        <View style={[styles.absoluteBox, styles.mainContents]}>
          {/* スクロールビュー */}
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* レコード詳細コンテナ - 横方向レイアウトの親 */}
            <View style={styles.recordDetail}>
              {/* 横方向レイアウト用のラッパー */}
              <View style={styles.horizontalLayout}>
                {/* 左カラム */}
                <View style={styles.leftColumn}>
                  {/* 画像セクション */}
                  <View style={styles.imageContainer}>
                    <Image
                      source={getImageSource(coffeeRecord.imageUri)}
                      style={styles.recordImage}
                      defaultSource={require("../../../../assets/images/no-image.png")}
                    />
                  </View>

                  {/* 豆・抽出情報セクション */}
                  <View style={styles.infoSection}>
                    {/* 各情報アイテム */}
                    <View style={styles.infoItem}>
                      <Text style={styles.label}>種類:</Text>
                      <Text style={styles.value}>
                        {coffeeRecord.variety || "未記入"}
                      </Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={styles.label}>産地:</Text>
                      <Text style={styles.value}>
                        {coffeeRecord.productionArea || "未記入"}
                      </Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={styles.label}>焙煎度:</Text>
                      <Text style={styles.value}>
                        {coffeeRecord.roastingDegree || "未記入"}
                      </Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={styles.label}>抽出器具:</Text>
                      <Text style={styles.value}>
                        {coffeeRecord.extractionMethod || "未記入"}
                      </Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={styles.label}>抽出メーカー:</Text>
                      <Text style={styles.value}>
                        {coffeeRecord.extractionMaker || "未記入"}
                      </Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={styles.label}>挽き目:</Text>
                      <Text style={styles.value}>
                        {coffeeRecord.grindSize || "未記入"}
                      </Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={styles.label}>注湯温度:</Text>
                      <Text style={styles.value}>
                        {coffeeRecord.temperature || "0"}℃
                      </Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={styles.label}>粉量:</Text>
                      <Text style={styles.value}>
                        {coffeeRecord.coffeeAmount || "0"}g
                      </Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={styles.label}>水量:</Text>
                      <Text style={styles.value}>
                        {coffeeRecord.waterAmount || "0"}ml
                      </Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={styles.label}>抽出時間:</Text>
                      <Text style={styles.value}>
                        {coffeeRecord.extractionTime || "未記入"}
                      </Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={styles.label}>豆/水比率:</Text>
                      <Text style={styles.value}>
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
                {/* /leftColumn */}

                {/* 右カラム */}
                <View style={styles.rightColumn}>
                  {/* 味わい評価セクション */}
                  <View style={styles.tastingInfo}>
                    <Text style={styles.tastingTitle}>テイスティング</Text>
                    <View style={styles.infoItem}>
                      <Text style={styles.label}>酸味:</Text>
                      <Text style={styles.value}>
                        {coffeeRecord.acidity || "0"}/5
                      </Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={styles.label}>甘味:</Text>
                      <Text style={styles.value}>
                        {coffeeRecord.sweetness || "0"}/5
                      </Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={styles.label}>苦味:</Text>
                      <Text style={styles.value}>
                        {coffeeRecord.bitterness || "0"}/5
                      </Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={styles.label}>コク:</Text>
                      <Text style={styles.value}>
                        {coffeeRecord.body || "0"}/5
                      </Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={styles.label}>香り:</Text>
                      <Text style={styles.value}>
                        {coffeeRecord.aroma || "0"}/5
                      </Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={styles.label}>後味:</Text>
                      <Text style={styles.value}>
                        {coffeeRecord.aftertaste || "0"}/5
                      </Text>
                    </View>
                  </View>

                  {/* レーダーチャートセクション */}
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
                </View>
                {/* メモセクション */}
                <View style={styles.memoSection}>
                  <Text style={styles.memoTitle}>メモ</Text>
                  <Text style={styles.memo}>
                    {coffeeRecord.memo || "未記入"}
                  </Text>
                </View>
                {/* /rightColumn */}
              </View>
              {/* /horizontalLayout */}
            </View>
            {/* /recordDetail */}

            {/* ボタンコンテナ */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() =>
                  router.replace({
                    pathname: `../../update/web/${coffeeRecord.id}`, // 編集画面への遷移パス
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

              {/* PDFボタンを追加 */}
              {/* Web版のみ表示 */}
              {Platform.OS === "web" && (
                // <TouchableOpacity
                //   style={styles.pdfButton}
                //   onPress={() =>
                //     router.replace({
                //       pathname: `../webPdf/${coffeeRecord.id}`, // 編集画面への遷移パス
                //     })
                //   }
                // >
                //   <Text style={styles.buttonText}>PDF</Text>
                // </TouchableOpacity>
                <Text style={{ color: "red", marginTop: 10 }}>
                  ※WEB版ではPDFダウンロードはご利用いただけません。
                </Text>
              )}

              {/* モバイル版のPDFボタンは別途実装が必要であれば追加 */}
              {/* {Platform.OS !== "web" && (
                 <TouchableOpacity
                   style={styles.pdfButton}
                   onPress={() => handleGeneratePdf()} // モバイル版のPDF生成処理を呼び出す
                 >
                   <Text style={styles.buttonText}>PDF出力 (モバイル)</Text>
                 </TouchableOpacity>
               )} */}
            </View>
            {/* /buttonContainer */}
          </ScrollView>
          {/* /ScrollView */}
        </View>
        {/* /mainContents */}
      </View>
      {/* /contents */}

      {/* /PDF表示用Modal */}
    </SafeAreaView> // /SafeAreaView
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
    maxWidth: 1000, // 最大幅を1000pxに設定
    marginHorizontal: "auto", // 中央寄せ
    top: 160,
    bottom: 0,
  },
  scrollContainer: {
    alignItems: "center", // 中央寄せ
    paddingVertical: 20,
    paddingBottom: 80,
    width: "100%", // 幅いっぱい使う
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
    // maxWidthは親のmainContentsで指定されているためここでは不要
    // alignSelf: 'center', // 親で中央寄せされているため不要
  },

  // 横方向レイアウト用のスタイル
  horizontalLayout: {
    flexDirection: "row", // 要素を横に並べる
    gap: 30, // 左カラムと右カラムの間の隙間
    flexWrap: "wrap", // 画面が狭い場合に折り返す
    justifyContent: "center", // 中央寄せ
  },
  leftColumn: {
    flex: 2, // 利用可能なスペースの2/3を占める
    minWidth: 300, // 左カラムの最小幅を調整
    maxWidth: 400, // 左カラムの最大幅を調整
    flexDirection: "column", // 左カラム内の要素は縦に並べる
    gap: 20, // 左カラム内のセクション間の隙間
  },
  rightColumn: {
    flex: 2, // 利用可能なスペースの3/3を占める（左カラムより広く）
    minWidth: 300, // 右カラムの最小幅を調整
    maxWidth: 400, // 右カラムの最大幅を調整
    flexDirection: "column", // 右カラム内の要素は縦に並べる
    gap: 20, // 右カラム内のセクション間の隙間
  },

  imageContainer: {
    marginBottom: 0, // 横並びになるため下マージンを調整
    alignItems: "center", // 中央寄せ
  },
  recordImage: {
    width: 120, // 画像サイズを調整
    height: 120,
    borderRadius: 60,
    backgroundColor: "#e0e0e0",
  },

  infoSection: {
    marginBottom: 0, // 横並びになるため下マージンを調整
    width: "100%", // 親要素の幅いっぱいに広げる
  },
  infoItem: {
    display: "flex",
    flexDirection: "row",
    marginBottom: 8, // アイテム間の下マージンを調整
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 8, // アイテム間の下パディングを調整
    alignItems: "baseline", // テキストのベースラインを揃える
  },
  label: {
    fontWeight: "bold",
    width: 100, // ラベルの固定幅
    color: "#777",
    flexShrink: 0, // 縮小しない
  },
  value: {
    flex: 1, // 残りのスペースを占める
    color: "#333",
    // textAlign: "center", // 中央寄せは不要
  },
  tastingInfo: {
    marginBottom: 0, // 横並びになるため下マージンを調整
    width: "100%", // 親要素の幅いっぱいに広げる
  },
  tastingTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#555",
  },
  radarChartSection: {
    marginBottom: 0, // 横並びになるため下マージンを調整
    alignItems: "center", // 中央寄せ
    width: "100%", // 親要素の幅いっぱいに広げる
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#555",
  },
  radarChart: {
    width: 250, // チャートサイズを調整
    height: 250,
  },
  memoSection: {
    marginBottom: 0, // 横並びになるため下マージンを調整
    width: "100%", // 親要素の幅いっぱいに広げる
  },
  memoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#555",
  },
  memo: {
    lineHeight: 22, // 行間を調整
    color: "#333",
  },
  buttonContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    maxWidth: 300, // ボタンコンテナの最大幅
    marginHorizontal: "auto", // 中央寄せ
    marginTop: 30, // recordDetailとの間隔
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
  pdfButton: {
    // PDFボタンのスタイルを追加
    backgroundColor: "#28a745", // 緑色系の色
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
