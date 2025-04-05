import React, { useState, useEffect } from "react";
import {
  Text,
  ScrollView,
  View,
  Image,
  StyleSheet,
  Platform,
  ImageSourcePropType,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import HeaderComponent from "../../components/HeaderComponent";
import PageTitleComponent from "../../components/PageTitleComponent";
import CoffeeStorageService from "../../services/CoffeeStorageService";
import { CoffeeRecord } from "../../types/CoffeeTypes";
import RadarChart from "../../components/RadarChart/RadarChart";
import Checkbox from "expo-checkbox";

export default function ListScreen() {
  const router = useRouter();
  const [coffeeRecords, setCoffeeRecords] = useState<CoffeeRecord[]>([]);
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const records = await CoffeeStorageService.getAllCoffeeRecords();
      setCoffeeRecords(records);
    } catch (error) {
      console.error("データの取得に失敗しました:", error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  // チェックボックスの選択状態を管理
  const toggleSelection = (id: string) => {
    setSelectedRecords((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // 選択されたレコードを削除
  const handleDeleteSelected = async () => {
    if (selectedRecords.length === 0) return;

    const message =
      selectedRecords.length === 1
        ? "このレコードを削除しますか？"
        : `選択した ${selectedRecords.length} 件のレコードを削除しますか？`;

    confirmDelete(message, async () => {
      try {
        for (const id of selectedRecords) {
          await CoffeeStorageService.deleteCoffeeRecord(id);
        }
        setSelectedRecords([]);
        await fetchData();
      } catch (error) {
        console.error("レコードの削除に失敗しました:", error);
      }
    });
  };

  // 単一レコードの削除
  const handleDeleteRecord = async (id: string) => {
    confirmDelete("このレコードを削除しますか？", async () => {
      try {
        await CoffeeStorageService.deleteCoffeeRecord(id);
        await fetchData();
      } catch (error) {
        console.error("レコードの削除に失敗しました:", error);
      }
    });
  };

  // 削除確認ダイアログを表示
  const confirmDelete = (message: string, onConfirm: () => void) => {
    if (Platform.OS === "web") {
      if (window.confirm(message)) {
        onConfirm();
      }
    } else {
      Alert.alert(
        "削除確認",
        message,
        [
          { text: "キャンセル", style: "cancel" },
          {
            text: "削除",
            style: "destructive",
            onPress: onConfirm,
          },
        ],
        { cancelable: false }
      );
    }
  };

  // 画像URIを環境に応じて適切に処理する関数
  const getImageSource = (uri?: string | null): ImageSourcePropType => {
    if (!uri) {
      return require("../../assets/images/no-image.png");
    }

    if (Platform.OS === "web") {
      // Base64形式かどうかをチェック
      if (uri.startsWith("data:image")) {
        return { uri };
      }
      // web環境でfileプロトコルは使用できないため、デフォルトの画像を表示
      return require("../../assets/images/no-image.png");
    } else {
      // モバイル環境の場合
      return { uri: uri.startsWith("file://") ? uri : `file://${uri}` };
    }
  };

  // レコードアイテムをレンダリング
  const renderCoffeeRecord = (record: CoffeeRecord) => {
    return (
      <View key={record.id} style={styles.wrapContainer}>
        <Checkbox
          value={selectedRecords.includes(record.id)}
          onValueChange={() => toggleSelection(record.id)}
          style={styles.checkbox}
        />

        <TouchableOpacity
          onPress={() => router.push({ pathname: `./item/${record.id}` })}
          style={styles.recordItemTouchable}
        >
          <View style={styles.recordItem}>
            {/* ヘッダー情報 */}
            <View style={styles.recordHeader}>
              <Text style={styles.recordTitle}>{record.name}</Text>
              <Image
                source={getImageSource(record.imageUri)}
                style={styles.recordImagePreview}
                defaultSource={require("../../assets/images/no-image.png")}
              />
            </View>

            {/* メイン情報 */}
            <View style={styles.recordMainInfo}>
              <View style={styles.infoColumn}>
                <InfoRow label="種類" value={record.variety} />
                <InfoRow label="産地" value={record.productionArea} />
                <InfoRow label="焙煎度" value={record.roastingDegree} />
                <InfoRow label="抽出器具" value={record.extractionMethod} />
                <InfoRow label="抽出メーカー" value={record.extractionMaker} />
              </View>

              <View style={styles.infoColumn}>
                <InfoRow label="挽き目" value={record.grindSize} />
                <InfoRow label="注湯温度" value={record.temperature} />
                <InfoRow label="粉量" value={record.coffeeAmount} />
                <InfoRow label="水量" value={record.waterAmount} />
                <InfoRow label="抽出時間" value={record.extractionTime} />
              </View>
            </View>

            {/* テイスティングノート */}
            <View style={styles.tastingSection}>
              <Text style={styles.sectionTitle}>テイスティングノート</Text>
              <View style={styles.tastingGrid}>
                <TastingValue label="酸味" value={record.acidity} />
                <TastingValue label="甘味" value={record.sweetness} />
                <TastingValue label="苦味" value={record.bitterness} />
                <TastingValue label="コク" value={record.body} />
                <TastingValue label="香り" value={record.aroma} />
                <TastingValue label="後味" value={record.aftertaste} />
              </View>
            </View>

            {/* レーダーチャート */}
            <View style={styles.radarChartContainer}>
              <Text style={styles.sectionTitle}>フレーバープロファイル</Text>
              <View style={styles.recordRadarChart}>
                <RadarChart
                  data={{
                    acidity: Number(record.acidity) || 0,
                    bitterness: Number(record.bitterness) || 0,
                    sweetness: Number(record.sweetness) || 0,
                    body: Number(record.body) || 0,
                    aroma: Number(record.aroma) || 0,
                    aftertaste: Number(record.aftertaste) || 0,
                  }}
                />
              </View>
            </View>

            {/* メモ */}
            {record.memo && (
              <View style={styles.memoContainer}>
                <Text style={styles.sectionTitle}>メモ</Text>
                <Text style={styles.memoText}>{record.memo}</Text>
              </View>
            )}

            {/* 削除ボタン */}
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteRecord(record.id)}
            >
              <Text style={styles.deleteButtonText}>削除</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  // 情報の行を表示するサブコンポーネント
  const InfoRow = ({
    label,
    value,
  }: {
    label: string;
    value: string | number;
  }) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );

  // テイスティング値を表示するサブコンポーネント
  const TastingValue = ({
    label,
    value,
  }: {
    label: string;
    value: string | number;
  }) => (
    <View style={styles.tastingItem}>
      <Text style={styles.tastingLabel}>{label}</Text>
      <View style={styles.tastingValueContainer}>
        <Text style={styles.tastingValue}>{value}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.contents}>
        <HeaderComponent />
        <PageTitleComponent TextData={"Coffee List"} />

        <View style={[styles.absoluteBox, styles.mainContents]}>
          <ScrollView
            style={{ flex: 1 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            }
          >
            <ScrollView
              horizontal={true}
              showsHorizontalScrollIndicator={true}
              contentContainerStyle={styles.innerScrollContainer}
            >
              <View style={styles.recordContainer}>
                {coffeeRecords.map(renderCoffeeRecord)}
              </View>
            </ScrollView>
          </ScrollView>

          {/* 一括削除ボタン */}
          {selectedRecords.length > 0 && (
            <TouchableOpacity
              style={styles.batchDeleteButton}
              onPress={handleDeleteSelected}
            >
              <Text style={styles.deleteButtonText}>
                {selectedRecords.length === 1
                  ? "1件のレコードを削除"
                  : `選択した ${selectedRecords.length} 件を削除`}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  contents: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  absoluteBox: {
    flex: 1,
    position: "absolute",
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
  },
  mainContents: {
    flex: 1,
    width: "100%",
    marginHorizontal: "auto",
    top: 210,
    bottom: 0,
  },
  innerScrollContainer: {
    flexDirection: "row",
    paddingVertical: 20,
  },
  recordContainer: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
    height: "auto",
    marginVertical: 20,
    justifyContent: "center",
  },
  wrapContainer: {
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 20,
    width: 350,
    margin: 10,
  },
  recordItemTouchable: {
    width: "100%",
  },
  recordItem: {
    width: "100%",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recordHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  recordTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#5D4037",
    marginBottom: 12,
    textAlign: "center",
  },
  recordImagePreview: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginVertical: 8,
    backgroundColor: "#F0F0F0",
  },
  recordMainInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  infoColumn: {
    flex: 1,
  },
  infoRow: {
    marginVertical: 4,
  },
  infoLabel: {
    fontSize: 14,
    color: "#A1887F",
    fontWeight: "500",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 1,
    color: "#333",
  },
  tastingSection: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#5D4037",
    marginBottom: 12,
    textAlign: "center",
  },
  tastingGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  tastingItem: {
    width: "30%",
    marginBottom: 12,
    alignItems: "center",
  },
  tastingLabel: {
    fontSize: 14,
    color: "#A1887F",
    marginBottom: 4,
  },
  tastingValueContainer: {
    width: 40,
    height: 40,
    backgroundColor: "#D7CCC8",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  tastingValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#5D4037",
  },
  radarChartContainer: {
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  recordRadarChart: {
    width: 250,
    height: 250,
    alignSelf: "center",
  },
  memoContainer: {
    marginBottom: 16,
  },
  memoText: {
    fontSize: 16,
    color: "#333",
    backgroundColor: "#F5F5F5",
    padding: 12,
    borderRadius: 8,
    lineHeight: 22,
  },
  checkbox: {
    marginBottom: 8,
    alignSelf: "flex-start",
    marginLeft: 8,
    width: 20,
    height: 20,
  },
  deleteButton: {
    backgroundColor: "#D32F2F",
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  batchDeleteButton: {
    backgroundColor: "#D32F2F",
    padding: 15,
    borderRadius: 8,
    marginVertical: 16,
    width: "80%",
    alignSelf: "center",
  },
  deleteButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
});
