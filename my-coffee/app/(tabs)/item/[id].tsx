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
          // float: right; が指定されているため、画像は右寄せになります。
          // 左寄せにしたい場合は float: left; に変更してください。
          imageHtml = `<img src="data:image/jpeg;base64,${base64}" style="width: 100px; height: 100px; border-radius: 50px; object-fit: cover; float: right; margin: 0 0 10px 10px;" />`;
        } catch (err) {
          console.error("画像の読み込みエラー:", err);
          // エラー時は画像なしで続行
          imageHtml = `<div style="width: 100px; height: 100px; border-radius: 50px; background-color: #e0e0e0; display: flex; justify-content: center; align-items: center;">No Image</div>`;
        }
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

      // SVGレーダーチャートの生成
      // ヘルパー関数：円上の座標を計算
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

      // 各カテゴリの角度を定義（「酸味」が上になるように270度（-90度）から開始）
      // 順序: 酸味, 甘味, 苦味, コク, 香り, 後味
      const anglesDegrees = [270, 330, 30, 90, 150, 210];
      const anglesRadians = anglesDegrees.map(
        (angle) => (angle * Math.PI) / 180
      );

      // 多角形（レーダーチャートのデータライン）のポイントを生成
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

      // 軸の線とラベルを生成
      const labelsSvg = ["酸味", "甘味", "苦味", "コク", "香り", "後味"];
      const axisLinesHtml: string[] = [];
      const labelTextsHtml: string[] = [];

      anglesRadians.forEach((angle, index) => {
        // 軸の線：maxDataRadiusより少し長く伸ばす
        const axisLineLength = maxDataRadius + 5; // 軸の線の長さ
        const { x: lineX, y: lineY } = calculatePointOnCircle(
          centerX,
          centerY,
          axisLineLength,
          angle
        );
        axisLinesHtml.push(
          `<line x1="${centerX}" y1="${centerY}" x2="${lineX}" y2="${lineY}" stroke="#ccc" />`
        );

        // ラベルの配置
        let { x: labelX, y: labelY } = calculatePointOnCircle(
          centerX,
          centerY,
          labelRadius,
          angle
        );
        let textAnchor = "middle"; // デフォルトは中央寄せ

        // 角度に基づいて text-anchor を調整し、ラベルが軸に沿って綺麗に表示されるようにする
        const angleDeg = anglesDegrees[index];
        if (Math.abs(angleDeg - 270) < 1 || Math.abs(angleDeg - 90) < 1) {
          // 上 (270度) または下 (90度)
          textAnchor = "middle";
        } else if (angleDeg > 270 || angleDeg < 90) {
          // 右側 (330度, 30度)
          textAnchor = "start"; // テキストの開始位置が x 座標になる
        } else {
          // 左側 (150度, 210度)
          textAnchor = "end"; // テキストの終了位置が x 座標になる
        }

        // 上と下のラベルのy座標を微調整して、円から少し離す
        if (Math.abs(angleDeg - 270) < 1) {
          // 酸味 (上)
          labelY -= 5; // テキストを上に少し移動
        } else if (Math.abs(angleDeg - 90) < 1) {
          // コク (下)
          labelY += 5; // テキストを下に少し移動
        }

        labelTextsHtml.push(
          `<text x="${labelX}" y="${labelY}" text-anchor="${textAnchor}" font-size="8" fill="#555">${labelsSvg[index]}</text>`
        );
      });

      // スケールを示す同心円を生成 (最大5レベル)
      const scaleCirclesHtml = [];
      for (let i = 1; i <= 5; i++) {
        const r = (i / 5) * maxDataRadius;
        // 最も外側の円は実線、内側の円は破線にして見やすくする
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

      const htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>${coffeeRecord.name}</title>
    <style>
    @page {
          size: A4 portrait;
          margin: 10mm; /* ページ全体の余白 */
        }
        body {
          width: 100%; /* ボディ幅 */
          /* max-width: 595px; /* A4幅より少し小さくすると余白内におさまりやすい */ */
          height: auto;
          font-family: "Helvetica", sans-serif;
          font-size: 15pt;
          line-height: 1.3;
          color: #333;
          margin: 10mm; /* ボディの外側の余白 */
          padding: 0;
          /* 中央寄せの原因になるtext-align: center; はbodyには通常つけません */
        }

      h1 {
        font-size: 20pt;
        color: #333;
        margin-bottom: 10px;
        border-bottom: 1px solid #ccc;
        padding-bottom: 5px;
        text-align: center; /* タイトルは中央寄せを維持 */
      }

      h2 {
        font-size: 18pt;
        color: #555;
        margin-top: 15px;
        margin-bottom: 8px;
        text-align: left; /* セクションタイトルは左寄せ */
      }

      .bean-extraction-container {
        width: 100%;
        max-width: 590px;
        /* === 修正ここから === */
        /* margin: 0 auto; */ /* 中央寄せを削除 */
        margin-left: 0; /* 明示的に左マージンを0に */
        margin-right: auto; /* 右マージンをautoにして左寄せを確実にする */
        /* === 修正ここまで === */
        margin-bottom: 15px;
        display: flex; /* flexを追加 */
        flex-direction: column; /* flex-directionを追加 */
        /* flex-wrap: nowrap; flex-wrapは親flexコンテナにつけるべきですが、今回はcolumnなので不要かも */
      }

      .bean-info {
        display: flex;
        align-items: center; /* 縦方向中央寄せ */
        margin-bottom: 15px;
        flex-direction: column; /* 子要素（h2とcontents）を縦に並べる */
        /* flex-wrap: nowrap; */
        /* justify-content: center; */ /* 子要素を縦方向に中央寄せ */
      }

      .bean-info-contents {
        display: flex;
        flex-direction: row; /* 子要素（txtとimg）を横に並べる */
        flex-wrap: nowrap;
        align-items: flex-start; /* 子要素を上端に揃える */
        justify-content: space-between; /* 子要素間に均等なスペース */
        gap: 10px;
        width: 100%; /* 親要素の幅に合わせる */
      }

      .bean-txt {
        flex: 1; /* 残りスペースを埋める */
      }

      .bean-img {
        width: 120px;
        height: 120px;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 8pt;
        /* background-color: #e0e0e0; 画像なしの場合の背景 */
      }

      .image-container {
        width: 100%;
        height: 100%;
        /* object-fit: contain; これはimgタグにつけるスタイル */
      }

      .extraction-info {
        flex: 1; /* 適切か確認が必要 */
        display: flex;
        align-items: center; /* 縦方向中央寄せ */
        margin-bottom: 15px;
        flex-direction: column; /* 子要素（h2とcontents）を縦に並べる */
        /* flex-wrap: nowrap; */
        /* justify-content: center; */ /* 子要素を縦方向に中央寄せ */
      }
      .extraction-info-contents {
        display: flex;
        flex-direction: column;
        flex-wrap: nowrap;
        /* justify-content: center; */
        align-items: stretch; /* 子要素の幅を親要素に合わせる */
      }
      .flavor-chart-container {
        width: 100%;
        max-width: 590px;      
        margin-left: 0; /* 明示的に左マージンを0に */
        margin-right: auto; /* 右マージンをautoにして左寄せを確実にする */
        /* === 修正ここまで === */
        margin-bottom: 15px;
        display: flex; /* flexを追加 */
        flex-direction: column; /* 子要素（h2とcontents）を縦に並べる */
        /* align-items: center; */ /* セクション全体の子要素（h2とcontents）を横方向中央寄せ */
      }
      .flavor-chart-contents {
        width: 100%; /* 親要素の幅に合わせる */
        display: flex;
        flex-direction: row; /* 子要素（ratingとchart）を横に並べる */
        flex-wrap: nowrap;
        justify-content: space-between; /* 子要素間に均等なスペース */
        align-items: flex-start; /* 子要素を上端に揃える */
        gap: 10px;
      }
      .flavor-rating {
        flex: 1; /* 残りスペースを埋める */
      }

      .chart-container {
        width: 150; /* svgChartのwidth/heightに合わせる */
        height: auto; /* svgChartのwidth/heightに合わせる */
        background-color: #fff;
        display: flex;
        justify-content: center;
        align-items: center;
        color: #777;
        font-size: 8pt; 
      
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
        margin-bottom: 6px; /* 追加: レーティング項目間のスペース */
        font-size: 15pt;
      }
        /* レーティング最後の項目に下マージンをなくすスタイルを追加 */
      .flavor-rating .rating-item:last-child {
          margin-bottom: 0;
      }


      .rating-label {
        font-weight: bold;
        color: #555;
        /* margin-right: 8px; */ /* 追加: ラベルと値の間にスペース */
      }
        /* レーティング項目のレイアウトを調整 */
      .flavor-rating .rating-item {
            display: flex; /* flexboxにする */
            flex-direction: row; /* 横並び */
            align-items: baseline; /* テキストベースラインを揃える */
      }
      .flavor-rating .rating-label {
            flex-shrink: 0; /* 縮まない */
            margin-right: 8px; /* ラベルと値の間にスペース */
            width: 60px; /* ラベルの幅を固定または調整 */
      }
        .flavor-rating .rating-value { /* 値の部分のクラスを追加してスタイル */
            flex: 1; /* 残りスペースを埋める */
        }


      .memo-section {
        width: 100%;
        max-width: 590px;
      margin: 0 auto;     
        margin-top: 25px;
        border-top: 1px solid #ccc;
        padding-top: 10px;
        display: flex; /* flexを追加 */
        flex-direction: column; /* 子要素（h2とcontent）を縦に並べる */
        /* align-items: center; */ /* セクション全体の子要素（h2とcontent）を横方向中央寄せ */
      }

      .memo-content {
        font-size: 13pt;
        white-space: pre-wrap;
        padding: 8px;
        background-color: #f9f9f9;
        border: 1px solid #eee;
        border-radius: 4px;
          width: auto; /* 親要素の幅に合わせる */
          max-width: 100%; /* 追加: 親要素を超えない */
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
            <div class="detail-item"><span class="detail-label">豆/水比率:</span> ${
              coffeeRecord.coffeeAmount && coffeeRecord.waterAmount
                ? `1:${
                    Math.round(
                      (coffeeRecord.waterAmount / coffeeRecord.coffeeAmount) *
                        10
                    ) / 10
                  }`
                : "計算不可"
            }</div>
        </div>
      </div>
    </div>

    <div class="flavor-chart-container">
      <h2>味わいの評価</h2>
      <div class="flavor-chart-contents">
        <div class="flavor-rating">
          <div class="rating-item"><span class="rating-label">酸味:</span><span class="rating-value"> ${
            coffeeRecord.acidity || "0"
          }</span></div>
          <div class="rating-item"><span class="rating-label">甘味:</span><span class="rating-value"> ${
            coffeeRecord.sweetness || "0"
          }</span></div>
          <div class="rating-item"><span class="rating-label">苦味:</span><span class="rating-value"> ${
            coffeeRecord.bitterness || "0"
          }</span></div>
          <div class="rating-item"><span class="rating-label">コク:</span><span class="rating-value"> ${
            coffeeRecord.body || "0"
          }</span></div>
          <div class="rating-item"><span class="rating-label">香り:</span><span class="rating-value"> ${
            coffeeRecord.aroma || "0"
          }</span></div>
          <div class="rating-item"><span class="rating-label">後味:</span><span class="rating-value"> ${
            coffeeRecord.aftertaste || "0"
          }</span></div>
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
        // Webの場合、orientation: 'portrait' は @page size で指定済みのため不要かもしれません。
        // モバイルで orientation を明示的に指定したい場合はここに追加できます。
        // orientation: 'portrait',
      });

      // モバイル環境ではシェア機能を使用 (Platform.OSで分岐が必要な場合あり)
      // この関数はモバイルのみで使用することを想定しているようですが、
      // Webでも印刷ではなくダウンロードさせたい場合は別の処理が必要です。
      // 例: Webの場合は uri を window.open などで開く
      if (Platform.OS === "web") {
        // Webの場合はダウンロードを促す
        window.open(uri, "_blank");
      } else {
        // モバイルの場合はシェア
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: "コーヒー情報をPDFで共有",
        });
        console.log("PDF共有完了 (Mobile)");
      }
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
