/**
 *
 *
 * @author: Bernhard Lukassen
 */

import Controller, { ComponentsWatcher }    from '/evolux.dyncomponents';

import { tservices, mythoregon }            from '/evolux.universe';

export const gunpeers =    ['https://matter.thoregon.io:8765/gun'];

// todo: move to seperate config e.g. 'tru4d.config.mjs'
export const responsibilities   = [
    'thoregon.app'
];

export const defaultapp = 'thatsme.app';

const thoregonsystem = async (universe) => {
    const services              = universe.services;
    const components            = services.components;
    const ComponentDescriptor   = components.ComponentDescriptor;

    /*
     * Evolux Components
     */
    const pubsub =       ComponentDescriptor({
         id:             'pubsub',
         displayName:    'publish/subscribe infrastructure in the universe (only local)',
         category:       'universe',
         href:           '/evolux.pubsub',
     });
    const gun =       ComponentDescriptor({
          id:             'gun',
          displayName:    'distributed DB from universe',
          category:       'universe',
          href:           '/terra.gun',
      });
    const everblack = ComponentDescriptor({
          id:             'everblack',
          displayName:    'encryption & security for thoregon',
          category:       'thoregon',
          href:           '/evolux.everblack',
      });
    const matter =    ComponentDescriptor({
          id:             'matter',
          displayName:    'matter in the universe',
          category:       'universe',
          href:           '/evolux.matter',
      });

    // install 'gun' to have synced distributed DB available
    await components.install(gun);
    await components.resolve(gun.id);
    await components.start(gun.id);

    // install 'gun' to have synced distributed DB available
    await components.install(pubsub);
    await components.resolve(pubsub.id);
    await components.start(pubsub.id);

    // install 'everblack' to have secure end2end encryption within the distributed DB
    await components.install(everblack);
    await components.resolve(everblack.id);
    await components.start(everblack.id);

    // install 'matter' to have fast queries available
    await components.install(matter);
    await components.resolve(matter.id);
    await components.start(matter.id);

    /*
     * UI Components
     */

    const UI = ComponentDescriptor({
           id         : 'UI',
           displayName: 'evolux UI components',
           category   : 'evolux',
           href       : '/evolux.ui',
       });

    const Aurora = ComponentDescriptor({
           id         : 'Aurora',
           displayName: 'Thoregon Aurora UI components',
           category   : 'thoregon',
           href       : '/thoregon.aurora',
       });

    await components.install(UI);
    await components.resolve(UI.id);
    await components.start(UI.id);

    await components.install(Aurora);
    await components.resolve(Aurora.id);
    await components.start(Aurora.id);

    /*
     * Thoregon Components
     */
    const identity  = ComponentDescriptor({
          id:             'identity',
          displayName:    'thoregon distributed identites',
          category:       'thoregon',
          href:           '/thoregon.identity',
      });

    /*
        const karte =    ComponentDescriptor({
             id:             'KARTE',
             displayName:    'thoregon universe KARTE',
             category:       'thoregon',
             href:           '/thoregon.karte',
         });
        const heavymatter = ComponentDescriptor({
           id:             'heavymatter',
           displayName:    'matter for heavy (large) data',
           category:       'universe',
           href:           '/terra.ipfs',
        });

        const schema =    ComponentDescriptor({
            id:             'schema',
            displayName:    'schema for apps and contexts',
            category:       'universe',
            href:           '/evolux.schema',
        });
    */
    const tru4D =     ComponentDescriptor({
                                              id:             'tru4D',
                                              displayName:    'true distributed domain driven design',
                                              category:       'universe',
                                              href:           '/thoregon.tru4D',
                                          });
    const truCloud =  ComponentDescriptor({
                                              id:             'truCloud',
                                              displayName:    'truCloud supporting truServerless',
                                              category:       'universe',
                                              href:           '/thoregon.truCloud',
                                          });

    // install 'dynlayer'. provides an infrastructure for all other components
    /*
        await components.install(dynlayers);
        await components.resolve(dynlayers.id);
        await components.start(dynlayers.id);
    */
    // install 'identity'. it is essential to have identities for DDDD available
    await components.install(identity);
    await components.resolve(identity.id);
    await components.start(identity.id);

    // install 'heavymatter'. it is essential to store files and other big data
    // await components.install(heavymatter);
    // await components.resolve(heavymatter.id);
    // await components.start(heavymatter.id);

    // install 'tru4D'. it is essential to have transactions and the eventstore available
    await components.install(tru4D);
    await components.resolve(tru4D.id);
    await components.start(tru4D.id);

    // install 'truCloud'. this is the magic
    await components.install(truCloud);
    await components.resolve(truCloud.id);
    await components.start(truCloud.id);

    // install 'KARTE'. it is essential to have name and discovery service for DDDD available
    // await components.install(karte);
    // await components.resolve(karte.id);
    // await components.start(karte.id);
}

universe.atDawn(async universe => {
    const componentLocation     = 'components';
    const componentController = Controller.baseCwd('ThoregonComponentController');
    tservices().components = componentController;

    // now setup the basic distributed system
    await thoregonsystem(universe);

    // now install all other components
    componentController.addPlugin(ComponentsWatcher.watch(componentLocation));
});

universe.atDusk(async universe => {
    await tservices().components.exit();
});
