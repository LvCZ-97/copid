import path from 'path';
import store from './store';
import log4js from 'log4js';

const pattern = '[%d{yyyy-MM-dd hh:mm:ss}]%n%n%m%n%n%n';

function getLogFileName() {
    const d = new Date();
    const year = d.getFullYear();
    let month = d.getMonth() + 1 + '';
    let date = d.getDate() + '';
    if (parseInt(month) < 10) month = '0' + month;
    if (parseInt(date) < 10) date = '0' + date;
    return `${year}${month}${date}`;
}

function filename(dir: string) {
    return path.join(logFileDir(dir), getLogFileName() + '.log');
}

function logFileDir(dir: string) {
    return path.resolve(store.state.runtime.paths.logSave, dir);
}

log4js.configure({
    appenders: {
        mainProcessLog: {
            type: 'file',
            filename: filename('main-process-log'),
            layout: { type: 'pattern', pattern },
        },

        mainProcessErr: {
            type: 'file',
            filename: filename('main-process-error'),
            layout: { type: 'pattern', pattern },
        },
    },

    categories: {
        default: { appenders: ['mainProcessLog'], level: 'all' },
        mainProcessLog: { appenders: ['mainProcessLog'], level: 'all' },
        mainProcessErr: { appenders: ['mainProcessErr'], level: 'error' },
    },
});

// 日志
export function mainProcessLog(...message: unknown[]): void {
    try {
        let msg = '';
        message.forEach(m => {
            if (typeof m === 'string') {
                msg += m + '\n';
            } else {
                msg += JSON.stringify(m) + '\n';
            }
        });
        log4js.getLogger('mainProcessLog').info(msg);
    } catch (error) {
        console._error(error);
    }
}

// 错误日志
export function mainProcessErr(...message: unknown[]): void {
    try {
        let msg = '';
        message.forEach(m => {
            if (typeof m === 'string') {
                msg += m + '\n';
            } else {
                msg += JSON.stringify(m) + '\n';
            }
        });
        log4js.getLogger('mainProcessErr').error(msg);
    } catch (error) {
        console._error(error);
    }
}
