/**
 *
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

import ThoregonProducer from "/thoregon.crystalline/lib/producers/thoregonproducer.mjs";
import DocumentLogger   from "/thoregon.crystalline/lib/documentlogger.mjs";

import TestEntity       from "/thoregon.crystalline/test/testentity.mjs";

const logelem = document.getElementById('log');
const log = (msg) => {
    const item = document.createElement('p');
    item.innerText = msg;
    logelem.appendChild(item);
}

thoregon.archetimlogger = new DocumentLogger('Producer', logelem);

export default class Producer {

    constructor() {
        this.name = 'Producer';
    }

    echo(text) {
        /*console.*/log("Producer.echo()", text);
        return "Got: '" + text + "'";
    }

    with(entity) {
        console.log("With Entity:", entity.text);
    }

}

universe.qtest = {};
const srvroot = "yPqTS97ESjGK5FV2rCDQqOoP30odvGKJ";

const producer = await ThoregonProducer.with(srvroot, new Producer());
universe.qtest.producer = producer;
