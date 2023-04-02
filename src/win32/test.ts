import win32Sdk from './sdk';

(async () => {
    try {
        const focusCtrlHandle = win32Sdk.GetFocus();
        console.log('focusCtrlHandle -> ', focusCtrlHandle);

        // ...
    } catch (e) {
        console.error('error -> ', e);
    }
})();
