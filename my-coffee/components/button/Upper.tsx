// components/button/Upper.tsx
import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ScrollView,
} from "react-native";

interface UpperButtonProps {
  scrollViewRef: React.RefObject<ScrollView | null>;
  isVisible: boolean; // ★追加: 表示/非表示を制御するプロパティ
}

const UpperButton: React.FC<UpperButtonProps> = ({
  scrollViewRef,
  isVisible,
}) => {
  // isVisible を受け取る
  const handleScrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  if (!isVisible) {
    // isVisible が false の場合は何もレンダリングしない
    return null;
  }

  return (
    <View style={styles.buttonContainer}>
      <TouchableOpacity
        onPress={handleScrollToTop}
        accessibilityLabel="上へ"
        style={styles.roundButton}
      >
        <Text style={styles.buttonText}>上へ</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    position: "absolute",
    bottom: 30,
    right: 20,
    zIndex: 99,
  },
  roundButton: {
    width: 60,
    height: 60,
    borderRadius: 30, // 幅/高さの半分で丸くなる
    backgroundColor: "#4A90E2", // ボタンの背景色
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: "#FFFFFF", // テキストの色
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default UpperButton;
