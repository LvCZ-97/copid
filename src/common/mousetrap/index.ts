import mousetrap from 'mousetrap';
import { IpcMainEventEnum } from '../enum';

const { ipcRenderer } = window.electron;

mousetrap.prototype.stopCallback = () => false;

interface IBindEscEventOptions {
    afterCallback?: () => void;
}

/**
 * 绑定 ESC 按键事件
 */
export function bindEscEvent(options?: IBindEscEventOptions): void {
    mousetrap.bind('esc', () => {
        ipcRenderer.send(IpcMainEventEnum.BACKEND_WINDOWS);
        options?.afterCallback?.();
    });
}

export default mousetrap;
