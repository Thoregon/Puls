/**
 *
 *  This is a minimal Universe to tunnel WebRTC for widgets
 *  It is used just to embed wigets in HTML pages
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

export default class Universe {

    setup() {
    }

    random(l) {
        return btoa( String.fromCharCode( ...crypto.getRandomValues(new Uint8Array(l ?? 32)) ) ).replaceAll(/[\/|+|=]/g,'').substring(0, l ?? 32);
    }

    get inow() {
        return Date.now();
    }

    get now() {
        return new Date();
    }

    get logger() {
        return console;
    }

}

if (!window.universe) {
    const universe = window.universe = new Universe();
    universe.setup();
}
