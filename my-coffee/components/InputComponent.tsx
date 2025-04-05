import React, { useState } from "react";
import { View, StyleSheet, TextInput, Text } from "react-native";

interface InputProps {
  dataTitle: string;
  onChange: (value: string) => void;
  value: string;
}

const InputComponent: React.FC<InputProps> = ({
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
});

export default InputComponent;
