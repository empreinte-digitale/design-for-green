const webpack = require('webpack');
const WebpackModules = require('webpack-modules');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const sveltePreprocess = require('svelte-preprocess');
const path = require('path');
const config = require('sapper/config/webpack.js');
const pkg = require('./package.json');

const mode = process.env.NODE_ENV;
const dev = mode === 'development';

const alias = { svelte: path.resolve('node_modules', 'svelte') };
const extensions = ['.mjs', '.js', '.ts', '.json', '.svelte', '.html'];
const mainFields = ['svelte', 'module', 'browser', 'main'];
const fileLoaderRule = {
	test: /\.(png|jpe?g|gif)$/i,
	use: [
		'file-loader',
	]
};

module.exports = {
	client: {
		entry: { main: config.client.entry().main.replace(/\.js$/, '.ts') },
		output: config.client.output(),
		resolve: { alias, extensions, mainFields },
		module: {
			rules: [
				{
					test: /\.ts$/,
					loader: 'ts-loader'
				},
				{
					test: /\.(svelte|html)$/,
					use: {
						loader: 'svelte-loader',
						options: {
							dev,
							emitCss: true,
							hydratable: true,
							preprocess: sveltePreprocess(),
							hotReload: false // pending https://github.com/sveltejs/svelte/issues/2377
						}
					}
				},
				{
					test: /\.css$/,
					use: [
						MiniCssExtractPlugin.loader,
						'css-loader'
					]
				},
				fileLoaderRule
			]
		},
		mode,
		plugins: [
			// pending https://github.com/sveltejs/svelte/issues/2377
			// dev && new webpack.HotModuleReplacementPlugin(),
			new webpack.DefinePlugin({
				'process.browser': true,
				'process.env.NODE_ENV': JSON.stringify(mode)
			}),
			new webpack.optimize.LimitChunkCountPlugin({
				maxChunks: 1
			}),
			new MiniCssExtractPlugin({
				filename: '[hash]/[name].css'
			})
		].filter(Boolean),
		devtool: dev && 'inline-source-map'
	},

	server: {
		entry: { server: config.server.entry().server.replace(/\.js$/, '.ts') },
		output: config.server.output(),
		target: 'node',
		resolve: { alias, extensions, mainFields },
		externals: Object.keys(pkg.dependencies).concat('encoding'),
		module: {
			rules: [
				{
					test: /\.ts$/,
					loader: 'ts-loader'
				},
				{
					test: /\.(svelte|html)$/,
					use: {
						loader: 'svelte-loader',
						options: {
							css: false,
							generate: 'ssr',
							hydratable: true,
							preprocess: sveltePreprocess(),
							dev
						}
					}
				},
				fileLoaderRule
			]
		},
		mode,
		plugins: [
			new WebpackModules()
		],
		performance: {
			hints: false // it doesn't matter if server.js is large
		}
	},

	serviceworker: {
		entry: { 'service-worker': config.serviceworker.entry()['service-worker'].replace(/\.js$/, '.ts') },
		output: config.serviceworker.output(),
		resolve: { extensions: ['.mjs', '.js', '.ts', '.json'] },
		module: {
			rules: [
				{
					test: /\.ts$/,
					loader: 'ts-loader'
				}
			]
		},
		mode
	}
};
