import { createApp } from 'vue'
import App from './App.js'
import './index.css'
import { init } from '@bluryar/tokenizers-js'

async function bootstrap() {
    await init()
    const app = createApp(App)
    app.mount('#app')
}

bootstrap() 