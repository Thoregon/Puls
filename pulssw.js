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
importScripts('./lib/utils.js');

// todo [REFACTOR]: this is a bad workaround to get SEA working. refactor asap
self.window = self;

importScripts( './puls.mjs');
// now the PULS is available

const workers = {};

self.addEventListener('install', (event) => {
//    console.log(':: The service worker is being installed.', event);
    event.waitUntil(puls.precache());
//    console.log(':: service worker skipWaiting()', event);
    event.waitUntil(event.target.skipWaiting()) // forces the waiting ServiceWorker to become the active ServiceWorker
    // return self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    self.clients.matchAll({
                              includeUncontrolled: true
                          }).then(function(clientList) {
        var urls = clientList.map(function(client) {
            return client.url;
        });
        clientList.forEach(client => client.postMessage({ from: 'puls', type: 'activate' }));
        // console.log(':: Matching clients:', urls.join(', '));
    });
    // event.waitUntil(() => {});
    // console.log(':: The service worker is being activated.', event);
    event.waitUntil(event.target.clients.claim())
    // return self.clients.claim();
});

self.addEventListener('fetch', async (event) => {
    let res = await puls.fetch(event);
    return res;
/*
    let reg = self.registration;
    const messageSource = event.source;
    if (messageSource) messageSource.postMessage({ "fetch": event.data });
*/
    // return fetch(request);
    /*
        event.respondWith(fromNetwork(event.request));
    */
});

/*
 * message communication
 */
self.addEventListener('message', (event) => {
    // console.log('The service worker received a message.', event);
    const messageSource = event.source;
    const data           = event.data;

    if (data.cmd === 'worker') {
        workers[data.kind] = data.port;
    }

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
