// @ts-nocheck

import dll from './dll';
import ref from 'ref-napi';

/**
 * 发送组合键
 *
 * https://docs.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-sendinput
 */
function SendInput(structNum: number, lpInput: unknown, size: number): void {
    dll.user32.SendInput(structNum, lpInput, size);
}

/**
 * 返回当前线程 ID

 * https://docs.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-getcurrentthreadid
 */
function GetCurrentThreadId(): number | null {
    return dll.kernel32.GetCurrentThreadId();
}

/**
 * 将一个线程的输入处理机制附加或分离到另一个线程的输入处理机制
 *
 * https://docs.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-attachthreadinput
 */
function AttachThreadInput(idAttach: number, idAttachTo: number, fAttach: boolean): void {
    dll.user32.AttachThreadInput(idAttach, idAttachTo, fAttach);
}

/**
 * 发送消息
 *
 * https://docs.microsoft.com/zh-cn/windows/win32/api/winuser/nf-winuser-sendmessagew
 */
function SendMessage(hWnd: number, Msg: number, wParam: number, lParam: number): boolean {
    return dll.user32.SendMessageW(hWnd, Msg, wParam, lParam);
}

/**
 * 发送消息
 *
 * https://docs.microsoft.com/zh-cn/windows/win32/api/winuser/nf-winuser-sendmessagew
 */
function PostMessage(hWnd: number, Msg: number, wParam: number, lParam: number): boolean {
    return dll.user32.PostMessageW(hWnd, Msg, wParam, lParam);
}

/**
 * 获取窗口进程线程标识
 *
 * https://docs.microsoft.com/zh-cn/windows/win32/api/winuser/nf-winuser-getwindowthreadprocessid
 */
function GetWindowThreadProcessId(hWnd: number): { tid: number; pid: number } | null {
    const pidBuf = ref.alloc('ulong', 0);
    const tid = dll.user32.GetWindowThreadProcessId(hWnd, pidBuf);
    const pid = ref.deref(pidBuf);
    if (tid && pid) {
        return { tid, pid };
    } else {
        return null;
    }
}

/**
 * 获取窗口句柄
 *
 * https://docs.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-findwindowa
 */
function FindWindowA(lpClassName: null | string, lpWindowName: null | string): number | null {
    return dll.user32.FindWindowA(lpClassName, lpWindowName);
}

/**
 * 获取聚焦控件句柄
 *
 * https://docs.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-getfocus
 */
function GetFocus(): number | null {
    return dll.user32.GetFocus();
}

/**
 * 获取活跃窗口句柄
 *
 * https://docs.microsoft.com/zh-cn/windows/win32/api/winuser/nf-winuser-getforegroundwindow
 */
function GetForegroundWindow(): number | null {
    return dll.user32.GetForegroundWindow();
}

/**
 * 获取与指定窗口具有指定关系的窗口句柄
 *
 * https://docs.microsoft.com/zh-cn/windows/win32/api/winuser/nf-winuser-getwindow
 */
function GetWindow(hWnd: number, uCmd: number): number | null {
    return dll.user32.GetWindow(hWnd, uCmd);
}

/**
 * 获取指定窗口的父级窗口句柄
 *
 * https://docs.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-getparent
 */
function GetParent(hWnd: number): number | null {
    return dll.user32.GetParent(hWnd);
}

/**
 * 切换窗口
 *
 * https://docs.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-switchtothiswindow
 */
function SwitchToThisWindow(hwnd: number, fUnknown: boolean): void {
    dll.user32.SwitchToThisWindow(hwnd, fUnknown);
}

/**
 * 从调用线程的消息队列中检索消息
 *
 * https://docs.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-getmessagea
 */
function GetMessageA(lpMsg: null | Buffer, hWnd: null | number, wMsgFilterMin: number, wMsgFilterMax: null | number): number | null {
    return dll.user32.GetMessageA(lpMsg, hWnd, wMsgFilterMin, wMsgFilterMax);
}

/**
 * 开启剪贴板
 *
 * https://docs.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-openclipboard
 */
function OpenClipboard(hWndNewOwner: null | number): Promise<boolean> {
    return dll.user32.OpenClipboard(hWndNewOwner);
}

/**
 * 关闭剪贴板
 *
 * https://docs.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-closeclipboard
 */
function CloseClipboard(): Promise<boolean> {
    return dll.user32.CloseClipboard();
}

/**
 * 获取剪贴板内容
 *
 * https://docs.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-getclipboarddata
 */
function GetClipboardData(uFormat: null | number): string {
    return dll.user32.GetClipboardData(uFormat);
}

/**
 * 添加剪贴板格式侦听器
 *
 * https://docs.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-addclipboardformatlistener
 */
function AddClipboardFormatListener(hwnd: number): boolean {
    return dll.user32.AddClipboardFormatListener(hwnd);
}

export default {
    GetFocus,
    GetWindow,
    GetParent,
    FindWindowA,
    GetCurrentThreadId,
    GetForegroundWindow,
    GetWindowThreadProcessId,

    AttachThreadInput,
    SwitchToThisWindow,

    SendInput,
    GetMessageA,
    SendMessage,
    PostMessage,

    OpenClipboard,
    CloseClipboard,
    GetClipboardData,
    AddClipboardFormatListener,
};
