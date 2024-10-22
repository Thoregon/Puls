/*
 * load modules for application
 */

importScripts('/apps/appmodules.js', '/lib/archive/archivegzip.js');

const debuglogML = (...args) => debuglog; // { logentries.push({ dttm: Date.now(), ...args }); console.log(...args); };
const debuglogML2 = (...args) => console.log(...args); // { logentries.push({ dttm: Date.now(), ...args }); console.log(...args); };

//
// archives & cache
//

const DIST           = '/dist/';
const CACHE_THOREGON = 'THOREGON';
const CACHE_NEULAND  = 'NEULAND';
const CACHE_NAMES    = [CACHE_THOREGON, CACHE_NEULAND];

// const CACHES = {};

async function getCache(cachename) {
    // let cache = CACHES[cachename];
    // if (!cache) cache = CACHES[cachename] = await caches.open(cachename);
    debuglogML(">> ModuleLoader::getCache", cachename);
    const cache = await caches.open(cachename);
    return cache;
}

async function clearCaches() {
    for await (const name of CACHE_NAMES) {
        await clearCache(name);
    }
    knownmodules = {};
}

async function clearCache(cachename) {
    await caches.delete(cachename);
}

async function getModified(url){
    const res = await fetch(url, { method: 'head' });
    const modified = new Date(res.headers.get('last-modified'));
}

function isValidDate(d) {
    return d instanceof Date && !isNaN(d);
}

//
//
//

const loadQ = [];

/**
 * load system and application modules into cache
 */
class ModuleLoader extends Loader {

    //
    // loader implementation
    //

    async doStart() {
        await this.loadSysDependencies();
        return super.doStart()
    }
    async doStop() {}  // nothing to do

    canHandle(request) {
        return true;
    }
    
    async doFetch(request) {
        debuglogML(">> ModuleLoader fetch", request.url);
        let response;
        response = await this.fromCache(request);
        debuglogML(">> ModuleLoader",  response ? "found in cache" : "not found", request.url);
        return response;
    }

    //
    // modules
    //

    async loadSysDependencies() {
        debuglogML2(">> ModuleLoader:loadSysDependencies");
        const cache   = await getCache(CACHE_THOREGON);
        this._loading = true;
        this.stateStarting();
        const start = Date.now();
        try {
            for await (const module of SYS_MODULES) {
                await this.loadAndCache(module + '.neuarch.gz', cache);
            }
        } finally {
            this._loading = false;
            debuglogML2(">> ModuleLoader:loadSysDependencies DONE", Date.now() - start);
            let fn
            while (fn = loadQ.shift()) { await fn(); }
            this.stateReady();
        }
    }

    /**/ clientOpened() {
        return new Promise(async (resolve, reject) => {
            if (this._loading) {
                loadQ.push(async () => {
                    await this.loadSysDependencies();
                    resolve();
                })
                return;
            }
            await this.loadSysDependencies();
            resolve();
        })
    }


    /*async*/ withApp(appname) {
        return new Promise(async (resolve, reject) => {
            if (this._loading) {
                loadQ.push(async () => {
                    await this.loadAppDependencies(appname, true);
                    resolve();
                })
                return;
            }
            await this.loadAppDependencies(appname);
            resolve();
        });
    }

    async loadAppDependencies(appname, embedded = false){
        const cache   = await getCache(CACHE_NEULAND);
        const modules = APP_MODULES[appname];
        if (!modules) {
            debuglogML("## ModuleLoader: app modules not found", appname);
            return;
        }
        if (!embedded) this.stateStarting();
        const start = Date.now();
        debuglogML2(">> ModuleLoader:loadAppDependencies", appname);
        try {
            for await (const module of modules) {
                await this.loadAndCache(module + '.neuarch.gz', cache);
            }
        } finally {
            debuglogML2(">> ModuleLoader:loadAppDependencies DONE", appname, Date.now() - start);
           if (!embedded) this.stateReady();
        }
    }

    // /*async*/ deferLoadAppDependencies(appname) {
    // }

    //
    // caching & loading
    //

    async fromCache(request) {
        const response = await caches.match(request);
        return response;
    }

