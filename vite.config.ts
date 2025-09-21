import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { staticBlogPlugin } from './src/plugins/static-blog-plugin';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		preact(),
		staticBlogPlugin({
			postsDir: 'posts',
			outputDir: 'dist',
			baseUrl: '/'
		})
	],
});
