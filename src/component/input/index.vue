<template>
    <div :class="that.rootClass.value">
        <div class="inner-wrap">
            <div class="wrapper" v-if="that.props.mode === 'textarea'">
                <el-input :ref="that.inputRef" :modelValue="that.innerValue.value" v-bind="that.wrapElInputAttr()" v-on="that.elInputEventBind()" />
            </div>

            <div class="wrapper" v-else>
                <el-input :ref="that.inputRef" :modelValue="that.innerValue.value" v-bind="that.wrapElInputAttr()" v-on="that.elInputEventBind()" />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import './index.css';

import { ElInput } from 'element-plus';
import { VueMountedCycle } from '~common/vue';
import { IPropsExt, IInputComponent } from '../type';
import { defineComponent, SetupContext, ComponentInternalInstance, getCurrentInstance, ref, Ref, watch } from 'vue';

class Init {
    props: IProps;
    context: SetupContext;
    current: ComponentInternalInstance;

    rootClass: Ref<string>;

    // 内部输入值
    innerValue = ref('');
    // 输入框引用
    inputRef: Ref<IInputComponent> = ref({});

    constructor(props: IProps, context: SetupContext, current: ComponentInternalInstance, vueMountedCycle: VueMountedCycle) {
        this.props = props;
        this.context = context;
        this.current = current;

        this.rootClass = ref(`lv-input mode-${props.mode} ${props.class || ''}`);

        // 向外部暴露属性
        context.expose({
            focus: () => {
                this.inputRef.value.focus?.();
            },
        });

        // 内部输入值同步外部更新
        watch(
            () => props.modelValue,
            newVal => {
                this.innerValue.value = newVal || '';
            },
        );

        vueMountedCycle.push(() => {
            this.innerValue.value = props.modelValue || '';
        });
    }

    /**
     * 输入框事件监听绑定
     */
    elInputEventBind() {
        switch (this.props.mode) {
            case 'text':
            default: {
                return {
                    input: (v: string) => {
                        this.context.emit('update:modelValue', v);
                    },
                };
            }
        }
    }

    /**
     * el-input 属性配置
     */
    wrapElInputAttr() {
        switch (this.props.mode) {
            case 'textarea': {
                return {
                    type: 'textarea',
                    rows: this.props.rows,
                    resize: this.props.resize,
                    readonly: this.props.readonly,
                    placeholder: this.props.placeholder,
                };
            }

            case 'text':
            default: {
                return {
                    readonly: this.props.readonly,
                    placeholder: this.props.placeholder,
                };
            }
        }
    }
}

interface IProps extends IPropsExt {
    rows: number;
    readonly: boolean;
    placeholder: string;
    resize: 'none' | 'both' | 'horizontal' | 'vertical';
}

export default defineComponent({
    name: 'lv-input',

    props: {
        modelValue: { type: String },
        class: { type: String, default: '' },
        mode: {
            type: String,
            default: 'default',
            validator(value: string) {
                return ['default', 'text', 'textarea'].includes(value);
            },
        },

        // 行数
        rows: { type: Number, default: 2 },
        // 是否只读
        readonly: { type: Boolean, default: false },
        // 提示语
        placeholder: { type: String, default: '' },
        // 是否可变更输入框大小
        resize: {
            type: null,
            default: 'none',
            validator(value: string) {
                return ['none', 'both', 'horizontal', 'vertical'].includes(value);
            },
        },
    },

    setup(props: IProps, context: SetupContext) {
        const vueMountedCycle = new VueMountedCycle();
        const current = getCurrentInstance() as ComponentInternalInstance;

        const that = new Init(props, context, current, vueMountedCycle);

        vueMountedCycle.trigger();

        return { that };
    },

    emits: {
        'update:modelValue': null,
    },

    components: { ElInput },
});
</script>
