export interface IPropsExt<T = string> {
    // ...

    mode?: string;

    class?: string;

    modelValue?: T;
    modelModifiers?: Record<string, unknown>;
}
