// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { createStarlightTypeDocPlugin } from 'starlight-typedoc';

const [starlightTypeDoc, typeDocSidebarGroup] = createStarlightTypeDocPlugin();

export default defineConfig({
	site: 'https://jw-mans.github.io',
	base: '/tmakit',
	integrations: [
		starlight({
			title: 'tmakit',
			description: 'SDK-agnostic devtools and runtime kit for Telegram Mini Apps',
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/jw-mans/tmakit' }],
			plugins: [
				starlightTypeDoc({
					entryPoints: [
						'../packages/core/src/index.ts',
						'../packages/kit/src/index.ts',
						'../packages/kit/src/server.ts',
						'../packages/devtools/src/index.ts',
						'../packages/testing/src/index.ts',
					],
					tsconfig: './typedoc.tsconfig.json',
					output: 'api',
					typeDoc: {
						skipErrorChecking: true,
					},
				}),
			],
			sidebar: [
				{
					label: 'Start here',
					items: [
						{ label: 'Introduction', slug: 'start/introduction' },
						{ label: 'Getting started', slug: 'start/getting-started' },
						{ label: 'Tutorial: build a Mini App', slug: 'start/tutorial' },
					],
				},
				{
					label: 'Concepts',
					items: [
						{ label: 'Architecture', slug: 'concepts/architecture' },
						{ label: 'The bridge protocol', slug: 'concepts/bridge-protocol' },
						{ label: 'SDK-agnostic injection', slug: 'concepts/sdk-agnostic' },
						{ label: 'The mock engine', slug: 'concepts/mock-engine' },
					],
				},
				{
					label: 'Guides',
					items: [
						{ label: 'The devtools panel', slug: 'guides/devtools-panel' },
						{ label: 'Viewport & safe area', slug: 'guides/viewport-safe-area' },
						{ label: 'Storage', slug: 'guides/storage' },
						{ label: 'Payments', slug: 'guides/payments' },
						{ label: 'Navigation', slug: 'guides/navigation' },
						{ label: 'Feature-gating', slug: 'guides/feature-gating' },
						{ label: 'Auth (initData → session)', slug: 'guides/auth' },
						{ label: 'Testing', slug: 'guides/testing' },
					],
				},
				{
					label: 'Reference',
					items: [
						{ label: 'Packages', slug: 'reference/packages' },
						{ label: 'Bridge events', slug: 'reference/events' },
						{ label: 'Version map', slug: 'reference/version-map' },
						{ label: 'Limits', slug: 'reference/limits' },
					],
				},
				typeDocSidebarGroup,
			],
		}),
	],
});
