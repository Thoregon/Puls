/**
 *
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

import { doAsync, timeout }     from "/evolux.universe";
import SEA                      from '/evolux.everblack/lib/crypto/sea.mjs'
import BrowserLifecycleEmitter  from "/thoregon.neuland/modules/browserpeer/browserlifecycleemitter.mjs";
import IdentityReflectionRemote from '/thoregon.identity/lib/identityreflectionremote.mjs';
import Dorifer                  from '/thoregon.truCloud/lib/doriferremote.mjs';
import Aurora                   from "/thoregon.aurora";
import LogSink                  from "/evolux.universe/lib/reliant/logsink.mjs";
import RemoteObserver           from "/thoregon.crystalline/lib/observers/remoteobserver.mjs";

thoregon.checkpoint("init Thoregon Remote 1");

//
// crypto, safety & security
//

universe.$everblack = SEA;
universe.$lifecycle = new BrowserLifecycleEmitter();

//
// Remote Agents
//
if (window.neulandconfig?.conn === 'duplex') {
    const WSConnector = (await import("/thoregon.crystalline/lib/connectors/wsconnector.mjs")).default;
    const endpoint = 'wsapi';
    let agenturls = {};

    if (universe.SA_REST) {
        const saurl = new URL(universe.SA_REST);
        const sahost = saurl.host;
        const saprotocol = saurl.protocol === 'https:' ? 'wss' : 'ws';
        agenturls.sa = `${saprotocol}://${sahost}/${endpoint}`;
    }

    if (universe.NEXUS_REST) {
        const nexusurl = new URL(universe.NEXUS_REST);
        const nexushost = nexusurl.host;
        const nexusprotocol = nexusurl.protocol === 'https:' ? 'wss' : 'ws';
        agenturls.nexus = `${nexusprotocol}://${nexushost}/${endpoint}`;
    }

    universe.$connector = WSConnector.use(agenturls);
}

//
// startup function
//

// todo: window.neulandconfig?.auth !== true for Identity

export default async function() {
    // create and inti

    console.log("$$ ThoregonRemote start 1");
    const identity = new IdentityReflectionRemote();
    thoregon.checkpoint("init Thoregon Remote 2");
    const connector = universe.connector;
    universe.RemoteObserver = RemoteObserver;
    thoregon.checkpoint("init Thoregon Remote 3");
    const aurora = Aurora; // new Aurora();
    thoregon.checkpoint("init Thoregon Remote 4");
    const dorifer = new Dorifer();

    // now start
    thoregon.checkpoint("init Thoregon Remote 5");
    await connector?.start();
    thoregon.checkpoint("init Thoregon Remote 6");
    await identity.start();
    universe.$IdentityReflection = identity;
    thoregon.checkpoint("init Thoregon Remote 7");
    await aurora.start();
    thoregon.checkpoint("init Thoregon Remote 8");
    await dorifer.start();
    thoregon.checkpoint("init Thoregon Remote 9");

    //
    // testing & debugging
    //
    await LogSink.init();
    universe.$logsink = LogSink;

    await doAsync();
}

//
// shutdown
//

universe.atDusk(async (universe, code) => {
    universe.connector?.stop();
})
