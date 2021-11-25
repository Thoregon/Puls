/**
 *
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

import Facade           from "/thoregon.crystalline/lib/facade.mjs";
import ThoregonConsumer from "/thoregon.crystalline/lib/providers/thoregonconsumer.mjs";

import { doAsync, timeout } from "/evolux.universe";

debugger;

console.log('\nConsumer start\n');

universe.qtest = {};
const srvroot = "yPqTS97ESjGK5FV2rCDQqOoP30odvGKS";

const consumer = await Facade.use(await ThoregonConsumer.at(srvroot));
universe.qtest.consumer = consumer;

consumer.subscribe('change', (evt) => {
    console.log('Producer -> change', evt);
});

console.log('Producer.echo()', await consumer.echo('wer ruft in den Wald'));
console.log('Producer.a = ', await consumer.a);

consumer.a = 'A';

await timeout(100);
consumer.close();

console.log('\nConsumer end');
