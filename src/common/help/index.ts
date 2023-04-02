import os from 'os';
import path from 'path';
import fs from 'fs-extra';
import packageJson from '../../../package.json';

function fixPathSeparator(path: string): string {
    return path.replace(/\/|\\/g, '/');
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
function getAppDataPath(): string {
    return `${fixPathSeparator(os.homedir())}/${getBuildConfigByPlatform().appData}`;
}

/**
 * 获取 main 文件夹所在目录路径
 */
function getMainDirAtPath(): string {
    return path.resolve(__filename, '..', '..');
}

/**
 * 命令参数解析
 */
function getArgvValue(key: string): string | null {
    const argvs = process.argv.splice(2);
    const argvObj = argvs.reduce((acc: { [k: string]: string }, cur: string) => {
        const [k, v] = cur.split('=');
        acc[k] = v;
        return acc;
    }, {});
    return argvObj[key] || null;
}

/**
 * 是否存在文件夹
 */
function existsDirSync(dirpath: string, options?: { create?: boolean }) {
    if (options?.create) {
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

export default {
    existsDirSync,

    getArgvValue,
    getAppDataPath,
    getMainDirAtPath,
};
