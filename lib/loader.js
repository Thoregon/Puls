/**
 * This is a base class for loaders
 *
 * todo: introduce subscriptions to update resources automatically
 *
 * @author: blukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

class Loader {

    constructor(props) {
        this._state  = 'init';
        this._readyQ = [];
    }

    /*
     * implement by subclasses
     */

    async doStart() {}
    async doFetch(request) {}
    async doStop() {}

    /*
     * lifecycle
     */

    start() {
        (async () => {
            this._state = 'starting';
            try {
                await this.doStart();
                this._state = 'ready';
                await this.processReadyQ();
            } catch (e) {
                console.log("$$ Loader error at start:", e);
                this._state = 'error';
            }
        })();
    }

    /*async*/ fetch(request) {
        return new Promise(async (resolve, reject) => {
            if (!this.isActive()) return;   // let next loader handle the request
            if (this.isReady()) {
                try {
                    let res = await this.doFetch(request);
                    resolve(res);
                } catch (e) {
                    reject(e);
                }
            } else {
                // while starting enqueue the requests, process it later when ready
                this._readyQ.push({ request, resolve, reject });
            }
        });
    }

    stop() {
        (async () => {
            this.stateTerminating();
            try {
                await this.doStop();
            } catch (ignore) {
                console.log('Loader', e);
            }
            this.stateTerminated();
        })();
    }

    async processReadyQ() {
        await forEach(async ({request, resolve, reject}) => {
            try {
                let res = await this.doFetch(request);
                resolve(res);
            } catch (e) {
                reject(e);
            }
        });
    }

    /*
     * states
     */

    isActive() {
        return !(this._state === 'error' || this._state === 'terminating' || this._state === 'terminated');
    }

    isReady() {
        return this._state === 'ready';
    }

    stateStarting() {
        this._state = 'starting';
    }

    stateReady() {
        this._state = 'ready';
    }

    stateError() {
        this._state = 'error';
    }

    stateTerminating() {
        this._state = 'terminating';
    }

    stateTerminated() {
        this._state = 'terminated';
    }

}
