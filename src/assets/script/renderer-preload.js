/**
 * 1、渲染进程在页面中运行其他脚本之前加载该脚本
 * 2、可访问 Node 模块
 * 3、可以通过 contextBridge 向渲染进程暴露 API，挂载在 window 上
 *
 * https://www.electronjs.org/docs/latest/api/browser-window#new-browserwindowoptions
 * https://www.electronjs.org/docs/latest/api/context-bridge#exposing-node-global-symbols
 */

const electron = require('electron');

window.electron = electron;
