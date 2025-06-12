import React, { useRef } from "react";
import { ScrollView, Button, Text, View, StyleSheet } from "react-native";
const UpperButton = () => {
  const scrollViewRef = useRef<ScrollView>(null);
  const data = Array.from({ length: 50 }, (_, i) => ({
    key: String(i),
    text: `Item ${i}`,
  }));

  const handleScrollToTop = async () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  return (
    <>
      <Button
        title="上へ"
        onPress={handleScrollToTop}
        accessibilityLabel="上へ"
      />
      <ScrollView ref={scrollViewRef}>
        {data.map((item) => (
          <View key={item.key}>
            <Text>{item.text}</Text>
          </View>
        ))}
      </ScrollView>
    </>
  );
};
export default UpperButton;
