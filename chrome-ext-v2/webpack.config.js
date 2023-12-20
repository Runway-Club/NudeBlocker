const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    entry: {
        background: './src/background/service-worker.ts',
        content: './src/content/content.ts',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'src/[name].js',
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                {from: 'manifest.json', to: 'manifest.json'},
                {from: 'src/statics', to: 'statics'},
                {from: 'models', to: 'models'},
            ],

        }),
    ],
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin()],
    },
}