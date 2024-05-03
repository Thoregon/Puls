/**
 *
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

import Universe from "./lib/universe.mjs";

function redirectPage(evt) {
    const url = evt.data.url;
    if (url) window.location.replace(url);
}

function init() {
    window.addEventListener('message', (evt) => received(evt));
}

function received(evt) {
    const data = evt.data;
    if (!data) return;
    const type = data.type;
    if (!type) return;
    switch (type) {
        case 'redirect':
            redirectPage(evt);
    }
}

try {
    init();
} catch (e) {
    console.error(e);
}

(async () => {
    const iframe = document.querySelector('iframe');
    if (!iframe) {
        console.error("No iframe, can't relay!");
        return;
    }
    universe.net.relayTo(iframe.contentWindow);
})();