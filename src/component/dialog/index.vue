<template>
    <div :class="that.rootClass.value">
        <div class="inner-wrap">
            <div class="wrapper" v-if="that.props.mode === 'confirm'">
                <el-dialog :modelValue="that.props.visible" v-on="that.elDialogEventBind()" v-bind="that.wrapElDialogAttr().value">
                    <div class="dialog-content">
                        <slot></slot>
                    </div>
                    <div class="dialog-footer flex-row-center-right">
                        <el-button type="primary" @click="that.confirm()">确认</el-button>
                        <el-button @click="that.close()">取消</el-button>
                    </div>
                </el-dialog>
            </div>

            <div class="wrapper" v-else>
                <el-dialog :modelValue="that.props.visible" v-on="that.elDialogEventBind()" v-bind="that.wrapElDialogAttr().value">
                    <div class="dialog-content">
                        <slot></slot>
                    </div>
                </el-dialog>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import './index.css';

import { IPropsExt } from '../type';
import { ElDialog, ElButton } from 'element-plus';
import { defineComponent, SetupContext, getCurrentInstance, ComponentInternalInstance, Ref, ref, computed } from 'vue';

class Init {
    props: IProps;
    context: SetupContext;
    current: ComponentInternalInstance;

    rootClass: Ref<string>;

    constructor(props: IProps, context: SetupContext, current: ComponentInternalInstance) {
        this.props = props;
        this.context = context;
        this.current = current;

        this.rootClass = ref(`lv-dialog mode-${props.mode} ${props.class || ''} screen-${props.screen}`);

        context.expose({
            close: () => {
                this.close();
            },
        });
    }

    close() {
        this.context.emit('close');
        this.context.emit('update:visible', false);
    }

    confirm() {
        this.context.emit('confirm');
    }

    /**
     *  el-dialog 事件监听
     */
    elDialogEventBind() {
        switch (this.props.mode) {
            case 'confirm':
            default:
                return {
                    close: () => {
                        this.close();
                    },
                };
        }
    }

    /**
     * el-dialog 属性配置
     */
    wrapElDialogAttr() {
        const base = computed(() => {
            return {
                width: this.props.width || this.getDialogDefaultWidth(),
                title: this.props.title,
                'close-on-click-modal': false,
            };
        });
        switch (this.props.mode) {
            case 'confirm':
            default:
                return computed(() => {
                    return {
                        ...base.value,
                    };
                });
        }
    }

    /**
     * 对话框默认宽度
     */
    getDialogDefaultWidth() {
        switch (this.props.screen) {
            case 'small':
                return '90%';
            default:
                return '50%';
        }
    }
}

interface IProps extends IPropsExt<boolean> {
    width?: string;
    title: string;
    screen: string;
    visible: boolean;
}

export default defineComponent({
    name: 'lv-dialog',

    props: {
        class: { type: String, default: '' },
        mode: {
            type: String,
            default: 'default',
            validator(value: string) {
                return ['default', 'confirm'].includes(value);
            },
        },

        width: { type: String },
        title: { type: String, default: '标题' },
        screen: {
            type: String,
            default: 'default',
            validator(value: string) {
                return ['default', 'small'].includes(value);
            },
        },
        visible: { type: Boolean, default: false, required: true },
    },

    setup(props: IProps, context: SetupContext) {
        const current = getCurrentInstance() as ComponentInternalInstance;

        const that = new Init(props, context, current);

        return { that };
    },

    emits: {
        close: null,
        confirm: null,
        'update:visible': null,
    },

    components: { ElDialog, ElButton },
});
</script>
