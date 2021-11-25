/**
 *
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

import ThoregonProducer from "/thoregon.crystalline/lib/services/thoregonproducer.mjs";

export default class Producer {

    constructor() {
        this.name = 'Producer';
    }

    echo(text) {
        console.log("Producer.echo()", text);
        return "Got: '" + text + "'";
    }

}

universe.qtest = {};
const srvroot = "yPqTS97ESjGK5FV2rCDQqOoP30odvGKS";

const producer = await ThoregonProducer.with(srvroot, new Producer());
universe.qtest.producer = producer;
