import ref from 'ref-napi';

import sdk from '../sdk';
import dll from '../dll';
import def from '../def';

/**
 * 获取活跃窗口句柄以及焦点控件句柄
 */
function getFocusControlHandle():
    | {
          focusControlHandle: number;
          foregroundWindowHandle: number;
          closeAttachThreadInput: () => void;
      }
    | undefined {
    // ...
    const foregroundWinHandle = sdk.GetForegroundWindow();
    if (foregroundWinHandle) {
        const currentThreadId = sdk.GetCurrentThreadId();
        const foregroundWinThreadId = sdk.GetWindowThreadProcessId(foregroundWinHandle);
        if (currentThreadId && foregroundWinThreadId) {
            sdk.AttachThreadInput(foregroundWinThreadId.tid, currentThreadId, true);
            const focusCtrlHandle = sdk.GetFocus();
            if (focusCtrlHandle) {
                return {
                    focusControlHandle: focusCtrlHandle,
                    foregroundWindowHandle: foregroundWinHandle,
                    closeAttachThreadInput: () => {
                        sdk.AttachThreadInput(foregroundWinThreadId.tid, currentThreadId, false);
                    },
                };
            }
        }
    }
}

/**
 * 虚拟按键
 */
function virtualKeyDown(vks: number[]): void {
    const inputCount = vks.length * 2;
    const inputArray = Buffer.alloc(inputCount * dll.type.lpInput.size);

    for (let i = 0; i < inputCount; i++) {
        let lpInput = null;

        if (i < inputCount / 2) {
            const keybdinput = dll.type.keybdinput({
                wVk: vks[i % 2],
                wScan: 0,
                time: 0,
                dwFlags: 0,
                dwExtraInfo: ref.NULL_POINTER,
            });
            lpInput = dll.type.lpInput({
                type: def.INPUT_KEYBOARD,
                union: dll.type.inputUnion({ ki: keybdinput }),
            });
        } else {
            const keybdinput = dll.type.keybdinput({
                wVk: vks[i % 2],
                wScan: 0,
                time: 0,
                dwFlags: def.KEYEVENTF_KEYUP,
                dwExtraInfo: ref.NULL_POINTER,
            });
            lpInput = dll.type.lpInput({
                type: def.INPUT_KEYBOARD,
                union: dll.type.inputUnion({ ki: keybdinput }),
            });
        }

        lpInput.ref().copy(inputArray, i * dll.type.lpInput.size);
    }

    sdk.SendInput(inputCount, inputArray, dll.type.lpInput.size);
}

/**
 * 粘贴行为
 */
function virtualKeyPaste(): void {
    virtualKeyDown([def.VK_CONTROL, def.VK_V]);
}

// as windowsNative
export default {
    virtualKeyDown,
    virtualKeyPaste,

    getFocusControlHandle,
};
