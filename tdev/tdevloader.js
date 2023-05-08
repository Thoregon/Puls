/**
 *
 * todo [OPEN]:
 *  - use ReadStream instead of reading chunks manually
 *  - listen to fs changes, update resource
 *
 * @author: blukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

const THOREGONMODULES = /^\/thoregon\.(.+)|^\/evolux\.(.+)|^\/terra\.(.+)/;

const WSROOT = `ws:${location.host}`;

const isGET = (request) => request.method === 'GET';

class TDevLoader extends Loader {

    /*
     * Loader API
     */

    // init WebSocket
    /*async*/ doStart() {
        return new Promise((resolve, reject) => {
            try {
                let ws  = new WebSocket(WSROOT);
                this.ws = ws;

                this.wsid    = 1;      // just a counter to identify the requests
                this.reqQ    = {};     // keep requests till they are processed (observe requests will be kept longer till observation ends)
                ws.onopen    = () => {
                    this.connected();
                    debuglog("## DevLoader :: connected");
                    resolve(this);
                };
                ws.onmessage = (data) => this.message(data);
                ws.onclose   = (code, reason) => this.close(code, reason);
                ws.onerror   = (err) => this.error(err);
            } catch (e) {
                this.reconnect();   // ignore the await
            }
        });
    }

    async doFetch(request) {
        let i = 5;
        while (!this.isReady() && i--) await timeout(50);
        let pathname = new URL(request.url).pathname;
        let head = await this.head(pathname)
        if (head.error) return;
        // redirect to index if exists
        debuglog("DevLoader > fetch", pathname);
        if (head.type !== 'file') {
            if (head.hasindex && isGET(request)) {
                debuglog("DevLoader > HEAD: redirect to 'index.mjs'");
                return Response.redirect(pathjoin(pathname,'index.mjs'), 302);    // 301: permanently moved, 302: temporarily moved
            } else if (head.type === 'dir') {
                const dircontent = JSON.stringify(head);
                debuglog("DevLoader > HEAD: dir content (JSON)", dircontent);
                let meta = {
                    status: 200,
                    headers: {
                        'Content-Type': 'text/plain',
                        'Structure': dircontent
                    } };
                // const blob = new Blob([dircontent], {type: 'text/plain'});
                const res = new Response(dircontent, meta);
                return res;
            }
            return;
        }
        let mime = head.mime || puls.getContentType(pathname);
        let stream = await this.read(pathname, head.size);
        let meta = { headers: {
            'Content-Type':  mime
        } };
        debuglog("DevLoader > fetch get stream", mime);
        return new Response(stream, meta);
    }

    /*
     * loder implementation
     */
    /*async*/ get(path, start, length) {
        return new Promise(((resolve, reject) => {
            let i = 3;
            try {
                let reqId        = this.wsid++;
                let req          = {
                    id  : reqId,
                    cmd : 'get',
                    once: true,
                    start,
                    length,
                    path
                }
                this.reqQ[reqId] = { resolve, reject, ...req };
                debuglog("DevLoader > ws get", path);
                this.ws.send(JSON.stringify(req));
            } catch (e) {
                // todo [OPEN]: implement retry with wait an max retries
                throw Error("Can't reach dev server: '" + path +"' " + e.stack);
            }
        }));
    }
    /*async*/ head(path, retry = 3) {
        return new Promise(((resolve, reject) => {
            try {
                let reqId        = this.wsid++;
                let req          = {
                    id  : reqId,
                    cmd : 'head',
                    once: true,
                    path
                }
                this.reqQ[reqId] = { resolve, reject, ...req };
                debuglog("DevLoader > ws head", path);
                this.ws.send(JSON.stringify(req));
            } catch (e) {
                if (!retry--) throw Error("Can't reach dev server: '" + path +"' " + e.stack);
                this.head(path, retry)
                    .then(resolve)
                    .catch(reject);
            }
        }));
    }

    /**
     * get a stream
     */
    /*async*/ read(path, size) {
        let abort = false;
        let client = this;
        // console.log(">> tdev:", path);
        let start = 0, length = size || 262144;
        debuglog("DevLoader > read start", path);
        return new ReadableStream({
              /**
               * @param {ReadableStreamDefaultController} controller
               */
              start(controller) {
                  (async () => {
                      let done, content, error, message;
                      try {
                          debuglog("DevLoader > stream pull", path);
                          ({ done, content, error, message } = await client.get(path, start, length));
                          if (abort) return;   // if aborted during read don't enqueue anything
                          if (error) throw error;
                          if (content) controller.enqueue(Uint8Array.from(content.data));
                          if (done) controller.close();
                          // start += content?.data?.length ?? 0;
                          debuglog("DevLoader > stream pull OK", path);
                      } catch (error) {
                          debuglog("DevLoader > stream error", path, error);
                          controller.error(error);
                      }
                  })();
              },
              pull(controller) {},  // don't need a pull in this case, whole data comes in one chunk
              cancel(reason) {
                  debuglog("DevLoader > stream about", path);
                  abort = true;
              }
          });
    }

    canHandle(request) {
        let url = request.url;
        let pathname = onlyPath(url);
        return this.isResponsible(pathname);
    }

    isResponsible(url) {
        return (this._settings.thoregon === 'dev') || !url.match(THOREGONMODULES);
    }

    /*
     * WS handling
     */

    connected() {
        this.stateReady();
    }

    message(message) {
        let res = JSON.parse(message.data);
        if (!res.id) return;
        let req = this.reqQ[res.id];
        if (!req) return;
        if (req.once) delete this.reqQ[res.id];
        req.resolve(res);   // todo [REFACTOR]: check for error and maintain req.reject
    }
    close(code, reason) {
        delete this.ws;
        this.statePaused();
        this.reconnect();   // ignore the await
    }
    error(err) {
        console.log(err);
    }

    // todo: switch to SyncManager!
    async reconnect() {
        await timeout(3000);
        await this.doStart();
    }
}

(async () => await puls.useDevLoader(new TDevLoader()))()
