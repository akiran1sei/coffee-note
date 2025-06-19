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
  Button,
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
  // const STAR_ASSET_BASE64_MODULES = {
  //   Star0: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAA8CAMAAADrAndoAAAAbFBMVEUAAADWrSnPqinPqirPqirPpyjPoCHSrCjPqyrPqSnPqinNpyjSsSfQqirRqSjQqinPqSrQqynQqyjPqirOqCnSqSnPqynPqyrPqynPqinOqSnPqinSrSfPqynOqSjQqirOqSjRqinNqCvPqip9xZAdAAAAI3RSTlMAGeB/4yAQNb9gkEAnjFOp8ZpS73BEn8/Fr8ZvYNQwt1BvcIt0nM8AAAPeSURBVHja7dhpl9ogFAZgBEIgi0nMZjSb7f//jx1tYzpliyCjPcP70ZznyLm5glzg4+Pj4+Pj4+PzgpCYoahBP+bg+9jGyMaozYcsRZe0OGHYBA/ZqM1Pdxs9aOHd5q+y7SOW/KA4PezuqTMcbbetuUXtYGFPT7Roq0XlaZFLkqwxtuG0zRI7Oz3Xbqt0DK9L5jLE7m3I0wS/s43wYScKarSUOLHRa2yqt0E7JTth9tStzRzYfoMtZLbTWpjybFn0m9oRIhe216/5LKH6lh5LNza1sIXOQrnNkHmtdji2sIHalja2ltLEpYVoJ03a2FjzOhdurXFT0lRuU6gudKu05DW2VVtoYdFJWSt3drKw2WtsgEO1DRhj4/ewRau2oEMymmQfltE8yyYsrjg9KywBP1qFbRWWEoBUFsrtRAmxs/hqW6GNscyGQ0TG5RqDSoFmcosjsFpIvsrWTqy+ORCsAFtfQxo9bPu7RbxtN9pCYKHcMsBytT1IbFpe7UH1d2vEYro/0gAgXK91h4/adWs4tJyNXdjhX0sNrOLW0yDxkiEDpBlWuwshb89y25na2dKeDG0MCD0l60d1K+jKkJNJfywRATEsFrtira0WK72q2dtSYNERVsDcsi12HLjttchpDACJ8l5zv4y3205v67s9PGz3i8VaezK3oMo+0/D2cgFgMEt099qq2GyRztaLLYuH7V5qC84iiT3ztuInfuhTQxY3SpBg7nmcuZ+/2JYCy93FO/b/WUAPf5cZR79pJjhefxJjm2hsn9tbKLBhCbbZYpMFbb0+L2AsnUzvLlRlk8VOQtsJ9nfeZm9lG6DA4dAQxWT6yN7SRko7qyxW2mEWdtZikWqqHUJhoe1t/dvCwshWKltb2P1q+Q2vztm1JUskm7Uy3lIbezC3bb0U4/pwhpZW09D8aRje1nxe/uIoXjB/GtYwvlpcS2wttJc/z0al7Z1aJLUXkQXseLOYXa180IOZwFY2dro1ez5b2NHEZltsIrSAwGzfZ6VmzWmjs4OBrbIytraJgZ1uNuKsdoYfRLSriPp7exi8p43k9mJplWFYakM8mttcY88KCwN3Fg3mFsBQanGlpkRlmdoG72hnoA6b5BbpbPZ+ljm0oDtLB9OVU8tkNmfGdu/WAnqQDbVnc1vG/6EdATCrdDK1gakNj64tlVjq2AJU8DRJcwS22FRkoXMbPd9WarWeaBzFNNhkA4HNv8LmT7bdYnVh+CKYTLu31SebWNrOieUT0HxK+/1HquKYU0TA9ozPs9UjNra0SGb1Ceaoox9p0CyTelt9D+vj4+Pj4+Pj4+PzpfkFs4V5FtzNpUAAAAAASUVORK5CYII=`, // ここにbeans0.pngの実際のBase64
  //   Star0_5: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAA8CAMAAADrAndoAAAAXVBMVEUAAADWrSnPqinPqirPqijPqirPnyDPqirTrCfPqyrPqinNpyjSsSfPqynPqinQqirQqSjQqynQqinQqyjPqCnPqynPqinOqSnSqSnOqSjQqirOqSjRqinPrzDPqirg6kzsAAAAHnRSTlMAGeB/YPAQ4zW/kEAn0caMU5qpUnCfr29EMLdQbxDdy5+sAAAD/klEQVR42u3Y6XKqMBiA4ayEAGHf8XD/l3lKa7U1GyZS7TTvX+cZ2s8IJCAUCoVCoVAo9ISilOCkw8MC/47tnGyKxXoJdfAumwia1wU+FVXOUHKnRRdLn2XFPTYa+HpTst8KVjTw0liz/RYL4WHzB1q812K6ynV7bd7A78XzPhv52fmxdt+kU7QqS3fZvIFyYqeNZZqxV7bJqqmz0ihhDVSFfWzyHFvYLRSrLm63cwaVlTtsfYAlO2yls73VolUbt9oCaiqPtBPCR1jCnWdlfx5OdIC6sIctPGxls0hva+wxqzW12AFqY9BsqY8dtTTzsx6z6iwWQ21F5z7n6ljrvCj5aghBoxWFYVYoeo4VZos8LPaYFc4N17XZ2cPWz7HQNitICJk0lsX66/5CWwmzBf2q780STut6ZuqJ8wFqymoRgUEYrDBYHgFsskhvZx5FfpZtVihtuupLoulzG4OpQhMGNcUsAVeLop+y4zHWfnenLSBoULz22BcWRpslF4tlK3baSmGR3hJAqNk2GlvQzTam161p1cUhwGy8zh3JlkFlZf5ur7eGRkg2PcKKW8sdrGHX063qEAFRJ64Wxki2g/rf3WzvahdPmzvaFEQ8z+ClUQAptKqiOAIpqjJoxCiW75FtfrbarZq/pQqLc9QCd0s01v4r5Ol2gkGJZX+ZCunWXFG17e12vNjmblt+Wma1ubsFrXJRAUBQndn2tW11M6pca7HNjp+WVnfbUmsryWKNHWTbWk/83mmEFeee+XJrO/xtMVdnSxU2vbU9+X329sUh+aB1A6XWSLINvFYyvc0sllB/ixQ2pmCfrXZZINYvoW2YKZpjKHfish2/fEVG2yvu77KtX8p25odhFxlOpnNiuHAsnmUTo11MlhmtWIwrC5tOtWME9BeOmbsdPyyqnGxrsqOHLZFxF022JUkxVFcT2XJyvi51sI27FePZou3DBR1hc4UFyddZDbSB0PIFy0/DEaWbZaPGjkp7On82GS051GKtPaksINdZXXdGcowobJt/rGcnO78vdrp42MnF1ntsprTgH1rfsv3NRae2dUnqDyscbFvT1NtmDnZ+t4lkrWf4MOF9G5mvSxB8TZvo7cnTGiNMa2M2uVtqsYPBInicxcLdAhRrLWvN9J/JErOFr2gXYI7Meotttn49Sw60oB+0B9PtoZboLCXOtjzWAt6oLUaLu6XpL7QTAG6TzmYBXW2cH225xvKDLcCVTLOCYrDHFiqLDrfJ421rVtcnmkQZh7ssVFj6E5Y+2PZXa46wk+Jk+njbfrOZp+0PsXKQ07kg5VttlVOOI7C/6XG2vcemnhbrrD24JD1/q8PLJt1s+zdsKBQKhUKhUCj0o/0HroKmPq2CKXgAAAAASUVORK5CYII=`, // ここにbeans0_5.pngの実際のBase64
  //   Star1: `data:image/png;base64,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`, // ここにbeans1.pngの実際のBase64
  //   Star1_5: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAA8CAMAAADrAndoAAAAZlBMVEUAAADWrSnPqinPqirPpyjPoCHPqyrQqijQqyjTrCfPqirPqinNpyjPqynPqirSsSfPqSrQqynQqirQqynPqynQqinPqinNpynSqSnOqSjOqSjPqynOqSnNqCnQqirPqCnNqCvPqiqCJkhwAAAAIXRSTlMAGeB/IBC/UmA145BA0e8n8ZqMqZ9vr2BEMFDFxnC3cHBIBJr2AAAEE0lEQVR42u3Za3fiIBAGYAKBkAsx95h4a/7/n9zadT1qmCEJZe2e5f3Y+hwBByIj8fHx8fHx8fHxeUN41rO0YR9j+P/YZpPNmJruoU24yqaPNl1paXGsK9ZW5bF4l1VrLP8Q00vS5VZtt0ypKgru2dfJGnv8RsuWWpZP8zTOLWf5MQqeE58X2/P32nSRzeikTebcHuNgll3yk206AWmMlFvZJAp0Yel7bGW2oZqgCLe23gXaRBZWLrAlZDujpRMY4dRWQbBxsQbKXFhpMV/jM23IbWwbQKksbGmyFLY1s1irKbOwIW6R+QaJye5BunNo8fk2Di2yVqVbu7koxYSEhqhVqOW4rQIwlY1VuKUWluFr5c6ekTGbbP0eG5rmG/Z9PziwSQyP+U22VLgl3QTn00qBVInALCcfqqjrc6K3qgXP2FpwwjBLYXsWnNvZ5GqV1mbYg58P9/M712iJWTLQ242PUa6xSQAkTrbbvTuLF0d+ITJ/mP1aS+V9Z7AVhcXoky01lsJWElngNgJslV9thH3dGiYoInw+vulK+3A0RGpmM+ADjg4WVr1asdqit54GOp17wpvnv6yynYofNpbGtvqloqOlPW60GeHiuHvYlEpTlfpdxPis66JW2dJwVaPx/Hy9HJbZXGPZgZ7IdtsjFt9JItN1XWY4g20hDRf5TM2O17K42Wi1jf7YxGiP2y05aQuDEEnxOzFuXzsnFZvZ8mWpDjebl6ttBNpyZhlg27k9GTt+X5Qz3QYbX20zt/oWcXDIXm0nnzZC+S/Y14d/+ptOuvBlto7mh4LGPr5KFvaWamyck2W2BCx2D6YZ0k0Xi+xZd5VoO+x835U3W/8o2+APw4Zj3fTeYJGu9qFHBh0rG5uidsRsglo1opXF0G46RReaYR3xWGfj+x3jy9Jyk71gdm9hI4reouW1JPNpeWER8WIZ1KfV2eg25mK9VfubpVc7Uhf20GO/f11tO4GhBP7yn2dXm+yh+6nWtrf/DaiVTi0DbXu1YN9AGhp5vcaeHi3cJEq09vxV7MVoYYcttl5id1pLOP2qjdGwVo3JKnDMFWDr6FLnmbXdbbDnL5sCFunhh6noTtywVjRELD5m6czi820tLRo5IRkMNgHfNy4MtkUsDd1ZprZbQic4F5xyGsNNT4nb8CfakWwvLGayNfy+77LSoSUdXle4bcGmttlKyBZys43cWbybno9mC3S1WZ79g3bAGF5ZKoQN/inFB9dWAFY4toThxxVuK83Xuoo6t+n32wtZEp7rf6OBgj9ZdlXxN2zxzbabWSC9rpu+1CbtvKu9MJcnu7O0nQOrSyieVopxsjyDKM6VjD5zKQ+FlT2tsZmlZZjFE45pJz7TsBGTuD39H9bHx8fHx8fHx8fnr+YXhPA9eUHywa0AAAAASUVORK5CYII=`, // ここにbeans1_5.pngの実際のBase64
  //   Star2: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAA8CAMAAADrAndoAAAAY1BMVEUAAADWrSnPqinPqirPpyjPoCHPqyrQqynQqijPqinNpyjQqyjPqirTrCfSsSfPqyrPqSrPqinQqirNpynQqinQqynOqSjOqSjSqSnPqynNqCnOqSnPqCnQqirPqynNqCvPqio6cVONAAAAIHRSTlMAGeB/IBC/nVKQQGDvNSfP8a+MYG+pMFBExXDGcLfUcLiuFIQAAAQLSURBVHja7dntjqMgFIBhPQioaP3Wfo/3f5VbO91uW+CgUraTDO/PSZ4EDOp4Gvh8Pp/P5/P5PhBNG5Jw8jVEv8fyVTYlxXgPeLTIJo82WWihPHQ1aWt+KD9liyWWfrHxpWS+LdZbUpzrOLy37WCJPbzRkrmWZKMcd24pyQ5x+Fx+mm1P77XJLJvCqCx1bg95KLWBn2yTURM3UmplIQ5VkeQztjbbqBh1Mbe224TKYgsrZlius5XRwqiNObV1GK68WD0QF1ZY7Nf4TuszG9uGumoLy00W9LYjFtdqTC1shFtkvyGY7FZLNw4tvl/u0CLXiru1qw8lG5EMF7pALcVtHWqrbWyBW7CwBL9W7uwJWbPJdp+xkWm/UdM0vQMLObLmz1he4DaokP1erGDIKWGYpcFXgdii1T5jO0YDUpRddwK1Bb09MUrtLEy2UNoUe/HTHsZbmUILzAb/LFCFhVBTDpO9fS2SZXbrzuKHIzsGInvYvYUlCw4WgYsFcb8zFBb0VgSixG2ssXU22Rj7d6sfdbHo+fENFraQbAqhsng3Wcj//WGBPb9attiiXz18VAdNQPnzXxbZymRb9aWC4WLP+cNNudAeVto0oOywebgpi0AK1HcRodLUpbCwTLa5/Hw97r4tN3zmZQpLdrAP1tsGsfidxFLV1EXC6XxbSfYsPV55+W3LWBoCmGz814LRHtbbYK88GNM7Q369WVgiWf5yqXY3m71OTmqjjbWWS5ZobCvbvXHid6WUwCg3vFquttmcb/FKPN0IfLLK8XK4+zH29eWf3LcrR99qHxcnypvtYvmBMtOCwuZZMM9ypcW/gyFFpunMwlbY833Db7bLQ7n2U5bjL0NOsWl6Y2ORRednTpGJ+A63CWoHzAJqzwN6sgg6TQfZgo3N798YVwuaiXiO2yNmtxY2BvQrWkxHUj8hbmTLbGx8W3P5bYluxquwxfZmYbIDuLC7Bvv9a7LtqA0C/T//WbrCtrc195MF3ZRXOLVEa9vJaucGwjDIaxR2b2NP18NeDpPVD5gAs/0a282xG6UNKFzPxmDYL3+/7eJjl6WTPWv3W5vtZoU9XW0iWeMMP0pYtaeG/ULkyOL7FajF99taWjQxIvXubAvaNecQubPkjFo8QPZ7xCnFrEAgPhDP4VN2CNYfDuLSdvo121jhzOK/WhydWqEbiJditY3dWXyang0WNjVbzUScfMz2GMNPRxE5tkJ5K+zmWKaxzLENCPLIWWezebYOpTY1zLLJ++0xmBPN1L/RzCmysZBLSy7n2vLNtpKspkY5TXdvj9A+rjjmpY2tnFi5iD3tltBgfr2VLU+1iC8d+a5k+yU2tbQEs3jRkFTsEicDJnG7/x3W5/P5fD6fz+f7r/0BDqxvCZUjkJEAAAAASUVORK5CYII=`, // ここにbeans2.pngの実際のBase64
  //   Star2_5: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAA8CAMAAADrAndoAAAAaVBMVEUAAADWrSnPqinPpyjPoCHPqSjPqyrNpyjPqirPqirQqyrPqirTrCfPqSnPqSrPqynQqijPqyrSsSfPqinQqynPqinPqSrNqCnQqynOqSjOqSjSqSjSqSnPqCnPqinQqirPqynRqinPqioMyzrEAAAAInRSTlMAGd8gEGC/QH/vjeM1kICfUs8nr5rG8XCpMFBTRHBvt9Rv05rQBQAAA/tJREFUeNrt2WlzpCAQBmBEwPsab+f2///InUmyWWegAWXYTFV4PyZ5qmilUTvIxcXFxcXFxcXlB0ICmmdF3k/+77HFJhuE1fwdXPirbLa02UqLTWzXDnF4jZu2M7HVGkt6Nj8l1rfVdhsa2TYuve8chsTEhro2jGY+hXVLzOy59B6Tnk1srGUDPAsTvLVtU4/LLrFt4xlIoaTEis00bFJ6ooQGNlZbv5qhsPe1w84ThmrYBrK10uIZDHtTO+LQA7I3sNRgzcp2GKOfsicPSqOyGLZDbnCt5sDA+nIbmdiDB2WXGFmDeos3tScPTGNgVZuSzZJgX2orqSX2bOyBiSu5xQY2lF+r97SDpF6L1let2aeUjm9mkxSu18A2ldyieoZzs5RJ7jSTWYL6CrCqJmQEhVU3DOdEbOFDZ3dmhJjZ5G4roQ1mOBkZv8/gSKCpzKJ/FpP1ti29e0KhTTwgh8SKVW+O6IhotKjAwOa8raQW0+/OyFdsjhBTRDu5LQEbR3dbyl63RrgV/McjGBvYirOB1C6Olb3AAptjf3m2bIuFv3oK6ISliBSPP1ll6612utnL4ghOBfYkLLf9sO1GGyDC2t2iKSvEBYs7ISfc5KQysGyVbRSfeVHKn81hi3u03VLAqjuJBaLJCYcDfVuvsF2pGAIEF25jNN2nTZS23W5RL7y5CFH+zmcGNte20fPkJOZt89xDkG04mwP2xNsePScTLZmEoiaZuPYX20jnW7wGbMs9q1re0ocmauxa+OGfAeXeQ+zboeQPFIFd/hXtPi0W2DRCerYBLfy2gwPJRJwZ2JqzWGCH1ONzFdh0sTWs2UL+MCyIbCJObVp4It5SScHpJZPaSWYTqb1M0p2VSyfimLf4hRYDE/EUI7jgQ3KU2YOB3Qssqh/ufgBPLilv2QttCM14BbY6/L0Y919O2IZtBRZlyzWfZjAYwS//UWBgx7tNoCkvFdrrV72mNgTt9Wbhb3+qGMZRge1fYKe7hQdMidCePxqlG7fYQcfuhBYR/HF/J0W9hSUb3O0FrDcG7FAehy+722DPHzaGLDzD9zNW90RRL/YtWXm9VGrl9V4t2GU/whnt2VMCrjnFvj0bXrZbhGc4RzklMkvl1scpuObkp+yEtm+O3KYd4DWbWGrRolqyr6xaCg3EO7rZ7u1aeJoeTQY2UNsSGKb/mB0hot4dlW/ZUmErtDqWAZZZtiiHjpzNNtKzscdlF2Mtm73eHpFOSCT+P4tOfBOLU27Jna7tXmxrzgKhwom4fXtMrssV75vOxNZWLB+fPVSbE6Sf0ch255iWtxybtmP9GhsY2hCy6vhTVrNbinyCpNr2v8O6uLi4uLi4uLi4/Nf8Ae62z0WpI3fTAAAAAElFTkSuQmCC`, // ここにbeans2_5.pngの実際のBase64
  //   Star3: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAA8CAMAAADrAndoAAAAbFBMVEUAAADWrSnPqinPqirPpyjPoCHPqirOqCjPqSnQqynPqynPqyvPqynNqCnPqinTrCfPqCnSsSfOqSjPqyvOqSjQqynQqirQqyjPqirPqyrRqSjPqSnOqSnPqynQqirRqynRqinTrSfOqSjPqip2wq3MAAAAI3RSTlMAGd9/IBDwQWCd0L+/cK81kCcwj1CpjFLj4lNvxsW3j29gUwmzdIAAAAPeSURBVHja7dlpk6IwEAbgmJBTDg9APFeX//8fV90dFyfpJNKyUrW832aspyodkgANmTJlypQpU6ZMmfKBcKnYD82yMvl/rO5lJTPtI1S/5OWPrv3xoqUYKw5Vzc61PgiMNa9YnqXtt6zjrelvGcoe6s3sEVk1GMtiLROtHT245Th72syeU5wwNm6mJW2dkaO2h2JmZdkMbdctEB2kfBC7iLDbzcwVhrB12CamhZKO11bLmTOXCKshmwctbcGkI7UrymZAdgh7QYw5uB1W4lN2P4OiQ5bCtmKIuWolwiZ+KzBWgvUuG5RF1KtHavczMBphQ4sybT2hidcar+XD2RqutzZ+SxGW+edqnLby1DugTUJjTpRSq5HZbQHXi7Da+C3JWzhXq1LPlZ77LCeZ8VjjsSknzGfhQ2d5SjlnRlTVqelpm5s1Tit9N2++epzBwqGVz5K/lvI32y1Ur2xu9rC5/8HQNn5xiIwo0akAYZltDcKCi4NRdbXqsatcdgPYWtzsxve4tYK3QvJ8BFOENZaVGAssjp252c6RtEn7WPitR0MnrCJcP//nJZv3tWWE3TvLPd5tt5NQvGAl4elh2dmUhlih7p3AuNU5MQibvtWKwj6b2ZFm5Gr10xxEWwXY8E5KpatzYmEZb/O3WmMtDC1S6ei6XGx76G9J5ry4hChq36IQlkVbEWH19z30Zb93XbRlGWD3ts2CHb875cy1SUpr+7utiHkXzzFWPW0i/WUP1n3uiLKhm//iMWQ7fDS2W9hF/La0sh8JCkHirAYt/LRDpacjniJsblmKsUVnafyxVTGzc8ZY7b8Zau7riKvx2EdxhVlwTzf9WPps47Wm9K4s5u2IU99E4y2FLVywbLK7BbrpEmF3DkvypysoRQtF2Xb+IWvk12TcfizBbnqFsEeHJevuoPYtGErgh38hEXbVw57/1Hu3Wwl9eAhaBtrz1cLv/irQjFMOm73Bln3s6b5RxL1euDnVOG0VY5dOSzi9X9/QmPVAVvaz1c+s+m3NEuwBwvZ0t2vIwj38ZDHPMx4YM03GaT31nvEWjmo9WQ1n9x4qkoDdgvUWoXqZ6W8JbeFkfsp9VvltgrIFWG+DsSXpvzjYWG0VN1d4G//VIvuQVUGrgHp3YlALd9NFibByWAt00xnKriASvsImGa+dK+c2OqYDW8KgY6O3FYPbde14nKwpxmYkJly4v7PEJPmYLaxyBcbmlgWinB3x4W2Gsc25W+1Oixxno5PMn0bMOInP6n02e8XKuTjVl5/XZPooXrcMsuEk5SKfX6NZCcmwzf4PO2XKlClTpkyZMmXKP80v1acbfexzEvYAAAAASUVORK5CYII=`, // ここにbeans3.pngの実際のBase64
  //   Star3_5: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAA8CAMAAADrAndoAAAAbFBMVEUAAADWrSnPqinPpyjPnyDPqyrPqSnPqinNpyjPqirQqynPqSnPqyrPqyrPqinPqirTrCfOqSjPqSrSsSfNqSrPqSrQqyjPqSjQqynRqSjOqSnPqynSqinPqinOqSjQqirMqCnPqynPrzDPqioaE0+/AAAAI3RSTlMAGd8gEL9gj0DvnXB/z6/jNTCAJ4DxUlCpU8bFRH5Tt1DUEGHsoRQAAAPESURBVHja7dnpeqIwFAbgELJAQgAXFLdRy/3f41jbsdjkHNBIcWy+v+37SPZwICEhISEhISEhISOEJWIu1Vwf4t9j1V02yUxzCVXxTVa2rbzR0rFsta7lTku1rswtlmnefIvsb839NhvNruUiumRbF1lfm6WNHTW4ZePZ/SK6TrmXvWxCG2eSl7XrMrIyK/pY2QBRnZQNYuXAtlhErshuG5sGCn9Nq2aRMyLvtLQBw5/UTrzsLgIiPJ65c0pP0v/QUh1BqecefdUkHjbGbTqW3UZQZkXs0V71glZHYJQkaHiDhMaoNahl41iDWyojMLLDZnhfvZ6tkb7qsHHX78ZCiMkL2aKE16DBLckbOCcrODJaHF8L2iDWIJYzkmGWopZlpqrrfQFYDe7t+7Mt3q1x2gQ7gNnXXSZ1aIFZ8mUp+1m7/rib75y2iIBsC9TikyPVRKStp/Cwc9saD0thK4ioxGVVuewC2q7OdoFdtybwdI6vt1HqYY1lk8Fsa0tacNsCE2t1vFj4rUdBu6Qg7Ppv9Cab32uXnrZdSSgdVju7akMTwvh61lqUpu+MTqfMqn4YD8sfalOnpZqcrLrqA4ct7X19t6ECsfhK4omr+mHhpL/Nf8LaVRdh27U1qVTV0xLtHFxChD3y0sPOe9vUx36vuijLztX39fdhtW11Z8XvTFnmWiQHa/m7bdrnXTwfwK6tc25jW3G1ABVu8cNfXh7ZDntqS2v7SlCmxLLt/xLVp1WAxW47NEGq2tzD5palD7Z1GdnRDlu2phVqFX4YKoZVtcVTWsmQavrmgHRWWaD2eEBn1hStalOso/0tvc/qswWq6VuXLS/vNqhdOSzJr0YwgauPwrZ8JGta7zaELMFqeu2y238diduNwL5/CetMtgYYOg3TxMNOfG0BVYiF0+rPvnq3GWj1ycLv76KjoCYcVj/ALj3sub1wcapw2vq8yCrczpyWvNHzGHU9sxrIJr72OIuASMDWf/T+bCVslQLqhpLnmnU8M42f0yLt1Z4WjWiQTIazGqFp3GELsL0l7bDZ8W6LF2o1Tt8wK3Abe9kSbG/hY5fk/skxfVZbI301mMW/WuiRrOi0InJnVQ1m8Wp6uvSwybAWqKbvvOwEY/gIm/h5LRfOZbThA1syh7aNu206uJXScZ2U1Mdq0idvqftbSZ/EY9mqtJpb+djcskCEs6o9vNU+ttDt1q5UlQ9i7cT86omnjPTP5HFW32ITXu2l+HOKVpvqdrvDLJ54KXN+ipovMYlb/TtsSEhISEhISEhIyI/mL8iwYYF7fNkQAAAAAElFTkSuQmCC`, // ここにbeans3_5.pngの実際のBase64
  //   Star4: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAA8CAMAAADrAndoAAAAbFBMVEUAAADWrSnPqinPpyjPoCHPqirOpyjPqinPqyrPqSjPqyvPqynQqyjPqinNpynOqSjPqinPqSrNqSrNqCnPqinQrCrTrCfQqinSsSfQqynPqinPqCnQqynQqirPqyrNqCvPqyvPqynQqCnPqipHW4T8AAAAI3RSTlMAGeAgEPBAkH9Rv79gsWAwz4CAcKCfNW8nmsZwqYzPcM/UYBeO2ZkAAAOoSURBVHja7dntcqowEIBhsiSBCBFEBUFsT8v93+Mp2A+RZINGxNq8PzvzTO2SgKSey+VyuVwul2uGKF9mwTZ7Ff7fsdurLA/T5jvYXuR5cGqDCy3MZVlVH7LiUFYsvcTS16g5KxhvX6634Wy2OgjyHa8hHGtD1gzbTm7pfFYK0i+X4ybNoVHGn9ZWORm0gzE2aDRtjJROYoOJLQii6mC2ftroip7TljuiLJZGC4226EFtYmVDoim2+MzGJZ2wX2ihILrqzGJWDbewPm7ZXJYTXTvwLf7ezRPagmgrDYsyapAMg05RS+exKW7hQLQdDDbEZ/V8tkZmZbC+6ff6y+UyeSILuX4Pprj1ZKPvw8YRcrUW+F54fUHsC2Ij6oWYBdRS3Bbae7vsLNS1hFRpOfYApj/fZZhCx5j1fizQB7JANHFobSVIWziw+OJgey9mJ5/CwmZD+8/Cgt7G7SRRK3S3q9YygX3dSvTL2e/fRsHCpgPL72KjodUsLPHWWsjRt55tow6WHt30f3KRlddaMbEtlKOqgHs0qnYnmzIdu6LZig5OP1ILG93UMqWFtTfG5sP7eljBsrVlb37RuJ0UcdXpxwDz8VY+jK0Gi6pkRwvCdPiwVl3c7pkxfMxY2Gy0ZdParDzff0dbsPMTm3JtPPHrKA1Vm0Sc243asjHv4nIu+97bgOWXrQbPyIqbHv7BkTaq6O+zzBvY06HE7GihFOS8nBm+7QBHTrUjCysHFuay+cmy+rR1ToYVG/xhuKHYqfbyIW2AWoEMK4eAIifxbwJdWSv0VBuwQdtbuM7uDVY/LA5HqzmJF4C+RcftkmTN+AvsLe5ikQvMWisus/xrVp3VnsRXS+z/X60tmga7SLqnIeMWNrmzLT5n1doQOFFXtFb7/h4bDtRUg17fwAoLm1xj626Tsc5Crj2HV1mPQneNTJ95M5Hl97e12MvOBm877RlgaxX5wUKuqeH3gv+YNrCwyKyKnlXuR6RkOlsglPnT2VA/qxxwix/U7nFKMRvj1p/N5vpZCe/6xbH6hTY22Vo/K5P1JLKuZrLxpPadqBMMtfhpOhMWlj+uFURZyBKM4Vcp9R/X6oYVjbHKlZVXY6yXIbeN6yyb3AY29qD4KnqAvTcmyrBLhOfPZRsLy/LBqJjsWaR35an29HZ/UyvHWyhOJyVK1rd4/qL3iVfUG19yO7u+xHIry2QYi4/2ZcUUFs8XgVx8tM0EJnG7/hvW5XK5XC6Xy+W6a/8BRy2oOayynYkAAAAASUVORK5CYII=`, // ここにbeans4.pngの実際のBase64
  //   Star4_5: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAA8CAMAAADrAndoAAAAWlBMVEUAAADWrSnPqinPpyjPnyDPqyrPqirPqinOqSnPqirPqynPqSrPqyrPqinQqijNpynPpyjLpyjOqSjPqynPqijQqijRsSfPrzDQqinPqynOqSnQqCrUrSjPqipqESpvAAAAHXRSTlMAGeAgEL/wj3B/noDQsDFgQEBQYGBSJxCpxcZhYGDhrgsAAAMHSURBVHja7dntktogFIBhOMCBEEJiNK67be7/NrvOtPUDckQxTay8P5151DkQjchKpVKpVCqVSgskN22tbW168T7WPmQ3lRv/BlbcZfW51XdaWN66e6w0arxKp1v3uK1WY6tUW+EYZme3clVWJ9kNjNG6YoN0oJKXSc5i9WqtcONU6s1sc9PCOJlaqfULWRHY9G3p8T+zdcasxi7DCtriC1qgrH0zqxmZoiwI0jrSymWsoy1k2IqeVbFniVtWtG3r38Q62rKGtltFTFzR+9k4wjrCKskqygJpZZ6Fw6EBF7Ubwmp5uh/BiN5Slp0syNexXwM/VgWW3hxo2BbPninD1qF1GRam7e57GhkWB/67Q8T6SavE5UchZFhHbOg5rbrTgud/+tmwIDtBoWXSXj5yl20etf1CtmNSfe353zqXuiuxlsEJhsuw6qkWoxYMe9y2R2v5WYNKu5JUFzvBCPAm3TYvYGHg31GXoYkuLmPbcOV1hq2TLc5r6wlr0O75Rdaw63SMygrGsP7a2rjFlN/izcrs18Cv+uxuffnr08sGydezyJIs2IFf5/HG3Q50xMm0yrBNYGFF9uB5mLGMxFZSJ9PtKq0mbZ9gYeCxXE/urJo8mQZq0PkWHrMm29o9jzUA+St6d9ySOKYvMFPL2NMC49H2ORYqHu+zpf7/OlozTgZs+uYfuwzrF7QVdDyeiVm2Pc2KPBSLDdo8wfYZ1uda8DzeHmKWfcCR4q33bGey3YJWuz2fyFoWTWjVGHnjdUGs0+oMS8zKBDa4Hon8fNYQFMV8tpqelQfa0oethqYflN3RVixm/fSsevb45qhf0O5u2cP0rGhL/2thFrK7We0PHm9A0tKn6dhn2G69duDRKvQUo1fJifVaNWFVio3uLP+ZYllNfGw8ZnF2q3Os5kF7DYal9IHUEtGJpeyYYdEHo8JGsLTa6Mn0/NY81TbpFsz5pAaLgSUS6uId15Kl559nzT22y7LYVLvhO2M/MWLpRK8b9Z2te0rS1ryHLZVKpVKpVCqV/mm/AHcvcf5T38mjAAAAAElFTkSuQmCC`, // ここにbeans4_5.pngの実際のBase64
  //   Star5: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAA8CAMAAADrAndoAAAAQlBMVEUAAADPpyjPoCHPqyrPqirOqSnNpyjPqinOqCnPqirPqyrPqinPqynPqyrPqinPqivOqSjPqSrNqSrOqSfPqSnPqiqP4inOAAAAFXRSTlMAIBC/32BAkHDvf9+fz6/vMICAUFCuTKbHAAACdklEQVR42u3Y6dKaMBiG4Td7QBIQzPmfajvttOAXeEDCpub+y1wykwUklMvlcrlcLpc7Ia5Va6rWdux7bLXK6tKF/8mKvWTN0JoXrTzfulcstyL8yCy3br0tL2PLpbasQ1y1u+WXsmaR1TKMprONMpFaPE18F2sua5kLU4kvs37WyjCZuKhtTrIM2Lll2dQfZtuEsQo6wTJs6ze0Etnqy6whmED2xqB10PJzrMNWJtgSj1W2g9icZUqp5kusw5Y8turvJpVszAq8ni2yDljBqXTASmj5BtaNWg2s4f3/kWJEK2Spt5J/hgWLo7Ck6sEvJdg2ti7BymmrSIXdbDNpBXt+FMoE6yKrD7EiwXqKqiboTRF/viZfsn6t7U6ymvjzRnFLV2Vx59EJhkuwYlNbjNqbpfVWAYt3ktD9CQbAern1n2DJjk4ukYpn3iTYdrGt97XthLWxtejEr6e8lCGug9u/t/WSb3H/hvbny9/0NIq/ny1oS0vu+Y0ATqZFgvWRlZe3FUFccXQyrS5pDbRdioUr6w5Ppm9ooNOtXGftkZb80wzqOkylYitOsm7wfUL0OMySGV60EYEDXf27r06wzYm2hHb6G1yNWjzQdgPbJdjmYEv89mecuxlb7WT1idZAOxozwls+c98bu6Y1+1mYCqBmP2uRZettMWNLbHESYIspR1Zhy65oO1q/OO5vaNWOljxYVydZdVVLYooWXYLVH2knR9qx61oxYcXOllrw2Fhni92t2d5aWhIv0DDj2Fk2bGw9svj1IDQdYO2m1m9mcUwMpbhzWl6znbWvWL2nxbGH8eJ3VftAElv7HTaXy+VyuVwulzu0XyS/9BPKaS0DAAAAAElFTkSuQmCC`, // ここにbeans5.pngの実際のBase64
  //   no_image: `data:image/png;base64,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`,
  // };

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
  const handleScrollToTop = async () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };
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
            ref={scrollViewRef}
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
                  <Text style={styles.sectionTitle}>レーダーチャート</Text>
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
                  <Text style={styles.sectionTitle}>全体の好み</Text>
                  <Text style={styles.overallValueText}>
                    {coffeeRecord.overall}
                  </Text>
                </View>
              </View>
              <View style={styles.memoContainer}>
                <View style={styles.wrapper}>
                  <Text style={styles.sectionTitle}>MEMO</Text>
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
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>PDF をダウンロード</Text>
              )}
            </TouchableOpacity>
            <Button
              title="上へ"
              color={"#5D4037"}
              onPress={handleScrollToTop}
              accessibilityLabel="上へ"
            />
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
  wrapper: { paddingVertical: 20 },
  absoluteBox: {
    flex: 1,
    position: "absolute",
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
  },
  mainContents: {
    width: "100%",
    maxWidth: screenWidth > 768 ? 700 : "100%",
    marginHorizontal: "auto",
    top: 160,
    bottom: 0,
  },
  scrollContainer: {
    alignItems: "stretch",
    marginHorizontal: "auto",

    width: "100%",
  },
  itemContainer: {
    width: "90%",
    padding: 20,
    marginHorizontal: "auto",
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
  sectionTitle: {
    color: "#555",
    fontSize: 20,
    fontWeight: "bold",

    textAlign: "center",
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
    color: "white",
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
