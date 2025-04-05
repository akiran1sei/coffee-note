// src/types/CoffeeTypes.ts
export interface CoffeeRecord {
  id: string; // 一意の識別子
  name: string; // 名称
  variety: string; // 品種
  productionArea: string; // 産地
  roastingDegree: string; // 焙煎度
  extractionMethod: string;
  extractionMaker: string;
  grindSize: string; // 挽き目
  temperature: number; // 温度（℃）
  coffeeAmount: number; // 粉量（g）
  waterAmount: number; // 湯量（g）
  extractionTime: string; // 抽出時間
  acidity: number; // 酸味（1-10）
  bitterness: number; // 苦味（1-10）
  sweetness: number; // 甘味（1-10）
  body: number; // コク（1-10）
  aroma: number; // 香り（1-10）
  aftertaste: number; // 後味（1-10）
  memo: string; // メモ
  imageUri: string; // 画像のパス
}
