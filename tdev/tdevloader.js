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

const wsroot = `ws:${location.host}`;

class TDevLoader extends Loader {

    /*
     * Loader API
     */

    // init WebSocket
    /*async*/ doStart() {
        return new Promise((resolve, reject) => {
            try {
                let ws  = new WebSocket(wsroot);
                this.ws = ws;

                this.wsid    = 1;      // just a counter to identify the requests
                this.reqQ    = {};     // keep requests till they are processed (observe requests will be kept longer till observation ends)
                ws.onopen    = () => {
                    this.connected();
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
        let pathname = new URL(request.url).pathname;
        let head = await this.head(pathname)
        if (head.error) return;
        // todo: if 'directory' fetch again with 'index.mjs'
        if (head.type !== 'file') {
            if (head.hasindex) {
                return Response.redirect(pathjoin(pathname,'index.mjs'), 302);    // 301: permanently moved, 302: temporarily moved
            }
            return;
        }
        let mime = head.mime || puls.getContentType(pathname);
        let stream = await this.read(pathname);
        let meta = { headers: {
            'Content-Type':  mime
        } };
        return new Response(stream, meta);
    }

    /*
     * loder implementation
     */
    /*async*/ get(path, start, length) {
        return new Promise(((resolve, reject) => {
            let reqId = this.wsid++;
            let req = {
                id: reqId,
                cmd: 'get',
                once: true,
                start,
                length,
                path
            }
            this.reqQ[reqId] = { resolve, reject, ...req };
            this.ws.send(JSON.stringify(req));
        }));
    }
    /*async*/ head(path) {
        return new Promise(((resolve, reject) => {
            let reqId = this.wsid++;
            let req = {
                id: reqId,
                cmd: 'head',
                once: true,
                path
            }
            this.reqQ[reqId] = { resolve, reject, ...req };
            this.ws.send(JSON.stringify(req));
        }));
    }

    /**
     * get a stream
     */
    /*async*/ read(path) {
        let abort = false;
        let client = this;
        console.log(">> tdev:", path);
        let start = 0, length = 32768;
        return new ReadableStream({
           /**
           * @param {ReadableStreamDefaultController} controller
           */
          async pull(controller) {
              try {
                  const { done, content, error, message } = await client.get(path, start, length);
                  if (abort) return;   // if aborted during read don't enqueue anything
                  if (error) throw error;
                  if (content) controller.enqueue(Uint8Array.from(content.data));
                  if (done) controller.close();
                  start += value.length;
              } catch (error) {
                  controller.error(error);
              }
          },
          cancel(reason) {
              abort = true;
          }
      });
    }

    /*
     * WS handling
     */

    connected() {}
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
        this.reconnect();   // ignore the await
    }
    error(err) {
        console.log(err);
    }

    async reconnect() {
        await timeout(3000);
        await this.doStart();
    }
}

if (self.location.hostname === 'localhost') {
    puls.useLoader(new TDevLoader(), { priority: 0 , cache: false });
}
