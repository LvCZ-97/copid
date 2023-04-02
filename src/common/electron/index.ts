const { ipcRenderer, clipboard } = window.electron;

/**
 * 写入剪贴板内容
 */
function clipboardWriteText(content: string) {
    clipboard.writeText(content);
}

export default {
    ipcRenderer,
    clipboardWriteText,
};
