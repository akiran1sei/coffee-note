// babel.config.js
module.exports = function (api) {
  api.cache(true); // Babel のキャッシュを有効にします

  return {
    presets: [
      "babel-preset-expo", // Expo アプリの基本的なBabel設定（expo-router機能も含まれています）
    ],
    plugins: [
      // 他のプラグインがあればここに追加

      // ======== expo-router/babel は削除（babel-preset-expoに統合されました） ========
      // "expo-router/babel", // ← この行を削除またはコメントアウト
      // ======== SDK 50以降は不要 ========

      // もし module-resolver を使っている場合はここに追加
      [
        "module-resolver",
        {
          alias: {
            "@": "./", // あなたのエイリアス設定
          },
          extensions: [
            ".js",
            ".jsx",
            ".ts",
            ".tsx",
            ".android.js",
            ".android.tsx",
            ".ios.js",
            ".ios.tsx",
          ],
        },
      ],
    ],
  };
};
