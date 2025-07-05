// components/button/Upper.tsx
import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ScrollView,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
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

  // ボタンの初期位置を設定 (例: 右下から30, 20)
  // これらは画面の右下からの相対位置として後で計算される
  const initialX = useSharedValue(0); // 後で画面幅から計算
  const initialY = useSharedValue(0); // 後で画面高さから計算
  const translateX = useSharedValue(0); // 現在のX座標のオフセット
  const translateY = useSharedValue(0); // 現在のY座標のオフセット

  // ジェスチャーの開始位置を保存するためのshared value
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  // パンジェスチャーの定義
  const panGesture = Gesture.Pan()
    .onStart(() => {
      // ジェスチャー開始時に現在の位置を保存

      // 保存するのは、ボタンがドラッグ開始時にすでにどこに移動していたかという「オフセット」
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    })
    .onUpdate((event) => {
      // 保存された開始位置と現在のドラッグ量を加算

      // ここで画面の境界チェックを行う
      let newX = savedTranslateX.value + event.translationX;
      let newY = savedTranslateY.value + event.translationY;

      // 画面の幅と高さを取得（ここでは仮の値を使用。実際にはDimensionsなどから取得）
      // 例として、画面幅 390, 画面高 844 (iPhone 12/13/14)
      const screenWidth = 390; // あなたのアプリの画面幅に合わせて調整
      const screenHeight = 844; // あなたのアプリの画面高さに合わせて調整

      const buttonSize = 100; // styles.button で定義された幅/高さ

      // 右下からのオフセットを考慮した移動範囲の計算
      const minX = -screenWidth + buttonSize + 20; // 画面左端からボタンの幅+右側の余白20
      const maxX = 0; // 初期位置が右端からの相対位置なので、右方向には0が最大

      const minY = -screenHeight + buttonSize + 30; // 画面上端からボタンの高さ+下側の余白30
      const maxY = 0; // 初期位置が下端からの相対位置なので、下方向には0が最大

      // 境界チェックとクランプ
      newX = Math.max(minX, Math.min(maxX, newX));
      newY = Math.max(minY, Math.min(maxY, newY));

      translateX.value = newX;
      translateY.value = newY;
    })
    .onEnd(() => {
      // 必要であれば、指を離した後の処理
      // 例: 位置をスナップする、など
    });

  // アニメーションスタイルの定義
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
      // 初期位置を絶対座標で設定
      position: "absolute",
      bottom: 30, // styles.buttonContainer の bottom と right をここに移動
      right: 20,
      zIndex: 99,
    };
  });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.button, animatedStyle]}>
        <TouchableOpacity
          onPress={handleScrollToTop}
          accessibilityLabel="上へ"
          style={styles.roundButton}
        >
          <Text style={styles.buttonText}>上へ</Text>
        </TouchableOpacity>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#dededecc", // 色を変えてみました
    borderRadius: 50,
    width: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
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
