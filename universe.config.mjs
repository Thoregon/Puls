/**
 *
 *
 * @author: Bernhard Lukassen
 */

import SEA                                  from '/evolux.everblack/lib/crypto/sea.mjs'
import GunService                           from '/terra.gun/lib/reliant/gunservice.mjs';
import IdentityReflection                   from '/thoregon.identity/lib/identityreflection.mjs';
import Dorifer                              from '/thoregon.truCloud/lib/dorifer.mjs';
import Aurora                               from "/thoregon.aurora";

//
// JS engine independence
//
export { path }                          from '/evolux.util';

// import TESTIDENTITY                      from "./testidentity.mjs";

export { default as myagents }           from './agent_config.mjs';

export const DEBUG = false;
export const HALT  = true;

/**
 * Globals available in universe
 */

export const gunpeers =    ['http://185.11.139.203:8765/gun'/*, 'https://matter.thoregon.io:8765/gun'*/];

//
// test storae adapter
//

export const HTTPFILESINK = 'http://185.11.139.203:7779'; // 'http://test.thoregon.app:7779';

//
// define app if no reference for this distribution
//
export const defaultapp = 'thatsme.app';


//
// initialize unviverse wide services an functions
//

export const everblack = SEA;


universe.atDawn(async universe => {
    const gunservice = new GunService();
    await gunservice.start();

    const identity = new IdentityReflection();
    await identity.start();

    const aurora = Aurora; // new Aurora();
    await aurora.start();

    const dorifer = new Dorifer();
    await dorifer.start();

    // register credentials for testing
    // universe.Identity.addListener('auth', async () => await dorifer.restartApp() );
    // await universe.Identity.useIdentity(TESTIDENTITY);
});

universe.atDusk(async universe => {
});
