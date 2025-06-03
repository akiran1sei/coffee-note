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

  // ルートパラメータからIDを取得
  const { id } = route.params as RouteParams;

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

  // PDFダウンロード処理
  const downloadPdf = async () => {
    // コーヒーレコードが読み込まれていない場合は処理しない
    if (!coffeeRecord) {
      Alert.alert("エラー", "コーヒーデータがありません。");
      return;
    }

    // PDF生成中の重複実行を防ぐ
    if (isGeneratingPdf) {
      return;
    }

    try {
      setIsGeneratingPdf(true); // PDF生成開始フラグを立てる
      console.log("PDF生成を開始します");

      // 画像URIをBase64に変換（モバイルのみ）
      // ウェブ環境ではFileSystem.readAsStringAsyncが利用できないため、HTML側で処理を分岐
      let imageHtml = "";
      if (coffeeRecord.imageUri) {
        if (Platform.OS !== "web") {
          try {
            const base64 = await FileSystem.readAsStringAsync(
              coffeeRecord.imageUri,
              {
                encoding: FileSystem.EncodingType.Base64,
              }
            );
            imageHtml = `<img src="data:image/jpeg;base64,${base64}" style="width: 80px; height: 80px; border-radius: 40px; object-fit: cover;" />`; // 画像サイズを小さく
          } catch (err) {
            console.error("画像のBase64変換エラー:", err);
            // 画像読み込み失敗時の代替表示
            imageHtml = `<div style="width: 80px; height: 80px; border-radius: 40px; background-color: #e0e0e0; display: flex; justify-content: center; align-items: center; color: #888; font-size: 8pt;">画像なし</div>`; // 代替表示も小さく
          }
        } else {
          // ウェブ環境では画像URIを直接指定しても表示されないため、代替表示
          imageHtml = `<div style="width: 80px; height: 80px; border-radius: 40px; background-color: #e0e0e0; display: flex; justify-content: center; align-items: center; color: #888; font-size: 8pt;">画像なし (ウェブ)</div>`; // 代替表示も小さく
        }
      } else {
        // 画像URIがない場合の代替表示
        imageHtml = `<div style="width: 80px; height: 80px; border-radius: 40px; background-color: #e0e0e0; display: flex; justify-content: center; align-items: center; color: #888; font-size: 8pt;">画像なし</div>`; // 代替表示も小さく
      }

      // レーダーチャート用のデータ準備
      const radarData = {
        acidity: Number(coffeeRecord.acidity) || 0,
        sweetness: Number(coffeeRecord.sweetness) || 0,
        bitterness: Number(coffeeRecord.bitterness) || 0,
        body: Number(coffeeRecord.body) || 0,
        aroma: Number(coffeeRecord.aroma) || 0,
        aftertaste: Number(coffeeRecord.aftertaste) || 0,
      };

      // レーダーチャートのSVG生成
      // 各評価項目を0-5のスケールでSVG座標にマッピング
      const maxRadius = 60; // チャートの最大半径を小さく
      const centerX = 75; // 中央座標を調整
      const centerY = 75; // 中央座標を調整
      const points = [
        { angle: 0, value: radarData.acidity, label: "酸味" }, // 0度 (上)
        { angle: 60, value: radarData.sweetness, label: "甘味" }, // 60度 (右上)
        { angle: 120, value: radarData.bitterness, label: "苦味" }, // 120度 (右下) - 苦味は通常下側
        { angle: 180, value: radarData.body, label: "コク" }, // 180度 (下)
        { angle: 240, value: radarData.aroma, label: "香り" }, // 240度 (左下) - 香りは左下
        { angle: 300, value: radarData.aftertaste, label: "キレ" }, // 300度 (左上) - キレは左上
      ];

      // SVGポリゴンのポイント文字列を生成
      const polygonPoints = points
        .map((point) => {
          const radius = (point.value / 5) * maxRadius; // 評価値に応じた半径
          // SVG座標系に合わせて角度を調整 (0度が上、時計回り)
          const angleRad = (point.angle - 90) * (Math.PI / 180); // 角度をラジアンに変換し、上を0度にするために-90度
          const x = centerX + radius * Math.cos(angleRad);
          const y = centerY + radius * Math.sin(angleRad);
          return `${x},${y}`;
        })
        .join(" ");

      // SVGテキストラベルの座標を生成
      const labelPoints = points
        .map((point) => {
          const radius = maxRadius + 10; // ラベルをチャートの外側に配置 (距離を短く)
          const angleRad = (point.angle - 90) * (Math.PI / 180);
          const x = centerX + radius * Math.cos(angleRad);
          const y = centerY + radius * Math.sin(angleRad);
          // テキストアンカーを調整してラベルがチャートから離れるようにする
          let textAnchor = "middle";
          if (point.angle > 0 && point.angle < 180) textAnchor = "start";
          if (point.angle > 180 && point.angle < 360) textAnchor = "end";
          if (point.angle === 0 || point.angle === 180) textAnchor = "middle";

          // 角度に応じてy座標を微調整して重なりを防ぐ
          let dy = "0.35em"; // SVG text baseline alignment
          if (point.angle === 0) dy = "-0.5em"; // 酸味を少し上に
          if (point.angle === 180) dy = "1em"; // コクを少し下に

          return `<text x="${x}" y="${y}" text-anchor="${textAnchor}" dy="${dy}" font-size="10" fill="#555">${point.label}</text>`; // フォントサイズを小さく
        })
        .join("\n");

      const svgChart = `
          <svg width="150" height="150" viewBox="0 0 150 150"> {/* SVG全体のサイズとviewBoxを小さく */}
            <circle cx="75" cy="75" r="60" fill="none" stroke="#eee" stroke-width="1" /> {/* 半径を調整 */}
            <circle cx="75" cy="75" r="45" fill="none" stroke="#eee" stroke-width="1" /> {/* 半径を調整 */}
            <circle cx="75" cy="75" r="30" fill="none" stroke="#eee" stroke-width="1" /> {/* 半径を調整 */}
            <circle cx="75" cy="75" r="15" fill="none" stroke="#eee" stroke-width="1" /> {/* 半径を調整 */}
            <line x1="75" y1="15" x2="75" y2="135" stroke="#ccc" stroke-width="1" /> {/* 座標を調整 */}
            <line x1="15" y1="75" x2="135" y2="75" stroke="#ccc" stroke-width="1" /> {/* 座標を調整 */}
             <line x1="${
               centerX + maxRadius * Math.cos(((60 - 90) * Math.PI) / 180)
             }" y1="${
        centerY + maxRadius * Math.sin(((60 - 90) * Math.PI) / 180)
      }" x2="${
        centerX + maxRadius * Math.cos(((240 - 90) * Math.PI) / 180)
      }" y2="${
        centerY + maxRadius * Math.sin(((240 - 90) * Math.PI) / 180)
      }" stroke="#ccc" stroke-width="1" />
            <line x1="${
              centerX + maxRadius * Math.cos(((120 - 90) * Math.PI) / 180)
            }" y1="${
        centerY + maxRadius * Math.sin(((120 - 90) * Math.PI) / 180)
      }" x2="${
        centerX + maxRadius * Math.cos(((300 - 90) * Math.PI) / 180)
      }" y2="${
        centerY + maxRadius * Math.sin(((300 - 90) * Math.PI) / 180)
      }" stroke="#ccc" stroke-width="1" />

            <polygon
              points="${polygonPoints}"
              fill="rgba(210, 180, 140, 0.5)"
              stroke="rgba(160, 120, 80, 1)"
              stroke-width="2"
            />
            ${labelPoints}
          </svg>`;

      // PDF生成用のHTMLコンテンツ
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="ja">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${coffeeRecord.name || "コーヒー記録"}</title>
          <style>
            /* Google Fontsから日本語フォントをインポート */
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&display=swap');
            /* 印刷時のページ設定 */
            @page { size: A4 portrait; margin: 1cm; } /* ページ方向を縦に指定 */
            body {
              font-family: 'Noto Sans JP', sans-serif; /* 日本語フォント指定 */
              line-height: 1.5; /* 行間を調整 */
              color: #333;
              background-color: #fff;
              margin: 0;
              padding: 0;
              font-size: 10pt; /* 基本フォントサイズ */
            }
            .container {
              max-width: 700px; /* コンテンツの最大幅 */
              margin: 0 auto; /* 中央寄せ */
              padding: 15px; /* パディング */
            }
            h1 {
              color: #333;
              font-size: 20pt; /* 見出しサイズ */
              margin-bottom: 15px; /* マージン */
              padding-bottom: 8px; /* パディング */
              border-bottom: 1px solid #d4a76a; /* 下線 */
            }
            h2 {
              color: #5d4037; /* コーヒー色っぽい見出し色 */
              font-size: 14pt; /* 見出しサイズ */
              margin-top: 15px; /* マージン */
              margin-bottom: 10px; /* マージン */
              border-left: 3px solid #d4a76a; /* 左側のアクセント線 */
              padding-left: 6px; /* パディング */
            }
            .section {
              margin-bottom: 20px; /* セクション間のマージン */
              background-color: #fff;
              border-radius: 6px; /* 角丸 */
              padding: 12px; /* パディング */
              box-shadow: 0 1px 3px rgba(0,0,0,0.05); /* 影 */
              border: 1px solid #eee;
            }
            .flex-row {
              display: flex;
              flex-direction: row;
              justify-content: space-between;
              align-items: flex-start;
              flex-wrap: wrap;
              gap: 15px; /* 要素間の隙間 */
            }
            .info-column {
              flex: 1;
              min-width: 200px; /* 最小幅 */
            }
            .image-column {
              width: 80px; /* 画像コンテナの幅 */
              margin-left: auto;
              flex-shrink: 0;
              display: flex;
              justify-content: center;
              align-items: center;
            }
             .image-column img, .image-column div {
                width: 80px;
                height: 80px;
                border-radius: 40px;
                object-fit: cover;
             }
            .detail-item {
              margin-bottom: 5px; /* アイテム間のマージン */
              display: flex;
              flex-wrap: wrap;
              align-items: baseline;
            }
            .detail-label {
              font-weight: bold;
              color: #5d4037;
              margin-right: 8px; /* マージン */
              min-width: 80px; /* ラベルの最小幅 */
              flex-shrink: 0;
            }
            .detail-value {
              flex: 1;
            }
            .chart-container {
              margin: 8px auto; /* マージンと中央寄せ */
              width: 150px; /* チャートサイズ */
              height: 150px;
              flex-shrink: 0;
            }
            .ratings-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); /* 列を自動調整 */
              gap: 8px; /* 隙間 */
              margin-bottom: 10px; /* マージン */
            }
            .rating-item {
              display: flex;
              align-items: center;
            }
            .rating-label {
              font-weight: bold;
              color: #5d4037;
              margin-right: 4px; /* マージン */
              min-width: 40px; /* 最小幅 */
            }
            .rating-value {
              font-weight: normal;
              color: #333;
            }
            .memo-box {
              background-color: #f9f5f0;
              border-radius: 6px; /* 角丸 */
              padding: 12px; /* パディング */
              white-space: pre-wrap;
              word-break: break-word;
              border-left: 3px solid #d4a76a; /* 線 */
            }
            .memo-content {
              font-size: 10pt; /* フォントサイズ */
              color: #333;
            }
            .footer {
              margin-top: 20px; /* マージン */
              text-align: center;
              font-size: 8pt; /* フォントサイズ */
              color: #888;
              border-top: 1px solid #eee;
              padding-top: 8px; /* パディング */
            }

            /* 印刷用スタイル - 横方向レイアウト最適化 */
            @media print {
                @page { size: A4 portrait; margin: 1.5cm; } /* 印刷時のページ設定とマージン */
                body {
                    font-size: 9.5pt; /* 印刷時の基本フォントサイズを調整 */
                    line-height: 1.3; /* 行間を調整 */
                }
                .container {
                    padding: 0; /* 印刷時はコンテナのパディングをなくす */
                    max-width: 100%; /* 印刷時は幅いっぱい使う */
                }
                h1 {
                    font-size: 17pt; /* 印刷時の見出しサイズを調整 */
                    margin-bottom: 10px;
                    padding-bottom: 5px;
                }
                h2 {
                    font-size: 12pt; /* 印刷時の見出しサイズを調整 */
                    margin-top: 10px;
                    margin-bottom: 7px;
                    padding-left: 4px;
                }
                .section {
                    margin-bottom: 10px; /* 印刷時のセクション間のマージンを調整 */
                    padding: 7px; /* 印刷時のパディングを調整 */
                    border-radius: 3px; /* 角丸を小さく */
                    box-shadow: none; /* 印刷時に影をなくす */
                    border: 1px solid #ddd; /* 印刷時の境界線 */
                }

                /* 二段組みレイアウト */
                .print-layout {
                    display: grid;
                    grid-template-columns: 2fr 1fr; /* 左カラムを右の2倍の幅に */
                    gap: 12px; /* カラム間の隙間を調整 */
                }
                .left-column {
                    display: flex;
                    flex-direction: column;
                    gap: 10px; /* 左カラム内のセクション間の隙間を調整 */
                }
                .right-column {
                    /* 右カラム（メモ）のスタイル */
                }

                .flex-row {
                    flex-direction: row; /* 印刷時も横並びを維持（左カラム内） */
                    gap: 8px; /* 隙間を調整 */
                     align-items: center; /* 縦方向の中央揃え */
                }

                .info-column {
                    flex: 1;
                    min-width: 140px; /* 印刷時の最小幅を調整 */
                    margin-right: 0;
                }
                .image-column {
                    width: 70px; /* 印刷時の画像サイズを調整 */
                    height: 70px;
                    margin: 0; /* マージンをなくす */
                    flex-shrink: 0;
                }
                 .image-column img, .image-column div {
                    width: 70px;
                    height: 70px;
                    border-radius: 35px;
                 }
                .chart-container {
                    margin: 0; /* マージンをなくす */
                    width: 90px; /* 印刷時のチャートサイズを調整 */
                    height: 90px;
                    flex-shrink: 0;
                }
                 .chart-container svg {
                     width: 90px;
                     height: 90px;
                     viewBox="0 0 90 90"; /* viewBoxも調整 */
                     /* SVG内の座標計算も90x90基準に修正が必要 */
                     /* 現在のSVG生成ロジックは200x200基準なので、
                        完全に正確な表示にはSVG生成部分の座標計算も
                        90x90基準に修正する必要があります。
                        今回はviewBoxとサイズ調整のみで対応を試みます。*/
                 }

                .detail-item {
                    margin-bottom: 3px; /* 印刷時のアイテム間のマージンを調整 */
                }
                 .detail-label {
                     min-width: 65px; /* 印刷時のラベル最小幅を調整 */
                     font-size: 9pt; /* ラベルのフォントサイズ */
                 }
                 .detail-value {
                     font-size: 9pt; /* 値のフォントサイズ */
                 }
                .ratings-grid {
                    gap: 5px; /* 印刷時の隙間を調整 */
                    grid-template-columns: repeat(auto-fit, minmax(70px, 1fr)); /* 印刷時の列の最小幅を調整 */
                }
                 .rating-item {
                     font-size: 9pt; /* 評価アイテムのフォントサイズ */
                 }
                 .rating-label {
                     min-width: 30px; /* 印刷時のラベル最小幅を調整 */
                 }
                .memo-box {
                    padding: 8px; /* 印刷時のパディングを調整 */
                    height: 100%; /* 高さを利用可能なだけ使う */
                    box-sizing: border-box; /* パディングを高さに含める */
                    font-size: 9pt; /* メモのフォントサイズ */
                    line-height: 1.4; /* メモの行間 */
                }
                .memo-content {
                    font-size: 9pt; /* メモコンテンツのフォントサイズ */
                }
                .footer {
                    margin-top: 12px; /* 印刷時のマージンを調整 */
                    font-size: 7pt; /* 印刷時のフォントサイズを調整 */
                    padding-top: 6px;
                    grid-column: 1 / -1; /* フッターを両カラムの下に配置 */
                }

                 /* ページ区切りを防ぐための調整 */
                h1, h2, .section, .memo-box {
                    break-inside: avoid; /* 要素内での改ページを防ぐ */
                }
                .flex-row {
                     break-inside: avoid; /* flexコンテナ内での改ページを防ぐ */
                }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>${coffeeRecord.name || "コーヒー記録"}</h1>

            <div class="print-layout"> {/* 二段組み用のラッパーを追加 */}
              <div class="left-column"> {/* 左カラム */}
                <div class="section">
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
                </div>

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
                        <span class="detail-label">抽出器具:</span>
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
                    </div>
                    <div class="info-column">
                       <div class="detail-item">
                        <span class="detail-label">注湯温度:</span>
                        <span class="detail-value">${
                          coffeeRecord.temperature || "0"
                        }℃</span>
                      </div>
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
                          <span class="rating-label">キレ:</span>
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
              </div> {/* /left-column */}

              <div class="right-column"> {/* 右カラム */}
                 <div class="section memo-section"> {/* メモ専用のセクションスタイル */ }
                    <h2>MEMO</h2>
                    <div class="memo-box">
                      <div class="memo-content">${
                        coffeeRecord.memo || "未記入"
                      }</div>
                    </div>
                 </div>
              </div> {/* /right-column */}
            </div> {/* /print-layout */}

            <div class="footer">
              作成日: ${new Date().toLocaleDateString("ja-JP")}
            </div>
          </div>
        </body>
        </html>
      `;

      // expo-printでPDFファイルを生成
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false, // Base64は不要
        // A4サイズをポイントで指定 (1インチ = 72ポイント)
        width: 595, // 210mm / 25.4mm/inch * 72 points/inch ≈ 595 points
        height: 842, // 297mm / 25.4mm/inch * 72 points/inch ≈ 842 points
      });

      console.log("PDF生成完了:", uri);

      // 生成したPDFファイルを共有
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: "コーヒー情報をPDFで共有",
        UTI: "com.adobe.pdf",
      });

      console.log("PDF共有完了");
    } catch (error) {
      console.error("PDF生成または共有エラー:", error);
      const errorMessage =
        error instanceof Error ? error.message : "不明なエラーが発生しました";
      Alert.alert(
        "エラー",
        `PDFの生成または共有に失敗しました: ${errorMessage}`
      );
    } finally {
      setIsGeneratingPdf(false); // PDF生成終了フラグを下ろす
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.downloadPdfButton,
        (isGeneratingPdf || loading || !coffeeRecord) && styles.disabledButton, // ローディング中、データなし、生成中は無効化
      ]}
      onPress={downloadPdf}
      disabled={isGeneratingPdf || loading || !coffeeRecord} // ボタン無効化
    >
      {isGeneratingPdf ? (
        // 生成中はローディングインジケーターを表示
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        // 通常時はボタンテキストを表示
        <Text style={styles.buttonText}>PDF をダウンロード</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  downloadPdfButton: {
    backgroundColor: "#8b5a2b", // ボタンの背景色
    paddingVertical: 12, // 垂直方向のパディング
    paddingHorizontal: 20, // 水平方向のパディング
    borderRadius: 8, // 角丸
    marginTop: 20, // 上マージン
    width: "90%", // 幅
    alignSelf: "center", // 親要素内で中央寄せ
    alignItems: "center", // テキストを中央寄せ
    justifyContent: "center", // コンテンツを中央寄せ
    flexDirection: "row", // アイコンとテキストを横並びに (必要であれば)
  },
  disabledButton: {
    backgroundColor: "#cccccc", // 無効時の背景色
    opacity: 0.7, // 無効時の透明度
  },
  buttonText: {
    color: "white", // テキスト色
    fontWeight: "bold", // フォントの太さ
    fontSize: 16, // フォントサイズ
  },
});

export default PdfButtonComponent;
