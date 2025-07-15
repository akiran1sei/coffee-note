import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Text,
  View,
  Image,
  StyleSheet,
  ImageSourcePropType,
  RefreshControl,
  TouchableOpacity,
  Alert,
  ScrollView,
  FlatList,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { useRouter } from "expo-router";
import HeaderComponent from "../../components/HeaderComponent";
import PageTitleComponent from "../../components/PageTitleComponent";
import CoffeeStorageService from "../../services/CoffeeStorageService";
import { CoffeeRecord } from "../../types/CoffeeTypes";
import { LoadingComponent } from "@/components/MessageComponent";
import RadarChart from "../../components/RadarChart/RadarChart";
import Checkbox from "expo-checkbox";
import SearchComponent from "../../components/button/Search";
import SortComponent from "@/components/button/Sort";
import { GlobalStyles } from "../styles/GlobalStyles";
import UpperButton from "@/components/button/Upper";
import { GestureHandlerRootView } from "react-native-gesture-handler";
// 画面サイズを取得
const { width: screenWidth } = Dimensions.get("window");
export default function ListScreen() {
  const router = useRouter();
  // ローディング状態管理: 初期値を true に
  const [loading, setLoading] = useState(true);
  // 元の全データ
  const [allCoffeeRecords, setAllCoffeeRecords] = useState<CoffeeRecord[]>([]);
  // 表示するデータ (検索・ソート結果)
  const [displayedCoffeeRecords, setDisplayedCoffeeRecords] = useState<
    CoffeeRecord[]
  >([]);
  // チェックボックス選択状態
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  // プルツーリフレッシュの状態
  const [refreshing, setRefreshing] = useState(false);
  // 不要な State を削除: const [coffeeRecords, setCoffeeRecords] = useState<CoffeeRecord[]>([]);
  const [showScrollToTopButton, setShowScrollToTopButton] = useState(false);
  // データの取得と State 更新
  const fetchData = useCallback(async () => {
    try {
      setLoading(true); // データ取得開始時にローディングを true に
      const records = await CoffeeStorageService.getAllCoffeeRecords();
      setAllCoffeeRecords(records);
      setDisplayedCoffeeRecords(records); // 最初はすべてのデータを表示
    } catch (error) {
      console.error("データの取得に失敗しました:", error);
    } finally {
      setLoading(false); // データ取得完了後にローディングを解除
    }
  }, []); // useCallback を使用して関数をメモ化

  // コンポーネントマウント時にデータを読み込む
  useEffect(() => {
    fetchData(); // useCallback でメモ化した関数を呼び出す
  }, [fetchData]); // 依存配列に fetchData を追加 (useCallback を使っているので実質的には初回のみ実行)

  // SearchComponent から検索結果を受け取るハンドラー
  const handleSearch = useCallback(
    (results: CoffeeRecord[]) => {
      console.log("検索結果:", results);
      setDisplayedCoffeeRecords(results); // 検索結果で表示するデータを更新
    },
    [] // useCallback を使用して関数をメモ化
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData(); // fetchData は既に loading を制御するのでここでは不要
    setRefreshing(false);
  }, [fetchData]); // 依存配列に fetchData を追加

  // チェックボックスの選択状態を管理
  const toggleSelection = useCallback((id: string) => {
    setSelectedRecords((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []); // useCallback を使用して関数をメモ化

  // 選択されたレコードを削除
  const handleDeleteSelected = useCallback(async () => {
    if (selectedRecords.length === 0) return;

    const message =
      selectedRecords.length === 1
        ? "このレコードを削除しますか？"
        : `選択した ${selectedRecords.length} 件のレコードを削除しますか？`;

    confirmDelete(message, async () => {
      try {
        setLoading(true); // 削除処理開始時にローディング
        for (const id of selectedRecords) {
          await CoffeeStorageService.deleteCoffeeRecord(id);
        }
        setSelectedRecords([]);
        await fetchData(); // データ再取得
      } catch (error) {
        console.error("レコードの削除に失敗しました:", error);
      } finally {
        setLoading(false); // 削除処理完了後にローディング解除
      }
    });
  }, [selectedRecords, fetchData]); // 依存配列に selectedRecords と fetchData を追加

  // 単一レコードの削除
  const handleDeleteRecord = useCallback(
    async (id: string) => {
      confirmDelete("このレコードを削除しますか？", async () => {
        try {
          setLoading(true); // 削除処理開始時にローディング
          await CoffeeStorageService.deleteCoffeeRecord(id);
          await fetchData(); // データ再取得
        } catch (error) {
          console.error("レコードの削除に失敗しました:", error);
        } finally {
          setLoading(false); // 削除処理完了後にローディング解除
        }
      });
    },
    [fetchData]
  ); // 依存配列に fetchData を追加

  // 削除確認ダイアログを表示
  const confirmDelete = useCallback(
    (message: string, onConfirm: () => void) => {
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
    },
    [] // useCallback を使用して関数をメモ化
  );

  // 画像URIを環境に応じて適切に処理する関数
  const getImageSource = useCallback(
    (uri?: string | null): ImageSourcePropType => {
      // URI がない場合はデフォルト画像
      if (!uri) {
        return require("../../assets/images/no-image.png");
      }
      // モバイル環境で file:// が付いていなければ追加
      if (!uri.startsWith("file://")) {
        return { uri: `file://${uri}` };
      }

      return { uri }; // その他の場合はそのまま URI を使用
    },
    []
  );
  // レコードアイテムをレンダリングする関数
  // この関数自体は useCallback で囲む必要はないが、
  // FlatList の renderItem に渡す場合は、FlatList の最適化のために
  // ItemSeparatorComponent など他の要素との組み合わせで検討する
  const renderCoffeeRecord = ({ item: record }: { item: CoffeeRecord }) => {
    // 各アイテムのレンダリングロジックはほぼそのまま
    console.log("Rendering record:", record.self);
    return (
      // key は FlatList が自動で付与するため、ここでは不要
      <View style={styles.wrapContainer}>
        <Checkbox
          value={selectedRecords.includes(record.id)}
          onValueChange={() => toggleSelection(record.id)}
          style={styles.checkbox}
        />

        <TouchableOpacity
          onPress={() => {
            const pathname = "/item/[id]";

            // router オブジェクトが変更されない限り useCallback は不要だが、念のため
            router.replace({ pathname: pathname, params: { id: record.id } });
          }}
          style={styles.recordItemTouchable}
        >
          <View style={styles.recordItem}>
            {/* ヘッダー情報 */}
            <View style={styles.recordHeader}>
              <Text style={styles.recordTitle}>{record.name}</Text>
              {/* Image コンポーネントの source を getImageSource で取得 */}
              <Image
                source={getImageSource(record.imageUri)}
                style={styles.recordImagePreview}
                defaultSource={require("../../assets/images/no-image.png")}
              />
            </View>

            {/* メイン情報 */}
            <View style={styles.recordMainInfo}>
              <View style={styles.infoColumn}>
                <InfoRow
                  label="Self/Shop"
                  value={record.self ? "自分" : "お店"}
                />
                <InfoRow label="産地" value={record.productionArea} />
                {record.self ? (
                  <>
                    <InfoRow label="種類" value={record.variety} />
                    <InfoRow label="焙煎度" value={record.roastingDegree} />
                    <InfoRow label="抽出器具" value={record.extractionMethod} />
                    <InfoRow label="抽出器具" value={record.extractionMaker} />
                  </>
                ) : (
                  <>
                    <InfoRow label="店名" value={record.shopName} />
                    <InfoRow
                      label="店の価格"
                      value={
                        record.shopPrice ? `${record.shopPrice}円` : "不明"
                      }
                    />
                  </>
                )}
              </View>

              <View style={styles.infoColumn}>
                {record.self ? (
                  <>
                    <InfoRow label="挽き目" value={record.grindSize} />
                    <InfoRow label="注湯温度" value={record.temperature} />
                    <InfoRow label="粉量" value={record.coffeeAmount} />
                    <InfoRow
                      label={`水量(${record.measurementMethod})`}
                      value={record.waterAmount}
                    />
                    <InfoRow label="抽出時間" value={record.extractionTime} />
                  </>
                ) : null}
              </View>
            </View>

            {/* テイスティングノート */}
            <View style={styles.tastingSection}>
              <Text style={GlobalStyles.sectionTitle}>
                テイスティングノート
              </Text>
              <View style={styles.tastingGrid}>
                <TastingValue label="酸味" value={record.acidity} />
                <TastingValue label="コク" value={record.body} />
                <TastingValue label="香り" value={record.aroma} />
                <TastingValue label="苦味" value={record.bitterness} />
                <TastingValue label="キレ" value={record.aftertaste} />
                <TastingValue label="全体の好み" value={record.overall} />
              </View>
            </View>

            {/* レーダーチャート - パフォーマンスへの影響が大きい可能性 */}
            {/* 検討: アイテム数が多い場合、一覧では非表示にするか、軽量な表示にする */}
            <View style={styles.radarChartContainer}>
              <Text style={GlobalStyles.sectionTitle}>
                フレーバープロファイル
              </Text>
              <View style={styles.recordRadarChart} pointerEvents="none">
                <RadarChart
                  data={{
                    acidity: Number(record.acidity) || 0,
                    bitterness: Number(record.bitterness) || 0,
                    body: Number(record.body) || 0,
                    aroma: Number(record.aroma) || 0,
                    aftertaste: Number(record.aftertaste) || 0,
                  }}
                />
              </View>
            </View>

            {/* メモ */}

            <View style={styles.memoContainer}>
              <Text style={GlobalStyles.sectionTitle}>メモ</Text>
              {record.memo && (
                <Text style={styles.memoText}>{record.memo}</Text>
              )}
            </View>

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
  const scrollViewRef = useRef<ScrollView>(null);
  //  スクロールイベントハンドラ
  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const scrollY = event.nativeEvent.contentOffset.y;
      // 例えば、200pxスクロールしたらボタンを表示する
      if (scrollY > 200 && !showScrollToTopButton) {
        setShowScrollToTopButton(true);
      } else if (scrollY <= 200 && showScrollToTopButton) {
        setShowScrollToTopButton(false);
      }
    },
    [showScrollToTopButton]
  );

  // handleSort 関数
  const handleSort = useCallback((sortedRecords: CoffeeRecord[]) => {
    // 表示用のデータを更新
    setDisplayedCoffeeRecords(sortedRecords);
  }, []); // useCallback を使用して関数をメモ化

  // 不要な loadCoffeeRecords 関数とその State を削除

  // 情報行を表示するサブコンポーネント (Memo化してパフォーマンス向上を試みる)
  const InfoRow = React.memo(
    ({ label, value }: { label: string; value: string | number | boolean }) => (
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    )
  );

  // テイスティング値を表示するサブコンポーネント (Memo化してパフォーマンス向上を試みる)
  const TastingValue = React.memo(
    ({ label, value }: { label: string; value: string | number }) => {
      if (!(label === "全体の好み")) {
        return (
          <View style={styles.tastingItem}>
            <Text style={styles.tastingLabel}>{label}</Text>
            <View style={styles.tastingValueContainer}>
              <Text style={styles.tastingValue}>{value}</Text>
            </View>
          </View>
        );
      } else {
        return (
          <View style={styles.tastingItem}>
            <Text style={styles.tastingLabel}>{label}</Text>
            <View style={styles.tastingOverallValueContainer}>
              <Text style={styles.tastingOverallValue}>{value}</Text>
            </View>
          </View>
        );
      }
      return null;
    }
  );

  if (loading) {
    // ローディング中は LoadingComponent を表示
    return <LoadingComponent />;
  } else {
    // ローディング完了後にメインコンテンツを表示
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={[GlobalStyles.container, styles.listContainer]}>
          <View style={GlobalStyles.contents}>
            <HeaderComponent />
            <PageTitleComponent TextData={"Coffee List"} />

            <View style={[GlobalStyles.absoluteBox, GlobalStyles.mainContents]}>
              <View style={styles.subMenuBox}>
                {/* SearchComponent には allCoffeeRecords を渡す */}
                <SearchComponent
                  initialData={allCoffeeRecords}
                  onSearch={handleSearch}
                />
                {/* SortComponent には allCoffeeRecords を渡して、ソート結果を handleSort で受け取る */}
                <SortComponent
                  onSort={handleSort}
                  records={allCoffeeRecords} // ソートは常に元の全データに対して行う
                />
              </View>
              {/* FlatList に置き換え */}
              <ScrollView
                ref={scrollViewRef}
                onScroll={handleScroll} //  スクロールイベントを監視
                scrollEventThrottle={16}
              >
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
                <FlatList
                  data={displayedCoffeeRecords}
                  renderItem={renderCoffeeRecord}
                  keyExtractor={(item) => item.id}
                  horizontal={true}
                  style={styles.horizontalList} // 専用のスタイルを適用
                  contentContainerStyle={styles.flatListContentContainer}
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={handleRefresh}
                    />
                  }
                  removeClippedSubviews={true}
                  maxToRenderPerBatch={5}
                  updateCellsBatchingPeriod={50}
                  windowSize={5}
                  showsHorizontalScrollIndicator={false}
                  snapToAlignment="start" // スナップ効果を追加（オプション）
                  decelerationRate="fast" // 速い減速率（オプション）
                  snapToInterval={370} // カードの幅+マージン（オプション）
                />
              </ScrollView>
              {displayedCoffeeRecords.length > 0 && (
                <UpperButton
                  scrollViewRef={scrollViewRef}
                  isVisible={showScrollToTopButton}
                />
              )}
            </View>
          </View>
        </View>
      </GestureHandlerRootView>
    );
  }
}

