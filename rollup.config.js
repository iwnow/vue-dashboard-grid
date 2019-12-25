import path from 'path';
import embedCSS from 'rollup-plugin-embed-css';
import html from 'rollup-plugin-fill-html';
import livereload from 'rollup-plugin-livereload';
import serve from 'rollup-plugin-serve';
import { terser } from 'rollup-plugin-terser';

const production = !process.env.ROLLUP_WATCH;

export default [
    {
        input: path.resolve(__dirname, 'src/dashboard-grid/index.js'),
        output: {
            name: 'vueDashboardGrid',
            format: 'umd',
            file: path.resolve(__dirname, 'dist/umd/vue-dashboard-grid.umd.js'),
        },
        plugins: [
			embedCSS(),
            // live reload if dev
            !production && livereload(),
            !production && serve('dist'),
            !production && html({
                template: path.resolve(__dirname, 'src/demo-app/index.html'),
				filename: 'index.html',
				extenrals: [
					{ type: 'js', file: 'demo-app.js' }
				]
              }),
            // minify if prod
            production && terser()
        ],
        watch: {
            clearScreen: true
        }
	},
	{
		input: path.resolve(__dirname, 'src/demo-app/index.js'),
		output: {
			format: 'iife',
            file: path.resolve(__dirname, 'dist/demo-app.js'),
		},
		globals: {
			vue: 'Vue'
		}
	}
];