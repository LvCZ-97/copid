// ...

export default {
    // ...

    /**
     * 窗口关系
     *
     * https://docs.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-getwindow
     */
    GW_CHILD: 5, // 子窗口
    GW_HWNDPREV: 3, // 上一个窗口关系

    /**
     * 按键编码
     *
     * https://docs.microsoft.com/en-us/windows/win32/inputdev/virtual-key-codes
     */
    VK_C: 0x43,
    VK_V: 0x56,
    VK_CONTROL: 0x11,

    /**
     * 消息编码
     *
     * https://docs.microsoft.com/en-us/windows/win32/winmsg/about-messages-and-message-queues
     */
    WM_CHAR: 0x0102,
    WM_KEYUP: 0x0101,
    WM_KEYDOWN: 0x0100,
    WM_PASTE: 0x0302,
    WM_CLIPBOARDUPDATE: 0x031d, // 剪贴板更新

    /**
     * INPUT structure type
     *
     * https://docs.microsoft.com/zh-cn/windows/win32/api/winuser/ns-winuser-input?redirectedfrom=MSDN
     */
    INPUT_MOUSE: 0,
    INPUT_KEYBOARD: 1,
    INPUT_HARDWARE: 2,

    /**
     * KEYBDINPUT structure dwFlags
     *
     * https://docs.microsoft.com/en-us/windows/win32/api/winuser/ns-winuser-keybdinput
     */
    KEYEVENTF_EXTENDEDKEY: 0x0001,
    KEYEVENTF_KEYUP: 0x0002,
    KEYEVENTF_UNICODE: 0x0004,
    KEYEVENTF_SCANCODE: 0x0008,
};
