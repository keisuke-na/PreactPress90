---
title: "MCP ServerをnpmパッケージとしてClaude Codeで使う方法"
date: "2025-09-28"
slug: "mcp-server-npm-claude-code"
author: "keisuke-na"
tags: ["TypeScript", "MCP", "Claude", "npm"]
---

# MCP ServerをnpmパッケージとしてClaude Codeで使う方法

Model Context Protocol (MCP) サーバーをnpmパッケージとして公開し、Claude Code CLIで使えるようにするまでの実装と、遭遇した問題の解決方法を共有します。

## MCPサーバーとは

MCPは、LLMに外部ツールやデータソースへの標準化されたアクセスを提供するプロトコルです。今回は営業日計算を行うMCPサーバーを実装しました。

## 実装のポイント

### 1. 基本構造

```typescript
#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new McpServer({
  name: "Business Days Until Server",
  version: "1.0.0",
});

// ツールの登録
server.tool('business_days_until', {
  // パラメータ定義
}, async (params) => {
  // 処理実装
});

const transport = new StdioServerTransport();
await server.connect(transport);  // 重要：awaitが必要
```

### 2. package.json の設定

```json
{
  "name": "mcp-business-days-until",
  "version": "1.0.4",
  "type": "module",
  "main": "dist/main.js",
  "bin": {
    "mcp-business-days-until": "dist/main.js"
  },
  "files": ["dist/"],
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.18.2",
    "zod": "^3.25.76"
  }
}
```

## 遭遇した問題と解決策

### 問題1：スコープ付きパッケージ名での実行エラー

最初は `@keisuke-na/mcp-business-days-until` というスコープ付きの名前で公開しました。

**問題**: npxでスコープ付きパッケージを実行すると、バイナリ名とパッケージ名の不一致でエラーが発生
```bash
sh: mcp-business-days-until: command not found
```

**解決策**: スコープを削除し、シンプルな名前 `mcp-business-days-until` に変更

### 問題2：サーバープロセスの即座終了

**問題**: `void server.connect(transport)` としていたため、プロセスがすぐに終了

**解決策**: `await server.connect(transport)` で適切に接続を待機

### 問題3：Claude Code CLIでの引数指定

**問題**: 以下のコマンドでは "Failed to connect" エラー
```bash
claude mcp add business-days "npx -y mcp-business-days-until"
```

**解決策**: `--` を使って引数を分離
```bash
claude mcp add business-days npx -- -y mcp-business-days-until
```

## Claude Codeでの動作原理

1. **起動時**: Claude Codeが設定されたコマンドを実行してMCPサーバーを起動
2. **通信**: stdio（標準入出力）経由でJSON-RPCプロトコルで通信
3. **待機**: MCPサーバーは長時間実行プロセスとして動作
4. **リクエスト処理**: 必要時にClaude Codeからのリクエストを処理

## まとめ

MCPサーバーのnpmパッケージ化で重要なポイント：

- **シンプルなパッケージ名**を使用（スコープなし）
- **awaitで接続を待機**してプロセスを維持
- **Claude Code CLIの引数は`--`で分離**
- **shebang行**（`#!/usr/bin/env node`）を忘れずに
- **stdio transport**で標準入出力通信を実装

これらのポイントを押さえることで、他のユーザーも簡単にインストールして使えるMCPサーバーを提供できます。

## 実行例

Claude Codeで実際に実行した様子：

![MCPサーバー実行例](/PreactPress90/images/mcp-business-days-example.png)

## 関連リンク

- [npmパッケージ: mcp-business-days-until](https://www.npmjs.com/package/mcp-business-days-until)
- [GitHubリポジトリ](https://github.com/keisuke-na/mcp-business-days-until)
- [Model Context Protocol公式ドキュメント](https://modelcontextprotocol.io/)
