import { InjectionKey } from 'vue';
import { createStore, Store } from 'vuex';
import { Clipboard as IClipboard } from '~sqlite';

export const vuexInjectionKey: InjectionKey<Store<IVuexState>> = Symbol('injection_key');

export interface IVuexState {
    // 剪贴板信息
    clipboard: {
        list: IClipboard[]; // 历史记录
    };
}

export const vuexStore = createStore<IVuexState>({
    state: {
        clipboard: { list: [] },
    },

    mutations: {
        SAVE_CLIPBOARD_LIST(state, list) {
            state.clipboard.list = list;
        },
        CLEAR_CLIPBOARD(state) {
            state.clipboard.list = [];
        },
        ADD_CLIPBOARD_ITEM(state, item) {
            state.clipboard.list.unshift(item);
        },
        DEL_CLIPBOARD_ITEM(state, id) {
            const findIndex = state.clipboard.list.findIndex(f => f.id === id);
            if (findIndex > -1) state.clipboard.list.splice(findIndex, 1);
        },
    },
});
