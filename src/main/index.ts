import fs from 'fs';
import path from 'path';
import store from './store';
import hotkey from '~hotkey';
import { initApp } from './init';
import { sendRendererEnv } from './env';
import { proxyConsole } from './console';
import { winEventHooks } from './events';
import { IpcRendererEventEnum } from '../common/enum';
import { app, globalShortcut, Menu, BrowserWindow, Tray } from 'electron';

// https://www.electronforge.io/config/makers/squirrel.windows
if (require('electron-squirrel-startup')) app.quit();

const isProd = store.state.isProd;
const isWindows = store.state.isWindows;

/**
 * 程序初始化
 */
(async function initProgram() {
    proxyConsole();

    // 初始化用户数据配置
    await initApp();

    app.on('window-all-closed', () => {
        app.quit();
    });

    // 区分 Mac 程序坞退出
    app.on('before-quit', () => {
        store.state.forceQuitWindow = true;
    });

    app.on('activate', () => {
        if (isWindows) {
            // ...
        } else {
            if (isProd) {
                // ...
            } else {
                store.state.mainWindow?.show();
            }
        }
    });

    app.whenReady()
        .then(() => {
            registerGlobalShortcut();

            createTray();
            createMainWindow();
        })
        .catch(e => {
            console.error(e);
        });
})();

/**
 * 创建主窗口
 */
function createMainWindow(): void {
    // 隐藏菜单栏
    Menu.setApplicationMenu(null);

    const mainWindow = new BrowserWindow({
        show: true,
        center: true,
        icon: store.state.logoPath,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            preload: path.join(store.state.runtime.paths.assetsScript, 'renderer-preload.js'),
        },
    });
    store.setMainWindow(mainWindow);

    mainWindow.on('ready-to-show', () => {
        winEventHooks(mainWindow);
        sendRendererEnv(mainWindow);
    });

    mainWindow.on('focus', () => {
        // FIX - Mac 平台下无法使用复制黏贴全选的快捷操作
        if (!isWindows) {
            const contents = mainWindow.webContents;
            globalShortcut.register('Command+C', () => {
                contents.copy();
            });
            globalShortcut.register('Command+V', () => {
                contents.paste();
            });
            globalShortcut.register('Command+X', () => {
                contents.cut();
            });
            globalShortcut.register('Command+A', () => {
                contents.selectAll();
            });
        }
    });

    mainWindow.on('blur', () => {
        globalShortcut.unregister('Command+C');
        globalShortcut.unregister('Command+V');
        globalShortcut.unregister('Command+X');
        globalShortcut.unregister('Command+A');
    });

    // 拦截关闭，退至后台
    mainWindow.on('close', e => {
        if (store.state.forceQuitWindow) return undefined;
        e.preventDefault();
        mainWindow.hide();
        return false;
    });

    // 页面加载
    let url = getResourcesPath();
    if (isProd || url) {
        loadIndex(mainWindow, url);
    } else {
        // 开发模式下页面可能没有构建完成，需要自动刷新加载页面
        mainWindow.loadURL(`file://${store.state.runtime.paths.page404}`);
        let times = 0;
        const timer = setInterval(() => {
            if (times > 5) {
                clearInterval(timer);
            } else {
                times++;
                url = getResourcesPath();
                if (url) {
                    loadIndex(mainWindow, url);
                    clearInterval(timer);
                }
            }
        }, 4000);
    }

    mainWindow.setBounds({ width: 270, height: 400 });
    mainWindow.center();
    mainWindow.show();
    mainWindow.webContents.send(IpcRendererEventEnum.SHOW_WINDOWS);

    if (!isProd) {
        mainWindow.webContents.openDevTools();
    }
}

/**
 * 注册全局快捷键
 */
function registerGlobalShortcut() {
    // 显示窗口
    globalShortcut.register('F1', () => {
        if (store.state.mainWindow?.isFocused()) {
            // ...
        } else {
            if (isWindows) {
                store.savePrevActiveWindow();
            }
            store.state.mainWindow?.center();
            store.state.mainWindow?.show();
            store.state.mainWindow?.webContents.send(IpcRendererEventEnum.SHOW_WINDOWS);
        }
    });

    // 剪贴板队列出列
    globalShortcut.register('Ctrl+Shift+V', () => {
        if (store.state.copidRecord.clipboardDataQueue.length) {
            const data = store.state.copidRecord.clipboardDataQueue.shift();
            if (data?.content) hotkey.typeString(data.content);
        }
    });

    // 剪贴板清除队列记录
    globalShortcut.register('Ctrl+Alt+V', () => {
        store.state.copidRecord.clipboardDataQueue = [];
    });
}

/**
 * 设置系统托盘
 */
export function createTray(): void {
    const menuItemTemplate: Electron.MenuItemConstructorOptions[] = [
        {
            label: '开发者模式',
            type: 'normal',
            click: () => {
                store.state.mainWindow?.webContents.openDevTools();
            },
        },
        {
            label: '退出',
            type: 'normal',
            click: () => {
                // 防止 close 事件拦截关闭
                store.state.forceQuitWindow = true;
                app.quit();
            },
        },
    ];

    const contextMenu = Menu.buildFromTemplate(
        isWindows
            ? menuItemTemplate
            : [
                  {
                      label: 'Copid',
                      type: 'submenu',
                      submenu: menuItemTemplate,
                  },
              ],
    );

    if (isWindows) {
        const tray = new Tray(store.state.trayIconPath);
        tray.on('click', () => {
            store.state.mainWindow?.center();
            store.state.mainWindow?.show();
        });
        tray.setContextMenu(contextMenu);
    } else {
        // FIX - 菜单栏按钮莫名其妙自动禁用了
        Menu.setApplicationMenu(contextMenu);
        setInterval(() => {
            Menu.setApplicationMenu(contextMenu);
        }, 10000);
    }
}

/**
 * 窗口资源访问
 */
function getResourcesPath() {
    const indexPath = path.join(store.state.runtime.paths.renderer, 'index.html');
    if (fs.existsSync(indexPath)) {
        return `file://${indexPath}`;
    } else {
        return '';
    }
}

/**
 * 页面加载
 */
function loadIndex(win: BrowserWindow, url: string) {
    win.loadURL(url).catch(e => {
        console.error(e);
    });
}
