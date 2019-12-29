import cjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import path from 'path';
import html from 'rollup-plugin-fill-html';
import livereload from 'rollup-plugin-livereload';
import serve from 'rollup-plugin-serve';
import { terser } from 'rollup-plugin-terser';
import vue from 'rollup-plugin-vue';

const production = !process.env.ROLLUP_WATCH;

export default [
    {
		input: path.resolve(__dirname, 'apps/demo-app/index.js'),
		output: {
			format: 'iife',
			file: path.resolve(__dirname, 'dist/demo-app.js'),
		},
		plugins: [
			// live reload if dev
            !production && livereload({
				watch: 'dist',
				delay: 1000
			}),
            !production && serve({
				contentBase: ['dist', 'node_modules'],
			}),
            !production && html({
                template: path.resolve(__dirname, './apps/demo-app/index.html'),
				filename: 'index.html',
				externals: [
					{ type: 'js', file: 'vue/dist/vue.min.js', pos: 'before' },
					{
						type: 'js',
						file: 'umd/vue-dashboard-grid.umd.js',
						pos: 'before' 
					},
				]
              }),
		],
		// external: ['vue'],
	},
	{
        input: path.resolve(__dirname, 'libs/vue-dashboard-grid/index.js'),
        output: {
            name: '@iwnow/vue-dashboard-grid',
            format: 'umd',
            file: path.resolve(__dirname, `dist/umd/vue-dashboard-grid.umd${production ? 'min' : ''}.js`),
        },
        plugins: [
			nodeResolve(),
			cjs(),
			vue(),
            production && terser()
        ],
        watch: {
            clearScreen: true
        }
	},
];