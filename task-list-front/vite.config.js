import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: '0.0.0.0', // Разрешает подключение со всех устройств в локальной сети
    cors: true,      // Включает CORS на уровне отладочного сервера
  }
})
