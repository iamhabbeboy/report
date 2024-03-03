import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                general: resolve(__dirname, 'general.html'),
                children: resolve(__dirname, 'children.html')
            }
        }
    }
})