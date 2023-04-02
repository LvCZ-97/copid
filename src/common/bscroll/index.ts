// https://better-scroll.github.io/docs/zh-CN/guide/
// https://better-scroll.github.io/docs/zh-CN/plugins/

import MouseWheel from '@better-scroll/mouse-wheel';
import BScroll, { Options as BSOptions } from '@better-scroll/core';

interface IOptions {
    option?: BSOptions;
    el: string | HTMLElement;
    plugins?: Array<'mouseWheel'>;
}

const plugins = [MouseWheel];

function createBScroll(options: IOptions): BScroll {
    // 附加插件
    options.plugins?.forEach(pluginName => {
        const findPlugin = plugins.find(p => p.pluginName === pluginName);
        findPlugin && BScroll.use(findPlugin);
    });

    return new BScroll(options.el, options.option || {});
}

export { createBScroll };

export default BScroll;
