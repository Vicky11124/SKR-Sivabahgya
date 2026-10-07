import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // In development the API runs separately (npm run dev starts both); Vite forwards /api to it
  server: { port: 5173, proxy: { '/api': 'http://localhost:3001' } }
});
