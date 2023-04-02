import { onMounted } from 'vue';

export class VueMountedCycle {
    callbackList: Array<() => void>;

    constructor() {
        this.callbackList = [];
    }

    push(cb: () => void): void {
        this.callbackList.push(cb);
    }

    trigger(): void {
        onMounted(() => {
            this.callbackList.forEach(cb => cb());
        });
    }
}
