import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const repoName = 'motocity-showroom'

export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? `/${repoName}/` : '/',
  server: {
    host: '0.0.0.0',
    allowedHosts: ['mac-mini-di-utente.tailaa52d2.ts.net'],
  },
})
