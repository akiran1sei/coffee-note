import React, { useEffect, useState, useCallback, useRef } from "react"; // useCallback を追加
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
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import * as FileSystem from "expo-file-system";
import { Asset } from "expo-asset";
import * as Sharing from "expo-sharing";
import * as Print from "expo-print";
import Constants from "expo-constants";
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
import STAR_ASSET_BASE64 from "../../../assets/images/pdf/eccode/beans"; // 画像アセットのBase64をインポート
import { GlobalStyles } from "../../styles/GlobalStyles";
import UpperButton from "@/components/button/Upper";

const isPreviewBuild = Constants.executionEnvironment === "storeClient";
if (isPreviewBuild) {
  console.log("[DEBUG] Running in preview/production environment");
}

const { width: screenWidth } = Dimensions.get("window");

type RouteParams = {
  id: string;
};

// --- 画像アセットとBase64キャッシュ管理 ---
const STAR_ASSET_MODULES = {
  Star0: require("../../../assets/images/pdf/beans0.png"),
  Star0_5: require("../../../assets/images/pdf/beans0_5.png"),
  Star1: require("../../../assets/images/pdf/beans1.png"),
  Star1_5: require("../../../assets/images/pdf/beans1_5.png"),
  Star2: require("../../../assets/images/pdf/beans2.png"),
  Star2_5: require("../../../assets/images/pdf/beans2_5.png"),
  Star3: require("../../../assets/images/pdf/beans3.png"),
  Star3_5: require("../../../assets/images/pdf/beans3_5.png"),
  Star4: require("../../../assets/images/pdf/beans4.png"),
  Star4_5: require("../../../assets/images/pdf/beans4_5.png"),
  Star5: require("../../../assets/images/pdf/beans5.png"),
  no_image: require("../../../assets/images/no-image.png"),
};

const base64ImageCache: { [key: string]: string | null } = {};

const getBase64ImageByKey = async (
  imageKey: keyof typeof STAR_ASSET_MODULES
): Promise<string | null> => {
  // キャッシュチェック
  if (base64ImageCache[imageKey]) {
    console.log(`[DEBUG_PREVIEW] Using cached base64 for ${imageKey}`);
    return base64ImageCache[imageKey];
  }

  const assetModule = STAR_ASSET_MODULES[imageKey];
  if (!assetModule) {
    console.error(`Asset module not found for key: ${imageKey}`);
    return getFallbackBase64(imageKey);
  }

  try {
    console.log(`[DEBUG_PREVIEW] Attempting Asset.fromModule for ${imageKey}`);
    const asset = Asset.fromModule(assetModule);

    // アセットの状態確認
    console.log(
      `[DEBUG_PREVIEW] Asset state: downloaded=${asset.downloaded}, uri=${asset.uri}`
    );

    // ダウンロード処理（タイムアウト付き）
    if (!asset.downloaded) {
      console.log(`[DEBUG_PREVIEW] Downloading asset ${imageKey}...`);
      await Promise.race([
        asset.downloadAsync(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Download timeout")), 10000)
        ),
      ]);
    }

    // ここが重要な修正点：asset.localUriまたはasset.uriを使用
    let fileUri = asset.localUri || asset.uri;

    // HTTP URLの場合は、Image.resolveAssetSourceを使用
    if (!fileUri || fileUri.startsWith("http")) {
      const resolvedSource = Image.resolveAssetSource(assetModule);
      fileUri = resolvedSource?.uri;
    }

    if (!fileUri) {
      console.warn(
        `[DEBUG_PREVIEW] Could not resolve file URI for ${imageKey}.`
      );
      return getFallbackBase64(imageKey);
    }

    console.log(
      `[DEBUG_PREVIEW] Resolved file URI for ${imageKey}: ${fileUri}`
    );

    // HTTP URLの場合は、fetch APIを使用してBase64変換
    if (fileUri.startsWith("http")) {
      return await convertHttpUrlToBase64(fileUri, imageKey);
    }

    // ローカルファイルの場合は、従来通りFileSystemを使用
    // ファイル存在確認
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (!fileInfo.exists) {
      console.warn(`[DEBUG_PREVIEW] File not found at resolved URI ${fileUri}`);
      return getFallbackBase64(imageKey);
    }

    // Base64変換
    const base64 = await readFileAsBase64Stable(fileUri);
    if (base64 && base64.length > 0) {
      const mimeType = "image/png";
      const dataUri = `data:${mimeType};base64,${base64}`;
      base64ImageCache[imageKey] = dataUri;
      console.log(
        `[DEBUG_PREVIEW] Successfully converted ${imageKey} to base64`
      );
      return dataUri;
    }
  } catch (error) {
    console.error(
      `[ERROR_PREVIEW] Failed to get base64 for ${imageKey}:`,
      error
    );
  }

  return getFallbackBase64(imageKey);
};

