<template>
    <el-config-provider size="small">
        <div class="window-wrap flex-col">
            <div class="top-wrap flex-col-fixed flex-row">
                <lv-input class="flex-row-auto" :ref="that.searchKeyInputRef" v-model="that.searchKey.value" placeholder="关键词搜索" />
                <el-dropdown class="flex-row-fixed" trigger="click" @command="c => that.dropdownCommand(c)">
                    <template v-slot:default>
                        <el-button icon="setting" />
                    </template>
                    <template v-slot:dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item command="operateConfig">操作配置</el-dropdown-item>
                            <el-dropdown-item command="clearClipboard">清空记录</el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </div>

            <div class="clipboard-list-wrap flex-col-auto">
                <div class="scroll-wrap">
                    <div
                        :key="clipboard.id"
                        :class="['clipboard-item', 'clipboard-item-' + index, that.selectedClipboardIndex.value === index ? 'clipboard-item-selected' : '']"
                        v-for="(clipboard, index) of that.clipboardListRender.value"
                    >
                        <div class="inner-content">{{ clipboard.content }}</div>
                    </div>
                </div>
            </div>

            <lv-dialog screen="small" title="操作配置" v-model:visible="that.configDialog.dialogVisible.value">
                <div class="flex-row-between">
                    <span class="line-height-1">自动粘贴</span>
                    <el-checkbox :checked="that.storageData.data.autoPaste" @change="that.configDialog.autoPasteConfigChange" />
                </div>
            </lv-dialog>
        </div>
    </el-config-provider>
</template>

<script lang="ts">
import './style/app.css';

import lodash from 'lodash';
import { clipboard as electronClipboard, ipcRenderer } from 'electron';
import { defineComponent, ref, watch, nextTick, reactive, Ref } from 'vue';

import LvMsgBox from '~component/msgbox';
import LvInput from '~component/input/index.vue';
import { IInputComponent } from '~component/type';
import LvDialog from '~component/dialog/index.vue';
import { ElConfigProvider, ElButton, ElDropdown, ElDropdownMenu, ElDropdownItem, ElCheckbox } from 'element-plus';

import { vuexStore } from './common/vuex';
import { VueMountedCycle } from '~common/vue';
import BScroll, { createBScroll } from '~common/bscroll';
import mousetrap, { bindEscEvent } from '~common/mousetrap';
import { IpcMainEventEnum, IpcRendererEventEnum } from '~common/enum';
import sqlite, { Clipboard as IClipboard, RendererConfig as IRendererConfig, IResolveInfo as ISqliteResolveInfo } from '~sqlite';

class Init {
    // 搜索关键字
    searchKey: Ref<string> = ref('');
    // 搜索输入框引用
    searchKeyInputRef: Ref<IInputComponent> = ref({});

    // 选中的剪贴板历史纪录下标
    selectedClipboardIndex = ref(0);

    // 剪贴板历史记录列表滚动容器实例
    clipboardListBScroll: null | BScroll = null;

    // 过滤后的剪贴板历史记录列表
    clipboardListRender: { value: IClipboard[] } = reactive({ value: [] });

    // 防抖更新剪贴板记录列表
    updateClipboardListDebounce = lodash.debounce(this.updateClipboardList, 333);

    storageData: ReturnType<typeof useStorageData>;
    configDialog: ReturnType<typeof useConfigDialog>;

    constructor(vueMountedCycle: VueMountedCycle) {
        this.storageData = useStorageData();
        this.configDialog = useConfigDialog(this.storageData);

        // 绑定快捷键
        bindEscEvent();
        mousetrap.bind('up', () => {
            if (this.selectedClipboardIndex.value > 0) {
                this.selectedClipboardIndex.value--;
                this.scrollToSelected();
            }
        });
        mousetrap.bind('down', () => {
            if (this.selectedClipboardIndex.value < this.clipboardListRender.value.length - 1) {
                this.selectedClipboardIndex.value++;
                this.scrollToSelected();
            }
        });
        mousetrap.bind('enter', () => {
            this.selectThisItem();
        });
        mousetrap.bind('ctrl+d', () => {
            const selectedClipboard = this.clipboardListRender.value[this.selectedClipboardIndex.value];
            if (selectedClipboard) {
                const oldFilterClipboardListLength = this.clipboardListRender.value.length;

                // 删除记录
                sqlite.clipboard
                    .deleteOne(selectedClipboard.id)
                    .then(() => {
                        vuexStore.commit('DEL_CLIPBOARD_ITEM', selectedClipboard.id);
                        this.updateClipboardList();

                        if (this.selectedClipboardIndex.value === oldFilterClipboardListLength - 1) {
                            this.limitSelectedClipboardIndex('del', oldFilterClipboardListLength);
                            this.scrollToSelected();
                        }
                    })
                    .catch(e => {
                        console.error(e);
                    });
            }
        });

        // 监听剪贴板更新
        ipcRenderer.on(IpcRendererEventEnum.CLIPBOARD_UPDATE, async (_, arg: { clipboard: ISqliteResolveInfo<IClipboard> }) => {
            try {
                if (arg.clipboard.data) {
                    // 最新复制的需要排在第一条，删除旧数据
                    if (arg.clipboard.hasSameRecord && arg.clipboard.deleteRecord) {
                        vuexStore.commit('DEL_CLIPBOARD_ITEM', arg.clipboard.deleteRecord.id);
                    }

                    // 插入记录
                    vuexStore.commit('ADD_CLIPBOARD_ITEM', arg.clipboard.data);
                    this.updateClipboardList();
                    this.resetPosition();
                }
            } catch (e) {
                console.error(e);
            }
        });

        // 搜索
        watch(this.searchKey, newValue => {
            if (newValue === null) {
                this.updateClipboardList();
            } else {
                this.updateClipboardListDebounce();
            }
            if (this.selectedClipboardIndex.value > 0) this.resetPosition();
        });

        // onMounted
        vueMountedCycle.push(() => {
            // Show Windows
            ipcRenderer.on(IpcRendererEventEnum.SHOW_WINDOWS, () => {
                if (this.searchKey.value) {
                    this.searchKey.value = ''; // 会触发该变量的监听，由此触发 resetPosition 函数
                } else {
                    this.resetPosition();
                }
                this.searchInputFocus();
            });

            this.searchInputFocus();
            this.updateClipboardList();
            this.storageData.initData();

            nextTick(() => {
                // 创建滚动容器
                this.clipboardListBScroll = createBScroll({
                    el: '.clipboard-list-wrap',
                    plugins: ['mouseWheel'],
                    option: {
                        mouseWheel: {
                            speed: 20,
                            easeTime: 150,
                            invert: false,
                        },
                    },
                });
            });
        });
    }

