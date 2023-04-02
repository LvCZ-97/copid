import path from 'path';
import osUtils from '~common/help';
import type robotjs from '@jitsi/robotjs';

// 自动根据平台引入 .node 文件
const dirname = path.resolve(osUtils.getMainDirAtPath(), 'main');
const robot: typeof robotjs = require('node-gyp-build')(dirname);

/**
 * 粘贴行为
 */
function virtualKeyPaste() {
    robot.keyTap('v', 'command');
    robot.keyToggle('v', 'up');
}

/**
 * 激活上一个窗口
 */
function activatePrevWindow() {
    robot.keyTap('tab', 'command');
    robot.keyToggle('tab', 'up');
}

/**
 * 打字
 */
function typeString(content: string) {
    robot.typeString(content);
}

// as hotkey
export default {
    typeString,
    virtualKeyPaste,
    activatePrevWindow,
};
