import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";

interface TimeInputProps {
  onChange: (value: string) => void;
  value: string;
}

const MeasuredTimeInputComponent: React.FC<TimeInputProps> = ({
  onChange,
  value,
}) => {
  const [minutes, setMinutes] = useState<string>("");
  const [seconds, setSeconds] = useState<string>("");

  const minutesInput = useRef<TextInput>(null);
  const secondsInput = useRef<TextInput>(null);

  useEffect(() => {
    if (typeof value === "string" && value) {
      // 文字列型であることを確認
      const [min, sec] = value.split(":");
      setMinutes(min || "");
      setSeconds(sec || "");
    } else {
      setMinutes("");
      setSeconds("");
    }
  }, [value]);
  const handleMinutesChange = (text: string) => {
    const numericValue = parseInt(text.replace(/[^0-9]/g, ""), 10);
    if (isNaN(numericValue) || (numericValue >= 0 && numericValue <= 99)) {
      setMinutes(text.replace(/[^0-9]/g, ""));
      onChange(`${text.replace(/[^0-9]/g, "")}:${seconds}`);
    }
  };

  const handleSecondsChange = (text: string) => {
    const numericValue = parseInt(text.replace(/[^0-9]/g, ""), 10);
    if (isNaN(numericValue) || (numericValue >= 0 && numericValue <= 59)) {
      setSeconds(text.replace(/[^0-9]/g, ""));
      onChange(`${minutes}:${text.replace(/[^0-9]/g, "")}`);
    }
  };

  const handleMinutesSubmit = () => {
    if (secondsInput.current) {
      secondsInput.current.focus();
    }
  };

  const resetTime = () => {
    onChange("");
    if (minutesInput.current) {
      minutesInput.current.focus();
    }
  };

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>抽出時間</Text>
      <View style={styles.timeInputContainer}>
        <View style={styles.timeInputWrapper}>
          <TextInput
            style={styles.timeInput}
            keyboardType="number-pad"
            maxLength={2}
            value={minutes}
            onChangeText={handleMinutesChange}
            onSubmitEditing={handleMinutesSubmit}
            placeholder="00"
            placeholderTextColor="#AAAAAA"
            ref={minutesInput}
          />
          <Text style={styles.timeUnit}>分</Text>
        </View>

        <Text style={styles.timeSeparator}>:</Text>

        <View style={styles.timeInputWrapper}>
          <TextInput
            style={styles.timeInput}
            keyboardType="number-pad"
            maxLength={2}
            value={seconds}
            onChangeText={handleSecondsChange}
            placeholder="00"
            placeholderTextColor="#AAAAAA"
            ref={secondsInput}
          />
          <Text style={styles.timeUnit}>秒</Text>
        </View>

        <TouchableOpacity style={styles.resetButton} onPress={resetTime}>
          <Text style={styles.resetButtonText}>リセット</Text>
        </TouchableOpacity>
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
  timeInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    backgroundColor: "#FFF",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderWidth: 1,
    borderColor: "#D2B48C",
    marginTop: -1,
  },
  timeInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeInput: {
    width: 50,
    height: 40,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 5,
    padding: 10,
    textAlign: "center",
    fontSize: 18,
  },
  timeUnit: {
    marginLeft: 5,
    fontSize: 18,
  },
  timeSeparator: {
    marginHorizontal: 10,
    fontSize: 24,
    fontWeight: "bold",
  },
  resetButton: {
    marginLeft: 15,
    backgroundColor: "#F5F5F5",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  resetButtonText: {
    color: "#333",
    fontSize: 14,
  },
});

export default MeasuredTimeInputComponent;
