const babelParser = require('@babel/parser');
const babelTraverse = require('@babel/traverse').default;
const babelGenerator = require('@babel/generator').default;

const isWindows = process.platform === 'win32';

module.exports = function (source) {
    const ast = babelParser.parse(source, {
        sourceType: 'module',
        plugins: ['typescript'],
        allowImportExportEverywhere: true,
    });

    babelTraverse(ast, {
        ImportDeclaration(item) {
            // 在非 Windows 平台下忽略 Win32 的导入，不得使用
            if (!isWindows) {
                const removeList = ['~win32'];
                const value = item.node.source.value;
                if (removeList.some(s => value.includes(s))) {
                    item.remove();
                }
            }
        },
    });

    const code = babelGenerator(ast).code;

    return code;
};
