import sdk from '../sdk';

export default {
    /**
     * 添加剪贴板格式侦听器
     */
    addClipboardFormatListener(lpWindowName: null | string): { windowHandle: number } | undefined {
        const windowHandle = sdk.FindWindowA(null, lpWindowName);
        if (windowHandle) {
            const success = sdk.AddClipboardFormatListener(windowHandle);
            if (success) {
                return { windowHandle };
            }
        }
    },

    /**
     * 添加剪贴板格式侦听器
     */
    addClipboardFormatListenerByWinHandle(windowHandle: number): boolean {
        return sdk.AddClipboardFormatListener(windowHandle);
    },
};
