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
    record: Omit<CoffeeRecord, "id">,
    imageUri: string
  ): Promise<string> {
    try {
      const id = uuidv4();

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
      if (!this.isWeb && recordToDelete?.imageUri) {
        await FileSystem.deleteAsync(recordToDelete.imageUri, {
          idempotent: true,
        });
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
}

export default new CoffeeStorageService();
