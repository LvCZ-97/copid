/**
 * 构建任务脚本工具库
 *
 * 1、用于全局的各项目构建的脚本工具库
 */

const os = require('os');
const fs = require('fs-extra');
const packageJson = require('./package.json');

const isWindows = process.platform === 'win32';

function fixPathSeparator(path) {
    return path.replace(/\/|\\/g, '/');
}

/**
 * 目标文件类型
 */
function hasFileExtension(path) {
    return /(\.html|\.css|\.js|\.ts|\.json|\.prisma|\.exe)$/.test(path);
}

/**
 * 创建目录
 */
function existsDirSync(dirpath, options) {
    if (options && options.create) {
        dirpath = fixPathSeparator(dirpath);
        const dirnames = dirpath.split('/');

        let i = 1;
        while (i < dirnames.length) {
            i++;
            const path = dirnames.slice(0, i).join('/');
            if (!fs.existsSync(path)) {
                fs.mkdirSync(path);
            }
        }

        return true;

        // ...
    } else {
        return fs.existsSync(dirpath);
    }
}

/**
 * 对象深度取值
 */
function deepProps(sourceObj, keyStr) {
    let temp = sourceObj;
    const keyArr = keyStr.split('.');
    for (let i = 0; i < keyArr.length; i++) {
        if (temp && typeof temp === 'object') temp = temp[keyArr[i]];
        if (i === keyArr.length - 1) return temp;
        if (!(temp && typeof temp === 'object')) return;
    }
}

/**
 * 根据平台获取构建配置
 */
function getBuildConfigByPlatform() {
    switch (process.platform) {
        case 'darwin':
            return packageJson.customerBuild.mac;
        default:
            return packageJson.customerBuild.win;
    }
}

/**
 * 用户数据存储目录
 */
function getAppDataPath() {
    return `${fixPathSeparator(os.homedir())}/${getBuildConfigByPlatform().appData}`;
}

/**
 * 复制转移静态资源
 */
function copyResources(config, targetDir) {
    for (const resources of config) {
        if (Array.isArray(resources)) {
            const [r, config] = resources;
            if (fs.existsSync(r)) {
                if (hasFileExtension(r)) {
                    fs.copySync(r, targetDir + '/' + config.dir + '/' + r.split('/').pop());
                } else {
                    fs.copySync(r, targetDir + '/' + config.dir);
                }
            }
        } else {
            if (fs.existsSync(resources)) {
                fs.copySync(resources, targetDir + '/' + resources.split('/').pop());
            }
        }
    }
}

/**
 * 删除静态资源
 */
function deleteResources(config, baseDir) {
    for (const resources of config) {
        fs.removeSync(baseDir + '/' + resources);
    }
}

/**
 * 复制转移本机构建库依赖
 */
function copyNativeDeps(targetDir) {
    if (isWindows) {
        for (const dep of packageJson.customerBuild.winNativeDeps) {
            fs.copySync('node_modules/' + dep, targetDir + '/node_modules/' + dep);
        }
    }
}

exports.deepProps = deepProps;

exports.existsDirSync = existsDirSync;

exports.getAppDataPath = getAppDataPath;
exports.getBuildConfigByPlatform = getBuildConfigByPlatform;

exports.copyResources = copyResources;
exports.copyNativeDeps = copyNativeDeps;
exports.deleteResources = deleteResources;
