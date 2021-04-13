import { initializeStore } from '@lib/redux/store';
import { dispatcher }      from '@lib/redux/dispatcher';

export class dispatcherClass {

    
    constructor() {
        this.reduxStore = initializeStore();
        this.dispatch   = this.reduxStore.dispatch;
        this.error      = false;
    }

    async dispatchers (updateStore) {
    
        const defaultParams = {
            light     : false,
            lastUpdate: Date.now(),
        };
    
        try {
    
            for (let index = 0; index < updateStore.length; index++) {
                const element = { ...defaultParams, ...updateStore[index] };
    
                dispatcher({
                    type      : element.type,
                    light     : element.light,
                    lastUpdate: element.lastUpdate,
                    data      : element.data
                });
            }
    
        } catch (e) {
            console.error(e);
            this.error = true;
        }
    
        return { props: { error: this.error, initialReduxState: this.reduxStore.getState() } };
    }

}
