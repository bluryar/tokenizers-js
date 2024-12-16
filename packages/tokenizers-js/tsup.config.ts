import { defineConfig } from 'tsup'
import { copyFile, mkdir, readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { fileURLToPath } from 'url'

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: {
        // 启用类型定义文件的打包
        entry: './src/index.ts',
        // 可以指定要包含的额外类型定义
        resolve: true,
    },
    clean: true,
    sourcemap: true,
    treeshake: true,
    bundle: true,
    platform: 'browser',
    noExternal: ['tokenizers-wasm'],
    async onSuccess() {
        // await sleep(1000)
        
        const files = [
            'tokenizers_wasm_bg.wasm',
            'tokenizers_wasm.d.ts',
            'tokenizers_wasm_bg.wasm.d.ts'
        ]

        const wasmDir = join(__dirname, '../tokenizers-wasm')
        const destDir = join(__dirname, 'dist')

        try {
            // 复制所有必需文件
            for (const file of files) {
                const sourcePath = join(wasmDir, file)
                const destPath = join(destDir, file)
                if (existsSync(sourcePath)) {
                    await copyFile(sourcePath, destPath)
                    await sleep(100)
                    console.log(`Copied ${file} to dist/`)
                } else {
                    console.warn(`Warning: Could not find ${file}`)
                }
            }
        } catch (error) {
            console.error('Error copying files:', error)
        }
    }
}) 