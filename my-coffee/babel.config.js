// babel.config.js
module.exports = function (api) {
  api.cache(true); // Babel のキャッシュを有効にします

  return {
    presets: [
      // Expo を使っている場合、通常は 'babel-preset-expo' を使います
      "babel-preset-expo",
      // もし Expo を使っておらず、React Native CLI のみの場合、
      // 'module:metro-react-native-babel-preset' を使うかもしれません
    ],
    plugins: [
      // ここに 'module-resolver' プラグインを追加します
      [
        "module-resolver",
        {
          alias: {
            // ここでエイリアスのマッピングを定義します
            // あなたの tsconfig.json の設定に合わせてください
            // tsconfig.json で "@/*": ["./*"] となっているので、
            // "@" がプロジェクトのルートディレクトリを指すように設定します。
            "@": "./",

            // 例: もし src ディレクトリをエイリアスにしたい場合は以下のようになります
            // '~': './src', // '~/' で src ディレクトリを参照
          },
          // 以下の拡張子も解決するように指定することが推奨されます
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
      // もし expo-router を使用している場合は、このプラグインも必要です
      // 'expo-router/babel',
    ],
  };
};
