import React, { useState, useEffect } from "react";
import {
  Platform,
  View,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

interface ImagePickerProps {
  onChange: (value: string) => void;
  value: string; // Property to receive values from parent component for reset
}

const ImageUploadComponent: React.FC<ImagePickerProps> = ({
  onChange,
  value,
}) => {
  // Set default image URI
  const defaultImage = require("../assets/images/no-image.png");

  const [image, setImage] = useState<string>();

  // Update image state when value from parent component changes
  useEffect(() => {
    setImage(value);
  }, [value]);

  const pickImage = async () => {
    // Check if running on web
    if (Platform.OS === "web") {
      // Use HTML input for web
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";

      input.onchange = (e: any) => {
        if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const reader = new FileReader();

          reader.onload = (loadEvent) => {
            const dataUrl = loadEvent.target?.result as string;
            setImage(dataUrl);
            onChange(dataUrl);
          };

          reader.readAsDataURL(file);
        }
      };

      // Trigger click on input element
      input.click();
    } else {
      // productionAreaal mobile implementation
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        alert("画像を選択するには、カメラロールへのアクセス許可が必要です。");
        return;
      }

      try {
        let result = await ImagePicker.launchImageLibraryAsync({
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          const selectedUri = result.assets[0].uri;
          setImage(selectedUri);
          onChange(selectedUri);
        }
      } catch (error) {
        console.error("画像の選択中にエラーが発生しました:", error);
        alert("画像の選択中にエラーが発生しました。");
      }
    }
  };

  // Determine image source (user-selected image or default image)
  const imageSource = image
    ? Platform.OS === "web"
      ? { uri: image }
      : { uri: image }
    : defaultImage;

  return (
    <View style={styles.uploadContainer}>
      <View style={styles.imageContents}>
        <TouchableOpacity onPress={pickImage} style={styles.imageButton}>
          <Text style={styles.buttonText}>画像を選択</Text>
        </TouchableOpacity>
        <Image source={imageSource} style={styles.imagePreview} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  uploadContainer: {
    width: "95%",
    height: "auto",
    backgroundColor: "#D2B48C",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    alignSelf: "center", // Center the container
  },
  imageContents: {
    width: "90%",
    marginBottom: 10,
    alignSelf: "center", // Center the contents
  },
  imageButton: {
    width: "100%",
    backgroundColor: "#F5F5F5",
    padding: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginTop: 5,
    marginBottom: 10,
  },
  buttonText: {
    color: "#333",
  },
  imagePreview: {
    width: "100%",
    height: 250,
    borderRadius: 10,
    backgroundColor: "#F0F0F0",
    resizeMode: "contain", // Ensure image is properly displayed
  },
});

export default ImageUploadComponent;
