/**
 * This is a base class for loaders
 *
 * todo:
 *  - introduce subscriptions to update resources automatically
 *  - widget support
 *      -> see ModuleResolver.buildWidgetScript
 *  - Sandbox & instrumentation: replacements when special URL ...?sandbox=true
 *      - hooks to pipe through the content
 *
 *      -> see https://github.com/googlearchive/caja
 *      -> see https://developers.google.com/closure/
 *      - add local variables
 *      -> const _window = {}, _document = {};
 *      - replace globals which are direcly referenced
 *          - array of allowed globals
 *          - wrap some globals (some with
 *              - import() -> add '?sandbox=true' to the URL
 *              - indexedDB
 *              - ...
 *      - extend 'import from' URLs with '?sandbox=true'
 *
 * @author: blukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

class Loader {

    constructor(options) {
        this.options = options;
        this._state  = 'init';
        this._readyQ = [];
        this._settings = {};
    }

    /*
     * implement by subclasses
     */

    async doStart() {}
    async doFetch(request) {}
    async doStop() {}

    //
    // override if necessary
    //

    canHandle(request) {
        return true;
    }

    /*
     * lifecycle
     */

    init(...options) {
        this.options = options;
    }

    start() {
        (async () => {
            this.stateStarting();
            try {
                await this.doStart();
                this.stateReady();
                await this.processReadyQ();
            } catch (e) {
                console.log("$$ Loader error at start:", e);
                this._state = 'error';
            }
        })();
    }

    /*async*/ fetch(request) {
        return new Promise(async (resolve, reject) => {
            // check if the loader can process the request, let next loader handle the request
            if (!this.canHandle(request)) { resolve(); return; }
            if (this.isPaused())          { resolve(); return; }
            if (!this.isActive())         { resolve(); return; }
            if (this.isReady()) {
                try {
                    let res = await this.doFetch(request);
                    resolve(res);
                } catch (e) {
                    console.log("$$ Loader", e);
                    resolve();
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

    pause() {
        this.statePaused();
    }

    resume(settings) {
        this._settings = settings;
        this.stateReady();
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

    isPaused() {
        return this._state === 'paused';
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

    statePaused() {
        this._state = 'paused';
    }

}
