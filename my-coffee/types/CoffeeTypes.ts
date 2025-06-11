// types/CoffeeTypes.ts
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
  measurementMethod: string; // 計測方法
  extractionTime: string; // 抽出時間
  acidity: number; // 酸味（1-10）
  bitterness: number; // 苦味（1-10）
  overall: number; // 全体の好み（1-55）
  body: number; // コク（1-10）
  aroma: number; // 香り（1-10）
  aftertaste: number; // キレ（1-10）
  memo: string; // メモ
  imageUri: string; // 画像のパス
  createdAt: Date; // 追加
}
