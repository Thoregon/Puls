/**
 * DEFAULT
 *
 * @author: Bernhard Lukassen
 */


//
// JS engine independence
//
export { path }                          from '/evolux.util';

import * as pspecials from "/evolux.util/lib/specialbrowser.mjs";
export const specials = pspecials;

// import TESTIDENTITY                      from "./testidentity.mjs";

export { default as KNOWN_PEERS }        from './knownpeers.mjs';
export { default as HTTPFILESINK }       from './resourcesink.mjs';

export { default as services }           from './services.mjs';

// export { default as account } from "./account.mjs";

export const DEBUG = false;
export const HALT  = true;

// only this dubug IDs will be logged, or DEBUG = true
export const DEBUGIDS     = ['== ThoregonDecorator', '== AccessObserver' ];
// export const DEBUGIDS     = ['** NeulandDB', '## Identity', '== ThoregonDecorator', '== AccessObserver', '++ AppInstance', ':: AgentInstance', '-- SyncManager', '-- SyncDriverMerge', ')) P2PNetworkPolicy', ')) NetworkPolicy', ')) PeerJSNetworkAdapter', ')) NetworkAdapter'];
export const DEBUGCONSOLE = false;
export const LOGUNCAUGHT  = false;

export const PEERSIGNALING = "peer.thoregon.io";
export const PEERSIGNALINGPORT = "9000";

import IDENTITY from "./identity.mjs";
export const ssi = IDENTITY;

/**
 * Globals available in universe
 */
const ONE_MIN = 60 * 1000;
export const NEULAND_STORAGE_OPT = { store: 'data', name: 'neuland', backup: ONE_MIN, maxmod: 1000 };    // can override: writeCount, writeInterval
export const NEULANDLOCAL_STORAGE_OPT = { location: 'data', name: 'neulandlocal' };    // can override: writeCount, writeInterval

//
// test storae adapter
//

// export const HTTPFILESINK = 'https://resource.thoregon.io'; // 'http://test.thoregon.app:7779';

//
// define app if no reference for this distribution
//
export const defaultapp = 'thatsme.app';


universe.atDawn(async (universe) => {
    thoregon.checkpoint("b4 import Thoregon System");
    const sys = await import('../thoregonsystem.mjs');
    const bootfn = sys.default;
    await bootfn();
    thoregon.checkpoint("imported Thoregon System");

    universe.lifecycle.triggerPrepare();
    universe.lifecycle.triggerStart();
});

universe.atDusk(async (universe, code) => {
    universe.lifecycle?.triggerExit(code);
});
