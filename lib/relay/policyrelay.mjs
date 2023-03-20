/**
 *
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

export default class PolicyRelay {

    constructor(Adapter, opt) {
        this._ready = false;
        const adapter = this._adapter = new Adapter(this, opt);
        debugger;
        adapter.prepare(() => this.adapterReady(adapter));
    }

    relayTo(channel) {
        this._channel = channel;
        if (this._ready) this.sendReady();
    }

    adapterReady(adapter) {
        const wasready = this._ready;
        this._ready = true;
        if (wasready && this._channel) this.ready();
    }

    ready() {
        debugger;
    }
}
