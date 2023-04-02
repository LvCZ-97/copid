import 'element-plus/es/components/message/style/css';
import 'element-plus/theme-chalk/index.css';
import '../assets/style/element.css';
import '../assets/style/common.css';

import App from './App.vue';
import sqlite from '~sqlite';
import { createApp } from 'vue';
import { vuexStore, vuexInjectionKey } from './common/vuex';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';

(async function () {
    try {
        // 由数据库缓存到 Vuex
        const resolveInfo = await sqlite.clipboard.searchAll({ reverse: true });
        vuexStore.commit('SAVE_CLIPBOARD_LIST', resolveInfo.data);

        const app = createApp(App);

        app.use(vuexStore, vuexInjectionKey);

        // 注册所有 Icon
        for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
            app.component(key, component);
        }

        app.mount('#copidWindow');

        // ...
    } catch (e) {
        console.error(e);
    }
})();
