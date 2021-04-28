/**
 *
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

importScripts('./gun/gun.js', './gun/rindexed.js', './gun/sea.js');

const LOADERURL  = /^\/matter\/.*/;
const LOADERPATH = /^\/matter\/(.+)/;

/*export default*/ class MatterLoader extends Loader {

    async doStart() {
        const peers = ['https://matter.thoregon.io:8765/gun'];
        const opts  = { peers, localStorage: false, store: RindexedDB({}) };
        this.gun = Gun(opts);
        self.gun = this.gun;
        console.log("** Matter Loader: GUN started");
    }

    canHandle(request) {
        let url = request.url;
        let pathname = onlyPath(url);
        return this.isResponsible(pathname);
    }

    isResponsible(url) {
        return url.match(LOADERURL);
    }

    /*async*/ doFetch(data, port) {
        return new Promise((resolve, reject) => {
            let url = data.url;
            let pathname = onlyPath(url);
            if (!this.isResponsible(pathname)) resolve();   // respond nothing

            let parts = this.getPathElements(pathname);
            if (!parts) resolve();  // respond nothing

            let node = this.gun;
            while (parts.length > 0) node = node.get(parts.shift());

            node.once((obj) => {
                let body = obj ? JSON.stringify(obj, undefined, 4) : '';
                let meta = {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };
                resolve(new Response(body, meta));
            });
        });
    }

    getPathElements(url) {
        let match = url.match(LOADERPATH);
        if (!match || match.length < 2) return;
        return match[1].split('/');
    }

}

(async () => await puls.useLoader(new MatterLoader(), { priority: 1, cache: false }) )()


