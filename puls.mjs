/**
 *
 * Loaders: can work with or w/o cache
 *
 * todo:
 *  - firewall transform streams -> Loader
 *  - widget loader (build widget script -> browserloader.sendWidgets)
 *
 * @author: blukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

importScripts('./lib/zip/zip.js');
importScripts('./lib/zip/inflate.js');
importScripts('./lib/zip/ArrayBufferReader.js');
zip.useWebWorkers = false;  // don't use separate workers, this is a worker

const THOREGONPKG = './lib/thoregon.zip';

var CACHE = 'PULS';
const contentTypesByExtension = {   // todo: add more mime types
    'css'  : 'text/css',
    'mjs'  : 'application/javascript',
    'js'   : 'application/javascript',
    'json' : 'application/json',
    'png'  : 'image/png',
    'jpg'  : 'image/jpeg',
    'jpeg' : 'image/jpeg',
    'html' : 'text/html',
    'htm'  : 'text/html',
    'svg'  : 'image/svg+xml',
    'woff' : 'application/font-woff',
    'woff2': 'font/woff2',
    'tty'  : 'font/truetype',
    'otf'  : 'font/opentype',
    'eot'  : 'application/vnd.ms-fontobject',
};

const ALLOWED_WEB_REQUESTS = [
    /^https:\/\/dns\.google\/.*/,
    /^https:\/\/cloudflare-dns\.com\/.*/,
    /^https:\/\/.*\.ipfs\.io\/.*/,
    /^https:\/\/cloudflare-ipfs\.com\/.*/,
];

const SYMLINKS = {
    'https://thatsme.plus/wp-content/uploads/2020/12/logo.png'                              : '/ext/thatsmelogo.png',
    'https://fonts.googleapis.com/icon?family=Material+Icons'                               : '/ext/materialicons.css',
    'https://fonts.gstatic.com/s/materialicons/v85/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2': '/ext/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2',
}

const resolveSymlink = (url) => SYMLINKS[url];
const requestAllowed = (url) => !!ALLOWED_WEB_REQUESTS.find(location => url.match(location));

/**
 *
 */
class Puls {

    constructor(props) {
        this.reset();
    }

    reset() {
        this._registry          = {};
        this._cachingloaders    = [];
        this._noncachingloaders = [];
        // other workers
    }

    async beat() {
        // todo:
        //  - open a cache for every handler (local, thoregon, gun, ipfs)
        //  - separate cache for each component
        this.cache = await caches.open(CACHE);
    }

    /*
     * cache and fetch
     */

    async precache() {
        if (!this.cache) await this.beat()
        let res = await fetch(THOREGONPKG);
        let thoregonpkg = await res.arrayBuffer();
        let entries = await this.getZipEntries(thoregonpkg);
        await forEach(entries, async (entry) => {
            await this.cacheEntry(entry);
            // console.log("Cached>", entry.filename);
        })
    }

    getZipEntries(pkg) {
        return new Promise(async (resolve, reject) => {
            try {
                let zipreader = await this.createZipReader(pkg);
                zipreader.getEntries(resolve);
            } catch (e) {
                reject(e);
            }
        });
    }

    createZipReader(pkg) {
        return new Promise((fulfill, reject) => {
            zip.createReader(new zip.ArrayBufferReader(pkg), fulfill, reject);
        });
    }

    async cacheEntry(entry) {
        if (entry.directory) return;    // just files, no directories to the cache
        let location = this.buildLocation(entry.filename);
        let data     = await this.getEntryData(entry);
        // special handling of root modules ('index.mjs')
        // this must be a redirect to maintain the directory (module) structure!
        // otherwise relative path of 'import' is one level too high
        if (entry.filename.endsWith('index.mjs')) {
            var redirlocation = location.substr(0, location.length-('index.mjs'.length+1))
            var redirect = Response.redirect(location, 301);    // 301: permanently moved, 302: temporarily moved
            return this.cache.put(redirlocation, redirect);
        }
        var response = new Response(data, {
            headers: {
                'Content-Type': this.getContentType(entry.filename)
            }
        });
        return this.cache.put(location, response);
    }

    buildLocation(filename) {
        return '/' + filename;
    }

    // todo [REFACTOR]: this is a primitive and simple mime type matching. exchange by more sophisticated
    getContentType(filename) {
        if (!filename) return 'text/plain';
        var tokens = filename.split('.');
        var extension = tokens[tokens.length - 1];
        return contentTypesByExtension[extension] || 'text/plain';
    }

