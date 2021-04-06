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

/*
 * define a global for 'thoregon' beside the 'universe'
 */
const thoregon = {};
// *** some test methods
Object.defineProperties(thoregon, {
    'ui':           { value: true,       configurable: false, enumerable: true, writable: false},
    'isBrowser' :   { value: true,       configurable: false, enumerable: true, writable: false },
    'isReliant' :   { value: true,       configurable: false, enumerable: true, writable: false },
    'isNode' :      { value: false,      configurable: false, enumerable: true, writable: false },
    'isSovereign' : { value: false,      configurable: false, enumerable: true, writable: false },
    'nature' :      { value: 'reliant',  configurable: false, enumerable: true, writable: false },
    'density' :     { value: 'rich',     configurable: false, enumerable: true, writable: false },
    'embedded':     { value: false,      configurable: false, enumerable: true, writable: false },
    // todo [OPEN]: autoselect other themes like iOS, get user selected theme from 'localStorage'
    'uitheme' :     { value: 'material', configurable: false, enumerable: true, writable: false },
});

/*
 * check if loaded embedded in another site
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

if (!window.globalThis) properties.globalThis = { value: window, configurable: false, enumerable: true, writable: false};

Object.defineProperties(window, properties);

export default class ProtoUniverse {

    async inflate() {
        // install service worker with the IPFS peer
        let wasinstalled = await this.installServiceWorker();
        await doAsync();
        if (!wasinstalled) {
             window.location.reload();
        } else {
            /*
                    var sworker = new SharedWorker('./sharedworker.js');
                    // sworker.port.onmessage = (msg) => console.log("msg from sworker", msg);
                    sworker.port.start();
                    registration.active.postMessage({ cmd: 'worker', kind: 'ipfs', port: sworker.port }, [sworker.port]);
            */
            // import basic THORE͛GON components
            let letThereBeLight = (await import('/evolux.universe')).default;
            // and boot
            let universe = await letThereBeLight();
            universe.logger.info('$$ Universe inflated, dark age overcome');
        }
    }

    async installServiceWorker(opts) {
        let wasinstalled = false;
        try {
            if (navigator.serviceWorker.controller) {
                // console.log("%% service worker already loaded exists");
                registration = await navigator.serviceWorker.ready; // navigator.serviceWorker.controller;
                await registration.update();
                wasinstalled = true;
                // console.log("%% service worker update");
            } else {
                registration = await navigator.serviceWorker.register('./pulssw.js', /*{ scope: '/' }*/);
                // console.log("%% service worker setup registered");
                registration = await navigator.serviceWorker.ready;
                // now wait a moment
                await timeout(300);
            }
            navigator.serviceWorker.addEventListener("message", (event) => this.serviceworkerRequest(event) );
        } catch (e) {
            // todo: handle error properly
            console.log('%% Service worker registration failed:', e);
        }
        return wasinstalled;
    }

    async serviceworkerRequest(event) {
        // let message = JSON.parse(event.data);
        // universe.logger.debug("Message from ServiceWorker", event);
        console.log("-> Message from ServiceWorker", event.data || 'no data');
/*
        let p = document.createElement('p');
        p.innerText = JSON.stringify(event);
        document.getElementById('msg').appendChild(p);
*/
    }
}

(async () => {
    // console.log('** PULS inflate universe');
    await new ProtoUniverse().inflate();
    // console.log('** PULS beats');
})();

// console.log('## genesis.mjs END');
