import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [
      react(),
      dts({
        include: ['lib/**/*', 'components/**/*', 'types.ts', 'GraphScene.tsx'],
        insertTypesEntry: true,
      })
    ],
    build: {
      lib: {
        entry: path.resolve(__dirname, 'lib/index.ts'),
        name: 'NebulaGraphExplorer',
        fileName: (format) => `index.${format}.js`,
        formats: ['es', 'umd']
      },
      rollupOptions: {
        external: ['react', 'react-dom', 'react/jsx-runtime', 'three', /@react-three\/.*/],
        output: {
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
            'react/jsx-runtime': 'react/jsx-runtime',
            three: 'THREE'
          }
        }
      }
    },
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
