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
        this._channelready = false;
        this._conns = {};
        const adapter = this._adapter = new Adapter(this, opt);
        adapter.prepare(() => this.adapterReady(adapter));
    }

    relayTo(channel) {
        this._channel = channel;
        window.addEventListener('message', (evt) => this.relayReceived(evt));
    }

    adapterReady(adapter) {
        this._ready = true;
    }

    send(relay) {
        if (!this._channel && this._channelready) {
            console.log("Not ready", this._ready ? '' : 'Relay', this._channelready ? '' : 'Channel');
            return;
        }
        this._channel.postMessage({ type: 'netrelay', relay }, '*');
    }

    //
    // relay
    //

    relayReceived(evt) {
        if (evt?.data?.type !== 'netrelay') return;
        console.log("Relay received:", evt);
    }

    //
    // relay API to channel (policy)
    //

    connectionEstablished(conn, adapter) {
        this._conns[conn.connectionId] = conn;  // todo [OPEN]: add cleanup closed connections
        const relay = { cmd: 'connectionEstablished', conn: conn.connectionId };
        this.send(relay);
    }

    wasReceived(data) {
        const relay = { cmd: 'wasReceived', data };
        this.send(relay);
    }

    received(data, conn, adapter) {
        if (!this._conns[conn.connectionId]) this._conns[conn.connectionId] = conn;
        const relay = { cmd: 'received', data, conn: conn.connectionId };
        this.send(relay);
    }

}
