import React, { useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import Slider from "@react-native-community/slider";
import { FontAwesome } from "@expo/vector-icons";

interface RangeComponentProps {
  dataTitle: string;
  onChange: (value: number) => void;
  value: number;
}

const RangeComponent: React.FC<RangeComponentProps> = ({
  dataTitle,
  onChange,
  value,
}) => {
  // ローカルステートを使って一時的な値を管理（スライダードラッグ中の値）
  const [localValue, setLocalValue] = useState(value);

  // メモリマークの値（0から5まで、0.5刻み）
  const tickValues = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

  // スライダーの値が変わった時（ドラッグ中）のハンドラー
  const handleSliderChange = (newValue: number) => {
    // ローカルステートだけを更新（レンダリングを最小限に）
    setLocalValue(newValue);
  };

  // スライダーの操作が完了した時のハンドラー
  const handleSlidingComplete = (newValue: number) => {
    // 親コンポーネントに通知
    onChange(parseFloat(newValue.toFixed(1)));
  };

  // ボタンを押した時のハンドラー
  const incrementValue = () => {
    if (value + 0.5 <= 5) {
      const newValue = parseFloat((value + 0.5).toFixed(1));
      onChange(newValue);
      setLocalValue(newValue);
    }
  };

  const decrementValue = () => {
    if (value - 0.5 >= 0) {
      const newValue = parseFloat((value - 0.5).toFixed(1));
      onChange(newValue);
      setLocalValue(newValue);
    }
  };

  // 親から新しい値が渡されたらローカルステートも更新
  if (value !== localValue) {
    setLocalValue(value);
  }

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{dataTitle}</Text>
      <View style={styles.sliderContainer}>
        <Text style={styles.valueText}>{value.toFixed(1)}</Text>
        <View style={styles.sliderAndButtons}>
          <TouchableOpacity
            onPress={decrementValue}
            style={styles.button}
            activeOpacity={0.7}
          >
            <FontAwesome name="minus" size={20} color="#D2B48C" />
          </TouchableOpacity>
          <View style={styles.sliderWrapper}>
            {/* メモリを上部に移動 */}
            <View style={styles.tickContainer}>
              {tickValues.map((tick) => (
                <View
                  key={tick}
                  style={[
                    styles.tick,
                    tick % 1 === 0 ? styles.majorTick : styles.minorTick,
                    value === tick && styles.activeTick,
                  ]}
                >
                  {tick % 1 === 0 && (
                    <Text style={styles.tickLabel}>{tick}</Text>
                  )}
                </View>
              ))}
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={5}
              step={0.5}
              value={localValue}
              onValueChange={handleSliderChange}
              onSlidingComplete={handleSlidingComplete}
              minimumTrackTintColor="#D2B48C"
              maximumTrackTintColor="#FFF"
              thumbTintColor="#D2B48C"
            />
          </View>
          <TouchableOpacity
            onPress={incrementValue}
            style={styles.button}
            activeOpacity={0.7}
          >
            <FontAwesome name="plus" size={20} color="#D2B48C" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    width: "90%",
    marginBottom: 10,
    marginHorizontal: "auto",
  },
  label: {
    width: "100%",
    backgroundColor: "#D2B48C",
    color: "#000",
    padding: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    textAlign: "center",
  },
  sliderContainer: {
    backgroundColor: "#FFF",
    paddingBottom: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    marginTop: -1,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D2B48C",
  },
  valueText: {
    color: "#000",
    marginVertical: 10,
    fontSize: 18,
    fontWeight: "bold",
  },
  sliderAndButtons: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    justifyContent: "center",
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 15,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
    shadowColor: "#000000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  sliderWrapper: {
    width: "60%",
    height: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  slider: {
    width: "100%",
    height: 40,
  },
  tickContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center", //中央に変更
    paddingHorizontal: 10,
    marginBottom: 5, // スライダーとの間隔を追加
  },
  tick: {
    width: 6,
    backgroundColor: "#D2B48C",
    alignItems: "center",
  },
  majorTick: {
    height: 12,
    width: 6,
  },
  minorTick: {
    height: 6,
  },
  activeTick: {
    backgroundColor: "#333",

    width: 6,
  },
  tickLabel: {
    color: "#A67B5B",

    fontSize: 12,
    marginBottom: 5, // ラベルとメモリの間隔を追加
    fontWeight: "500",
    position: "absolute",
    top: -20,
  },
});

export default RangeComponent;
