import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import postcssPresetEnv from 'postcss-preset-env';

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    host: '0.0.0.0',
  },
  css: {
    postcss: {
      plugins: [postcssPresetEnv({
        browsers: ['last 2 versions', 'Firefox ESR', 'not IE 11'],
      })],
    },
  },
});
