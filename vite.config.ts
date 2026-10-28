import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carrega explicitamente variáveis do .env para garantir injeção no bundle
  const env = loadEnv(mode, process.cwd(), 'VITE_');

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    define: {
      'import.meta.env.VITE_GEOAPIFY_API_KEY': JSON.stringify(env.VITE_GEOAPIFY_API_KEY),
    },
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
  };
});
