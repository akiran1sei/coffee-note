import React from "react";
import { View, StyleSheet, DimensionValue } from "react-native"; // Textコンポーネントは不要になります
import {
  VictoryPolarAxis,
  VictoryChart,
  VictoryTheme,
  VictoryLine,
  VictoryArea,
} from "victory-native";

interface RadarChartProps {
  data: {
    acidity: number;
    bitterness: number;
    body: number;
    aroma: number;
    aftertaste: number;
  };
}

const RadarChart: React.FC<RadarChartProps> = ({ data }) => {
  const chartData = [
    { x: "酸味", y: data.acidity },
    { x: "苦味", y: data.bitterness },
    { x: "コク", y: data.body },
    { x: "香り", y: data.aroma },
    { x: "キレ", y: data.aftertaste },
    { x: "酸味", y: data.acidity }, // グラフを閉じるために最初の点を再度追加
  ];

  const yAxisTicks = [0, 1, 2, 3, 4, 5]; // 評価値の目盛り

  // 各軸の項目名（X軸の目盛りに相当）
  const xAxisTickValues = ["酸味", "苦味", "コク", "香り", "キレ"];

  return (
    <View style={styles.radarChartContainer}>
      <VictoryChart
        polar
        domain={{ y: [0, 5] }}
        theme={VictoryTheme.material}
        width={350}
        height={350}
        // パディングは、軸ラベルが外に出る分を考慮して調整
        padding={{ top: 40, bottom: 40, left: 40, right: 40 }}
        // 五角形の上部分が真ん中に来るように角度を調整
        startAngle={270 - 72 * 2.5}
        endAngle={270 + 72 * 2.5}
      >
        {/*
          中心から放射状に伸びる評価値の軸 (Y軸に相当)
          目盛り（0, 1, 2, 3, 4, 5）を表示
        */}
        <VictoryPolarAxis
          dependentAxis
          style={{
            axis: { stroke: "none" }, // 軸の線自体は非表示
            tickLabels: { fontSize: 14, fill: "#5D4037" }, // 目盛りラベルのスタイル
            // axisLabel: をコメントアウトまたは削除し、Victoryでの軸ラベル表示を無効にする
            // axisLabel: {
            //   fontSize: 14,
            //   fontWeight: "bold",
            //   fill: "#333",
            //   padding: 20,
            // },
          }}
          tickValues={yAxisTicks}
          tickFormat={(t) => t}
          labelPlacement="perpendicular" // 目盛りラベルを軸に垂直に表示
        />

        {/*
          各項目名（酸味、苦味など）を示す軸 (X軸に相当)
          この軸のtickLabelsで項目名を表示します
        */}
        <VictoryPolarAxis
          tickValues={xAxisTickValues} // ここで項目名を指定
          style={{
            axis: { stroke: "#ccc", strokeWidth: 1 }, // 軸の線（クモの巣の線）の色と太さ
            tickLabels: { fontSize: 16, fill: "#666", padding: 15 }, // 項目名のラベルスタイル
          }}
          labelPlacement="vertical" // オプション: 項目名を縦書きにする場合（この場合も放射状に広がります）
        />

        {/* 評価値を結ぶ線 */}
        <VictoryLine
          data={chartData}
          style={{
            data: { stroke: "#D2B48C", strokeWidth: 3 }, // 線の色と太さを調整
          }}
        />

        {/* オプションで VictoryArea を追加 */}
        <VictoryArea
          data={chartData}
          style={{
            data: { fill: "#007AFF", opacity: 0.3 },
          }}
        />
      </VictoryChart>
    </View>
  );
};

const styles = StyleSheet.create({
  radarChartContainer: {
    width: "100%",
    height: "auto",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    // position: 'relative', // カスタムラベルがないので不要
  },
});

export default RadarChart;
