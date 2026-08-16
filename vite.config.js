import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        react({
            include: ['resources/js/**/*.tsx', 'resources/js/**/*.ts', 'resources/js/**/*.jsx', 'resources/js/**/*.js'],
        }),
        laravel({
            input: ['resources/css/app.css', 'resources/js/index.tsx'],
            refresh: true,
        }),
        tailwindcss(),
    ],
    server: {
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
    optimizeDeps: {
        include: ['react', 'react-dom', 'react-dom/client', 'react-router-dom'],
    },
});
