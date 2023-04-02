export const IpcMainEventEnum = {
    RENDERER_ENV_READY: 'renderer_env_ready',

    BACKEND_WINDOWS: 'backend_windows',
    BACKEND_WINDOWS_AND_PASTE: 'backend_windows_and_paste',
};

export const IpcRendererEventEnum = {
    SHOW_WINDOWS: 'show_windows',
    RENDERER_ENV: 'renderer_env',
    CLIPBOARD_UPDATE: 'clipboard_update',
};
