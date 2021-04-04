/**
 *
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

export default class TestClient {

    /*
     * work
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
        let start = 0, length = 16;
        return new ReadableStream({
          /**
           * @param {ReadableStreamDefaultController} controller
           */
          async pull(controller) {
              try {
                  const { done, content, error, message } = await client.get(path, start, length);
                  if (abort) return;
                  if (error) {
                      controller.error(`${error} ${message}`);
                      return;
                  }
                  let value = content ? Uint8Array.from(content.data) : '';
                  if (content) controller.enqueue(value);
                  if (done) {
                      controller.close();
                      return;
                  }
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
     * WS init
     */

    display(selector) {
        this._display = selector;
        return this;
    }

    /*async*/ connect() {
        return new Promise((resolve, reject) => {
            let ws = new WebSocket('ws://localhost:7777/');
            this.ws = ws;

            this.wsid = 1;      // just a counter to identify the requests
            this.reqQ = {};     // keep requests till they are processed (observe requests will be kept longer till observation ends)
            ws.onopen = () => {
                this.connected();
                resolve(this);
            };
            ws.onmessage = (data) => this.message(data);
            ws.onclose = (code, reason) => this.close(code, reason);
            ws.onerror = (err) => this.error(err);
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
    }
    error(err) {
        console.log(err);
    }
}
