import store from './store';
import sqlite from '~sqlite';
import hotkey from '~hotkey';
import win32Def from '~win32/def';
import win32Sdk from '~win32/sdk';
import windowsNative from '~win32/module/windows';
import clipboardNative from '~win32/module/clipboard';
import { clipboard, ipcMain, BrowserWindow } from 'electron';
import { IpcMainEventEnum, IpcRendererEventEnum } from '~common/enum';

const isWindows = store.state.isWindows;

/**
 * 激活上一个窗口
 */
function activatePrevWindow() {
    if (isWindows) {
        const prevActiveWindowHandle = store.state.prevActiveWindowHandle;
        store.clearPrevActiveHandle();
        if (typeof prevActiveWindowHandle === 'number') {
            win32Sdk.SwitchToThisWindow(prevActiveWindowHandle, true);
        }
    } else {
        hotkey.activatePrevWindow();
    }
}

/**
 * 创建剪贴板记录
 */
const createClipboardRecord = (window: BrowserWindow, content: string) => {
    sqlite.clipboard.createOne({ content }, { deleteSameRecord: true }).then(resolveInfo => {
        if (resolveInfo.data) {
            if (store.state.copidRecord.clipboardDataQueue.length < store.state.copidRecord.queueMaxSize) {
                store.state.copidRecord.clipboardDataQueue.push({ content: resolveInfo.data.content });
            }
            window.webContents.send(IpcRendererEventEnum.CLIPBOARD_UPDATE, { clipboard: resolveInfo });
        }
    });
};

export async function winEventHooks(window: BrowserWindow | null): Promise<void> {
    // ...

    if (!window) {
        return;
    }

    // 退到后台，并激活上一个活跃窗口
    ipcMain.on(IpcMainEventEnum.BACKEND_WINDOWS, () => {
        activatePrevWindow();
        store.state.mainWindow?.hide();
    });

    // 退到后台，并激活上一个活跃窗口后粘贴
    ipcMain.on(IpcMainEventEnum.BACKEND_WINDOWS_AND_PASTE, () => {
        if (isWindows) {
            const prevActiveWindowHandle = store.state.prevActiveWindowHandle;
            store.clearPrevActiveHandle();
            if (typeof prevActiveWindowHandle === 'number') {
                win32Sdk.SwitchToThisWindow(prevActiveWindowHandle, true);
                setTimeout(() => {
                    windowsNative.virtualKeyPaste();
                }, 400);
            }
        } else {
            hotkey.activatePrevWindow();
            setTimeout(() => {
                hotkey.virtualKeyPaste();
            }, 400);
        }
        store.state.mainWindow?.hide();
    });

    if (isWindows) {
        try {
            // 添加剪贴板监听器
            const windowHandle = win32Sdk.FindWindowA(null, 'Copid');
            if (windowHandle) {
                // @ts-ignore
                clipboardNative.addClipboardFormatListenerByWinHandle(windowHandle);
            }

            // 剪贴板内容监听
            window.hookWindowMessage(win32Def.WM_CLIPBOARDUPDATE, () => {
                const content = clipboard.readText().trim();
                if (content) createClipboardRecord(window, content);
            });
        } catch (error) {
            console.error(error);
        }

        // ...
    } else {
        let timer: NodeJS.Timer | null = null;
        let prevContent = clipboard.readText().trim();
        try {
            // 轮询监听剪贴板
            timer = setInterval(() => {
                const currContent = clipboard.readText().trim();
                if (currContent && currContent !== prevContent) {
                    prevContent = currContent;
                    createClipboardRecord(window, currContent);
                }
            }, 1500);
        } catch (error) {
            console.error(error);
            if (timer) clearInterval(timer);
        }
    }
}
