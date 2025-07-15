import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import {
  HierarchicalCoffeeSelect,
  CoffeeProcessingSelect,
  CoffeeTypesSelect,
  ConditionalMeasurementSelector,
} from "../SelectComponent";
import {
  InputComponent,
  NumberComponent,
  TextAreaComponent,
  MeasuredTimeInputComponent,
} from "../InputComponent";
import RangeComponent from "../RangeComponent";
import ImageUploadComponent from "../ImageUploadComponent";
import RadarChart from "../RadarChart/RadarChart";
import OverallPreferenceRangeComponent from "../OverallComponent";

interface CoffeeFormProps {
  resetKey: number;
  formData: {
    imageUri: string;
    beansName: string;
    variety: string;
    productionArea: string;
    roastingDegree: string;
    extractionMethod: string;
    extractionMaker: string;
    grindSize: string;
    temperature: number;
    coffeeAmount: number;
    measurementMethod: string;
    waterAmount: number;
    extractionTime: string;
    acidity: number;
    bitterness: number;
    overall: number;
    body: number;
    aroma: number;
    aftertaste: number;
    textArea: string;
    shopName: string; // 店名
    shopPrice: number; // 店の価格
  };
  rangeValues: {
    acidity: number;
    bitterness: number;
    body: number;
    aroma: number;
    aftertaste: number;
    overall: number;
  };
  imageData: string;
  InputLabel: {
    beansName: string;
    productionArea: string;
    shopName: string;
  };

  RangeLabel: {
    acidity: string;
    bitterness: string;
    body: string;
    aroma: string;
    aftertaste: string;
    overall: string;
  };
  NumberLabel: {
    temperature: string;
    coffeeAmount: string;
    waterAmount: string;
    shopPrice: string; // 店の価格
  };
  handleInputChange: (label: string, value: string | number) => void;
  handleRangeChange: (label: string, value: number) => void;
  handleOverallPreferenceChange: (label: string, value: number) => void;
  handleTextAreaChange: (value: string) => void;
  handleImageChange: (value: string) => void;
  handleSubmit: () => void;
}

export default function ShopEditComponent({
  resetKey,
  formData,
  rangeValues,
  imageData,
  InputLabel,

  RangeLabel,
  NumberLabel,
  handleInputChange,

  handleRangeChange,
  handleOverallPreferenceChange,
  handleTextAreaChange,

  handleImageChange,
  handleSubmit,
}: CoffeeFormProps) {
  return (
    <View style={styles.formContainer}>
      <ImageUploadComponent
        key={`imageUpload-${resetKey}`}
        onChange={handleImageChange}
        value={imageData}
      />
      <InputComponent
        key={`beansName-${resetKey}`}
        dataTitle={InputLabel.beansName}
        onChange={(value: string) => handleInputChange("beansName", value)}
        value={formData.beansName}
      />
      <InputComponent
        key={`shopName-${resetKey}`}
        dataTitle={InputLabel.shopName}
        onChange={(value: string) => handleInputChange("shopName", value)}
        value={formData.shopName}
      />

      <InputComponent
        key={`productionArea-${resetKey}`}
        dataTitle={InputLabel.productionArea}
        onChange={(value: string) => handleInputChange("productionArea", value)}
        value={formData.productionArea}
      />
      <NumberComponent
        key={`shopPrice-${resetKey}`}
        dataTitle={NumberLabel.shopPrice}
        onChange={(value: number) => handleInputChange("shopPrice", value)}
        value={formData.shopPrice}
      />
      <RangeComponent
        key={`acidity-${resetKey}`}
        dataTitle={RangeLabel.acidity}
        onChange={(value: number) => handleRangeChange("acidity", value)}
        value={rangeValues.acidity}
      />
      <RangeComponent
        key={`bitterness-${resetKey}`}
        dataTitle={RangeLabel.bitterness}
        onChange={(value: number) => handleRangeChange("bitterness", value)}
        value={rangeValues.bitterness}
      />
      <RangeComponent
        key={`body-${resetKey}`}
        dataTitle={RangeLabel.body}
        onChange={(value: number) => handleRangeChange("body", value)}
        value={rangeValues.body}
      />
      <RangeComponent
        key={`aroma-${resetKey}`}
        dataTitle={RangeLabel.aroma}
        onChange={(value: number) => handleRangeChange("aroma", value)}
        value={rangeValues.aroma}
      />
      <RangeComponent
        key={`aftertaste-${resetKey}`}
        dataTitle={RangeLabel.aftertaste}
        onChange={(value: number) => handleRangeChange("aftertaste", value)}
        value={rangeValues.aftertaste}
      />
      <RadarChart data={rangeValues} />
      <OverallPreferenceRangeComponent
        key={`overall-${resetKey}`}
        onChange={(value: number) =>
          handleOverallPreferenceChange("overall", value)
        }
        value={rangeValues.overall}
      />
      <TextAreaComponent
        key={`textArea-${resetKey}`}
        onChange={handleTextAreaChange}
        value={formData.textArea}
      />
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>保存</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    width: "100%",
    paddingTop: 20,
    marginHorizontal: "auto",
    borderRadius: 10,
    backgroundColor: "#fff",
    shadowColor: "#333",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  submitButton: {
    backgroundColor: "#4A90E2",
    padding: 15,
    borderRadius: 10,
    width: "90%",
    alignItems: "center",
    marginVertical: 20,
    marginHorizontal: "auto",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
