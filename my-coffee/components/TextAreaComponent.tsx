import React, { useState } from "react";
import { View, StyleSheet, TextInput, Text } from "react-native";

interface TextAreaProps {
  onChange: (value: string) => void;
  value: string;
}

const TextAreaComponent: React.FC<TextAreaProps> = ({ onChange, value }) => {
  const handleInputChange = (text: string) => {
    onChange(text); // 親コンポーネントに値を渡す
  };

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>MEMO</Text>
      <TextInput
        style={styles.textarea}
        onChangeText={handleInputChange}
        value={value} // value プロパティを使用
        placeholder="入力してください"
        placeholderTextColor="#D3D3D3"
        multiline={true}
        numberOfLines={4}
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
});

export default TextAreaComponent;
