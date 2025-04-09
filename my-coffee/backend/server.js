const express = require("express");
const fs = require("node:fs/promises");
const path = require("path");
const ChartJSImage = require("chart.js-image");

// Correct pdfMake imports
const pdfMake = require("pdfmake/build/pdfmake");
const pdfFonts = require("pdfmake/build/vfs_fonts");
pdfMake.vfs = pdfFonts.pdfMake?.vfs;

const app = express();
const port = 3000;
const chartJSNodeCanvas = new ChartJSImage({ width: 200, height: 200 });

// 一時的な画像保存ディレクトリ
const imageDir = path.join(__dirname, "temp-images");
fs.mkdir(imageDir, { recursive: true }).catch(console.error);

app.use(express.json());
app.use("/temp-images", express.static(imageDir));

app.post("/api/generate-pdf", async (req, res) => {
  try {
    const coffeeRecord = req.body.coffeeRecord;
    if (!coffeeRecord) {
      return res.status(400).send("コーヒーデータがありません。");
    }

    // レーダーチャートのデータ
    const radarData = {
      labels: ["酸味", "甘味", "苦味", "コク", "香り", "後味"],
      datasets: [
        {
          label: coffeeRecord.name,
          data: [
            Number(coffeeRecord.acidity) || 0,
            Number(coffeeRecord.sweetness) || 0,
            Number(coffeeRecord.bitterness) || 0,
            Number(coffeeRecord.body) || 0,
            Number(coffeeRecord.aroma) || 0,
            Number(coffeeRecord.aftertaste) || 0,
          ],
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
      ],
    };

    // チャートの設定
    const chartConfig = {
      type: "radar",
      data: {
        labels: radarData.labels,
        datasets: radarData.datasets,
      },
      options: {
        scale: {
          ticks: {
            beginAtZero: true,
            max: 5, // 評価の最大値に合わせて調整
            stepSize: 1,
            showLabelBackdrop: false,
          },
        },
      },
    };

    // チャート画像をBase64エンコード
    const chartDataUrl = await chartJSNodeCanvas.toDataURL(chartConfig);
    const base64Image = chartDataUrl.split(",")[1];
    const imageName = `radar-chart-${Date.now()}.png`;
    const imagePath = path.join(imageDir, imageName);
    await fs.writeFile(imagePath, base64Image, "base64");

    // 重要: imageUrlをフルパスに変更
    const imageFilePath = path.resolve(imagePath);

    // PDFドキュメントの定義 (画像埋め込みを修正)
    const documentDefinition = {
      content: [
        { text: coffeeRecord.name, style: "header" },
        { text: "\n" },
        {
          // 画像を直接base64で埋め込む方法に変更
          image: `data:image/png;base64,${base64Image}`,
          width: 200,
          alignment: "center",
        },
        { text: "\n" },
        {
          table: {
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

    const pdfDoc = pdfMake.createPdfKitDocument(documentDefinition);
    const chunks = [];
    pdfDoc.on("data", (chunk) => {
      chunks.push(chunk);
    });
    pdfDoc.on("end", () => {
      const result = Buffer.concat(chunks);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${coffeeRecord.name}.pdf"`
      );
      res.send(result);

      // 画像ファイルのクリーンアップ (オプション)
      fs.unlink(imagePath).catch((err) =>
        console.error("Temporary file deletion error:", err)
      );
    });
    pdfDoc.end();
  } catch (error) {
    console.error("PDF 生成エラー:", error);
    res
      .status(500)
      .json({ error: "PDF の生成に失敗しました。" + error.message });
  }
});

app.listen(port, () => {
  console.log(`サーバーがポート ${port} で起動しました`);
});
