import store from './store';
import { BrowserWindow, ipcMain } from 'electron';
import { IpcMainEventEnum, IpcRendererEventEnum } from '../common/enum';

export type RendererEnv = {
    isProd: boolean;
    runtime: typeof store['state']['runtime'];
    devProject: typeof store['state']['devProject'];
};

/**
 * 为渲染进程附加环境变量
 */
function sendRendererEnv(mainWindow: BrowserWindow | null): void {
    const env: RendererEnv = {
        isProd: store.state.isProd,
        runtime: store.state.runtime,
        devProject: store.state.devProject,
    };

    mainWindow?.webContents.send(IpcRendererEventEnum.RENDERER_ENV, env);
    ipcMain.on(IpcMainEventEnum.RENDERER_ENV_READY, () => {
        store.state.mainWindow?.webContents.send(IpcRendererEventEnum.RENDERER_ENV, env);
    });
}

export { sendRendererEnv };
