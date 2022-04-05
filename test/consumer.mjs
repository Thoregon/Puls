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
/*
const log = (msg) => {
    const item = document.createElement('p');
    item.innerText = msg;
    logelem.appendChild(item);
}
*/

// *********************************
class ProducerInterface {

    constructor() {
        this.name = '';
    }

    echo(text) {}

    with(entity) {}

}
// *********************************

thoregon.archetimlogger = new DocumentLogger('Consumer', logelem);

const SOUL = 'EOocUoPqzpe5lqTySaAK4pf8ENZ7bRtn';

const $run = document.getElementById('run');
$run.style.visibility = 'visible';
$run.onclick = async () => {
    console.log('\nConsumer start\n');

    const testEntity = await TestEntity.restoreOrCreate(SOUL, { text: 'thoregon Q test' });

    const consumer = await Facade.use(await ThoregonConsumer.at(srvroot), { cls: ProducerInterface });
    universe.qtest.consumer = consumer;

    consumer.subscribe('change', (evt) => {
        console.log('Producer -> change', evt);
    });

    console.log('Producer.echo()', await consumer.echo('wer ruft in den Wald'));
    await consumer.with(testEntity);
    await consumer.with([testEntity, 'A']);
    await consumer.with({ test: testEntity, b: 'B' });
    console.log('Producer.name = ', await consumer.name);
    consumer.name = 'Pwned';

    await timeout(100);
    consumer.close();

    console.log('\nConsumer end');
}

