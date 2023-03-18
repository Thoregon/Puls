/**
 *
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

import PeerJSNetworkAdapter from "./relay/peerjsnetworkadapter.mjs";
import PolicyRelay          from "./relay/policyrelay.mjs";

export default class Universe {

    setup() {
        this.netconfig = {
            policies: [PolicyRelay],
            p2p     : {
                adapters  : [PeerJSNetworkAdapter],
                knownPeers: universe.KNOWN_PEERS,
                signaling : {
                    host: "185.11.139.203",
                    port: 9000,
                    // path  : "/myapp",
                }
            }
        };
        const Policy  = this.netconfig.policies[0];
        const Adapter = this.netconfig.p2p.adapters[0];
        this.net = [new Policy(Adapter, {})];
    }
}

if (!window.universe) {
    const universe = window.universe = new Universe();
    universe.setup();
}
