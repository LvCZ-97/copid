const path = require('path');

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
    target: 'electron-main',

    experiments: {
        topLevelAwait: true,
    },

    entry: {
        main: resolve('index.ts'),
    },

    output: {
        path: projectRoot('dist/main'),
        filename: '[name].bundle.js',
        chunkFilename: '[name].chunk.js',
    },

    node: {
        global: true,
        __dirname: true,

        // 该变量由 electron 代理
        // 用于静态资源访问
        __filename: false,
    },

    resolve: {
        alias: {
            '~win32': srcRoot('win32'),
            '~hotkey': srcRoot('hotkey'),
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
                loader: 'node-loader',
                options: {
                    name: '[name].[ext]',
                },
            },

            {
                test: /\.(m?js|node)$/,
                exclude: /fs-extra/,
                parser: { amd: false },
                use: {
                    loader: '@marshallofsound/webpack-asset-relocator-loader',
                    options: {
                        production: true,
                        outputAssetBase: 'native_modules',
                    },
                },
            },

            {
                test: /\.ts$/,
                exclude: /(node_modules)/,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            transpileOnly: true,
                        },
                    },
                    {
                        loader: path.join(__dirname, 'compiler.js'),
                    },
                ],
            },
        ],
    },
};
