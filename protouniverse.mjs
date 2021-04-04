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

export default class ProtoUniverse {

    async inflate() {
        // install service worker with the IPFS peer
        await this.installServiceWorker();
        await doAsync();

/*
        var sworker = new SharedWorker('./sharedworker.js');
        // sworker.port.onmessage = (msg) => console.log("msg from sworker", msg);
        sworker.port.start();
        registration.active.postMessage({ cmd: 'worker', kind: 'ipfs', port: sworker.port }, [sworker.port]);
*/
        // import basic THORE͛GON components
        let letThereBeLight = await import('/evolux.universe');
        // and boot
        let universe = await letThereBeLight();
    }

    async installServiceWorker(opts) {

        //console.log("%% service worker setup start");
        if ('serviceWorker' in navigator) {
            await this.doInstallServiceWorker();
        } else {
            // browser loader on the server must fulfill all requests; no advanced functions like server push are available
            console.log("%% ServiceWorker not available, use another bowser");
        }
    }

    async doInstallServiceWorker() {
        try {
            if (navigator.serviceWorker.controller) {
                // console.log("%% service worker already loaded exists");
                registration = await navigator.serviceWorker.ready; // navigator.serviceWorker.controller;
                await registration.update();
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
