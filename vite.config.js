import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'url';
import path from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        tailwindcss(),
        react(),
    ],
    build: {
        rolldownOptions: {
            output: {
                // Stable vendor code in its own chunk so it stays cached across deploys
                manualChunks: (id) => {
                    if (id.includes('/node_modules/react/') ||
                        id.includes('/node_modules/react-dom/') ||
                        id.includes('/node_modules/react-router/') ||
                        id.includes('/node_modules/react-router-dom/') ||
                        id.includes('/node_modules/scheduler/') ||
                        id.includes('/node_modules/@supabase/')) {
                        return 'vendor';
                    }
                },
            },
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        port: 5173,
        open: true,
    },
});
