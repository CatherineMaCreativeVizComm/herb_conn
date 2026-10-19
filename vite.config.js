import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/api/multimedia': {
        target: 'https://multimedia.scmp.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/multimedia/, '')
      }
    }
  },
  build: {
    lib: {
      entry: {
        'herb-conn': 'src/herbconn.js',
        // 'second-widget': 'src/second-widget.js'
      },
      formats: ['es'], 
      fileName: (format, entryName) => `${entryName}.${format}.js`
    }
  }
});