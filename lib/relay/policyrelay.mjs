/**
 *
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

export default class PolicyRelay {

    constructor(Adapter, opt) {
        const adapter = this._adapter = new Adapter(this, opt);
        adapter.prepare(() => this.adapterReady(adapter));
    }

    adapterReady(adapter) {

    }
}
