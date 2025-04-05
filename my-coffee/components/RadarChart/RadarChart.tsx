import React from "react";
import { View, StyleSheet } from "react-native";
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
    sweetness: number;
    body: number;
    aroma: number;
    aftertaste: number;
  };
}

const RadarChart: React.FC<RadarChartProps> = ({ data }) => {
  const chartData = [
    { x: "酸味", y: data.acidity },
    { x: "苦味", y: data.bitterness },
    { x: "甘味", y: data.sweetness },
    { x: "コク", y: data.body },
    { x: "香り", y: data.aroma },
    { x: "後味", y: data.aftertaste },
    { x: "酸味", y: data.acidity },
  ];

  const yAxisTicks = [0, 1, 2, 3, 4, 5];

  return (
    <View style={styles.radarChartContainer}>
      <VictoryChart
        polar
        domain={{ y: [0, 5] }}
        theme={VictoryTheme.material}
        width={300}
        height={300}
        padding={{ top: 40, bottom: 40, left: 40, right: 40 }} // パディングを追加
      >
        <VictoryPolarAxis
          dependentAxis
          style={{
            axis: { stroke: "none" },
            tickLabels: { fontSize: 12, fill: "#333" },
            axisLabel: {
              fontSize: 14,
              fontWeight: "bold",
              fill: "#333",
              padding: 20,
            },
          }}
          tickValues={yAxisTicks}
          tickFormat={(t) => t}
          labelPlacement="perpendicular"
        />
        <VictoryPolarAxis
          style={{
            axis: { stroke: "#ccc", strokeWidth: 1 },
            tickLabels: { fontSize: 10, fill: "#666" },
          }}
        />
        <VictoryLine
          data={chartData}
          style={{
            data: { stroke: "#007AFF", strokeWidth: 3 }, // 色と太さを調整
          }}
        />
        {/* オプションで VictoryArea を追加 */}
        {/* <VictoryArea
                    data={chartData}
                    style={{
                        data: { fill: "#007AFF", opacity: 0.3 },
                    }}
                /> */}
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
    paddingVertical: 30, // 垂直方向のパディングを追加
  },
});

export default RadarChart;
