---
title: "macOSアプリでフルスクリーン上にオーバーレイを表示する方法"
date: "2025-09-29"
slug: "textoverlay-fullscreen-fix"
author: "keisuke-na"
tags: ["Swift", "macOS", "NSPanel", "SwiftUI"]
---

# macOSアプリでフルスクリーン上にオーバーレイを表示する方法

Google Meetのプレゼン中にコメントと紙吹雪エフェクトを表示するmacOSアプリ「TextOverlay」で、フルスクリーンモードでエフェクトが表示されない問題を解決した話です。

## 問題：フルスクリーンで消える紙吹雪

通常のウィンドウモードでは正常に表示される紙吹雪とコメントが、Google Slidesをフルスクリーンにすると表示されなくなる問題に遭遇しました。

## 原因：NSWindowの限界

当初は`NSWindow`を使用していましたが、macOSではセキュリティの観点から、通常のウィンドウはフルスクリーンアプリの上に表示できません。

## 解決策：NSPanelの活用

### NSPanelとNSWindowの違い

- **NSPanel**: 補助的なウィンドウ用（ツールパレット、インスペクタ）
- **NSWindow**: メインコンテンツ表示用

NSPanelは`nonactivatingPanel`スタイルでフォーカスを奪わないため、プレゼン中でも安全に使用できます。

### 実装コード

```swift
// NSPanelでオーバーレイウィンドウを作成
let panel = NSPanel(
    contentRect: NSScreen.main?.frame ?? .zero,
    styleMask: [.borderless, .nonactivatingPanel],
    backing: .buffered,
    defer: false
)

// フルスクリーンより上に表示
panel.level = NSWindow.Level(rawValue: Int(CGWindowLevelForKey(.mainMenuWindow)))

// 全てのSpaceで表示
panel.collectionBehavior = [.canJoinAllSpaces, .fullScreenAuxiliary]

// クリックスルー（下のウィンドウを操作可能に）
panel.ignoresMouseEvents = true
```

## 紙吹雪エフェクトの改善

ついでに紙吹雪エフェクトも改善しました：

- 発射位置を画面下部の4箇所に固定
- 色を赤系・黄色系・青系・紫系からランダムに選択
- 垂直方向への統一された発射

## まとめ

フルスクリーンアプリケーションの上にオーバーレイを表示するには、NSPanelと適切なウィンドウレベル、コレクション動作の設定が重要です。この方法により、プレゼンテーションツールとして実用的なアプリになりました。

## 参考リンク

- [TextOverlay - GitHub](https://github.com/keisuke-na/TextOverlay)