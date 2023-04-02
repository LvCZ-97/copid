import path from 'path';
import fs from 'fs-extra';
import store from './store';
import jsonfile from 'jsonfile';
import packageJson from '../../package.json';

/**
 * App 设置
 */
export interface IInitJson {
    sqlite: {
        version: string;
    };
}

const isProd = store.state.isProd;

const initJsonPath = store.state.runtime.paths.initJson;
const appDataDirPath = store.state.runtime.paths.appData;

/**
 * 初始化 APP
 */
export async function initApp() {
    try {
        await initAppUserData();
    } catch (error) {
        console.error(error);
    }
}

/**
 * 初始化 APP 用户数据配置
 */
async function initAppUserData() {
    if (!fs.existsSync(appDataDirPath)) fs.mkdirsSync(appDataDirPath);

    if (!fs.existsSync(initJsonPath)) {
        writeInitJson(await getOriginInitJson());

        // 重置数据库数据
        if (isProd) {
            removeSqlite();
            copySqlite();
        }
    }

    const initJsonObj = jsonfile.readFileSync(initJsonPath) as IInitJson;

    if (isProd) {
        // 校验 Sqlite 版本，是否要重置数据库数据
        const curSqliteVersion = initJsonObj.sqlite.version;
        const newSqliteVersion = packageJson.customerBuild.sqlite.version;
        if (curSqliteVersion === newSqliteVersion) {
            copySqlite(false);
        } else {
            initJsonObj.sqlite.version = newSqliteVersion;
            writeInitJson(initJsonObj);
            removeSqlite();
            copySqlite();
        }

        writeInitJson(initJsonObj);
    }
}

/**
 * 获取原始的配置数据
 */
async function getOriginInitJson() {
    const initJsonObj: IInitJson = {
        sqlite: {
            version: packageJson.customerBuild.sqlite.version,
        },
    };
    return initJsonObj;
}

/**
 * 输出 init.json 文件
 */
function writeInitJson(initJsonObj: IInitJson) {
    jsonfile.writeFileSync(initJsonPath, initJsonObj, { spaces: 4, EOL: '\r\n' });
}

/**
 * 删除用户的数据库数据
 */
function removeSqlite(): void {
    const p = path.join(store.state.runtime.paths.appData, packageJson.customerBuild.sqlite.dbpath.appData.split('/')[0]);
    if (fs.existsSync(p)) {
        fs.removeSync(p);
    }
}

/**
 * 从安装目录复制一份干净的数据库文件到用户数据存储目录
 */
function copySqlite(overwrite = true): void {
    const fromPath = store.state.runtime.paths.appDataSqliteFrom;
    const toPath = store.state.runtime.paths.appDataSqliteTo;

    if (!fs.existsSync(toPath)) {
        fs.mkdirsSync(toPath);
    }

    fs.copySync(fromPath, toPath, { overwrite });
}
