/**
 * PU͛LS Service Worker
 *
 * Ebmedded: IPFS full stack gateway
 *
 * @author: blukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

// just some utils and polyfills
// import puls from "../Thoregon/www/puls.mjs";

importScripts('./lib/utils.js');

// todo [REFACTOR]: this is a bad workaround to get SEA working. refactor asap
// self.window = self;
thoregon = {
    isDev : false
};

// *** some profiling methods
Object.defineProperties(thoregon, {
    'birth'      : { value: Date.now(), configurable: false, enumerable: true, writable: false },
    'since'      : { get: () => Date.now() - thoregon.birth, configurable: false, enumerable: true },
    'checkpoint' : { value: (msg) => console.log(msg, Date.now() - thoregon.birth), configurable: false, enumerable: true, writable: false },
});

importScripts( './puls.mjs');
// now the PULS is available

const workers = {};

self.addEventListener('install', (event) => {
    event.waitUntil(skipWaiting()) // forces the waiting ServiceWorker to become the active ServiceWorker
    // event.waitUntil(event.target.skipWaiting()) // forces the waiting ServiceWorker to become the active ServiceWorker
    event.waitUntil(puls.precache());
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
/*
    self.clients.matchAll({
                              includeUncontrolled: true
                          }).then(function(clientList) {
        var urls = clientList.map(function(client) {
            return client.url;
        });
        clientList.forEach(client => client.postMessage({ from: 'puls', type: 'activate' }));
    });
*/
});

self.addEventListener('fetch', async (event) => {
    let res = await puls.fetch(event);
    return res;
});

/*
 * message communication
 */
self.addEventListener('message', (event) => {
    // directly handle the claim command
    if (event.data?.cmd === 'claim') {
        const messageSource = event.source;
        event.waitUntil(self.skipWaiting());
        event.waitUntil(self.clients.claim());
        messageSource.postMessage({ cmd: 'claim', "ack": true });
    }
    // console.log('The service worker received a message.', event);
    puls.handleMessage(event);
    // messageSource.postMessage({ "ack": true });
    /*
        event.waitUntil((async () => {
            const clients = await self.clients.matchAll();
            clients.forEach(client => client.postMessage("answer"));
        })());
    */
});

/*
 * Web Push Notifications
 */

self.addEventListener('push', function(event) {
    event.waitUntil(self.registration.showNotification('ServiceWorker Cookbook', {
        body: 'Push Notification Subscription Management'
    }));
});

self.addEventListener('pushsubscriptionchange', function(event) {
    console.log('Subscription expired');
    event.waitUntil(
        self.registration.pushManager.subscribe({ userVisibleOnly: true })
            .then(function(subscription) {
                // console.log('Subscribed after expiration', subscription.endpoint);
                return fetch('register', {
                    method: 'post',
                    headers: {
                        'Content-type': 'application/json'
                    },
                    body: JSON.stringify({
                                             endpoint: subscription.endpoint
                                         })
                });
            })
    );
});

// console.log('@@ pulssw.mjs END');
/*
    // doesn't got thru 'fetch' handler
setTimeout(() => {
    console.log("$$ b4 import ptest");
    importScripts('/test/ptest.js');
    console.log("$$ after import ptest");
}, 5000);
*/
