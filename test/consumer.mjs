/**
 *
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

import Facade           from "/thoregon.crystalline/lib/facade.mjs";
import ThoregonConsumer from "/thoregon.crystalline/lib/consumers/thoregonconsumer.mjs";
import DocumentLogger   from "/thoregon.crystalline/lib/documentlogger.mjs";

import { doAsync, timeout } from "/evolux.universe";

import TestEntity       from "/thoregon.crystalline/test/testentity.mjs";

universe.qtest = {};
const srvroot = "yPqTS97ESjGK5FV2rCDQqOoP30odvGKJ";
const logelem = document.getElementById('log');
const log = (msg) => {
    const item = document.createElement('p');
    item.innerText = msg;
    logelem.appendChild(item);
}

thoregon.archetimlogger = new DocumentLogger('Producer', logelem);

const ADR = 'EOocUoPqzpe5lqTySaAK4pf8ENZ7bRtn';

const $run = document.getElementById('run');
$run.style.visibility = 'visible';
$run.onclick = async () => {
    console.log('\nConsumer start\n');

    const testEntity = await TestEntity.from(ADR) ?? await TestEntity.create({ text: 'test consumer' }, { store: ARD });

    const consumer = await Facade.use(await ThoregonConsumer.at(srvroot));
    universe.qtest.consumer = consumer;

    consumer.subscribe('change', (evt) => {
        console.log('Producer -> change', evt);
    });

    consumer.with(testEntity);

    // console.log('Producer.echo()', await consumer.echo('wer ruft in den Wald'));
    // console.log('Producer.name = ', await consumer.name);
    // consumer.name = 'Pwned';

    await timeout(100);
    consumer.close();

    console.log('\nConsumer end');
}

