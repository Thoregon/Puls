/**
 *
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

import SEA                     from '/evolux.everblack/lib/crypto/sea.mjs'
import GunService              from '/terra.gun/lib/reliant/gunservice.mjs';
import { Automerge, Peer }     from "/thoregon.neuland/modules/browserpeer/index.mjs";
import BrowserLifecycleEmitter from "/thoregon.neuland/modules/browserpeer/browserlifecycleemitter.mjs";
import NeulandStorageAdapter   from "/thoregon.neuland/modules/browserpeer/idxdbneulandstorageadapter.mjs";
import NeulandDB               from "/thoregon.neuland/src/storage/neulanddb.mjs";
import P2PNetworkPolicy        from "/thoregon.neuland/src/p2p/p2pnetworkpolicy.mjs";
import PeerJSNetworkAdapter    from "/thoregon.neuland/src/p2p/peerjsnetworkadapter.mjs";
import SyncManager             from "/thoregon.neuland/src/sync/syncmanager.mjs";
import MQ                      from "/thoregon.neuland/src/mq/mq.mjs";
import IdentityReflection      from '/thoregon.identity/lib/identityreflection.mjs';
import Dorifer                 from '/thoregon.truCloud/lib/dorifer.mjs';
import Aurora                  from "/thoregon.aurora";

//
// crypto, safety & security
//

universe.$everblack = SEA;
universe.$lifecycle = new BrowserLifecycleEmitter();

//
// network policies & adapters,
//

universe.$Peer      = Peer;
universe.$netconfig = {
    policies: [P2PNetworkPolicy],
        p2p: {
        adapters: [PeerJSNetworkAdapter],
            knownPeers: ['PeerJS-ynGhbGJjEh3BCNH1mSBTykj89a7PXNzO']
    },
};

const netopt = {};
universe.$net = universe.netconfig.policies.map((Policy) => new Policy(netopt));

//
// crdt & sync
//

universe.$Automerge = Automerge;
universe.$syncmgr   = SyncManager.setup();
universe.$mq        = MQ.setup();

//
// components
//

const neuland    = new NeulandDB();
const gunservice = new GunService();
const identity   = new IdentityReflection();
const aurora     = Aurora; // new Aurora();
const dorifer    = new Dorifer();

neuland.init(NeulandStorageAdapter, universe.NEULAND_STORAGE_OPT);
await neuland.start();
await gunservice.start();
await identity.start();
await aurora.start();
await dorifer.start();

//
// information functions
//

universe.p2ppolicy = () => universe.net[0];
universe.p2padapter = () => universe.p2ppolicy().net[0];

// register credentials for testing
// universe.Identity.addListener('auth', async () => await dorifer.restartApp() );
// await universe.Identity.useIdentity(TESTIDENTITY);

// don't need a double lifecycle handling
// universe.lifecycle.addEventListener('prepare', () => {
//     neuland.init(NeulandStorageAdapter, universe.NEULAND_STORAGE_OPT);
// });
//
// universe.lifecycle.addEventListener('start', async () => {
//     neuland.start();
//     await gunservice.start();
//     await identity.start();
//     await aurora.start();
//     await dorifer.start();
//
//     // register credentials for testing
//     // universe.Identity.addListener('auth', async () => await dorifer.restartApp() );
//     // await universe.Identity.useIdentity(TESTIDENTITY);
// });
