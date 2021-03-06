/**
 *
 * todo [OPEN]:
 *  - analyse directories (entries) method HEAD
 *  - analyse full module with the {rootdir} with '!' at the end
 *  - @see --> tdevloader.mjs
 *  - @see --> fsmapper.mjs (in tdev server)
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

importScripts('./ipfs/ipfs.min_.js');

const IPFSURL = /^\/ipfs\/.*/;
const IPFSPATH  = /^\/ipfs\/(.+)/;

/*export default*/ class IPFSLoader extends Loader {

    async doStart() {
        // todo [OPEN]: introduce a wait Q to process requests later when IPFS is ready
        // console.log("** IPFS Loader: before IPFS start");
        this.ipfs = await Ipfs.create();
        self.ipfs = this.ipfs;
        console.log("** IPFS Loader: IPFS started");
    }

    /*async*/ doFetch(data, port) {
        return new Promise((resolve, reject) => {
            let url = data.url;
            let pathname = onlyPath(url);
            if (!this.isResponsible(pathname)) resolve();  // respond nothing

            let cid = this.getIpfsPath(pathname);
            if (!cid) resolve();  // respond nothing

            // console.log(`** IPFS Loader: CID '${cid}' -> '${url}'`);
            (async () => {
                // intentionally JS-IPFS has no timeouts.
                // if the requested URL/CID does not exist, this 'cat' waits forever
                let notfound = setTimeout(() => {
                    resolve();
                }, 3000);

                let source = await this.ipfs.cat(cid); // returns an AsyncGenerator
                clearTimeout(notfound);
                // todo [OPEN]: use transform stream for decryption
                let body   = this.toReadableStream(source); // browser can't handle AsyncGenerator, wrap with ReadableStream
                let meta = {
                    headers: {
                        // todo [OPEN]: if only a CID w/o filename is requested, try to find the mime type
                        //  this is currently not supported by IPFS, need to MIME sniff -> https://mimesniff.spec.whatwg.org/
                        'Content-Type': puls.getContentType(cid)
                    }
                };
                resolve(new Response(body, meta));
            })();
        });
    }

    canHandle(request) {
        let url = request.url;
        let pathname = onlyPath(url);
        return this.isResponsible(pathname);
    }

    isResponsible(url) {
        return url.match(IPFSURL);
    }

    getIpfsPath(url) {
        let match = url.match(IPFSPATH);
        if (!match || match.length < 2) return;
        return match[1];
    }

    toReadableStream(source) {
        const iterator = source[Symbol.asyncIterator]()
        return new ReadableStream({
          /**
           * @param {ReadableStreamDefaultController} controller
           */
          async pull(controller) {
              try {
                  const chunk = await iterator.next()
                  if (chunk.done) {
                      controller.close()
                  } else {
                      controller.enqueue(chunk.value)
                  }
              } catch (error) {
                  controller.error(error)
              }
          },
          /**
           * @param {any} reason
           */
          cancel(reason) {
              if (source.return) {
                  source.return(reason)
              }
          }
      });
    }

}

(async () => await puls.useLoader(new IPFSLoader(), { priority: 2, cache: false }) )()