const styles = StyleSheet.create({
  listContainer: {
    backgroundColor: "#F5F5F5",
  },

  subMenuBox: {
    marginVertical: 10,
    flexDirection: "column",
    justifyContent: "space-around",
    alignItems: "center",
    height: "100%",
    maxHeight: 120, // 一定の高さを設定
    // 必要に応じて paddingHorizontal などを調整
  },

  // 横スクロールリスト専用スタイル
  horizontalList: {
    flexGrow: 0,
    height: "100%", // カードの高さに合わせて調整
    width: "100%",
  },

  // FlatListのコンテンツコンテナスタイル
  flatListContentContainer: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    paddingBottom: 10,
    alignItems: "flex-start",
  },

  // カードのコンテナスタイル
  wrapContainer: {
    flexDirection: "column",
    alignItems: "center",
    width: 350,
    marginHorizontal: 10,
    height: "100%", // カードの高さを固定
  },

  // カード自体のスタイル
  recordItem: {
    width: "100%",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    shadowColor: "#333",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    height: "auto", // 最大高さを設定
  },

  // 画像のサイズを調整
  recordImagePreview: {
    width: 150, // 小さくする
    height: 150, // 小さくする
    borderRadius: 10,
    marginVertical: 5,
    backgroundColor: "#F0F0F0",
  },

  // メイン情報領域をコンパクトに
  recordMainInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5, // 余白を減らす
    paddingBottom: 5, // 余白を減らす
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },

  // レーダーチャートのコンテナ
  radarChartContainer: {
    alignItems: "center",
    marginBottom: 5, // 余白を減らす
    paddingBottom: 5, // 余白を減らす
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    height: "auto", // 高さを固定
  },

  // レーダーチャート自体
  recordRadarChart: {
    width: "100%",
    height: "auto", // 高さを固定
    alignSelf: "center",
  },

  // メモコンテナ
  memoContainer: {
    marginBottom: 5, // 余白を減らす
    width: "100%",
    height: 150, // 最大高さを制限
  },

  // メモテキスト
  memoText: {
    fontSize: 14, // 小さくする
    color: "#333",
    backgroundColor: "#F5F5F5",
    padding: 5, // パディングを減らす
    borderRadius: 8,
    lineHeight: 20, // 行間を詰める
  },

  recordItemTouchable: {
    width: "100%", // wrapContainer の幅いっぱいに広げる
    flexDirection: "column",
  },
  recordHeader: {
    alignItems: "center",
    marginBottom: 10,
  },
  recordTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#5D4037",
    marginBottom: 10,
    textAlign: "center",
  },

  infoColumn: {
    flex: 1,
  },
  infoRow: {
    marginVertical: 5,
  },
  infoLabel: {
    fontSize: 16,
    color: "#A1887F",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 18,
    color: "#333",
  },
  tastingSection: {
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },

  tastingGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  tastingItem: {
    width: "30%", // 3列表示
    marginBottom: 10,
    alignItems: "center",
  },
  tastingLabel: {
    fontSize: 16,
    color: "#A1887F",
  },
  tastingValueContainer: {
    width: 40,
    height: 40,
    backgroundColor: "#D7CCC8",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5, // ラベルとの間に少し余白
  },
  tastingOverallValueContainer: {
    width: 40,
    height: 40,
    backgroundColor: "#D2B48C",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5, // ラベルとの間に少し余白
  },
  tastingValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#5D4037",
  },
  tastingOverallValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#f0f0f0",
  },
  checkbox: {
    marginBottom: 5,
    alignSelf: "flex-start", // wrapContainer 内で左寄せ
    marginLeft: 5,
    width: 20,
    height: 20,
  },
  deleteButton: {
    width: "100%", // wrapContainer の幅に合わせる
    backgroundColor: "#D32F2F",
    borderRadius: 8,
    marginTop: 10, // アイテムの他の部分との間に余白
    alignItems: "center",
    marginHorizontal: "auto",
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  batchDeleteButton: {
    backgroundColor: "#D32F2F",
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    width: "80%",
    alignSelf: "center",
    alignItems: "center", // テキスト中央揃え
  },
  deleteButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
});

// Memo化されたサブコンポーネントをエクスポート (もし別のファイルにある場合)
// export { InfoRow, TastingValue };
