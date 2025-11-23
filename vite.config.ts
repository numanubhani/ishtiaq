import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || ''),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || '')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        },
        dedupe: ['react', 'react-dom', 'react-is']
      },
      // Ensure react-is is properly resolved
      esbuild: {
        jsx: 'automatic'
      },
      ssr: {
        noExternal: ['recharts', 'react-is']
      },
      build: {
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: false,
        rollupOptions: {
          output: {
            manualChunks: undefined
          },
          onwarn(warning, warn) {
            // Suppress "externalized" warnings for react-is
            if (warning.code === 'UNRESOLVED_IMPORT' && warning.source === 'react-is') {
              return;
            }
            warn(warning);
          }
        },
        commonjsOptions: {
          include: [/node_modules/],
          transformMixedEsModules: true
        }
      },
      optimizeDeps: {
        include: ['react', 'react-dom', 'react-is', 'recharts'],
        esbuildOptions: {
          resolveExtensions: ['.js', '.jsx', '.ts', '.tsx']
        }
      }
    };
});
