/**
 *  ETCPORTAL
 *
 * @author: Bernhard Lukassen
 */


//
// JS engine independence
//
export { path }                          from '/evolux.util';

import * as pspecials from "/evolux.util/lib/specialbrowser.mjs";
export const specials = pspecials;

export const IDENTITY_CLASS = '/thoregon.identity/lib/identityremote.mjs';
// import TESTIDENTITY                      from "./testidentity.mjs";

export { default as HTTPFILESINK }       from './resourcesink.mjs';

export const DEBUG = false;
export const HALT  = true;

export { default as NEXUS_REST } from './nexus.mjs';

//
// inspect & test
//

// export const getInspector = async () => await universe.mq.consumerFor(services.inspector);

// only this dubug IDs will be logged, or DEBUG = true
export const DEBUGIDS     = [];
// export const DEBUGIDS     = ['== ThoregonDecorator', '== AccessObserver' ]; // ['** NeulandDB', '## Identity', '== ThoregonDecorator', '== AccessObserver', '++ AppInstance', ':: AgentInstance', '-- SyncManager', '-- SyncDriverMerge', ')) P2PNetworkPolicy', ')) NetworkPolicy', ')) PeerJSNetworkAdapter', ')) NetworkAdapter'];
export const DEBUGCONSOLE = false;
export const LOGUNCAUGHT  = false;

/**
 * Globals available in universe
 */

universe.atDawn(async (universe) => {
    thoregon.checkpoint("b4 import Thoregon System");
    const sys = await import('../thoregonremote.mjs');
    const bootfn = sys.default;
    await bootfn();
    thoregon.checkpoint("imported Thoregon System");

    universe.lifecycle.triggerPrepare();
    universe.lifecycle.triggerStart();
});

universe.atDusk(async (universe, code) => {
    universe.lifecycle?.triggerExit(code);
});
