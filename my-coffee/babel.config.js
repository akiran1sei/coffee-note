// babel.config.js
module.exports = function (api) {
  api.cache(true); // Babel のキャッシュを有効にします

  return {
    presets: [
      "babel-preset-expo", // Expo アプリの基本的なBabel設定
    ],
    plugins: [
      // 他のプラグインがあればここに追加

      // ======== ここから expo-router/babel の設定 ========
      "expo-router/babel",
      // ======== ここまで expo-router/babel の設定 ========

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