    getEntryData(entry) {
        return new Promise((resolve, reject) => {
            try {
                entry.getData(new zip.BlobWriter(), resolve);
            } catch (e) { reject(e); }
        })
    }

    isPermitted(url) {
        return (self.location.origin === new URL(url).origin)
               || requestAllowed(url);
    }

    /*
     * fetch
     */

    /**
     * ask all loaders for the requested resource
     *
     * todo
     *  - [OPEN]: match loaders with the clientId of the event, may be different
     *  - [OPEN]: maintain same request queue
     *
     *
     * check:
     *  - reject all requests not to: self.location.origin === new URL(request.url).origin
     *  - everthing else must be requested from matter (gun) or heavymatter (ipfs)
     *  - put also fetch from current location to cache
     */
    async fetch(event) {
        if (!this.cache) await this.beat();
        let request = event.request;
        // enforce same origin in any case!
        let symlink = resolveSymlink(request.url);      // todo: check method etc. if this request can really be redirected to a 'local' resource
        if (symlink) {
            await event.respondWith((async () => {
                return Response.redirect(symlink, 301);
            })());
            return;
        }
        if (!this.isPermitted(request.url)) throw Error(`location not allowed (same origin) -> ${request.url}`);
        try {
            await event.respondWith((async () => {
                let pathname = onlyPath(request);
                let response;

                // first lookup non caching loaders (mainly for dev and realtime
                response = await this.fetchNonCaching(request);
                if (response) return response;

                // not found, now lookup cache
                response = await caches.match(pathname);
                if (response) return response;

                // not found in cache, lookup caching loaders
                response = await this.fetchCaching(request);
                if (response) return response;

                // Not found by any loader - return the result from a web server, but only if permitted
                // `fetch` is essentially a "fallback"
                response = await fetch(request);
                // save response in cache
                // todo [OPEN]
                //  - consider http cache headers
                //  - introduce refresh strategy when no headers
                // await this.cache.put(pathname, response.clone());
                return response;
            })());
        } catch (e) {
            console.log("Fetch error:", request.url, e);
            throw Error("Can't fetch");
        }
    }

    async fetchNonCaching(request, i) {
        i = i || 0;
        if (this._noncachingloaders.length <= i) return;
        let loader = this._noncachingloaders[i];
        let response = await loader.fetch(request);
        return response || this.fetchNonCaching(request, i+1);
    }

    async fetchCaching(request, i) {
        i = i || 0;
        if (this._cachingloaders.length <= i) return;
        let loader = this._cachingloaders[i];
        let response = await loader.fetch(request);
        return response || this.fetchCaching(request, i+1);
    }

    /*
     * message relay
     */

    async handleMessage(evt) {
        const messageSource = evt.source;
        const data           = evt.data;
        const cmd            = data.cmd;

        switch (cmd) {
            case 'exists':
                let exists = !!this._registry[data.name];
                messageSource.postMessage({ cmd, exists, name: data.name });
                break;
            case 'loader':
                await this.addLoader(data);
                break;
            case 'worker':
                break;
            case 'matter':
                //
                break;
            case 'state':
                // todo: add state of each loader
                messageSource.postMessage({ cmd, name: 'PULS', registry: this._registry, state: 'running' });
                break;
            case 'reset':
                this.reset();
        }
    }

    /*
     * Loaders
     */

    async addLoader(data) {
        let { name, kind, port, cache, priority } = data;
        let loader = new MsgPortLoader({ name, kind, port });
        this.useLoader(loader, { cache: cache || false, priority });
        // add to registry if no error  (throw)
        this._registry[name] = { name, kind, cache, priority };
    }

    /**
     * register a loader
     * only one loader per priority
     * first registered loader wins
     * registers and starts the loader
     * however, the loader starts async and may not be 'ready' when this method returns
     *
     * @param loader
     * @param priority
     * @param cache
     */
    async useLoader(loader, { priority, cache = true } = {}) {
        if (!loader) return;
        let q = cache ? this._cachingloaders : this._noncachingloaders;
        if (priority == undefined) priority = q.length;
        if (q[priority]) return;
        await loader.start();
        // add to loaders if no error (throw) at start
        q[priority] = loader;
    }
}

self.puls = new Puls();

/*
 * now loaders can be defined get loaders
 */
importScripts('./lib/loaders/loader.js')
importScripts('./tdev/tdevloader.js');
importScripts('./ipfs/ipfsloader.js');
importScripts('./gun/matterloader.js');
// importScripts('./lib/loaders/msgportloader.js');
// importScripts('./gun/gunloader.js');
