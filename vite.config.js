import { defineConfig } from 'vite';

export default defineConfig({
  // Set up a local development server proxy
  server: {
    proxy: {
      '/api/multimedia': {
        target: 'https://multimedia.scmp.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/multimedia/, '')
      }
    }
  },
  optimizeDeps: {
  },
  build: {
    lib: {
      entry: 'src/main.js',
      name: 'HerbConnWidget',
      fileName: (format) => `herb-conn.${format}.js`,
      formats: ['umd'] 
    }
  }
});