import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/trail-cam-project/', // ← match your repo name
  plugins: [react()],
});