/**
 * HTTP URLからBase64に変換する新しい関数
 */
const convertHttpUrlToBase64 = async (
  httpUrl: string,
  imageKey: string
): Promise<string | null> => {
  try {
    console.log(`[DEBUG_PREVIEW] Converting HTTP URL to base64: ${httpUrl}`);

    const response = await fetch(httpUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        base64ImageCache[imageKey] = result;
        console.log(
          `[DEBUG_PREVIEW] Successfully converted HTTP URL to base64 for ${imageKey}`
        );
        resolve(result);
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error(
      `[ERROR_PREVIEW] Failed to convert HTTP URL to base64:`,
      error
    );
    return null;
  }
};

/**
 * 安定したBase64読み込み関数（ローカルファイル用）
 */
const readFileAsBase64Stable = async (
  fileUri: string
): Promise<string | null> => {
  try {
    // HTTP URLの場合はこの関数を使わない
    if (fileUri.startsWith("http")) {
      console.warn(
        `[WARNING] HTTP URL passed to readFileAsBase64Stable: ${fileUri}`
      );
      return null;
    }

    // ファイルサイズチェック
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (!fileInfo.exists) {
      throw new Error(`File does not exist: ${fileUri}`);
    }

    // 大きなファイルの場合は処理をスキップ
    if (fileInfo.size && fileInfo.size > 5 * 1024 * 1024) {
      console.warn(`[WARNING] File too large: ${fileInfo.size} bytes`);
      return null;
    }

    // Base64変換（リトライ機能付き）
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(
          `[DEBUG] Base64 conversion attempt ${attempt} for ${fileUri}`
        );

        const base64 = await FileSystem.readAsStringAsync(fileUri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        if (base64 && base64.length > 0) {
          console.log(
            `[DEBUG] Base64 conversion successful on attempt ${attempt}`
          );
          return base64;
        } else {
          throw new Error("Empty base64 result");
        }
      } catch (error) {
        lastError = error as Error;
        console.log(`[DEBUG] Attempt ${attempt} failed:`, error);

        if (attempt < 3) {
          await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
        }
      }
    }

    throw lastError || new Error("Base64 conversion failed after 3 attempts");
  } catch (error) {
    console.error(`[ERROR] readFileAsBase64Stable failed:`, error);
    return null;
  }
};

/**
 * フォールバック用の埋め込みBase64データ
 * 最小限の画像データを事前に準備
 */
const getFallbackBase64 = (
  imageKey: keyof typeof STAR_ASSET_MODULES
): string | null => {
  console.warn(
    `[PDF_DEBUG] Falling back for ${imageKey}. No Base64 available.`
  );
  // --- 画像アセットとBase64文字列の定義 ---
  // ここに、上記で取得したBase64文字列を貼り付けます
  const STAR_ASSET_BASE64_MODULES = {
    Star0: STAR_ASSET_BASE64.Star0,
    Star0_5: STAR_ASSET_BASE64.Star0_5,
    Star1: STAR_ASSET_BASE64.Star1,
    Star1_5: STAR_ASSET_BASE64.Star1_5,
    Star2: STAR_ASSET_BASE64.Star2,
    Star2_5: STAR_ASSET_BASE64.Star2_5,
    Star3: STAR_ASSET_BASE64.Star3,
    Star3_5: STAR_ASSET_BASE64.Star3_5,
    Star4: STAR_ASSET_BASE64.Star4,
    Star4_5: STAR_ASSET_BASE64.Star4_5,
    Star5: STAR_ASSET_BASE64.Star5,
    no_image: STAR_ASSET_BASE64.no_image,
  };

  // 簡単なビーンズアイコン代替（必要に応じて実際のBase64データを追加）
  const fallbackMap: Partial<Record<keyof typeof STAR_ASSET_MODULES, string>> =
    {
      no_image: STAR_ASSET_BASE64_MODULES.no_image,
      Star0: STAR_ASSET_BASE64_MODULES.Star0,
      Star0_5: STAR_ASSET_BASE64_MODULES.Star0_5,
      Star1: STAR_ASSET_BASE64_MODULES.Star1,
      Star1_5: STAR_ASSET_BASE64_MODULES.Star1_5,
      Star2: STAR_ASSET_BASE64_MODULES.Star2,
      Star2_5: STAR_ASSET_BASE64_MODULES.Star2_5,
      Star3: STAR_ASSET_BASE64_MODULES.Star3,
      Star3_5: STAR_ASSET_BASE64_MODULES.Star3_5,
      Star4: STAR_ASSET_BASE64_MODULES.Star4,
      Star4_5: STAR_ASSET_BASE64_MODULES.Star4_5,
      Star5: STAR_ASSET_BASE64_MODULES.Star5,
    };

  return fallbackMap[imageKey] || null;
};

