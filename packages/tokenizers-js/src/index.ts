import wasmInit from 'tokenizers-wasm'

// 根据运行环境动态导入 WASM
async function init() {
  if (typeof window !== 'undefined') {
    // 浏览器环境
    await wasmInit()
  } else {
    // Node.js 环境
    const wasmPath = new URL('./tokenizers_wasm_bg.wasm', import.meta.url)
    await wasmInit(wasmPath)
  }
}

export * from 'tokenizers-wasm'
export { init }