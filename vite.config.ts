import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import postcssPresetEnv from 'postcss-preset-env';

export default defineConfig({
	plugins: [sveltekit()],
	css: {
		postcss: {
			plugins: [postcssPresetEnv({
				browsers: ['last 2 versions', 'Firefox ESR', 'not IE 11']
			})]
		}
	}
});
