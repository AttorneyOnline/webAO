import path from 'path';
import packageJson from './package.json'

import { defineConfig } from 'vite';

export default defineConfig({
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'webAO'),
        },
        extensions: ['.js', '.jsx', '.tsx', '.ts', '.json'],
    },
    server: {
        open: true,
        port: 8080,
    },
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        sourcemap: true,
    },
    define: {
        __APP_VERSION__: JSON.stringify(packageJson.version),
    }
});