    /**
     * 下拉菜单点击事件
     */
    dropdownCommand(command: string) {
        switch (command) {
            case 'operateConfig': {
                this.configDialog.dialogVisible.value = true;
                break;
            }
            case 'clearClipboard': {
                LvMsgBox.confirm('是否确定清空复制记录', '警告', {
                    type: 'warning',
                    screen: 'small',
                })
                    .then(() => {
                        this.clearClipboard();
                    })
                    .catch(e => {
                        console.error(e);
                    });
                break;
            }
        }
    }

    /**
     * Auto focus
     */
    searchInputFocus() {
        this.searchKeyInputRef.value.focus?.();
    }

    /**
     * 清空剪贴板记录
     */
    async clearClipboard() {
        try {
            await sqlite.clipboard.deleteAll();
            this.resetPosition();
            vuexStore.commit('CLEAR_CLIPBOARD');
            this.updateClipboardList();
        } catch (e) {
            console.error(e);
        }
    }

    /**
     * 选择当前项
     */
    selectThisItem(idx?: number) {
        let selectIndex = this.selectedClipboardIndex.value;
        if (idx !== void 0) {
            selectIndex = idx;
        }
        const selectedClipboard = this.clipboardListRender.value[selectIndex];
        if (selectedClipboard) {
            electronClipboard.writeText(selectedClipboard.content);
            if (this.storageData.data.autoPaste) {
                ipcRenderer.send(IpcMainEventEnum.BACKEND_WINDOWS_AND_PASTE);
            } else {
                ipcRenderer.send(IpcMainEventEnum.BACKEND_WINDOWS);
            }
        }
    }

    /**
     * 重置滚动位置
     */
    resetPosition() {
        this.selectedClipboardIndex.value = 0;
        this.clipboardListBScroll?.scrollTo(0, 0, 300);
    }

    /**
     * 定位到选中的历史记录
     */
    scrollToSelected() {
        this.clipboardListBScroll?.scrollToElement(`.clipboard-item-${this.selectedClipboardIndex.value}`, 300, false, true);
    }

    /**
     * 限制 selectedClipboardIndex 下标移动范围
     */
    limitSelectedClipboardIndex(operate: 'add' | 'del', oldLength: number) {
        const curIndex = this.selectedClipboardIndex.value;
        const newLength = this.clipboardListRender.value.length;

        if (oldLength === 0 || newLength === 0) {
            this.selectedClipboardIndex.value = 0;
            return;
        }
        if (operate === 'add') {
            if (oldLength === newLength) return;
            if (curIndex < newLength - 1) this.selectedClipboardIndex.value++;
        }
        if (operate === 'del') {
            if (curIndex > 0) this.selectedClipboardIndex.value--;
        }
    }

    /**
     * 更新剪贴板历史记录列表
     */
    updateClipboardList() {
        const filterList = vuexStore.state.clipboard.list;
        this.clipboardListRender.value = filterList.filter(item => {
            if (this.searchKey.value) {
                const searchArr = this.searchKey.value.split(/\s+/);
                return searchArr.every(search => {
                    return item.content.includes(search);
                });
            } else {
                return true;
            }
        });

        nextTick(() => {
            // 滚动元素有更新，需要重置
            this.clipboardListBScroll?.refresh();
        });
    }
}

export default defineComponent({
    setup() {
        const vueMountedCycle = new VueMountedCycle();
        const that = new Init(vueMountedCycle);
        vueMountedCycle.trigger();

        return { that };
    },

    components: { LvInput, LvDialog, ElConfigProvider, ElButton, ElDropdown, ElDropdownMenu, ElDropdownItem, ElCheckbox },
});

/**
 * 本地存储数据
 */
function useStorageData() {
    const data = reactive({
        autoPaste: false,
    });

    async function initData() {
        const resolveInfo: ISqliteResolveInfo<IRendererConfig> = await sqlite.rendererConfig.search('copid');
        if (resolveInfo.data) {
            Object.assign(data, JSON.parse(resolveInfo.data.config));
        }
    }

    async function saveData() {
        await sqlite.rendererConfig.update('copid', JSON.stringify(data));
    }

    return {
        data,
        initData,
        saveData,
    };
}

/**
 * 配置对话框
 */
function useConfigDialog(storageData: ReturnType<typeof useStorageData>) {
    const dialogVisible = ref(false);

    function autoPasteConfigChange(flag: boolean) {
        storageData.data.autoPaste = flag;
        storageData.saveData();
    }

    return {
        dialogVisible,
        autoPasteConfigChange,
    };
}
</script>
