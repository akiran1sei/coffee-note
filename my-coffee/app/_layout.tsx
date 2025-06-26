// _layout.tsx
import { Stack } from "expo-router";
import React from "react";

export default function RootLayout() {
  return (
    <Stack>
      {/*
        Home画面（index）はヘッダーを非表示のまま。
        （もしHome画面にもヘッダーが必要で、そこから戻る機能がある場合は
        optionsを調整してください）
      */}
      <Stack.Screen name="index" options={{ headerShown: false }} />

      {/*
        以下の画面でヘッダーを表示し、戻るボタンのアイコンのみ表示
        - title: 各画面のタイトルを表示
        - headerBackVisible: true (戻るアイコンを表示)
        - headerBackTitleVisible: false (戻るボタンの文字を非表示 - iOSに影響)
      */}
      <Stack.Screen
        name="(tabs)/list"
        options={{
          title: "リスト", // この画面のタイトル
          headerBackVisible: true,
        }}
      />
      <Stack.Screen
        name="(tabs)/create"
        options={{
          title: "新規作成", // この画面のタイトル
          headerBackVisible: true,
        }}
      />
      <Stack.Screen
        name="(tabs)/item/[id]"
        options={{
          title: "詳細", // 詳細画面のタイトル
          headerBackVisible: true,
        }}
      />
      <Stack.Screen
        name="(tabs)/settings/PrivacyPolicyJP"
        options={{
          title: "プライバシーポリシー", // プライバシーポリシー画面のタイトル
          headerBackVisible: true,
        }}
      />
      <Stack.Screen
        name="(tabs)/settings/TermsAndConditionsJP"
        options={{
          title: "利用規約", // 利用規約画面のタイトル
          headerBackVisible: true,
        }}
      />
      <Stack.Screen
        name="(tabs)/update/[id]"
        options={{
          title: "編集", // 編集画面のタイトル
          headerBackVisible: true,
        }}
      />
    </Stack>
  );
}
