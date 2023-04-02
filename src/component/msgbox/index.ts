import './index.css';

import { ElMessageBox } from 'element-plus';

function confirm(
    content: string,
    title: string,
    options?: {
        class?: string;
        screen?: 'small' | undefined;
        type?: 'success' | 'warning' | 'info' | 'error' | undefined;
    },
): Promise<void> {
    // ...

    const customClass = ['lv-message-box-confirm', `${options?.class || ''}`, `screen-${options?.screen || 'default'}`].filter(t => !!t).join(' ');

    return new Promise((resolve, reject) => {
        ElMessageBox.confirm(content, title, {
            customClass,
            type: options?.type || 'info',
            showClose: false,
            closeOnClickModal: false,
            closeOnPressEscape: false,
            cancelButtonText: '取消',
            confirmButtonText: '确定',
        })
            .then(() => {
                resolve();
            })
            .catch(e => {
                reject(e);
            });
    });
}

// as LvMsgBox
export default {
    confirm,
};
