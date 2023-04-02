import { Notification } from 'electron';
import { mainProcessErr, mainProcessLog } from './log';

/**
 * 代理 Console
 */
function proxyConsole(): void {
    const proxyLog = console.log;
    const proxyError = console.error;

    console._log = proxyLog;
    console._error = proxyError;

    console.log = function (...e: unknown[]) {
        if (e) {
            mainProcessLog(...e);
            proxyLog(...e);
        }
    };

    console.error = function (e: unknown) {
        if (e) {
            mainProcessErr(e);
            if (Notification.isSupported()) {
                const notify = new Notification({
                    silent: false,
                    title: 'Tetetool Error',
                    body: typeof e === 'string' ? e : JSON.stringify(e),
                });
                notify.show();
            } else {
                proxyError(e);
            }
        }
    };

    console._notify = function (e: unknown) {
        if (Notification.isSupported()) {
            const notify = new Notification({
                silent: false,
                title: 'Tetetool',
                body: typeof e === 'string' ? e : JSON.stringify(e),
            });
            notify.show();
        }
    };
}

export { proxyConsole };
