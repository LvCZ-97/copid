declare module 'vue/dist/vue.global.prod';
declare module 'vue/dist/vue.esm-bundler';

declare module '*.vue' {
    import { DefineComponent } from 'vue';
    const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;
    export default component;
}
