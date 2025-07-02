import React, { useState, useEffect } from "react"; // useEffect をインポート
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
  const [localValue, setLocalValue] = useState(value);
  const tickValues = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

  // =========================================================================
  // ここを修正します！
  useEffect(() => {
    // 親から新しい値が渡されたらローカルステートも更新
    if (value !== localValue) {
      setLocalValue(value);
    }
  }, [value, localValue]); // localValueも依存配列に含めるのがより安全です
  // =========================================================================

  const handleSliderChange = (newValue: number) => {
    setLocalValue(newValue);
  };

  const handleSlidingComplete = (newValue: number) => {
    onChange(parseFloat(newValue.toFixed(1)));
  };

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

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{dataTitle}</Text>
      {/* dataTitleはTextで囲まれているのでOK */}
      <View style={styles.sliderContainer}>
        <Text style={styles.valueText}>{value.toFixed(1)}</Text>
        {/* valueもTextで囲まれているのでOK */}
        <View style={styles.sliderAndButtons}>
          <TouchableOpacity
            onPress={decrementValue}
            style={styles.button}
            activeOpacity={0.7}
          >
            <FontAwesome name="minus" size={20} color="#D2B48C" />
          </TouchableOpacity>
          <View style={styles.sliderWrapper}>
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
                    <Text style={styles.tickLabel}>{tick}</Text> // tickもTextで囲まれているのでOK
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
              thumbImage={require("../assets/images/slider-thumb.png")} // スライダーのサム画像を指定
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
    width: 50,
    height: 50,
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
    height: 50,
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
