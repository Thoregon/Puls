/**
 * Thoregon micro kernel
 *
 * Works as a bootloader, loads basic components.
 * - ipfs
 * From ipfs:
 * - gun
 * - evolux.universe
 * - evolux.dyncomponents
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */
// import Spike from "./lib/spike.mjs";

// console.log('## genesis.mjs START');

const timeout = (ms) => new Promise(resolve => setTimeout(resolve, ms));
// just push back to the event loop and perform following steps 'async' (simulated)
const doAsync = () => timeout(0);

let registration;

const rnd = (l, c) => {
    var s = '';
    l = l || 24; // you are not going to make a 0 length random number, so no need to check type
    c = c || '0123456789ABCDEFGHIJKLMNOPQRSTUVWXZabcdefghijklmnopqrstuvwxyz';
    while(l > 0){ s += c.charAt(Math.floor(Math.random() * c.length)); l-- }
    return s;
}

/*
    clientparams: recognise kind of peer/client
    - nature: sovereign (standalone peer, providing services)
        - density: headless
        - density: headed
    - nature: reliant (from an individual, typically in a browser)
        - density: lite
        - density: rich

   yes, this can be faked by the peer but it does not matter because the peers can decide themselves what they are
   it is not of interest for the loader
 */
const url = new URL(document.location.href);
const devparam = url.searchParams.get('isDev');
const isDev = devparam ? devparam === 'true' || devparam === '1' : window.location.hostname === 'localhost';

/*
 * define a global for 'thoregon' beside the 'universe'
 */
const thoregon = {};

// *** some test methods
Object.defineProperties(thoregon, {
    'ui'         : { value: true, configurable: false, enumerable: true, writable: false },
    'isBrowser'  : { value: true, configurable: false, enumerable: true, writable: false },
    'isReliant'  : { value: true, configurable: false, enumerable: true, writable: false },
    'isNode'     : { value: false, configurable: false, enumerable: true, writable: false },
    'isSovereign': { value: false, configurable: false, enumerable: true, writable: false },
    'nature'     : { value: 'reliant', configurable: false, enumerable: true, writable: false },
    'density'    : { value: 'rich', configurable: false, enumerable: true, writable: false },
    'embedded'   : { value: false, configurable: false, enumerable: true, writable: false },
    // todo [OPEN]: autoselect other themes like iOS, get user selected theme from 'localStorage'
    'uitheme'    : { value: 'material', configurable: false, enumerable: true, writable: false },
    'isDev'      : { value: isDev, configurable: false, enumerable: true, writable: false },
    'birth'      : { value: Date.now(), configurable: false, enumerable: true, writable: false },
    'since'      : { get: () => Date.now() - thoregon.birth, configurable: false, enumerable: true },
    'checkpoint' : { value: (msg) => console.log(msg, Date.now() - thoregon.birth), configurable: false, enumerable: true, writable: false },
});

/*
 * check if loaded embedded in another site
 * e.g. via a widget hatch
 * may need
 */

let m = import.meta;

let lorigin = new URL(window.location.href).origin;
let morigin = new URL(m.url).origin;
if (lorigin !== morigin) {
    Object.defineProperty(thoregon, 'delivery', { value: morigin, configurable: false, enumerable: true, writable: false});
}

// todo: encapsulate with its own processing context (vm-shim);
//       replace global variables with mockups to allow checks for existence in strict mode

/*
 * defines some global properties
 */
const properties = {
    'thoregon' :    { value: thoregon,                  configurable: false, enumerable: true, writable: false },
    // *** define also the 'process' as global variable that it can be tested
    // 'process' :     { value: { env: {} },                  configurable: false, enumerable: true, writable: false },
};

// if missing define 'globalThis'
if (!window.globalThis) properties.globalThis = { value: window, configurable: false, enumerable: true, writable: false};

const puls = {};

// define globals
Object.defineProperties(window, properties);

// can be changed by setting: thoregon.swtimeout = n
// if thoregon.swtimeout <= 0 not timeout is used
const SERVICEWORKERREQUESTTIMEOUT = 2500;

export default class ProtoUniverse {

    constructor(props) {
        this._requestQ = {};
    }

    async inflate() {
        thoregon.checkpoint("§§ protouniverse inflate");
        let wasinstalled = true;
        try {
            // install service worker with the IPFS peer
            wasinstalled = await this.installServiceWorker();
        } catch (e) {
            // todo: handle error properly
            console.log('%% Service worker registration failed:', e);
            return;
        }
        await doAsync();
        if (!wasinstalled) {
            // todo: check if 'serviceworker.skipWaiting()' is sufficient or the page needs a reload on first install
            // window.location.reload();
        } else {
            // setup the communication interface to the service worker
            this.definePulsInterface();
            // set development mode
            await puls.dev(isDev);

            // establish the IPFS loader
            // await this.initWorkers();

            // import basic THORE͛GON components
            thoregon.checkpoint("§§ protouniverse inflate 4");
            let letThereBeLight = (await import('/evolux.universe/lib/reliant/letThereBeLight.mjs')).default;
            thoregon.checkpoint("§§ protouniverse inflate 5");
            // and boot
            let universe = await letThereBeLight();

            thoregon.checkpoint("§§ start delta");

            let id = universe.random();     // tmp id for this instance (window)
            universe.puls = puls;
        }
    }

