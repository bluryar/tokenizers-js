# @bluryar/tokenizers-js

基于 [HuggingFace Tokenizers](https://github.com/huggingface/tokenizers) 的JavaScript封装,使用WebAssembly实现高性能的文本标记化功能。

## 功能特点

- 使用Rust和WebAssembly实现高性能文本标记化
- 支持浏览器环境
- 提供完整的TypeScript类型定义
- 支持批量编码和解码

## 安装

```bash
npm install @bluryar/tokenizers-js
# 或
pnpm add @bluryar/tokenizers-js
# 或
yarn add @bluryar/tokenizers-js
```

## 使用方法

```typescript
import { init, TokenizerWrapper } from '@bluryar/tokenizers-js'

// 初始化WASM
await init()

// 创建tokenizer实例
const config = await fetch('path/to/tokenizer.json').then(r => r.text())
const tokenizer = new TokenizerWrapper(config)

// 编码文本
const encoding = await tokenizer.encode('Hello, world!', true)
console.log(encoding.tokens)    // 获取分词结果
console.log(encoding.ids)       // 获取token ID

// 解码
const text = await tokenizer.decode(encoding.ids, true)
console.log(text)              // 'Hello, world!'
```

## API 文档

### TokenizerWrapper

主要的tokenizer封装类,提供以下方法:

#### encode(text: string, addSpecialTokens: boolean): Promise<EncodingWrapper>
将文本编码为token。
- `text`: 输入文本
- `addSpecialTokens`: 是否添加特殊token
- 返回: 包含编码结果的EncodingWrapper对象

#### encodeBatch(texts: string[], addSpecialTokens: boolean): Promise<EncodingWrapper[]>
批量编码多个文本。
- `texts`: 输入文本数组
- `addSpecialTokens`: 是否添加特殊token
- 返回: EncodingWrapper对象数组

#### decode(ids: number[], skipSpecialTokens: boolean): Promise<string>
将token ID解码为文本。
- `ids`: token ID数组
- `skipSpecialTokens`: 是否跳过特殊token
- 返回: 解码后的文本

#### decodeBatch(sentences: number[][], skipSpecialTokens: boolean): Promise<string[]>
批量解码多组token ID。
- `sentences`: token ID二维数组
- `skipSpecialTokens`: 是否跳过特殊token
- 返回: 解码后的文本数组

### EncodingWrapper

编码结果的包装类,提供以下属性:

- `tokens`: string[] - 分词结果
- `ids`: Uint32Array - token ID
- `typeIds`: Uint32Array - token类型ID
- `wordIds`: (number | null)[] - 词ID
- `offsets`: [number, number][] - token在原文中的位置偏移
- `specialTokensMask`: Uint32Array - 特殊token掩码
- `attentionMask`: Uint32Array - 注意力掩码

## 浏览器兼容性

- 需要支持WebAssembly的现代浏览器
- 推荐使用Chrome 57+、Firefox 52+、Safari 11+、Edge 16+

## 开发指南

1. 克隆仓库:
```bash
git clone https://github.com/bluryar/tokenizers-js.git
cd tokenizers-js
```

2. 安装依赖:
```bash
# 构建wasm
wasm-pack build --target web --out-dir packages/tokenizers-wasm
pnpm install
```

3. 构建:
```bash
pnpm build
```