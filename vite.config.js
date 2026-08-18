import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    laravel({
      input: ['resources/css/app.css', 'resources/js/index.tsx'],
      refresh: true,
    }),
    react({
      fastRefresh: true,
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'resources/js'),
    },
  },
  server: {
    host: '::',
    port: 5173,
    strictPort: false,
    cors: true,
    origin: 'http://[::1]:5173',
    hmr: {
      host: 'localhost',
      protocol: 'ws',
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-dom/client',
      'react-router-dom',
      'react-hook-form',
      'framer-motion',
      'sonner',
      'lucide-react',
      'zod',
      '@hookform/resolvers/zod',
      'recharts',
    ],
    esbuildOptions: {
      target: 'es2022',
    },
  },
  build: {
    target: 'es2022',
    sourcemap: true,
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          forms: ['react-hook-form', '@hookform/resolvers/zod', 'zod'],
          ui: ['framer-motion', 'sonner', 'lucide-react'],
          charts: ['recharts'],
        },
      },
    },
  },
});
