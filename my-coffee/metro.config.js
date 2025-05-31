const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// アセットの拡張子を明示的に指定
config.resolver.assetExts.push(
  // 画像形式
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
  "bmp",
  "svg"
);

// JavaScriptの拡張子も明示的に指定（必要に応じて）
config.resolver.sourceExts.push("js", "jsx", "ts", "tsx", "json");

// アセットの変換設定
config.transformer = {
  ...config.transformer,
  // アセットファイルの処理を改善
  assetRegistryPath: "react-native/Libraries/Image/AssetRegistry",
};

// キャッシュ設定（開発時のトラブル回避）
config.resetCache = true;

module.exports = config;
