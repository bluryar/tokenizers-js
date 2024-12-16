import { defineComponent, ref, onMounted } from 'vue'
import { init,TokenizerWrapper } from '@bluryar/tokenizers-js'

const DEFAULT_TOKENIZER_URLS = [
    'https://huggingface.co/Qwen/Qwen2.5-0.5B/resolve/main/tokenizer.json',
    'https://hf-mirror.com/Qwen/Qwen2.5-0.5B/resolve/main/tokenizer.json'
]

export default defineComponent({
    name: 'App',
    setup() {
        const inputText = ref('')
        const tokens = ref<{ raw: string, decoded: string, id: number }[]>([])
        const tokenizer = ref<TokenizerWrapper | null>(null)
        const isLoading = ref(false)
        const error = ref('')
        const tokenizerUrl = ref(DEFAULT_TOKENIZER_URLS[0])
        const decodedText = ref('')

        const initTokenizer = async (url: string) => {
            try {
                isLoading.value = true
                error.value = ''
                await init()

                const response = await fetch(url)
                if (!response.ok) throw new Error('Failed to fetch tokenizer config')
                const config = await response.text()

                tokenizer.value = new TokenizerWrapper(config)
            } catch (err) {
                error.value = err instanceof Error ? err.message : 'Failed to initialize tokenizer'
                console.error('Initialization error:', err)
            } finally {
                isLoading.value = false
            }
        }

        onMounted(() => initTokenizer(tokenizerUrl.value))

        const handleTokenize = async () => {
            if (!tokenizer.value || !inputText.value.trim()) return

            try {
                error.value = ''
                const encoding = await tokenizer.value.encode(inputText.value, true)
                const ids = Array.from(encoding.ids)
                const rawTokens = Array.from(encoding.tokens)
                
                decodedText.value = await tokenizer.value.decode(ids, true)
                
                tokens.value = rawTokens.map((token, i) => ({
                    raw: token,
                    decoded: tokenizer.value!.decode([ids[i]], true),
                    id: ids[i]
                }))

                console.log('完整解码文本:', decodedText.value)
            } catch (err) {
                error.value = err instanceof Error ? err.message : 'Tokenization failed'
            }
        }

        return () => (
            <div class="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
                <div class="relative py-3 sm:max-w-xl sm:mx-auto">
                    <div class="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
                        <div class="max-w-md mx-auto">
                            <div class="divide-y divide-gray-200">
                                <div class="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                                    <div class="flex flex-col gap-4">
                                        <div class="flex flex-col gap-2">
                                            <label class="text-sm font-medium text-gray-700">
                                                Tokenizer URL
                                            </label>
                                            <select
                                                v-model={tokenizerUrl.value}
                                                onChange={() => initTokenizer(tokenizerUrl.value)}
                                                class="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                {DEFAULT_TOKENIZER_URLS.map(url => (
                                                    <option key={url} value={url}>
                                                        {url}
                                                    </option>
                                                ))}
                                            </select>
                                            <input
                                                type="url"
                                                v-model={tokenizerUrl.value}
                                                onBlur={() => initTokenizer(tokenizerUrl.value)}
                                                placeholder="Or enter custom tokenizer URL..."
                                                class="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        {isLoading.value ? (
                                            <div class="flex justify-center items-center">
                                                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                            </div>
                                        ) : error.value ? (
                                            <div class="text-red-500 text-center p-4 bg-red-50 rounded-lg">
                                                {error.value}
                                            </div>
                                        ) : (
                                            <>
                                                <textarea
                                                    v-model={inputText.value}
                                                    class="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    rows="4"
                                                    placeholder="Enter text to tokenize..."
                                                />
                                                <button
                                                    onClick={handleTokenize}
                                                    disabled={!tokenizer.value || !inputText.value.trim()}
                                                    class={`
                            px-4 py-2 rounded font-bold text-white
                            ${!tokenizer.value || !inputText.value.trim()
                                                            ? 'bg-gray-400 cursor-not-allowed'
                                                            : 'bg-blue-500 hover:bg-blue-700'}
                          `}
                                                >
                                                    Tokenize
                                                </button>
                                            </>
                                        )}
                                    </div>

                                    {tokens.value.length > 0 && (
                                        <div class="mt-6">
                                            <h3 class="text-lg font-medium mb-2">Tokens:</h3>
                                            <div class="p-4 bg-gray-50 rounded-lg">
                                                <div class="mb-4 p-2 bg-white rounded">
                                                    <div class="font-medium text-sm text-gray-700">完整解码文本:</div>
                                                    <div class="mt-1">{decodedText.value}</div>
                                                </div>
                                                
                                                <div class="flex flex-wrap gap-2">
                                                    {tokens.value.map((token, index) => (
                                                        <span
                                                            key={index}
                                                            class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-mono break-all"
                                                            title={`ID: ${token.id}`}
                                                        >
                                                            {token.decoded}
                                                        </span>
                                                    ))}
                                                </div>
                                                <div class="flex gap-2">
                                                    <div class="mt-2 text-sm text-gray-500">
                                                        Total tokens: {tokens.value.length}
                                                    </div>
                                                    <div class="mt-2 text-sm text-gray-500">
                                                        Total length: {inputText.value.length}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}) 