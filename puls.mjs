/**
 *
 * Loaders: can work with or w/o cache
 *
 * @author: blukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

importScripts('./lib/zip.js');
importScripts('./lib/inflate.js');
importScripts('./lib/ArrayBufferReader.js');
zip.useWebWorkers = false;  // don't use separate workers, this is a worker

const THOREGONPKG = './lib/thoregon.zip';

var CACHE = 'PULS';
const contentTypesByExtension = {   // todo: add more mime types
    'css' : 'text/css',
    'mjs' : 'application/javascript',
    'js'  : 'application/javascript',
    'png' : 'image/png',
    'jpg' : 'image/jpeg',
    'jpeg': 'image/jpeg',
    'html': 'text/html',
    'htm' : 'text/html',
    'svg' : 'image/svg+xml',
};

/**
 *
 */
class Puls {

    constructor(props) {
        this._cachingloaders = [];
        this._noncachingloaders = [];
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

    onlyPath(request) {
        let url = request.url || request;
        return new URL(url).pathname;
    }

    // todo [REFACTOR]: this is a primitive and simple mime type matching. exchange by more sophisticated
    getContentType(filename) {
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

    /*
     * fetch
     */

    // check:
    //  - reject all requests not to: self.location.origin === new URL(request.url).origin
    //  - everthing else must be requested from matter (gun) or heavymatter (ipfs)
    //  - put also fetch from current location to cache
    async fetch(event) {
        if (!this.cache) await this.beat();
        let request = event.request;
        // console.log(`>> fetch: ${request.method} -> ${request.url}`);
        // enforce same origin in any case!
        if (self.location.origin !== new URL(request.url).origin) throw Error(`location not allowed (same origin) -> ${request.url}`);
        let cached = await
        event.respondWith(
            this.fetchNonCaching(request).then(response => {
                if (!response) {
                    return caches.match(this.onlyPath(request))
                          .then(function (response) {
                              if (!response) {
                                  console.log(`>> - fetch not in cache -> ${request.url}`);
                                  // Not in cache - return the result from the live server
                                  // `fetch` is essentially a "fallback"
                                  response = fetch(event.request);
                              } else {
                                  // Cache hit - return the response from the cached version
                                  // console.log(`>> ! fetch from cache -> ${request.url}`);
                              }
                              return response;
                          })
                }
                return response;
            })
        );
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
        return response || this.fetchNonCaching(request, i+1);
    }

    /*
     * Loaders
     */

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
    useLoader(loader, { priority = 9, cache = true } = {}) {
        if (!loader) return;
        let q = cache ? this._cachingloaders : this._noncachingloaders;
        if (q[priority]) return;
        q[priority] = loader;
        loader.start(); // this runs async! the loader may not be 'ready' when this method returns!
    }
}

self.puls = new Puls();

/*
 * now loaders can be defined get loaders
 */
importScripts('./lib/loader.js')
importScripts('./tdev/tdevloader.js');
// importScripts('./gun/gunloader.js');
// importScripts('./ipfs/ipfsloader.js');