    definePulsInterface() {
        //
        // define a communication channel to puls
        // todo: must be hidden for other loaded components
        //
        Object.assign(puls, {
            postMessage    : this.serviceWorkerPost,
            reset          : async () => await this.serviceWorkerRequest({ cmd: 'reset' }),
            clear          : async (cache) => await this.serviceWorkerRequest({ cmd: 'clearCache', cache }),
            refreshThoregon: async () => await this.serviceWorkerRequest({ cmd: 'refreshThoregonCache' }),
            state          : async () => await this.serviceWorkerRequest({ cmd: 'state' }),
            dev            : async (state) => await this.serviceWorkerRequest({ cmd: 'dev', state }),
        });
    }

    async installServiceWorker(opts) {
        let wasinstalled = false;

        if (navigator.serviceWorker.controller) {
            // console.log("%% service worker already loaded exists");
            registration = await navigator.serviceWorker.ready; // navigator.serviceWorker.controller;
            await registration.update();
            wasinstalled = true;
            // console.log("%% service worker update");
        } else {
            // todo [REFACTOR]: check the support status for workers as module -> https://stackoverflow.com/questions/44118600/web-workers-how-to-import-modules
            registration = await navigator.serviceWorker.register('./pulssw.js', /*{ scope: '/', type: "module" }*/);
            // console.log("%% service worker setup registered");
            registration = await navigator.serviceWorker.ready;
            // now wait a moment
            await timeout(300);
        }
        navigator.serviceWorker.addEventListener("message", async (event) => await this.serviceworkerMessage(event) );

        return wasinstalled;
    }

    async serviceworkerMessage(event) {
        let data = event.data;

        // find handlers for the request
        let handlers = this._requestQ[data.cmd];
        if (!handlers) return;

        // cleanup Q
        delete this._requestQ[data.cmd];
        // continue processing response
        handlers.forEach(({ resolve, reject, watchdog }) => {
            if (watchdog) clearTimeout(watchdog);
            (data.error) ? reject(error) : resolve(data);
        });
    }

    /**
     * send a request to the service worker
     * return Promise with the response
     */
    /*async*/ serviceWorkerRequest(msg) {
        return new Promise(((resolve, reject) => {
            let handlers = this._requestQ[msg.cmd];
            let watchdog;
            if (!handlers) {
                handlers = [];
                this._requestQ[msg.cmd] = handlers;
                const timeout = this.getSWTimeout();
                if (timeout > 0) {
                    // only the first request for the same command needs a timeout
                    watchdog = setTimeout(() => {
                        let handlers = this._requestQ[msg.cmd];
                        delete this._requestQ[msg.cmd];
                        if (handlers) handlers.forEach(({ reject }) => {
                            reject(new Error("Requets timeout"));
                        });
                    }, timeout);
                }
            }
            handlers.push({ resolve, reject, watchdog });
            registration.active.postMessage(msg);
        }));
    }

    getSWTimeout() {
        // first check is it is set by developer
        if (thoregon.swtimeout != undefined) return thoregon.swtimeout <= 0 ? -1 : thoregon.swtimeout;
        // in dev mode no timeout (for debugging)
        if (thoregon.isDev) return -1;
        // in all other cases use default timeout
        return SERVICEWORKERREQUESTTIMEOUT;
    }

    serviceWorkerPost(msg, transfer) {
        registration.active.postMessage(msg, transfer);
    }

    // todo [REFACTOR]: move to universe.config
    async initWorkers() {
        await this.initIpfsLoader();
        await this.initMatterWorker();
/*
        sworker.port.onmessage = (evt) => {
            console.log("$$ msg from sworker -> ", evt.data);
        }
        sworker.port.start();
        sworker.port.postMessage(["A", "1"]);
        console.log("$$ msg sent to sworker");
        registration.active.postMessage({ cmd: 'loader', name:'ipfs', kind: 'ipfs', port: sworker.port }, [sworker.port]);
*/
    }

    async initIpfsLoader() {
        let res = await this.serviceWorkerRequest({ cmd: 'exists', name: 'ipfs' });
        if (res.exists) return;     // ipfs loader is runniing
        var sworker = new SharedWorker('/evolux.matter/lib/loader/ipfsloader.mjs', { name: 'IPFS loader', type: 'module' });
        let port = sworker.port;
        // port.start();
        this.serviceWorkerPost({ cmd: 'loader', name:'ipfs', kind: 'ipfs', cache: false, port }, [port]);
    }

    async initMatterWorker() {
        let res = await this.serviceWorkerRequest({ cmd: 'exists', name: 'matter' });
        if (res.exists) return;     // matter loader is runniing
    }
}

(async () => {
    // console.log('** PULS inflate universe');
    const protouniverse = new ProtoUniverse();
    await protouniverse.inflate();
    // new Spike().doit();
    // console.log('** PULS beats');
})();

// console.log('## genesis.mjs END');
