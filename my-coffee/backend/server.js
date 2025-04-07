// backend/server.js
const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
require("dotenv").config();

//
const pdfMake = require("pdfmake/build/pdfmake");
const vfs_fonts = require("pdfmake/build/vfs_fonts");
pdfMake.vfs = vfs_fonts;
const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
// PostgreSQL 接続設定
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT, 10),
});

app.post("/api/coffee/:id/pdf", async (req, res) => {
  const coffeeId = req.params.id;
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT * FROM notes WHERE id = $1", [
      coffeeId,
    ]);
    const coffeeRecord = result.rows[0];
    client.release();

    if (!coffeeRecord) {
      return res.status(404).send("Coffee record not found");
    }

    const documentDefinition = {
      content: [
        { text: coffeeRecord.name, style: "header" },
        { text: `種類: ${coffeeRecord.variety}` },
        // ... PDF のデザインに合わせて他のデータも追加 ...
      ],
      styles: {
        header: { fontSize: 18, bold: true },
      },
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
    });
    pdfDoc.end();
  } catch (error) {
    console.error("PDF generation failed:", error);
    res.status(500).send("Failed to generate PDF");
  }
});

app.listen(port, () => {
  console.log(`Backend server listening on port ${port}`);
});
