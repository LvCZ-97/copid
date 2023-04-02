const path = require('path');
const fs = require('fs-extra');
const { sh } = require('tasksfile');
const concurrently = require('concurrently');
const { copyResources, copyNativeDeps, deleteResources } = require('./taskutils');

const packageJson = require('./package.json');
const projectSrcPath = path.join(__dirname, 'src');
const distPath = path.join(__dirname, packageJson.build.directories.output);

/**
 * 任务
 */
class TaskMap {
    /**
     * 同步资源文件，会在构建任务中自动调用
     */
    sync() {
        const copyFileList = packageJson.customerBuild.syncResources.reduce((acc, cur) => {
            cur.to.forEach(t => {
                acc.push({
                    from: path.resolve(projectSrcPath, cur.from),
                    to: path.resolve(projectSrcPath, t),
                });
            });
            return acc;
        }, []);
        copyFileList.forEach(item => {
            fs.copySync(item.from, item.to, { overwrite: true });
        });
    }

    /**
     * 构建库（不是构建打包项目）
     *
     * 命令行：npm run task build
     */
    build() {
        const { result } = concurrently(['npm:build:*']);
        result.catch(e => {
            console.error(e);
        });
    }

    /**
     * 开发模式
     *
     * 命令行：npm run task dev
     */
    dev(params) {
        this.sync();
        sh('npx rimraf dist');
        sh('npx rimraf .parcel-cache');

        devCopy();

        const { result } = concurrently(['npm:dev:*']);
        result.catch(e => {
            console.error(e);
        });
    }

    /**
     * 生产模式，构建可执行程序
     *
     * 命令行：npm run task pack
     */
    async pack() {
        try {
            this.sync();
            await packBuild();
            if (process.platform === 'win32') {
                sh('npx electron-builder --dir --win --x64');
            } else {
                sh('npx electron-builder --dir --mac');
            }
            // auto run afterPackHook.js
        } catch (e) {
            console.error(e);
        }
    }

    /**
     * 生产模式，构建安装包
     *
     * 命令行：npm run task make
     */
    async make() {
        try {
            this.sync();
            await packBuild();
            if (process.platform === 'win32') {
                sh('npx electron-builder --win nsis:x64');
            } else {
                sh('npx electron-builder --mac');
            }
            // auto run afterPackHook.js
        } catch (e) {
            console.error(e);
        }
    }
}

/**
 * 生产模式构建
 */
async function packBuild() {
    try {
        sh('npx rimraf dist');
        sh('npx rimraf .parcel-cache');

        // 所有库都需要重新构建
        const { result: buildResult } = concurrently(['npm:build:*']);
        await buildResult;

        packCopy();
        const { result: packResult } = concurrently(['npm:pack:*']);
        await packResult;

        // ...
    } catch (e) {
        console.error(e);
        return Promise.reject();
    }
}

/**
 * 开发模式下的静态资源移动
 */
function devCopy() {
    // 将 package.json 配置的静态资源复制到 dist
    copyResources(packageJson.customerBuild.resources, distPath);
    copyResources(packageJson.customerBuild.devResources, distPath);

    // node_modules -> dist/node_modules
    copyNativeDeps(distPath);
}

/**
 * 生产模式下的静态资源移动
 */
function packCopy() {
    // 将 package.json 配置的静态资源复制到 dist
    copyResources(packageJson.customerBuild.resources, distPath);

    // 删除多余资源
    deleteResources(packageJson.customerBuild.deleteResources, distPath);
}

(function run() {
    const args = process.argv;
    if (args && args.length >= 2) {
        const taskMap = new TaskMap();
        const argArray = args.slice(2);
        if (argArray.length > 0) {
            const [task, ...params] = argArray;
            if (taskMap[task]) {
                taskMap[task](params);
            } else {
                taskMap.quk(argArray);
            }
        } else {
            taskMap.quk();
        }
    }
})();
