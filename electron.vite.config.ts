import { resolve } from 'node:path'
import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'

/**
 * Configuration electron-vite.
 *
 * Trois cibles de compilation distinctes :
 *  - `main`     : processus principal Electron (Node.js).
 *  - `preload`  : script de pre-chargement expose au renderer via contextBridge.
 *  - `renderer` : application React (Vite classique).
 */
export default defineConfig({
  main: {
    build: {
      rollupOptions: {
        input: { index: resolve(__dirname, 'src/main/index.ts') }
      }
    },
    resolve: {
      alias: {
        '@shared': resolve(__dirname, 'src/shared')
      }
    }
  },
  preload: {
    build: {
      rollupOptions: {
        input: { index: resolve(__dirname, 'src/preload/index.ts') }
      }
    },
    resolve: {
      alias: {
        '@shared': resolve(__dirname, 'src/shared')
      }
    }
  },
  renderer: {
    root: resolve(__dirname, 'src/renderer'),
    build: {
      // Optimisations de production : minification esbuild, pas de sourcemap
      // embarquee, chunk Word charge a la demande (voir printService).
      minify: 'esbuild',
      sourcemap: false,
      reportCompressedSize: false,
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        input: { index: resolve(__dirname, 'src/renderer/index.html') }
      }
    },
    // Retire les appels de debogage du bundle de production.
    esbuild: {
      drop: ['debugger'],
      pure: ['console.log', 'console.debug', 'console.info']
    },
    resolve: {
      alias: {
        '@renderer': resolve(__dirname, 'src/renderer/src'),
        '@shared': resolve(__dirname, 'src/shared')
      }
    },
    plugins: [react()]
  }
})
