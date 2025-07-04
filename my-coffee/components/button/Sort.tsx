import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from "react-native";
import { CoffeeRecord } from "../../types/CoffeeTypes"; // パスは実際の構造に合わせて調整してください

type SortCriteria =
  | "acidity"
  | "bitterness"
  | "overall"
  | "body"
  | "aroma"
  | "aftertaste"
  | "createdAt";

interface SortComponentProps {
  onSort: (sortedRecords: CoffeeRecord[]) => void;
  records: CoffeeRecord[];
}

const SortComponent: React.FC<SortComponentProps> = ({ onSort, records }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [currentCriteria, setCurrentCriteria] = useState<SortCriteria | null>(
    null
  );
  const [currentOrder, setCurrentOrder] = useState<"asc" | "desc">("asc");

  // ソート基準の選択肢（名前を除外）
  const sortOptions: {
    label: string;
    value: SortCriteria;
    order: "asc" | "desc";
  }[] = [
    { label: "酸味 昇順", value: "acidity", order: "asc" },
    { label: "酸味 降順", value: "acidity", order: "desc" },
    { label: "苦味 昇順", value: "bitterness", order: "asc" },
    { label: "苦味 降順", value: "bitterness", order: "desc" },
    { label: "全体 昇順", value: "overall", order: "asc" },
    { label: "全体 降順", value: "overall", order: "desc" },
    { label: "コク 昇順", value: "body", order: "asc" },
    { label: "コク 降順", value: "body", order: "desc" },
    { label: "香り 昇順", value: "aroma", order: "asc" },
    { label: "香り 降順", value: "aroma", order: "desc" },
    { label: "キレ 昇順", value: "aftertaste", order: "asc" },
    { label: "キレ 降順", value: "aftertaste", order: "desc" },
    { label: "作成日時 (古い順)", value: "createdAt", order: "asc" },
    { label: "作成日時 (新しい順)", value: "createdAt", order: "desc" },
  ];

  // ソート実行
  const handleSort = (criteria: SortCriteria, order: "asc" | "desc") => {
    setCurrentCriteria(criteria);
    setCurrentOrder(order);
    sortRecords(criteria, order);
    setModalVisible(false);
  };

  // 実際のソート処理
  const sortRecords = (criteria: SortCriteria, order: "asc" | "desc") => {
    const sortedRecords = [...records].sort((a, b) => {
      let comparison = 0;

      switch (criteria) {
        case "acidity":
          comparison = (a.acidity || 0) - (b.acidity || 0);
          break;
        case "bitterness":
          comparison = (a.bitterness || 0) - (b.bitterness || 0);
          break;
        case "overall":
          comparison = (a.overall || 0) - (b.overall || 0);
          break;
        case "body":
          comparison = (a.body || 0) - (b.body || 0);
          break;
        case "aroma":
          comparison = (a.aroma || 0) - (b.aroma || 0);
          break;
        case "aftertaste":
          comparison = (a.aftertaste || 0) - (b.aftertaste || 0);
          break;
        case "createdAt":
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          comparison = dateA - dateB;
          break;
      }

      return order === "asc" ? comparison : -comparison;
    });

    onSort(sortedRecords);
  };

  // 現在のソート条件を表示するための文字列を取得
  const getCurrentSortLabel = () => {
    if (!currentCriteria) return "並び替え";

    const option = sortOptions.find(
      (opt) => opt.value === currentCriteria && opt.order === currentOrder
    );

    return option ? `並び替え: ${option.label}` : "並び替え";
  };

  return (
    <View>
      <TouchableOpacity
        style={styles.sortButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.sortButtonText}>{getCurrentSortLabel()}</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>並び替え基準を選択</Text>
            <ScrollView>
              {sortOptions.map((option, index) => (
                <TouchableOpacity
                  key={`${option.value}-${option.order}`}
                  style={[
                    styles.optionButton,
                    currentCriteria === option.value &&
                      currentOrder === option.order &&
                      styles.selectedOption,
                  ]}
                  onPress={() => handleSort(option.value, option.order)}
                >
                  <Text style={styles.optionText}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>キャンセル</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  sortButton: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
  },
  sortButtonText: {
    textAlign: "center",
    fontWeight: "500",
    color: "#777",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    width: "80%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  optionButton: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  selectedOption: {
    backgroundColor: "#e8f4ff",
  },
  optionText: {
    fontSize: 16,
  },
  cancelButton: {
    marginTop: 15,
    padding: 12,
    backgroundColor: "#e0e0e0",
    borderRadius: 5,
  },
  cancelButtonText: {
    textAlign: "center",
    fontWeight: "500",
  },
});

export default SortComponent;
