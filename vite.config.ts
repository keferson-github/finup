import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks - bibliotecas grandes separadas
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'ui-vendor': ['lucide-react', 'react-hot-toast'],
          'chart-vendor': ['recharts'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'date-vendor': ['date-fns'],
        },
      },
    },
    // Aumentar o limite de aviso para chunks grandes
    chunkSizeWarningLimit: 1000,
  },
});
