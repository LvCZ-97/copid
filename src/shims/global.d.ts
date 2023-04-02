declare global {
    import electron from 'electron';

    interface Console {
        _notify: (message: unknown) => void;
        _log: (...message: Array<unknown>) => void;
        _error: (...message: Array<unknown>) => void;
    }
    interface Window {
        electron: typeof electron;
    }
}

export {};