    /*async*/ loadAndCache(module, cache) {
        return new Promise(async (resolve, reject) => {
            // if (await this.isModuleInCache(module, cache)) {
            if (! await this.isModuleOutdated(module, cache)) {
                debuglogML(">> ModuleLoader: already cached", module);
                return resolve(true);
            }
            try {
                let structure   = {};
                let directories = {};
                const start     = Date.now();
                const res       = await fetch(DIST + module);  // *.neuarch.gz
                if (res.ok) {
                    // let hasIndex             = false;
                    const modified = new Date(res.headers.get('last-modified'));
                    const gzippedArrayBuffer = await res.body;
                    const fetched            = Date.now();
                    debuglogML2(">> ModuleLoader::fetched", module, fetched - start);
                    const files    = await unpackArchive(gzippedArrayBuffer);
                    const gunziped = Date.now();
                    debuglogML2(">> ModuleLoader::gunziped", module, gunziped - fetched);
                    const gunzip = Date.now();
                    for await (const [filename, entry] of Object.entries(files)) {
                        this.maintainDirectories(filename, directories);
                        this.maintainStructure(filename, structure);
                        await this.cacheEntry(filename, entry.mimetype, entry.fileContent, cache);
                        // hasIndex = filename.endsWith('index.mjs');
                    }
                    this.cacheModule(module, cache, modified);
                    this.cacheDirectories(directories, cache);
                    this.cacheStructure(structure, cache);

                    const cached = Date.now();
                    debuglogML2(">> ModuleLoader::cached", module, cached - gunziped);
                    resolve(true);
                } else {
                    resolve(false);
                    debuglogML2(">> ModuleLoader: Fetched failed", module);
                }
            } catch (e) {
                debuglogML2(">> ModuleLoader load & cache ERROR", e);
                resolve(false, e);
            }
        })
    }

    maintainDirectories(filename, directories) {
        const parts = filename.split('/');
        parts.shift();                              // remove the training '/' which causes an empty item
        const root = parts.shift();                 // the module directory
        const file = parts.pop();                   // this is the file (in any case, because in our zip's are no empty directories)
        if (parts.length === 0) return;             // the root directory will be provided as whole structure -> maintainStructure()
        let prev = root;
        let entry;
        parts.forEach((part) => {
            let dir = '/' + prev + '/' + part;
            entry   = directories[dir];
            if (!entry) entry = directories[dir] = {
                path     : dir,
                name     : part,
                type     : "dir",
                entries  : []
            }
            if (prev !== root) directories[prev]?.entries.push('dir:' + part);
            prev += '/' + part;
        });
        entry?.entries.push('file:' + file);
    }

    maintainStructure(filename, structure) {
        const i = filename.indexOf('/',1);  // root directory of module
        const root = filename.substring(1,i);
        const sub  = filename.substring(i+1);
        const parts = sub.split('/');
        let entries = structure[root];
        if (!entries) entries = structure[root] = { _: "flat" };
        parts.pop();    // last element is the file, don't add as 'dir'
        let dirpath = '/' + root;
        parts.forEach((part) => {
            dirpath += '/' + part;
            entries[dirpath] = { name: part, path: dirpath, type: 'dir' };
        })
        entries[filename] = { name: sub, path: filename, type: 'file' };

    }

    cacheEntry(filename, mimetype, content, cache) {
        if (filename.endsWith('index.mjs')) {
            const redirlocation = filename.substring(0, filename.lastIndexOf('/'));
            // debuglogML(">> ModuleLoader redirect for ", redirlocation);
            const redirect = Response.redirect(filename, 301);    // 301: permanently moved, 302: temporarily moved
            cache.put(redirlocation, redirect);
        }
        let response = new Response(content, {
            headers: {
                'Content-Type': mimetype
            }
        });
        return cache.put(filename, response);
    }

    async isModuleInCache(module, cache) {
        const response = await cache.match(module + '.mod');
        return response != undefined;
    }

    async isModuleOutdated(module, cache) {
        const response = await cache.match(module + '.mod');
        if (response == undefined) return true;
        const cachmodified = new Date(response.headers.get('last-modified'));
        if (!isValidDate(cachmodified)) return true;
        const distmodified = await getModified(DIST + mod);
        if (!isValidDate(distmodified)) return true;
        return distmodified > cachmodified;
    }

    cacheModule(module, cache, modified) {
        let response = new Response('{}', {
            headers: {
                'Content-Type': 'application/json',
                'last-modified': (isValidDate(modified) ? modified : new Date()).toLocaleString(),
            }
        });
        cache.put(module + '.mod', response);
    }

    cacheDirectories(directories, cache) {
        Object.entries(directories).forEach(([dir, entries]) => {
            let data = JSON.stringify(entries, undefined, 3);
            let response = new Response(data, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            cache.put(dir, response);
        })
    }

    cacheStructure(structure, cache) {
        Object.entries(structure).forEach(([root, entries]) => {
            let data = JSON.stringify(entries, undefined, 3);
            let response = new Response(data, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            cache.put(root+'.ls', response);
        })
    }

}

(async () => await puls.useLoader(new ModuleLoader(), { priority: 0 , cache: true }) )()
