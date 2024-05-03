/**
 *
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

import Universe from "./lib/universe.mjs";

(async () => {
    const iframe = document.querySelector('iframe');
    if (!iframe) {
        console.error("No iframe, can't relay!");
        return;
    }
    universe.net.relayTo(iframe.contentWindow);
})();