import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';
import rehypeExternalLinks from 'rehype-external-links';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import path from 'path';

// Same as template: .md for mdsvex, vitePreprocess first then mdsvex
const extensions = ['.svelte', '.md'];

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(),
		// base: '' (default) or e.g. '/app' — must start with / and must NOT end with /
		paths: {
			base: ''
		},
		prerender: {
			// /rss.xml is linked from Footer but the route may be added later; don't fail the build
			handleHttpError: ({ path, message }) => {
				if (path === '/rss.xml') return;
				throw new Error(message);
			}
		},
		alias: {
			$routes: path.resolve('./src/routes'),
			$ui: path.resolve('./src/lib/components/ui'),
			$blocks: path.resolve('./src/lib/components/blocks'),
			$layout: path.resolve('./src/lib/components/layout')
		}
	},
	preprocess: [
		vitePreprocess(),
		mdsvex({
			extensions: ['.md'],
			rehypePlugins: [
				rehypeExternalLinks,
				rehypeSlug,
				[
					rehypeAutolinkHeadings,
					{
						behavior: 'prepend',
						properties: { className: ['heading-link'], title: 'Permalink', ariaHidden: 'true' },
						content: {
							type: 'element',
							tagName: 'span',
							properties: {},
							children: [{ type: 'text', value: '#' }]
						}
					}
				]
			]
		})
	],
	extensions
};

export default config;
