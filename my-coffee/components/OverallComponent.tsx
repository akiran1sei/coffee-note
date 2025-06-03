// OverallComponent.tsx (修正後)
import React, { useState, useEffect } from "react"; // <-- useEffect をインポート
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import Slider from "@react-native-community/slider";
import { FontAwesome } from "@expo/vector-icons";

interface OverallPreferenceRangeComponentProps {
  onChange: (value: number) => void;
  value: number;
}

const OverallPreferenceRangeComponent: React.FC<
  OverallPreferenceRangeComponentProps
> = ({ onChange, value }) => {
  const [localValue, setLocalValue] = useState(value);
  const tickValues = [1, 2, 3, 4, 5];

  // =========================================================================
  // ここを修正します！
  // value Prop の変更を localValue State に同期するために useEffect を使用します。
  useEffect(() => {
    if (value !== localValue) {
      setLocalValue(value);
    }
  }, [value, localValue]); // localValueも依存配列に含めるのがより安全です
  // =========================================================================

  const handleSliderChange = (newValue: number) => {
    setLocalValue(newValue);
  };

  const handleSlidingComplete = (newValue: number) => {
    onChange(newValue);
  };

  const incrementValue = () => {
    if (value + 1 <= 5) {
      const newValue = value + 1;
      onChange(newValue);
      setLocalValue(newValue);
    }
  };

  const decrementValue = () => {
    if (value - 1 >= 0) {
      const newValue = value - 1;
      onChange(newValue);
      setLocalValue(newValue);
    }
  };

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>全体の好み</Text>
      <View style={styles.sliderContainer}>
        <Text style={styles.valueText}>{value}</Text>
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
                    styles.majorTick,
                    value === tick && styles.activeTick,
                  ]}
                >
                  <Text style={styles.tickLabel}>{tick}</Text>
                </View>
              ))}
            </View>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={5}
              step={1}
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
    alignItems: "center",
    paddingHorizontal: 10,
    marginBottom: 5,
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
  activeTick: {
    backgroundColor: "#333",
    width: 6,
  },
  tickLabel: {
    color: "#A67B5B",
    fontSize: 12,
    marginBottom: 5,
    fontWeight: "500",
    position: "absolute",
    top: -20,
  },
});

export default OverallPreferenceRangeComponent;
