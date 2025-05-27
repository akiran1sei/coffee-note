import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CoffeeRecord } from "../types/CoffeeTypes";
import * as FileSystem from "expo-file-system";
import { v4 as uuidv4 } from "uuid";

class CoffeeStorageService {
  private STORAGE_KEY = "@CoffeeRecords";
  private isWeb = Platform.OS === "web";

  // Web環境用のストレージヘルパー
  private async webSaveData(key: string, data: any): Promise<void> {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error("Webストレージ保存エラー:", error);
      throw error;
    }
  }

  private async webGetData(key: string): Promise<any> {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Webストレージ取得エラー:", error);
      return null;
    }
  }

  // Web環境での画像保存の改善
  private async webSaveImage(imageUri: string): Promise<string> {
    // Base64形式かどうかをチェック
    if (imageUri.startsWith("data:image")) {
      // Base64形式の画像はそのまま返す
      return imageUri;
    }

    // Web環境ではBase64またはURLをそのまま保存
    return imageUri;
  }
  // 新しいコーヒーレコードを保存
  async saveCoffeeRecord(
    record: Omit<CoffeeRecord, "id" | "createdAt">, // OmitにcreatedAtを追加
    imageUri: string
  ): Promise<string> {
    try {
      const id = uuidv4();
      const createdAt = new Date(); // 作成日時を取得

      let processedImageUri = null;
      if (imageUri) {
        if (this.isWeb) {
          processedImageUri = await this.webSaveImage(imageUri);
        } else {
          processedImageUri = await this.saveImage(imageUri, id);
        }
      }

      // 画像処理が失敗した場合のデフォルト値を設定
      const finalImageUri = processedImageUri || "default_image_path";

      const fullRecord: CoffeeRecord = {
        id,
        ...record,
        imageUri: finalImageUri,
        createdAt: createdAt, // 作成日時を追加
      };
      // 既存のレコードを取得
      let existingRecords: CoffeeRecord[] = [];

      if (this.isWeb) {
        const existingRecordsJson = await this.webGetData(this.STORAGE_KEY);
        existingRecords = existingRecordsJson || [];
      } else {
        const existingRecordsJson = await AsyncStorage.getItem(
          this.STORAGE_KEY
        );
        existingRecords = existingRecordsJson
          ? JSON.parse(existingRecordsJson)
          : [];
      }

      // 新しいレコードを追加
      const updatedRecords = [...existingRecords, fullRecord];

      // 更新されたレコードを保存
      if (this.isWeb) {
        await this.webSaveData(this.STORAGE_KEY, updatedRecords);
      } else {
        await AsyncStorage.setItem(
          this.STORAGE_KEY,
          JSON.stringify(updatedRecords)
        );
      }

      return id;
    } catch (error) {
      console.error("コーヒーレコードの保存中にエラーが発生しました:", error);
      throw error;
    }
  }

  // 画像をアプリのファイルシステムに保存 (モバイル環境用)
  private async saveImage(
    sourceUri: string,
    recordId: string
  ): Promise<string> {
    // ドキュメントディレクトリが存在することを確認
    const dirPath = `${FileSystem.documentDirectory}coffee_images/`;
    await FileSystem.makeDirectoryAsync(dirPath, { intermediates: true });

    // 一意のファイル名を生成
    const fileExtension = sourceUri.split(".").pop();
    const newImageUri = `${dirPath}${recordId}.${fileExtension}`;

    // 画像を新しい場所にコピー
    await FileSystem.copyAsync({ from: sourceUri, to: newImageUri });

    return newImageUri;
  }

  // すべてのコーヒーレコードを取得
  async getAllCoffeeRecords(): Promise<CoffeeRecord[]> {
    try {
      if (this.isWeb) {
        const records = await this.webGetData(this.STORAGE_KEY);
        return records || [];
      } else {
        const recordsJson = await AsyncStorage.getItem(this.STORAGE_KEY);
        return recordsJson ? JSON.parse(recordsJson) : [];
      }
    } catch (error) {
      console.error("コーヒーレコードの取得中にエラーが発生しました:", error);
      return [];
    }
  }

  // 特定のIDのレコードを取得
  async getCoffeeRecordById(id: string): Promise<CoffeeRecord | null> {
    try {
      const records = await this.getAllCoffeeRecords();
      return records.find((record) => record.id === id) || null;
    } catch (error) {
      console.error("コーヒーレコードの取得中にエラーが発生しました:", error);
      return null;
    }
  }

  // 既存のレコードを更新
  async updateCoffeeRecord(
    id: string,
    updatedRecord: Partial<CoffeeRecord>
  ): Promise<boolean> {
    try {
      const records = await this.getAllCoffeeRecords();
      const index = records.findIndex((record) => record.id === id);

      if (index !== -1) {
        records[index] = { ...records[index], ...updatedRecord };

        if (this.isWeb) {
          await this.webSaveData(this.STORAGE_KEY, records);
        } else {
          await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(records));
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error("コーヒーレコードの更新中にエラーが発生しました:", error);
      return false;
    }
  }

  // レコードを削除
  async deleteCoffeeRecord(id: string): Promise<boolean> {
    try {
      const records = await this.getAllCoffeeRecords();
      const recordToDelete = records.find((record) => record.id === id);
      const filteredRecords = records.filter((record) => record.id !== id);

      // 関連する画像があれば削除（モバイル環境のみ）
      if (
        !this.isWeb && // Web環境ではない
        recordToDelete?.imageUri && // imageUri が存在し
        recordToDelete.imageUri !== "default_image_path" && // デフォルトパスではない
        !recordToDelete.imageUri.startsWith("file://assets/")
      ) {
        try {
          // FileSystem.deleteAsync は 'file://' スキームを期待するので、必要なら付与
          const uriToDelete = recordToDelete.imageUri.startsWith("file://")
            ? recordToDelete.imageUri
            : `file://${recordToDelete.imageUri}`; // 例えば、file:// を付与する場合

          await FileSystem.deleteAsync(uriToDelete, {
            idempotent: true,
          });
          console.log(`画像を削除しました: ${uriToDelete}`);
        } catch (imageDeleteError) {
          // 画像の削除に失敗しても、レコードの削除は続行できるようにエラーをログに記録するだけにする
          console.warn(
            `画像の削除に失敗しました (${recordToDelete.imageUri}):`,
            imageDeleteError
          );
        }
      }

      if (this.isWeb) {
        await this.webSaveData(this.STORAGE_KEY, filteredRecords);
      } else {
        await AsyncStorage.setItem(
          this.STORAGE_KEY,
          JSON.stringify(filteredRecords)
        );
      }
      return true;
    } catch (error) {
      console.error("コーヒーレコードの削除中にエラーが発生しました:", error);
      return false;
    }
  }
  async searchCoffeeRecords(keyword: string): Promise<CoffeeRecord[]> {
    try {
      const allRecords = await this.getAllCoffeeRecords();
      if (!keyword) {
        return allRecords; // キーワードが空の場合はすべてのレコードを返す
      }
      const lowerCaseKeyword = keyword.toLowerCase();
      return allRecords.filter((record) =>
        record.name.toLowerCase().includes(lowerCaseKeyword)
      );
    } catch (error) {
      console.error("コーヒーレコードの検索中にエラーが発生しました:", error);
      return [];
    }
  }

  // 名前を除外したコーヒーレコードのソート関数
  async sortCoffeeRecordsWithoutName(
    criteria:
      | "acidity"
      | "bitterness"
      | "sweetness"
      | "body"
      | "aroma"
      | "aftertaste"
      | "createdAt",
    order: "asc" | "desc" = "asc"
  ): Promise<CoffeeRecord[]> {
    try {
      const allRecords = await this.getAllCoffeeRecords();

      return allRecords.sort((a, b) => {
        let comparison = 0;

        switch (criteria) {
          case "acidity":
            comparison = (a.acidity || 0) - (b.acidity || 0);
            break;
          case "bitterness":
            comparison = (a.bitterness || 0) - (b.bitterness || 0);
            break;
          case "sweetness":
            comparison = (a.sweetness || 0) - (b.sweetness || 0);
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
          default:
            break;
        }

        return order === "asc" ? comparison : -comparison;
      });
    } catch (error) {
      console.error("コーヒーレコードのソート中にエラーが発生しました:", error);
      return [];
    }
  }

  // 名前を除外した検索とソートを組み合わせた関数
  async searchAndSortCoffeeRecordsWithoutName(
    keyword?: string,
    sortCriteria?:
      | "acidity"
      | "bitterness"
      | "sweetness"
      | "body"
      | "aroma"
      | "aftertaste"
      | "createdAt",
    sortOrder: "asc" | "desc" = "asc"
  ): Promise<CoffeeRecord[]> {
    try {
      let records;
      if (keyword) {
        records = await this.searchCoffeeRecords(keyword);
      } else {
        records = await this.getAllCoffeeRecords();
      }

      if (sortCriteria) {
        return records.sort((a, b) => {
          let comparison = 0;

          switch (sortCriteria) {
            case "acidity":
              comparison = (a.acidity || 0) - (b.acidity || 0);
              break;
            case "bitterness":
              comparison = (a.bitterness || 0) - (b.bitterness || 0);
              break;
            case "sweetness":
              comparison = (a.sweetness || 0) - (b.sweetness || 0);
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
            default:
              break;
          }

          return sortOrder === "asc" ? comparison : -comparison;
        });
      }

      return records;
    } catch (error) {
      console.error(
        "コーヒーレコードの検索とソート中にエラーが発生しました:",
        error
      );
      return [];
    }
  }
}

export default new CoffeeStorageService();
