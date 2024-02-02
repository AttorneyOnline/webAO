import path from 'path';
import dotenv from 'dotenv';
import packageJson from './package.json'

import { defineConfig } from 'vite';

// this will update the process.env with environment variables in .env file
dotenv.config();

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
        static: {
            directory: path.join(__dirname, 'webAO'),
        },
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
