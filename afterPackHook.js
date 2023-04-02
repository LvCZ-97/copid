const path = require('path');
const packageJson = require('./package.json');
const { copyNativeDeps, getBuildConfigByPlatform } = require('./taskutils');

// https://www.electron.build/configuration/configuration#afterpack

// 生成可执行程序安装包前的钩子
// 只会在 pack 或 make 时执行

exports.default = function () {
    // dist/...
    const targetDir = path.join(__dirname, packageJson.build.directories.output, getBuildConfigByPlatform().output);

    // node_modules -> dist/.../node_modules
    copyNativeDeps(targetDir);
};
