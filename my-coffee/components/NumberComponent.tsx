import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text, TextInput } from "react-native";
interface NumberProps {
  dataTitle: string;
  onChange: (value: number) => void;
  value: number;
}
const NumberComponent: React.FC<NumberProps> = ({
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
});

export default NumberComponent;
