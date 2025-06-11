import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Text,
  TouchableOpacity,
} from "react-native";

interface InputProps {
  dataTitle: string;
  onChange: (value: string) => void;
  value: string;
}

export const InputComponent: React.FC<InputProps> = ({
  dataTitle,
  onChange,
  value,
}) => {
  // const [inputText, setInputText] = useState("");

  const handleInputChange = (text: string) => {
    onChange(text); // 親コンポーネントに値を渡す
  };

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{dataTitle}</Text>
      <TextInput
        style={styles.input}
        onChangeText={handleInputChange}
        value={value}
        placeholder="入力してください"
        placeholderTextColor="#D3D3D3"
      />
    </View>
  );
};

interface NumberProps {
  dataTitle: string;
  onChange: (value: number) => void;
  value: number;
}
export const NumberComponent: React.FC<NumberProps> = ({
  dataTitle,
  onChange,
  value,
}) => {
  const [inputValue, setInputValue] = useState(value.toString()); // 初期値を文字列とする
  const [isFocused, setIsFocused] = useState(false);
  useEffect(() => {
    setInputValue(value.toString()); // value が変更されたときに inputValue を更新
  }, [value]);
  const handleInputChange = (text: string) => {
    const filteredText = text.replace(/[^0-9]/g, "");
    setInputValue(filteredText);
    const numericValue = parseInt(filteredText, 10) || 0;
    onChange(numericValue); // 親コンポーネントに値を渡す
  };

  const handleBlur = () => {
    setIsFocused(false);
    let currentValue = parseInt(inputValue, 10) || 0;
    if (currentValue < 0) {
      setInputValue("0");
      onChange(0); // 親コンポーネントに0を渡す
    } else {
      setInputValue(currentValue.toString());
      onChange(currentValue); // 親コンポーネントに値を渡す
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };
  if (dataTitle === "湯量") {
    return (
      <View style={styles.inputContainer}>
        <Text style={styles.label}>{dataTitle}</Text>

        <TextInput
          style={[styles.numberInput, isFocused && styles.focusedInput]}
          value={inputValue} // value プロパティを使用
          onChangeText={handleInputChange}
          keyboardType="number-pad"
          onBlur={handleBlur}
          onFocus={handleFocus}
        />
      </View>
    );
  }
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{dataTitle}</Text>

      <TextInput
        style={[styles.numberInput, isFocused && styles.focusedInput]}
        value={inputValue} // value プロパティを使用
        onChangeText={handleInputChange}
        keyboardType="number-pad"
        onBlur={handleBlur}
        onFocus={handleFocus}
      />
    </View>
  );
};

interface TextAreaProps {
  onChange: (value: string) => void;
  value: string;
}

export const TextAreaComponent: React.FC<TextAreaProps> = ({
  onChange,
  value,
}) => {
  const [text, setText] = useState(value);
  const maxLength = 100;
  const handleInputChange = (newText: string) => {
    if (newText.length <= maxLength) {
      setText(newText);
      onChange(newText); // 親コンポーネントに値を渡す
    }
  };

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>MEMO</Text>
      <TextInput
        style={styles.textarea}
        onChangeText={handleInputChange}
        value={value} // value プロパティを使用
        placeholder="コーヒーの評価項目以外でのメモや気になることがあれば記入してください"
        placeholderTextColor="#D3D3D3"
        multiline={true}
        numberOfLines={4}
      />

      <Text style={styles.counter}>
        {text.length} / {maxLength} 字
      </Text>
    </View>
  );
};
interface TimeInputProps {
  onChange: (value: string) => void;
  value: string;
}

export const MeasuredTimeInputComponent: React.FC<TimeInputProps> = ({
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
    marginBottom: 10, // 後の定義を採用
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
  numberInput: {
    width: "100%",
    height: 40,
    backgroundColor: "#FFF",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderWidth: 1,
    borderColor: "#D2B48C",
    paddingHorizontal: 10,
    fontSize: 18,
    textAlign: "center",
  },
  focusedInput: {
    borderColor: "#D2B48C", // フォーカス時のボーダーカラー
    borderWidth: 1,
  },
  input: {
    width: "100%",
    backgroundColor: "#FFF",
    padding: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderWidth: 1,
    borderColor: "#D2B48C",
    marginTop: -1,
  },
  textarea: {
    width: "100%",
    backgroundColor: "#FFF",
    padding: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderWidth: 1,
    borderColor: "#D2B48C",
    marginTop: -1,
    height: 100,
    textAlignVertical: "top",
  },
  counter: {
    width: "100%",
    textAlign: "right",
    color: "#888",
    fontSize: 12,
    marginTop: 5,
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
