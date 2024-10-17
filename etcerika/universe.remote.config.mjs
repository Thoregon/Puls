/**
 * DEFAULT
 *
 * @author: Bernhard Lukassen
 */

import "../basesetup.mjs";

//
// JS engine independence
//
export { path }                          from '/evolux.util';

import * as pspecials from "/evolux.util/lib/specialbrowser.mjs";
export const specials = pspecials;

// export { default as HTTPFILESINK }       from './resourcesink.mjs';

export { default as account } from "./account.mjs";

export { default as SA_REST } from './sa.mjs';
export { default as NEXUS_REST } from './nexus.mjs';

// export const SA_REST = 'http://localhost:30101';
// export const NEXUS_REST = 'http://localhost:30000';

//
// inspect & test
//

// export const getInspector = async () => await universe.mq.consumerFor(services.inspector);

export const DEBUG = false;
// export const HALT  = true;

// only this dubug IDs will be logged, or DEBUG = true
export const DEBUGIDS     = [];
// export const DEBUGIDS     = ['** NeulandDB', '## Identity', '== ThoregonDecorator', '== AccessObserver', '++ AppInstance', ':: AgentInstance', '-- SyncManager', '-- SyncDriverMerge', ')) P2PNetworkPolicy', ')) NetworkPolicy', ')) PeerJSNetworkAdapter', ')) NetworkAdapter'];
export const DEBUGCONSOLE = false;
export const LOGUNCAUGHT  = false;

//
// define app if no reference for this distribution
//
export const defaultapp = 'easypay-application-dashboard';

universe.atDawn(async (universe) => {
    thoregon.checkpoint("b4 import Thoregon Remote");
    const sys = await import('../thoregonremote.mjs');
    const bootfn = sys.default;
    await bootfn();
    thoregon.checkpoint("imported Thoregon Remote");

    universe.lifecycle.triggerPrepare();
    universe.lifecycle.triggerStart();
});

universe.atDusk(async (universe, code) => {
    universe.lifecycle?.triggerExit(code);
});
