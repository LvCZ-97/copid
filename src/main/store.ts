import path from 'path';
import osUtils from '~common/help';
import { BrowserWindow } from 'electron';
import packageJson from '../../package.json';
import windowsNative from '~win32/module/windows';

const isWindows = process.platform === 'win32';
const isProd = process.env.NODE_ENV === 'production';

const devProjectRootPath = path.resolve(osUtils.getMainDirAtPath(), '..');
const devProjectDistPath = path.join(devProjectRootPath, 'dist');
const devProjectSrcPath = path.join(devProjectRootPath, 'src');

const appDataDirPath = isProd ? osUtils.getAppDataPath() : devProjectDistPath;

class Store {
    // ...

    state: {
        isProd: boolean;

        // 是否 Windows 平台
        isWindows: boolean;

        // 是否强制退出窗口
        forceQuitWindow: boolean;

        // Logo 路径
        logoPath: string;
        // 任务栏图标
        trayIconPath: string;

        // 主窗口 Electron 实例
        mainWindow: BrowserWindow | null;

        // 上一个活跃窗口句柄
        prevActiveWindowHandle: number | null;
        // 上一个活跃窗口聚焦控件句柄
        prevActiveWindowFocusControlHandle: number | null;

        // Copid 记录
        copidRecord: {
            queueMaxSize: number;
            clipboardDataQueue: Array<{ content: string }>;
        };

        // 项目信息
        devProject: {
            paths: {
                root: string;
                src: string;
                dist: string;
            };
        };

        // 运行时信息
        runtime: {
            paths: {
                appData: string;
                initJson: string;

                logSave: string;
                renderer: string;

                page404: string;

                appDataSqliteFrom: string;
                appDataSqliteTo: string;

                assets: string;
                assetsHtml: string;
                assetsScript: string;
            };
        };
    } = {
        // ...

        isProd,
        isWindows,

        mainWindow: null,
        forceQuitWindow: false,

        prevActiveWindowHandle: null,
        prevActiveWindowFocusControlHandle: null,

        logoPath: isWindows ? (isProd ? 'resources/app/assets/logo/icon.ico' : 'dist/assets/logo/icon.ico') : '',
        trayIconPath: isWindows ? (isProd ? 'resources/app/assets/logo/icon.ico' : 'dist/assets/logo/icon.ico') : '',

        copidRecord: {
            queueMaxSize: 20,
            clipboardDataQueue: [],
        },

        devProject: {
            paths: {
                root: devProjectRootPath,
                src: devProjectSrcPath,
                dist: devProjectDistPath,
            },
        },

        runtime: {
            paths: {
                appData: appDataDirPath,
                initJson: path.join(appDataDirPath, 'init.json'),

                renderer: path.resolve(osUtils.getMainDirAtPath(), 'renderer'),
                logSave: path.resolve(isProd ? osUtils.getAppDataPath() : osUtils.getMainDirAtPath(), 'logFile'),

                page404: path.resolve(osUtils.getMainDirAtPath(), 'assets', 'html', '404.html'),

                appDataSqliteFrom: path.join(osUtils.getMainDirAtPath(), packageJson.customerBuild.sqlite.dbpath.appData),
                appDataSqliteTo: path.join(osUtils.getAppDataPath(), packageJson.customerBuild.sqlite.dbpath.appData),

                assets: path.resolve(osUtils.getMainDirAtPath(), 'assets'),
                assetsHtml: path.join(osUtils.getMainDirAtPath(), 'assets', 'html'),
                assetsScript: path.resolve(osUtils.getMainDirAtPath(), 'assets', 'script'),
            },
        },
    };

    /**
     * 设置主 Electron 窗口
     */
    setMainWindow(window: BrowserWindow | null) {
        this.state.mainWindow = window;
    }

    /**
     * 清除上一个活跃句柄
     */
    clearPrevActiveHandle() {
        this.state.prevActiveWindowHandle = null;
        this.state.prevActiveWindowFocusControlHandle = null;
    }

    /**
     * 保存上一个获取焦点的窗口
     */
    async savePrevActiveWindow() {
        if (isWindows) {
            const handles = windowsNative.getFocusControlHandle();
            if (handles) {
                // @ts-ignore
                this.state.prevActiveWindowHandle = handles.foregroundWindowHandle;
                // @ts-ignore
                this.state.prevActiveWindowFocusControlHandl = handles.focusControlHandle;
            }
        }
    }
}

const store = new Store();
export default store;
