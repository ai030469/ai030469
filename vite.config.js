import { defineConfig } from 'vite'
export default defineConfig({
  build: {
    outDir: 'dist-iife',
    rollupOptions: {
      output: {
        format: 'iife',
        name: 'SpaceRaiders',
        entryFileNames: 'game.js'
      }
    }
  }
})
