/**
 *
 *
 * @author: Bernhard Lukassen
 */

import Controller, { ComponentsWatcher } from '/evolux.dyncomponents';
import { tservices, mythoregon }         from '/evolux.universe';

import TESTIDENTITY                      from "./testidentity.mjs";

export { default as myagents }           from './agent_config.mjs';

export const DEBUG = false;
export const HALT  = true;

/**
 * Globals available in universe
 */

export const gunpeers =    ['http://185.11.139.203:8765/gun'/*, 'https://matter.thoregon.io:8765/gun'*/];

// todo: move to seperate config e.g. 'tru4d.config.mjs'
export const responsibilities   = [
    'thoregon.app'
];


//
// define app if no reference for this distribution
//
export const defaultapp = 'thatsme.app';

//
// define the universe for this distribution
//
// export const STRANGENESS = 'bwhOilJRd73uyFUzeKfJ13604fJdwKTy';  // the strangeness is a basic reference to be used as 'pepper' for all PoW's
// export const DORIFER = 'HriEr6DQKudGfFVphupRuTyxLGKgxNay';  // the soul (address) of the dorifer directory
// export const THOREGON_SPUB = '';

const thoregonsystem = async (universe) => {
    thoregon.checkpoint("§§ thoregonsystem install ");
    const pubsub = (await import('/evolux.pubsub')).service;
    await pubsub.install();
    await pubsub.start();
    thoregon.checkpoint("§§ thoregonsystem evolux.pubsub");

    const everblack = (await import('/evolux.everblack')).service;
    await everblack.install();
    await everblack.start();
    thoregon.checkpoint("§§ thoregonsystem evolux.everblack");

    const aurora = (await import('/thoregon.aurora')).default;
    await aurora.install();
    await aurora.start();
    thoregon.checkpoint("§§ thoregonsystem thoregon.aurora");

    const gun = (await import('/terra.gun')).service;
    await gun.install();
    await gun.start();
    thoregon.checkpoint("§§ thoregonsystem terra.gun");
/*
    const matter = (await import('/evolux.matter')).service;
    await matter.install();
    await matter.start();
    thoregon.checkpoint("§§ thoregonsystem evolux.matter");
*/
/*
    const heavymatter = (await import('/terra.ipfs')).service;
    await heavymatter.install();
    await heavymatter.start();
    thoregon.checkpoint("§§ thoregonsystem terra.ipfs");
*/

    const archetim = (await import('/thoregon.archetim')).default;
    await archetim.install();
    await archetim.start();
    thoregon.checkpoint("§§ thoregonsystem thoregon.archetim");

    const identity = (await  import('/thoregon.identity')).default;
    await identity.install();
    await identity.start();
    thoregon.checkpoint("§§ thoregonsystem thoregon.identity");

    const truCloud = (await  import('/thoregon.truCloud')).default;
    await truCloud.install();
    await truCloud.start();
    thoregon.checkpoint("§§ thoregonsystem thoregon.truCloud");
}


universe.atDawn(async universe => {
    const componentLocation     = 'components';
    const componentController = Controller.baseCwd('ThoregonComponentController');
    tservices().components = componentController;

    // now setup the basic distributed system
    await thoregonsystem(universe);

    // register credentials for testing
    universe.Identity.addListener('auth', async () => await dorifer.restartApp() );
    await universe.Identity.useIdentity(TESTIDENTITY);
});

universe.atDusk(async universe => {
    await tservices().components.exit();
});
