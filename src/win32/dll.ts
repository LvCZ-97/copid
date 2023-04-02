import ffi from 'ffi-napi';
import ref from 'ref-napi';
import refStructDi from 'ref-struct-di';

// 使用 @types 会构建失败
// @ts-ignore
import refUnionDi from 'ref-union-di';

const unionType = refUnionDi(ref);
const structType = refStructDi(ref);

const ulong = ref.types.ulong;
const voidPtr = ref.refType(ref.types.void);
const ulongPtr = ref.refType(ref.types.ulong);

const mouseinput = structType({
    dx: 'int32',
    dy: 'int32',
    mouseData: 'uint32',
    dwFlags: 'uint32',
    time: 'uint32',
    dwExtraInfo: 'pointer'
});
const keybdinput = structType({
    wVk: 'uint16',
    wScan: 'uint16',
    dwFlags: 'uint32',
    time: 'uint32',
    dwExtraInfo: 'pointer'
});
const hardwareinput = structType({
    uMsg: 'uint32',
    wParamL: 'uint16',
    wParamH: 'uint16'
});
const inputUnion = unionType({
    mi: mouseinput,
    ki: keybdinput,
    hi: hardwareinput
});
const lpInput = structType({
    type: 'uint32',
    union: inputUnion
});

const user32 = ffi.Library('user32.dll', {
    GetFocus: ['int', []],
    GetWindow: ['int', ['int', 'uint']],
    GetForegroundWindow: ['int', []],
    GetParent: ['int', ['int']],
    FindWindowA: ['int', ['pointer', 'string']],
    GetWindowThreadProcessId: ['int', ['int', ulongPtr]],

    SwitchToThisWindow: ['void', ['int', 'bool']],
    AttachThreadInput: ['int', ['int', 'int', 'bool']],

    SendInput: ['int', ['int', 'pointer', 'int']],
    GetMessageA: ['bool', [voidPtr, 'pointer', 'uint', 'uint']],
    SendMessageW: ['bool', ['long', 'long', 'long', ulong]],
    PostMessageW: ['bool', ['long', 'long', 'long', ulong]],
    SetWinEventHook: ['int', ['int', 'int', 'pointer', 'pointer', 'int', 'int', 'int']],

    CloseClipboard: ['bool', []],
    OpenClipboard: ['bool', ['int']],
    GetClipboardData: ['string', ['pointer']],
    AddClipboardFormatListener: ['bool', ['int']]
});

const kernel32 = ffi.Library('kernel32.dll', {
    GetCurrentThreadId: ['int', []]
});

// as win32Dll
export default {
    type: {
        ulong,
        voidPtr,
        ulongPtr,

        mouseinput,
        keybdinput,
        hardwareinput,
        inputUnion,
        lpInput
    },

    user32,
    kernel32
};
