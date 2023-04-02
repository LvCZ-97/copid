const path = require('path');
const { VueLoaderPlugin } = require('vue-loader');
const HtmlWebpackPlugin = require('html-webpack-plugin');

function resolve(dir) {
    return path.join(__dirname, '..', dir);
}

function srcRoot(dir) {
    return path.join(__dirname, '..', '..', dir);
}

function projectRoot(dir) {
    return path.join(__dirname, '..', '..', '..', dir);
}

module.exports = {
    target: 'electron-renderer',

    entry: {
        app: resolve('index.ts'),
    },

    output: {
        publicPath: '.',
        path: projectRoot('dist/renderer'),
        filename: '[name].[contenthash:8].js',
    },

    node: {
        global: true,
        __dirname: true,
        __filename: true,
    },

    plugins: [
        new VueLoaderPlugin(),

        new HtmlWebpackPlugin({
            template: resolve('index.html'),
            filename: projectRoot('dist/renderer/index.html'),
            minify: {
                removeComments: true,
                keepClosingSlash: true,
                collapseWhitespace: true,
                conservativeCollapse: true,
                removeAttributeQuotes: true,
                collapseInlineTagWhitespace: true,
            },
        }),
    ],

    resolve: {
        alias: {
            '~common': srcRoot('common'),
            '~component': srcRoot('component'),
        },

        extensions: ['.js', '.ts'],
    },

    externals: {
        // 引用构建好的外部 sqlite 模块代码
        // 因为如果直接引入 Prisma 库构建 boundle 会报错
        '~sqlite': ['commonjs2 ../sqlite', 'default'],
    },

    module: {
        rules: [
            {
                test: /\.node$/,
                use: 'node-loader',
            },

            {
                test: /\.(m?js|node)$/,
                parser: { amd: false },
                use: {
                    loader: '@marshallofsound/webpack-asset-relocator-loader',
                    options: {
                        outputAssetBase: 'native_modules',
                    },
                },
            },

            {
                test: /\.(jpg|png|jpeg|gif)$/,
                loader: 'url-loader',
            },

            {
                test: /\.(eot|svg|ttf|woff|woff2)$/,
                loader: 'file-loader',
                options: {
                    name: '[name].[ext]',
                    publicPath: './',
                },
            },

            {
                test: /\.css$/,
                use: [
                    { loader: 'style-loader' },
                    { loader: 'css-loader' },
                    {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                plugins: ['postcss-nesting'],
                            },
                        },
                    },
                ],
            },

            {
                test: /\.vue$/,
                loader: 'vue-loader',
            },

            {
                test: /\.ts$/,
                exclude: /(node_modules)/,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            transpileOnly: true,
                            appendTsSuffixTo: [/\.vue$/],
                        },
                    },
                ],
            },
        ],
    },
};