/**
 * フォールバック機能付きのBase64画像取得
 */
const getBase64ImageByKeyWithFallback = async (
  imageKey: keyof typeof STAR_ASSET_MODULES
): Promise<string | null> => {
  try {
    const result = await getBase64ImageByKey(imageKey);
    return result;
  } catch (error) {
    console.error(
      `[ERROR_PREVIEW] getBase64ImageByKey failed for ${imageKey}:`,
      error
    );
    return getFallbackBase64(imageKey);
  }
};

/**
 * 改良版: アプリケーション起動時のアセット事前ロード
 */
export const preloadAssets = async (): Promise<void> => {
  console.log("[DEBUG_PREVIEW] Starting improved asset preload...");

  const assetKeys = Object.keys(STAR_ASSET_MODULES) as Array<
    keyof typeof STAR_ASSET_MODULES
  >;

  // 並列処理数を制限（メモリ使用量を抑制）
  const batchSize = 3;
  for (let i = 0; i < assetKeys.length; i += batchSize) {
    const batch = assetKeys.slice(i, i + batchSize);

    const batchPromises = batch.map(async (key) => {
      try {
        console.log(`[DEBUG_PREVIEW] Preloading ${key}...`);
        await getBase64ImageByKeyWithFallback(key);
        console.log(`[DEBUG_PREVIEW] Preloaded ${key} successfully`);
      } catch (error) {
        console.error(`[ERROR_PREVIEW] Failed to preload ${key}:`, error);
      }
    });

    await Promise.all(batchPromises);

    // バッチ間で短い休憩を入れる
    if (i + batchSize < assetKeys.length) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  console.log("[DEBUG_PREVIEW] Improved asset preload completed");
};

export default function CoffeeItemScreen() {
  const route = useRoute();
  const router = useRouter();
  const { id } = route.params as RouteParams;

  const [coffeeRecord, setCoffeeRecord] = useState<CoffeeRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [triggerPdfDownload, setTriggerPdfDownload] = useState(false); // New state to trigger PDF download
  const [showScrollToTopButton, setShowScrollToTopButton] = useState(false);

  // 画像URIを処理する関数
  const getImageSource = (uri?: string | null): ImageSourcePropType => {
    if (!uri) {
      return require("../../../assets/images/no-image.png");
    }
    // HTTP/HTTPSの場合はそのまま
    if (uri.startsWith("http://") || uri.startsWith("https://")) {
      return { uri };
    }
    // file://の場合はそのまま
    if (uri.startsWith("file://")) {
      return { uri };
    }
    // Expo assetIdの場合や相対パスの場合
    if (/^\d+$/.test(uri)) {
      // assetId (number as string)
      return parseInt(uri, 10);
    }
    // それ以外はfile://を付与
    return { uri: `file://${uri}` };
  };

  const handleDeleteRecord = async (recordId: string) => {
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
              await CoffeeStorageService.deleteCoffeeRecord(recordId);
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

  // Memoize the PDF generation function
  const generateAndDownloadPdf = useCallback(async () => {
    // useCallback でラップ
    if (!coffeeRecord) {
      Alert.alert("エラー", "コーヒーデータがありません。");
      return;
    }

    try {
      setIsGeneratingPdf(true);

      // --- 1. 画像処理 (既存のコードをそのまま使用) ---
      let imageHtml = "";
      if (
        !coffeeRecord.imageUri ||
        coffeeRecord.imageUri === "default_image_path"
      ) {
        const noImageBase64 = await getBase64ImageByKeyWithFallback("no_image");
        if (noImageBase64) {
          imageHtml = `<img src="${noImageBase64}" alt="No Image" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;" />`;
        } else {
          imageHtml = `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; border: 2px dashed #ccc; background-color: #f9f9f9; border-radius: 12px; color: #666;">画像なし</div>`;
        }
      } else {
        try {
          const base64 = await readFileAsBase64Stable(coffeeRecord.imageUri);

          if (base64) {
            const fileExtension = coffeeRecord.imageUri
              .split(".")
              .pop()
              ?.toLowerCase();
            let mimeType = "application/octet-stream"; // デフォルト
            if (fileExtension === "png") {
              mimeType = "image/png";
            } else if (fileExtension === "gif") {
              mimeType = "image/gif";
            } else if (fileExtension === "jpg" || fileExtension === "jpeg") {
              mimeType = "image/jpeg";
            } else if (fileExtension === "webp") {
              mimeType = "image/webp";
            } else if (fileExtension === "svg") {
              mimeType = "image/svg+xml";
            }

            imageHtml = `<img src="data:${mimeType};base64,${base64}" alt="Coffee Image" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;" />`;
          } else {
            // readFileAsBase64Stable が null を返した場合 (サイズ制限超過など)
            console.warn(
              "[WARNING] User image is too large or failed to convert, using no_image fallback."
            );
          }
        } catch (err) {
          console.error(
            "画像の読み込みエラー (uri: " + coffeeRecord.imageUri + "):",
            err
          );
          const noImageBase64 = await getBase64ImageByKeyWithFallback(
            "no_image"
          );

          if (noImageBase64) {
            imageHtml = `<img src="${noImageBase64}" alt="No Image" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;" />`;
          } else {
            imageHtml = `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; border: 2px dashed #ccc; background-color: #f9f9f9; border-radius: 12px; color: #666;">画像なし</div>`;
          }
        }
      }

      // --- 2. レーダーチャートのSVG生成 (既存のコードをそのまま使用) ---
      const radarDataValues = [
        Number(coffeeRecord.acidity) || 0,
        Number(coffeeRecord.aftertaste) || 0,
        Number(coffeeRecord.aroma) || 0,
        Number(coffeeRecord.bitterness) || 0,
        Number(coffeeRecord.body) || 0,
      ];

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
      const maxDataRadius = 40;
      const labelRadius = 48;
      const anglesDegrees = [
        270,
        270 + 72,
        270 + 72 * 2,
        270 + 72 * 3,
        270 + 72 * 4,
      ];
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

      const labelsSvg = ["酸味", "キレ", "香り", "苦味", "コク"];
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
        let offsetX = 0;
        let offsetY = 0;

        const angleDeg = anglesDegrees[index];
        const normalizedAngle = ((angleDeg % 360) + 360) % 360;

        if (Math.abs(normalizedAngle - 270) < 1) {
          textAnchor = "middle";
          offsetY = -8;
        } else if (Math.abs(normalizedAngle - 90) < 1) {
          textAnchor = "middle";
          offsetY = 8;
        } else if (normalizedAngle > 270 || normalizedAngle < 90) {
          textAnchor = "start";
          offsetX = 5;
        } else {
          textAnchor = "end";
          offsetX = -5;
        }

        labelTextsHtml.push(
          `<text x="${labelX + offsetX}" y="${
            labelY + offsetY
          }" text-anchor="${textAnchor}" font-size="10" fill="#444" font-weight="600">${
            labelsSvg[index]
          }</text>`
        );
      });

      const scaleCirclesHtml = [];
      for (let i = 1; i <= 5; i++) {
        const r = (i / 5) * maxDataRadius;
        scaleCirclesHtml.push(
          `<circle cx="${centerX}" cy="${centerY}" r="${r}" stroke="${
            i === 5 ? "#666" : "#ddd"
          }" fill="none" stroke-width="${i === 5 ? "1.5" : "1"}" />`
        );
      }

      const svgChart = `
        <svg width="250" height="250" viewBox="-15 -15 150 150">
          ${scaleCirclesHtml.join("\n")}
          ${axisLinesHtml.join("\n")}
          <polygon
            points="${polygonPoints.trim()}"
            fill="rgba(139, 69, 19, 0.3)"
            stroke="rgba(139, 69, 19, 0.8)"
            stroke-width="2"
          />
          ${labelTextsHtml.join("\n")}
        </svg>`;

      // --- 3. 評価バーのHTML生成関数 (SVG画像対応版) ---
      const createRatingBarHtml = async (label: string, value: number) => {
        const roundedValue = Math.round(value * 2) / 2; // 0.5刻みに丸める

        // 全体の好みの場合は特別な処理をしない（他の項目と同じ画像で表示）
        // そのため、isOverallRatingの分岐を削除し、一律に画像表示する。
        // ただし、valueの表示は引き続き行うため、rating-numberは残します。

        // 各評価値に対応する画像キーを決定
        const imageKeyMap: Record<number, keyof typeof STAR_ASSET_MODULES> = {
          0: "Star0",
          0.5: "Star0_5",
          1: "Star1",
          1.5: "Star1_5",
          2: "Star2",
          2.5: "Star2_5",
          3: "Star3",
          3.5: "Star3_5",
          4: "Star4",
          4.5: "Star4_5",
          5: "Star5",
        };

        // 評価値に対応する画像を取得
        const assetKey = imageKeyMap[roundedValue];
        let ratingImageBase64: string | null = null;
        if (assetKey) {
          ratingImageBase64 = await getBase64ImageByKeyWithFallback(assetKey);
        }
        console.log("ratingImageBase64", ratingImageBase64);
        // 画像が取得できなかった場合のフォールバック（テキスト表示）
        if (!ratingImageBase64) {
          console.warn(
            `[WARNING] Could not load image for rating ${roundedValue}, falling back to text.`
          );
          return `
      <div class="taste-field">
        <div class="taste-label">${label}</div>
        <div class="taste-rating">
          <span class="rating-number">${value}</span>
        </div>
      </div>
`;
        }
        if (label === "全体の好み") {
          return `
        <div class="taste-field-overall">
          <div class="taste-label-overall">${label}</div>
          <div class="taste-rating">
            <img src="${ratingImageBase64}" alt="labelRating" class="rating-image"/><span class="rating-number">${value}</span>
          </div>
        </div>
      `;
        }

        return `
        <div class="taste-field">
          <div class="taste-label">${label}</div>
          <div class="taste-rating">
            <img src="${ratingImageBase64}" alt="labelRating" class="rating-image"/><span class="rating-number">${value}</span>
          </div>
        </div>
      `;
      };

      const acidityHtml = await createRatingBarHtml(
        "酸味",
        Number(coffeeRecord.acidity) || 0
      );
      const overallHtml = await createRatingBarHtml(
        "全体の好み",
        Number(coffeeRecord.overall) || 0
      );
      const bitternessHtml = await createRatingBarHtml(
        "苦味",
        Number(coffeeRecord.bitterness) || 0
      );
      const bodyHtml = await createRatingBarHtml(
        "コク",
        Number(coffeeRecord.body) || 0
      );
      const aromaHtml = await createRatingBarHtml(
        "香り",
        Number(coffeeRecord.aroma) || 0
      );
      const aftertasteHtml = await createRatingBarHtml(
        "キレ",
        Number(coffeeRecord.aftertaste) || 0
      );

      // --- 4. 完全なHTMLコンテンツの組み立て (大幅改良版) ---
      const htmlContent = `
      <!DOCTYPE html>
      <html lang="ja">
      <head>
        <meta charset="utf-8">
        <title>${coffeeRecord.name}</title>
        <style>
          /* ------------------------------------------------------------------- */
          /* リセットとベース設定 */
          /* ------------------------------------------------------------------- */
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }

          /* ------------------------------------------------------------------- */
          /* ページ設定 (A4サイズ指定) */
          /* ------------------------------------------------------------------- */
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

          /* ------------------------------------------------------------------- */
          /* Bodyの基本スタイル */
          /* ------------------------------------------------------------------- */
          body {
            font-family: 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', 'Yu Gothic', 'YuGothic', 'Meiryo', sans-serif;
            width: 210mm;
            height: 297mm;
            margin: 0 auto;
            padding: 0mm 10mm;
            color: #333;
            background: linear-gradient(135deg, #f8f4e6 0%, #f0ebe0 100%);
            box-sizing: border-box;
            line-height: 1.6;
          }

          /* ------------------------------------------------------------------- */
          /* ヘッダー部分 */
          /* ------------------------------------------------------------------- */
          .header {
            text-align: center;
            margin-bottom: 25px;
            padding-bottom: 15px;
            border-bottom: 3px solid #8b4513;
            position: relative;
          }



          .title {
            font-size: 28px;
            font-weight: bold;
            color: #5d4037;
            margin-bottom: 8px;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
          }



          /* ------------------------------------------------------------------- */
          /* カラムレイアウト */
          /* ------------------------------------------------------------------- */
          .container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 25px;
            margin-top: 20px;
          }

          .left-column, .right-column {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }

          /* ------------------------------------------------------------------- */
          /* セクションスタイル */
          /* ------------------------------------------------------------------- */
          .section {
            background: white;
            border-radius: 12px;
            padding: 18px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            border: 1px solid rgba(139, 69, 19, 0.1);
          }

          .section-title {
            font-weight: bold;
            font-size: 18px;
            color: #5d4037;
            margin-bottom: 10px;
            text-align: center;
            padding-bottom: 8px;
            border-bottom: 2px solid #d2b48c;
            position: relative;
          }

          .section-title::before {
            content: '◆';
            color: #8b4513;
            margin-right: 8px;
          }

          /* ------------------------------------------------------------------- */
          /* 項目行のスタイル */
          /* ------------------------------------------------------------------- */
          .field-row {
            display: flex;
            align-items: center;
            margin-bottom: 0px;
            padding: 8px 0;
            border-bottom: 1px solid #f5f5f5;
          }

          .field-row:last-child {
            border-bottom: none;
            margin-bottom: 0;
          }

          .field-label {
            background: linear-gradient(135deg, #d2b48c 0%, #c19a6b 100%);
            color: white;
            padding: 6px 12px;
            min-width: 90px;
            border-radius: 6px;
            text-align: center;
            font-weight: 600;
            font-size: 13px;
            text-shadow: 1px 1px 1px rgba(0,0,0,0.2);
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }

          .field-input {
            flex-grow: 1;
            padding: 8px 12px;
            margin-left: 10px;
            background-color: #fafafa;
            border: 1px solid #e0e0e0;
            border-radius: 6px;
            color: #444;
            font-size: 14px;
          }

          /* ------------------------------------------------------------------- */
          /* 計算比率の特別スタイル */
          /* ------------------------------------------------------------------- */
          .ratio-highlight {
            background: linear-gradient(135deg, #e8f5e8 0%, #d4f1d4 100%) !important;
            border: 2px solid #4caf50 !important;
            font-weight: bold;
            color: #2e7d32 !important;
          }

          /* ------------------------------------------------------------------- */
          /* メモ欄のスタイル */
          /* ------------------------------------------------------------------- */
          .memo-field {
            min-height: 80px;
            max-height: 120px;
            overflow-y: auto;
            background-color: #fff8e1;
            border: 2px dashed #ffb74d;
            padding: 12px;
            border-radius: 8px;
            font-style: italic;
            color: #e65100;
            line-height: 1.5;
          }

          /* ------------------------------------------------------------------- */
          /* 画像コンテナのスタイル */
          /* ------------------------------------------------------------------- */
          .image-container {
            text-align: center;
            margin-bottom: 10px;
          }

          .image-item {
            width: 180px;
            height: 180px;
            margin: 0 auto;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 6px 16px rgba(0,0,0,0.15);
            border: 3px solid white;
          }

          /* ------------------------------------------------------------------- */
          /* 味わい評価のスタイル */
          /* ------------------------------------------------------------------- */
          .taste-field {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 8px 12px;
            background: #fafafa;
            border-radius: 8px;
            border-left: 4px solid #8b4513;
          }

          .taste-field-overall {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin: 10px 0;
            padding: 10px;
            background: #fafafa;
            border-radius: 12px;
            border: 2px solid #CFAA2A;
            box-shadow: 0 4px 8px rgba(255, 152, 0, 0.2);
          }

          .taste-label {
            font-weight: 600;
            color: #5d4037;
            min-width: 50px;
            font-size: 14px;
          }

          .taste-label-overall {
            font-weight: bold;
            color: #e65100;
            font-size: 16px;
            margin-bottom: 8px;
          }

          .taste-rating {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .stars {
            display: flex;
            gap: 2px;
          }


          /* 新しく追加する評価画像用スタイル */
  .rating-image {
      height: 25px; /* 画像の高さ。必要に応じて調整 */
      width: auto;  /* アスペクト比を維持 */
      margin-right: 8px; /* 画像と数字の間のスペース */
  }

  /* 評価テキストのスタイル */
  .rating-number {
      color: rgba(0, 80, 150, 1);
      font-weight: bold;
      font-size: 18px;
      min-width: 35px; /* 数字の幅を確保 */
      text-align: left; /* 数字の配置を左寄りに */
  }
          /* ------------------------------------------------------------------- */
          /* レーダーチャートのスタイル */
          /* ------------------------------------------------------------------- */
          .radar-chart-container {
            text-align: center;
            margin-top: 0px;
          }

          .radar-chart {
            background: white;
            border-radius: 12px;
            padding: 0px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            border: 2px solid #e0e0e0;
          }

          /* ------------------------------------------------------------------- */
          /* レスポンシブ調整 */
          /* ------------------------------------------------------------------- */
          @media screen and (max-width: 768px) {
            body {
              width: 100%;
              height: auto;
              padding: 10px;
            }

            .container {
              grid-template-columns: 1fr;
            }

            .field-label {
              min-width: 80px;
              font-size: 12px;
            }

            .title {
              font-size: 24px;
            }
          }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="header">
            <h1 class="title">${coffeeRecord.name}</h1>
          </div>

          <div class="container">
            <div class="left-column">
              <div class="section">
                <h2 class="section-title">豆の情報</h2>
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
              </div>

              <div class="section">
                <h2 class="section-title">抽出情報</h2>
                <div class="field-row">
                  <div class="field-label">抽出方法</div>
                  <div class="field-input">${
                    coffeeRecord.extractionMethod || "未記入"
                  }</div>
                </div>
                <div class="field-row">
                  <div class="field-label">器具</div>
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
                  <div class="field-label">温度</div>
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
                  <div class="field-label">${
                    coffeeRecord.measurementMethod
                  }</div>
                  <div class="field-input">${
                    coffeeRecord.waterAmount || "未記入"
                  }</div>
                </div>
                <div class="field-row">
                  <div class="field-label">時間</div>
                  <div class="field-input">${
                    coffeeRecord.extractionTime || "未記入"
                  }</div>
                </div>
                <div class="field-row">
                  <div class="field-label">比率</div>
                  <div class="field-input ratio-highlight">
                    ${
                      coffeeRecord.coffeeAmount && coffeeRecord.waterAmount
                        ? `1:${
                            Math.round(
                              (coffeeRecord.waterAmount /
                                coffeeRecord.coffeeAmount) *
                                10
                            ) / 10
                          }`
                        : "計算不可"
                    }
                  </div>
                </div>
              </div>

              <div class="section">
                <h2 class="section-title">メモ</h2>
                <div class="memo-field">${coffeeRecord.memo || "記録なし"}</div>
              </div>
            </div>

            <div class="right-column">
              <div class="section">
                <div class="image-container">
                  <div class="image-item">${imageHtml}</div>
                </div>
              </div>

              <div class="section">
                <h2 class="section-title">味わいの評価</h2>
                ${acidityHtml}
                ${bitternessHtml}
                ${bodyHtml}
                ${aromaHtml}
                ${aftertasteHtml}
                ${overallHtml}
              </div>

              <div class="section">

                <div class="radar-chart-container">
                  <div class="radar-chart">${svgChart}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
      `;

      // --- 5. PDF生成と共有 (既存のコードをそのまま使用) ---
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: "コーヒー情報をPDFで共有",
      });
      console.log("PDF共有完了 (Mobile)");
    } catch (error) {
      console.error("PDF生成エラー:", error);
      const errorMessage =
        error instanceof Error ? error.message : "不明なエラーが発生しました";
      Alert.alert("エラー", `PDFの生成に失敗しました: ${errorMessage}`);
    } finally {
      setIsGeneratingPdf(false);
    }
  }, [coffeeRecord]); // coffeeRecord を依存関係に追加
  const scrollViewRef = useRef<ScrollView>(null);
  // ★追加: スクロールイベントハンドラ
  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const scrollY = event.nativeEvent.contentOffset.y;
      // 例えば、200pxスクロールしたらボタンを表示する
      if (scrollY > 200 && !showScrollToTopButton) {
        setShowScrollToTopButton(true);
      } else if (scrollY <= 200 && showScrollToTopButton) {
        setShowScrollToTopButton(false);
      }
    },
    [showScrollToTopButton]
  );
  // レコードをフェッチする useEffect
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

  // PDFダウンロードをトリガーする useEffect
  useEffect(() => {
    if (triggerPdfDownload && coffeeRecord) {
      generateAndDownloadPdf();
      // generateAndDownloadPdf は完了時に isGeneratingPdf を false に設定するため、ここでは特にリセットは不要
      // ただし、再度ダウンロードできるようにするため、triggerPdfDownload はここでリセットします
      setTriggerPdfDownload(false);
    }
  }, [triggerPdfDownload, coffeeRecord, generateAndDownloadPdf]); // 依存関係に generateAndDownloadPdf を追加

  if (loading) {
    return <LoadingComponent />;
  }

  if (!coffeeRecord) {
    return <NoRecordComponent />;
  }

  return (
    <SafeAreaView style={[GlobalStyles.container, styles.itemContainer]}>
      <View style={GlobalStyles.contents}>
        <HeaderComponent />
        <PageTitleComponent TextData={coffeeRecord.name} />
        {isGeneratingPdf && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#007bff" />
            <Text style={styles.loadingText}>PDFを作成中...</Text>
          </View>
        )}
        <View style={[GlobalStyles.absoluteBox, GlobalStyles.mainContents]}>
          <ScrollView
            contentContainerStyle={GlobalStyles.scrollContainer}
            showsVerticalScrollIndicator={false}
            ref={scrollViewRef}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            <View style={styles.itemContents}>
              <View style={styles.imageContents}>
                <Image
                  source={getImageSource(coffeeRecord.imageUri)}
                  style={styles.recordImagePreview}
                  defaultSource={require("../../../assets/images/no-image.png")}
                />
              </View>

              <View style={styles.detailItem}>
                <View style={styles.wrapper}>
                  <Text style={styles.labelText}>種類</Text>
                  <Text style={styles.valueText}>{coffeeRecord.variety}</Text>
                </View>
              </View>
              <View style={styles.detailItem}>
                <View style={styles.wrapper}>
                  <Text style={styles.labelText}>産地</Text>
                  <Text style={styles.valueText}>
                    {coffeeRecord.productionArea}
                  </Text>
                </View>
              </View>
              <View style={styles.detailItem}>
                <View style={styles.wrapper}>
                  <Text style={styles.labelText}>焙煎度</Text>
                  <Text style={styles.valueText}>
                    {coffeeRecord.roastingDegree}
                  </Text>
                </View>
              </View>
              <View style={styles.detailItem}>
                <View style={styles.wrapper}>
                  <Text style={styles.labelText}>抽出方法</Text>
                  <Text style={styles.valueText}>
                    {coffeeRecord.extractionMethod}
                  </Text>
                </View>
              </View>
              <View style={styles.detailItem}>
                <View style={styles.wrapper}>
                  <Text style={styles.labelText}>抽出器具</Text>
                  <Text style={styles.valueText}>
                    {coffeeRecord.extractionMaker}
                  </Text>
                </View>
              </View>
              <View style={styles.detailItem}>
                <View style={styles.wrapper}>
                  <Text style={styles.labelText}>挽き目</Text>
                  <Text style={styles.valueText}>{coffeeRecord.grindSize}</Text>
                </View>
              </View>
              <View style={styles.detailItem}>
                <View style={styles.wrapper}>
                  <Text style={styles.labelText}>注湯温度</Text>
                  <Text style={styles.valueText}>
                    {coffeeRecord.temperature}
                  </Text>
                </View>
              </View>
              <View style={styles.detailItem}>
                <View style={styles.wrapper}>
                  <Text style={styles.labelText}>粉量</Text>
                  <Text style={styles.valueText}>
                    {coffeeRecord.coffeeAmount}
                  </Text>
                </View>
              </View>
              <View style={styles.detailItem}>
                <View style={styles.wrapper}>
                  <Text style={styles.labelText}>
                    {coffeeRecord.measurementMethod}
                  </Text>
                  <Text style={styles.valueText}>
                    {coffeeRecord.waterAmount}
                  </Text>
                </View>
              </View>
              <View style={styles.detailItem}>
                <View style={styles.wrapper}>
                  <Text style={styles.labelText}>抽出時間</Text>
                  <Text style={styles.valueText}>
                    {coffeeRecord.extractionTime}
                  </Text>
                </View>
              </View>
              <View style={styles.detailItem}>
                <View style={styles.wrapper}>
                  <Text style={styles.labelText}>酸味</Text>
                  <Text style={styles.valueText}>{coffeeRecord.acidity}</Text>
                </View>
              </View>
              <View style={styles.detailItem}>
                <View style={styles.wrapper}>
                  <Text style={styles.labelText}>苦味</Text>
                  <Text style={styles.valueText}>
                    {coffeeRecord.bitterness}
                  </Text>
                </View>
              </View>
              <View style={styles.detailItem}>
                <View style={styles.wrapper}>
                  <Text style={styles.labelText}>コク</Text>
                  <Text style={styles.valueText}>{coffeeRecord.body}</Text>
                </View>
              </View>
              <View style={styles.detailItem}>
                <View style={styles.wrapper}>
                  <Text style={styles.labelText}>香り</Text>
                  <Text style={styles.valueText}>{coffeeRecord.aroma}</Text>
                </View>
              </View>
              <View style={styles.detailItem}>
                <View style={styles.wrapper}>
                  <Text style={styles.labelText}>キレ</Text>
                  <Text style={styles.valueText}>
                    {coffeeRecord.aftertaste}
                  </Text>
                </View>
              </View>

              <View style={styles.radarChartContainer}>
                <View style={styles.wrapper}>
                  <Text style={GlobalStyles.sectionTitle}>
                    フレーバープロファイル
                  </Text>
                  <View style={styles.recordRadarChart}>
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
              <View style={styles.overallContainer}>
                <View style={styles.wrapper}>
                  <Text style={GlobalStyles.sectionTitle}>全体の好み</Text>
                  <Text style={styles.overallValueText}>
                    {coffeeRecord.overall}
                  </Text>
                </View>
              </View>
              <View style={styles.memoContainer}>
                <View style={styles.wrapper}>
                  <Text style={GlobalStyles.sectionTitle}>MEMO</Text>
                  <Text style={styles.memoText}>{coffeeRecord.memo}</Text>
                </View>
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
            {/* PDFダウンロードボタンの onClick ハンドラを修正 */}
            <TouchableOpacity
              style={styles.downloadPdfButton}
              onPress={() => setTriggerPdfDownload(true)} // useEffect でトリガーするように変更
              disabled={isGeneratingPdf} // PDF生成中は無効にする
            >
              {isGeneratingPdf ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>PDF をダウンロード</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
          <UpperButton
            scrollViewRef={scrollViewRef}
            isVisible={showScrollToTopButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    backgroundColor: "#f8f8f8",
  },

  wrapper: { paddingVertical: 20 },

  itemContents: {
    width: "90%",
    padding: 20,
    marginHorizontal: "auto",
    borderRadius: 10,
    backgroundColor: "#fff",
    shadowColor: "#333",
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
    textAlign: "center",
    fontWeight: "bold",
  },
  overallValueText: {
    color: "#333",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "bold",
    paddingBottom: 0,
  },

  radarChartContainer: {
    width: "100%",
    alignItems: "center",
    marginVertical: 20,
  },
  recordRadarChart: {
    width: 250,
    height: 250,
    marginVertical: 20,
  },
  overallContainer: {
    width: "100%",
    marginTop: 20,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
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
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  downloadPdfButton: {
    backgroundColor: "#28a745",
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 20,
    marginHorizontal: "auto",
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
