/**
 *
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

/******************************************************************/
/* ThoregonEntity delete collection in property                   */
/******************************************************************/

import { doAsync, timeout } from "/evolux.universe";
import ThoregonEntity       from "/thoregon.archetim/lib/thoregonentity.mjs";
import MetaClass            from "/thoregon.archetim/lib/metaclass/metaclass.mjs";

class TestBOMeta extends MetaClass {

    initiateInstance() {
        this.name = "TestBO";

        this.text("a");
        this.object("b");

        this.event("cancommit", function () { return  this.a != undefined });
    }

}

class TestBO extends ThoregonEntity() {
    constructor(props) {
        super();
        Object.assign(this, props);
    }
}

TestBO.checkIn(import.meta, TestBOMeta);

window.TestBO = TestBO;
window.myhome = await me.home;

console.log("** Spikes done");
// debugger;



/******************************************************************/
/* ThoregonEntity initiate                                        */
/******************************************************************/


import { doAsync, timeout } from "/evolux.universe";
import ThoregonEntity       from "/thoregon.archetim/lib/thoregonentity.mjs";
import MetaClass            from "/thoregon.archetim/lib/metaclass/metaclass.mjs";

class TestBOMeta extends MetaClass {

    initiateInstance() {
        this.name = "TestBO";

        this.text("a");
        this.object("b");

        this.event("cancommit", function () { return  this.a != undefined });
    }

}

class TestBO extends ThoregonEntity() {
    constructor(props) {
        super();
        Object.assign(this, props);
    }
}

TestBO.checkIn(import.meta, TestBOMeta);

debugger;

TestBOMeta.getInstance().addEventListener('cancommit', (evt) => console.log('TestBO can commit>', evt));

const store = universe.random();
console.log("store", store);
const a = await TestBO.materialize({}, { store });
a.addEventListener('materialized', (evt) => console.log('a materialized', evt));
a.addEventListener('change', (evt) => console.log('a>', evt));

let b = await TestBO.create();
// @@@
b.addEventListener('materialized', (evt) => console.log('b materialized', evt));
b.addEventListener('change', (evt) => console.log('b>', evt));
b.addEventListener('cancommit', (evt) => console.log('b can commit>', evt));

b.a = "set value of b.a";

a.b = b;


/******************************************************************/
/* GUN indexedDB storage adapter                                  */
/******************************************************************/

//
// constants
//
//
// const WEBKIT_RESTART_INTERVAL = 15000; // 15 seconds
// const VERSION_REOPEN_DELAY    =   350;
//
// // if multiple DB's used keep their adapter instances
// const Stores = {};
//
// class RIndexedStore {
//
//     constructor(opt) {
//         this.opt    = opt;
//         this.dbName = opt.file;
//         this._getQ  = [];    // keep 'get' request until the DB is ready
//         this._putQ  = [];    // keep 'put' request until the DB is ready
//     }
//
//     /**
//      * Open an indexed DB
//      * Create a store if missing
//      * Handle exceptions and bugs
//      */
//     start() {
//         console.log("> start 1");
//         var openDB = indexedDB.open(this.dbName, 1);
//         console.log("> start 2");
//
//         openDB.onupgradeneeded = (evt) => {
//             console.log("> onupgradeneeded 1");
//             const db = evt.target.result;
//             console.log("> onupgradeneeded createObjectStore");
//             const store = db.createObjectStore(this.dbName, { keyPath: 'id' });
//             // console.log("> onupgradeneeded createIndex");
//             // store.createIndex('id', 'id', { unique: true });
//             console.log("> onupgradeneeded 2");
//         };
//         openDB.onblocked = () => {
//             console.log("> onblocked");
//             setTimeout(() => this.restart(), VERSION_REOPEN_DELAY);
//         };
//         openDB.onsuccess       = (evt) => {
//             console.log("> onsuccess 1");
//             const db = this.db = evt.target.result;
//             // add a handler for version change from another tab
//             // this may block the DB and cause irregular behavior
//             db.onversionchange = () => {
//                 console.log("> onversionchange 1");
//                 const db = this.db;
//                 delete this.db;
//                 db.close();
//                 // try reopen after version change
//                 setTimeout(() => this.start(), VERSION_REOPEN_DELAY);
//                 console.log("> onversionchange 2");
//             };
//             // this is an ugly workaround to reset webkit bug
//             // if (window.webkitURL) this.restartIntervalId = setInterval(() => this.restart(), WEBKIT_RESTART_INTERVAL);
//
//             console.log("> onsuccess 2");
//             this.processQs();
//             console.log("> onsuccess 3");
//         }
//         openDB.onerror         = (evt) => {
//             console.log('IndexedDB Error:', evt);
//         }
//         console.log("> start 3");
//     }
//
//     //
//     // base functions
//     //
//
//     put(key, data, cb) {
//         const db = this.db;
//         if (!db) {
//             console.log("> put wait 4 DB");
//             this._putQ.push({ key, data, cb });
//             return;
//         }
//         console.log("> put 1");
//         key = '' + key;     // sanitize
//
//         // this.get(key, (ignore, exists) => {
//             console.log("> put 2");
//             const transaction = this.db.transaction(this.dbName, 'readwrite');
//             const store       = transaction.objectStore(this.dbName);
//             console.log("> put 3");
//             //if (exists) {
//                 store.put({ id: key, payload: data });
//             //} else {
//             //    store.add({ id: key, payload: data });
//             //}
//             transaction.onabort    = (evt) => {
//                 console.log("> put onabort");
//                 cb(evt || 'put.tx.abort');
//             }
//             transaction.onerror    = (evt) => {
//                 console.log("> put onerror");
//                 cb(evt || 'put.tx.error');
//             }
//             transaction.oncomplete = (evt) => {
//                 console.log("> put oncomplete");
//                 cb(null, 1);
//             }
//             console.log("> put 4");
//         // });
//     }
//
//     get(key, cb) {
//         const db = this.db;
//         if (!db) {
//             console.log("> get wait 4 DB");
//             this._getQ.push({ key, cb });
//             return;
//         }
//         console.log("> get 1");
//         key = '' + key;     // sanitize
//
//         const request     = this.db
//                                 .transaction(this.dbName, 'readonly')
//                                 .objectStore(this.dbName)
//                                 .get(key);
//         request.onabort   = (evt) => {
//             console.log("> get onabort");
//             cb(evt || 4);
//         }
//         request.onerror   = (evt) => {
//             console.log("> get onerror");
//             cb(evt || 5);
//         }
//         request.onsuccess = (evt) => {
//             console.log("> get onsuccess");
//             cb(null, request.result?.payload);
//         }
//         console.log("> get 2");
//     }
//
//     //
//     // maintenance
//     //
//
//     restart() {
//         console.log("> restart 1");
//         if (this.restartIntervalId) clearInterval(this.restartIntervalId);
//         this.db?.close();
//         delete this.db;
//         this.start();
//         console.log("> restart 2");
//     }
//
//     //
//     // process request queues
//     //
//
//     processQs() {
//         console.log("> processQs 1");
//         this._putQ.forEach(({ key, data, cb }) => this.put(key, data, cb));
//         console.log("> processQs 2");
//         setTimeout(() => this._getQ.forEach(({ key, cb }) => this.get(key, cb)), VERSION_REOPEN_DELAY);
//         console.log("> processQs 3");
//     }
// }
//
// function createStore(opt) {
//     opt      = opt || {};
//     const dbName = opt.file = String(opt.file || 'ratest');
//     if (Stores[dbName]) {
//         console.log("Warning: reusing same IndexedDB store and options as 1st.");
//         return Stores[dbName];
//     }
//
//     const store = Stores[dbName] = new RIndexedStore(opt);
//     store.start();
//     return store;
// }


const store = createStore();

const key = universe.random();
store.put(key, { a: 'A' }, console.log);
store.get(key, console.log);

store.put(key, { b: 'B' }, console.log);
store.get(key, console.log);


// debugger;

/******************************************************************/
/* thoregon decorator with promise chain                          */
/******************************************************************/


import { doAsync, timeout } from "/evolux.universe";

debugger;

console.log("1");
const agentid = await me.agents.dpRuuCDRDUoc8Jd4WbBMiDQrtESwWayl.id;
console.log("2", agentid);
debugger;



/******************************************************************/
/* directory property delete & reload                             */
/******************************************************************/


import { doAsync, timeout } from "/evolux.universe";
import PromiseChain         from "/thoregon.archetim/lib/promisechain.mjs";

let i = 1;

class Test {

    constructor(props) {
        this.i = i++;
    }


    get x() {
        return new Test();
    }

    async fn() {
        await timeout(100);
        return "done: " + this.i;
    }
}

try {
    const { proxy } = PromiseChain.with((resolve, reject) => { resolve(new Test()); });
    const x = proxy;

    const z = x.x.x;

    debugger;
    console.log("1", await z.fn());
    console.log("2", await x.x.x.x.fn());
} catch (e) {
    debugger;
    console.log(e);
}


// console.log("PromiseChain ", await x.x.x.x.fn());

/******************************************************************/
/* directory property delete & reload                             */
/******************************************************************/


import { doAsync, timeout }               from "/evolux.universe";
import ThoregonEntity, { ThoregonObject } from "/thoregon.archetim/lib/thoregonentity.mjs";
import Directory                          from "/thoregon.archetim/lib/directory.mjs";

const store = universe.random();
console.log("store", store);
const dir = await Directory.create({ store });

dir.addEventListener('change', (evt) => console.log('dir change', evt));

dir.x = { x: 'x' };
dir.y = { y: 'y' };
dir.z = { z: 'z' };

delete dir.y;
console.log('3', dir);

const dirA = await ThoregonObject.from(store);
debugger;
window.dirA = dirA;

for await (const entry of dirA) {
    console.log("entry", entry);
}


debugger;

/******************************************************************/
/* ThoregonEntity initiate                                        */
/******************************************************************/


import { doAsync, timeout }               from "/evolux.universe";
import ThoregonEntity, { ThoregonObject } from "/thoregon.archetim/lib/thoregonentity.mjs";
import MetaClass                          from "/thoregon.archetim/lib/metaclass/metaclass.mjs";
import Directory                          from "/thoregon.archetim/lib/directory.mjs";

class TestBOMeta extends MetaClass {

    initiateInstance() {
        this.name = "TestBO";

        this.text("txt");
        this.object("ref");
        this.collection("dir",  Directory);
    }

}

class TestBO extends ThoregonEntity() {
    constructor(props) {
        super();
        Object.assign(this, props);
    }
}

TestBO.checkIn(import.meta, TestBOMeta);

// debugger;

const store = universe.random();
console.log("store", store);
const a = await TestBO.create({}, { store });

a.addEventListener('change', (evt) => console.log('a change', evt));

a.txt = "text A";
a.ref = await TestBO.create();

const b = await a.ref;
b.txt = "text B";

const dir = await a.dir;
dir.x = { x: 'x' };
dir.y = { y: 'y' };

await doAsync();

delete a.txt;
await doAsync();
console.log('1', a);

delete a.ref;
await doAsync();
console.log('2', a);

delete dir.y;
console.log('3', dir);

const A = await ThoregonObject.from(store);

const dirA = await A.dir;
debugger;

for await (const entry of dirA) {
    console.log("entry", entry);
}

debugger;


/******************************************************************/
/* autocomplete collection & directory                            */
/******************************************************************/


import { doAsync, timeout } from "/evolux.universe";
import ThoregonEntity       from "/thoregon.archetim/lib/thoregonentity.mjs";
import MetaClass            from "/thoregon.archetim/lib/metaclass/metaclass.mjs";
import Collection           from "/thoregon.archetim/lib/collection.mjs";
import Directory            from "/thoregon.archetim/lib/directory.mjs";

class TestBOMeta extends MetaClass {

    initiateInstance() {
        this.name = "TestBO";

        this.text("txt");
        this.collection("col",  Collection); // autocomplete default is true in this case
        this.collection("dir",  Directory);  // autocomplete default is true in this case
    }

}

class TestBO extends ThoregonEntity() {
    constructor(props) {
        super();
        Object.assign(this, props);
    }
}

TestBO.checkIn(import.meta, TestBOMeta);

debugger;

const refA = universe.random();

const a = await TestBO.create({ text: 'A' }, { store: refA });
const col = await a.col;
col.add({ x: 'X' });

debugger;

const dir = await a.dir;
dir.y = { y: 'y' };

await timeout(1000);
console.log(a);

debugger;

const a2 = await TestBO.from(refA);
console.log(await a2.prop('dir.y'));
console.log([...(await a2.col).propertyNames]);

debugger;


/******************************************************************/
/* ThoregonEntity initiate                                        */
/******************************************************************/


import { doAsync, timeout } from "/evolux.universe";
import ThoregonEntity       from "/thoregon.archetim/lib/thoregonentity.mjs";
import MetaClass            from "/thoregon.archetim/lib/metaclass/metaclass.mjs";

class TestBOMeta extends MetaClass {

    initiateInstance() {
        this.name = "TestBO";

        this.text("a");
        this.object("b");
    }

}

class TestBO extends ThoregonEntity() {
    constructor(props) {
        super();
        Object.assign(this, props);
    }
}

TestBO.checkIn(import.meta, TestBOMeta);

debugger;

const refA = universe.random();

const a = await TestBO.create({ a: 'A' }, { store: refA });
const b = await TestBO.create({ b: 'B' });
a.b = b;

await timeout(2000);
console.log(a);

debugger;
const a2 = await TestBO.from(refA);
const b2 = await a2.b;
console.log(b2);

debugger;


// import { TelegramProvider } from "/thatsme-module-message-provider/lib/providers/telegramprovider.mjs";

// import Query, { EMPTY_QUERY }   from "/thoregon.truCloud/lib/query.mjs";
// import Channel from "/thatsme-application-broadcastgreen/lib/entities/channel.mjs";

// import ThoregonObject       from "/thoregon.archetim/lib/thoregonentity.mjs";
// import BO                   from "/thoregon.archetim/test/items/bo.mjs";
// import Directory            from "/thoregon.archetim/lib/directory.mjs";
// import Collection           from "/thoregon.archetim/lib/collection.mjs";

// import { TelegramProviderSetting, SignalProviderSetting } from "/thatsme-application-broadcastgreen/lib/entities/providersetting.mjs";

// import Facade           from "/thoregon.crystalline/lib/facade.mjs";
// import ThoregonProducer from "/thoregon.crystalline/lib/producers/thoregonproducer.mjs";
// import ThoregonConsumer from "/thoregon.crystalline/lib/consumers/thoregonconsumer.mjs";
// import ConsoleLogger    from "/thoregon.crystalline/lib/consolelogger.mjs";

// import MetaClass            from "../../thoregon.modules/thoregon.archetim/lib/metaclass/metaclass.mjs";




console.log("Spikes START");
debugger;


console.log(await srv.echo("request"));


// todo: Views on thoregonobjects !!!

/******************************************************************/
/* Telegram API ID                                                */
/******************************************************************/


const setup = new TelegramAppSetup();

globalThis.tsetup = setup;


/******************************************************************/
/* Query                                                          */
/******************************************************************/


debugger;

const channels = await(await (await (await me.apps).undefined)['0h24w']).channels;
// const channels = [ { identifier: 'Summit 2021', name: '2021 - Pioneers of Change Summit' }, { identifier: 'Summit 2020', name: '2020 - Pioneers of Change Summit' }, { identifier: 'Summit 2022', name: '2022 - Pioneers of Change Summit' }];
const query = await Query.from(channels);
// const query = EMPTY_QUERY;

query.onAdd(console.log);


/******************************************************************/
/* Thoregon Consumer/Producer                                     */
/******************************************************************/


debugger;

console.log('\nRequest/Response Service start\n');
thoregon.archetimlogger = new ConsoleLogger();

class Producer {

    constructor(props) {
        this.a = 1;
    }


    echo(req) {
        return "received: " + req;
    }

    doThrow() {
        throw new Error("Test throw");
    }
}

universe.spikes = {};

const srvroot = "yPqTS97ESjGK5FV2rCDQqOoP30odvGK2";
// const srvroot = universe.random();

const srvimpl = await ThoregonProducer.with(srvroot, new Producer());
universe.spikes.srvimpl = srvimpl;

const srv = await Facade.use(await ThoregonConsumer.at(srvroot));
universe.spikes.srv = srv;

srv.subscribe('change', (evt) => {
    console.log('Producer -> change', evt);
});

console.log('Producer.echo()', await srv.echo('wer ruft in den Wald'));
console.log('Producer.a = ', await srv.a);

srv.a = 'A';

try {
    await srv.doThrow();
    console.log("!! should not reach this !!");
} catch (e) {
    console.log("Test throw OK");
}

await timeout(100);
srv.a = 'B';

srv.close();

console.log('\nRequest/Response Service end');


/******************************************************************/
/* Reserved Objects                                              */
/******************************************************************/


debugger;

console.log('\nReserve Object start');

const refA = 'reserved1';
const bo = await BO.reserve(refA);

console.log('BO materialized:', !bo.reserved);
console.log('BO.x:', await bo.x);

await doAsync();

console.log('\nReserve Object end');



debugger;
const refA = 'dbCPS37EAoQg1d36xnNagNlKL5zm9Rta'; // universe.random();

console.log('\nReserve Object start');

const settings = await Directory.from(refA);
settings.addEventListener('change', (evt) => console.log('settings change', evt));

universe.spikes = { settings };

const telegramsetting = await settings.reserveProperty('telegram', TelegramProviderSetting);
const signalsetting   = await settings.reserveProperty('signal',   SignalProviderSetting);


telegramsetting.addEventListener('materialized', (evt) => console.log('telegram materialized', evt));
telegramsetting.addEventListener('change', (evt) => console.log('telegram change', evt));

signalsetting.addEventListener('materialized', (evt) => console.log('signal materialized', evt));
signalsetting.addEventListener('change', (evt) => console.log('signal change', evt));

await doAsync();

telegramsetting.token = 'telegram-token-1';
await doAsync();

console.log('\nReserve Object end');




debugger;
const refA = universe.random(); // 'testA4';

console.log('\nReserve Object start');
// console.log('Materialized', await Directory.materialized(refA));
const res1 = await Directory.reserve(refA);
//universe.spikes = { res1 };
const res2 = await Directory.reserve(refA);
universe.spikes = { res1, res2 };
res1.addEventListener('materialized', (evt) => console.log('res1 materialized', evt));
res1.addEventListener('change', (evt) => console.log('res1 change', evt));
res2.addEventListener('materialized', (evt) => console.log('res2 materialized', evt));
res2.addEventListener('change', (evt) => console.log('res2 change', evt));
 console.log('res1 materialized', await res1.materialized);

await res1.a;

res1.a = { b: 'B' };

console.log('\nReserve Object end');


res.a = new Directory();

const a = Directory.awakeOrCreate(refA, {});
const b = Directory.awakeOrCreate(refA, {});


/******************************************************************/
/* Comprised Objects                                              */
/******************************************************************/


debugger;
const refA = universe.random();
const refB = universe.random();
// todo !! [OPEN]:
//  - there is a timing issue with initial properties { a: 'A' }
//  - because the 'put' of the entry run in background, the 'on' runs later and overrides the change a1.a = 1 (with { a: 'A' })
const a1 = await BO.create({ a: 'A' }, { store: refA });
a1.addEventListener('change', (evt) => console.log("a1", evt));
// const b = await BO.create({ x: '2' }, { store: refB });
const a2 = await BO.from(refA);
a2.addEventListener('change', (evt) => console.log("a2", evt));

universe.spikes = { a1, a2 };

// a1.b = b;
a1.a = 1;
a1.x = 'X';
// a1.y = new BO({ y: 'Y' });

// const a3 = await BO.from(refA);
// a3.addEventListener('change', (evt) => console.log("a3", evt));

// a2.x = 'x';

// A.c = new BO({ c: 'C' });
// a.y = new BO({ z: 'Z' });
// await doAsync();
// A.a = true;
// a.x = 2;

await doAsync();

// universe.spikes = { a1, a2, a3 };

console.log("\na1:");
for await (let prop of a1.propertyNames) {
    console.log(prop, await a1[prop]);
}
console.log("\na2: ");
for await (let prop of a2.propertyNames) {
    console.log(prop, await a2[prop]);
}



console.log("\na1:");
console.log("a1.a", await a1.a);
console.log("a1.y.y", await (await a1.y).y);

console.log("\na2:");
console.log("a2.a", await a2.a);
console.log("a2.y.y", await (await a2.y).y);




const refA ='aaa'; // a.__id__;
// const refB = b.__id__;
//  JSON.parse((await universe.archetim.persistenceRoot[rb][universe.T].val).substr(2))
const A = await BO.from(refA);

console.log("A.a", await A.a);
console.log("A.c.c", await (await A.c).c);
console.log("A.y.y", await (await A.y).y);
console.log("A.b.x", await (await A.b).x);

for await ( const key of await A.propertyNames ) {
    const item = await A[key];
    console.log("Object item", key, item, item instanceof BO);
}


/******************************************************************/
/* Lists                                                          */
/******************************************************************/


debugger;

const listRef = universe.random();
const list1 = await KeyedCollection.create({ store: listRef });
list1.addEventListener('change', (evt) => console.log("1 change >", evt));
const list2 = await KeyedCollection.from(listRef);
list2.addEventListener('change', (evt) => console.log("2 change >", evt));
universe.spikes = { list1, list2 };


await list1.add(new BO({ a: 'A' }));
await list2.add(new BO({ b: 'B' }));
await list1.add(new BO({ c: 'C' }));
await list2.add(new BO({ d: 'D' }));

await timeout(100);

console.log("\nList 1");
let items = list1.propertyNames;
for await ( const key of items) {
    const item = await list1.get(key);
    console.log('['+key+']', item, item instanceof BO);
    // item.test();
}

console.log("\nList 2");
items = list2.propertyNames;
for await ( const key of items) {
    const item = await list1.get(key);
    console.log('['+key+']', item, item instanceof BO);
    // item.test();
}



let q = Query
        .from(list1)
        .filter(() => {})
        .order(...);


/******************************************************************/
/* Directories                                                    */
/******************************************************************/


debugger;

const refDir = universe.random(); // 'dir39';

const dir1 = await Directory.create({ store: refDir });
dir1.addEventListener('change', (evt) => console.log("dir1", evt));
const dir2 = await ThoregonObject.from(refDir);
dir2.addEventListener('change', (evt) => console.log("dir2", evt));
universe.spikes = { dir1, dir2 };

dir1.a = new Date();
dir2.e = new BO({ x: 'X' });
dir1.c = new BO({ a: 'A' });

dir1.b = new Directory();
(await dir1.b).d = { d: 'D' };

// await doAsync();
await timeout(100);

console.log("dir1.e.b", await (await dir1.e).b);
console.log("dir2.e.b", await (await dir2.e).b);

console.log("dir1.c.a", await (await dir1.c).a);
console.log("dir2.c.a", await (await dir2.c).a);

console.log("\nDir 1", [...dir1.propertyNames].join(', '));
let properties = dir1.propertyNames;
for await ( const key of properties ) {
    const item = await dir1[key];
    console.log('['+key+']', item);
}

console.log("\nDir 2", [...dir2.propertyNames].join(', '));
properties = dir2.propertyNames;
for await ( const key of properties ) {
    const item = await dir2[key];
    console.log('['+key+']', item);
}

console.log("path dir2.b.d.d", await dir2.getPath('b.d.d'));



import AccessObserver from "/evolux.universe/lib/accessobserver.mjs";

const ary = ['a', 2, { b: 'B' }];

const px = AccessObserver.observe(ary);

debugger;

// get [Symbol.iterator], length, 0, length, 1, length, 2, length
for (const i of px) {
    console.log(i);
}

// get length, 0, 1, 2
px.forEach(i => console.log(i));

// set 3
// px[3] = 3;






const a = await BO.create({ a: 'A', c: new BO({ c: 'C' }) });
const b = await BO.create({ x: '2' });
a.a = 1;
a.x = 'x';
a.y = new BO({ y : 'Y' });
a.b = b;


const refA = a.__id__;
const refB = b.__id__;

// await universe.archetim.persistenceRoot.[key][universe.T].val

globalThis.spikes = { a, b, refA, refB };

//  JSON.parse((await universe.archetim.persistenceRoot[rb][universe.T].val).substr(2))
const A = await BO.from(refA);

console.log("A.a", await A.a);
console.log("A.c.c", await (await A.c).c);
console.log("A.y.y", await (await A.y).y);
console.log("A.b.x", await (await A.b).x);




    // const o = await BO.create({ j: ['a', 2, { b: 'B' }] });
    const o = await BO.create({ j: ['a', 2, { b: 'B' }, new BO({ b: 'B' })] });

    const refO = o.__id__;

    globalThis.spikes = { o, refO };

    //  JSON.parse((await universe.archetim.persistenceRoot[rb][universe.T].val).substr(2))
    const O = await ThoregonObject.from(refO);
    console.log("O.j", await O.j);


    if (!me.broadcastgreen['PoC'].root) {
        let settings = await MessengerSettings.create();
        settings.add(new TelegramSetting());
        ...
        me.credentials.broadcastgreen.root.settings = settings;

    }

    let bg = me.credentials.broadcastgreen.root;

    bg.settings.add(new SignalSetting());

    new Query.from(bg.settings);


import * as util         from "/evolux.util/lib/serialize.mjs";

    const ary32 = Uint32Array.from([12344567, 45645636, 345564, 456546]);
    const m1 = new Map();
    m1.set('a', 'A');
    m1.set('b', 'B');
    m1.set(3, 4);
    const s1 = new Set();
    s1.add('A');
    s1.add('B');
    s1.add(42);
    s1.add(true);

    console.log(util.deserialize( util.serialize("abc") ));
    console.log(util.deserialize( util.serialize(123) ));
    console.log(util.deserialize( util.serialize(true) ));
    console.log(util.deserialize( util.serialize(null) ));
    console.log(util.deserialize( util.serialize(Symbol("lucky")) ));
    console.log(util.deserialize( util.serialize([1,2,3]) ));
    console.log(util.deserialize( util.serialize(['a', 'b', true]) ));
    console.log(util.deserialize( util.serialize({ a: 'A', b: 'B', c: 42}) ));
    console.log(util.deserialize( util.serialize(/a.*b/i) ));
    console.log(util.deserialize( util.serialize(new Error("Error")) ));
    console.log(util.deserialize( util.serialize(new SyntaxError("sdvfvf")) ));
    console.log(util.deserialize( util.serialize(new DOMError("DOMError")) ));
    console.log(util.deserialize( util.serialize(document.getElementById("status")) ));
    console.log(util.deserialize( util.serialize(new Date()) ));
    console.log(util.deserialize( util.serialize(ary32) ));
    console.log(util.deserialize( util.serialize(m1) ));
    console.log(util.deserialize( util.serialize(s1) ));




import Facade         from "/thoregon.crystalline/lib/facade.mjs";
import WorkerConsumer from "/thoregon.crystalline/lib/consumers/workerconsumer.mjs";
import ConsoleLogger  from "/thoregon.crystalline/lib/consolelogger.mjs";
import SEA            from '/evolux.everblack/lib/crypto/sea.mjs';

thoregon.archetimlogger = new ConsoleLogger();

const TESTIDENTITY = {
    alias: 'testuser',
    pairs :  {
        "spriv": "6qVy7_nSSpID_l52VTxiIXGM5f2_tFr_0PwLmZNvwKQ",
        "spub": "9pE55g0wLnYWsO7StqLuU_aMS7B0eyrPZmUJMy30zyA.om3gh6eVdZAOkthFVWOfTRN263oxVxfN-XusHCRq9TA",
        "epriv": "LR8F3zbKrlXBiXI2-iBqanG7Ly3HqaX2g_G91_Nr9Rc",
        "epub": "Aw8nkkcW5gWPQ7QUnR15LSL6xvey2cPL3rxTytCV9tk.8i29pajwLhr_Fg3A7xqxp94cqYqC7qedvNHbrxTMm3I",
        "apriv": "CUseGLiq9FRJtjgpmGLLD7vUlS3LsEavUaXY4i7DUBsyYy50IPtcaGMVjoi08OpjJSrgmuyFOmEOiB_eOR0wkszXf48GDB0CrsvUASHnWSfvs5AQexsjD1jsqJOek4f4LkHAujrNTg5sv1Ulz-E1VP-oh4VPPpwoTYM3DthJx0MKN3_21btZA3CftA-oKH9zsc5mGfHTqcuHJ2vEBj8aL2DMN34zvpfNnMxJlLvsM99IFXNg2fjft4OLCllEWoGoCAhIFYP7h-UwXGHORrGJtNWiuXwxCDxxR4LdI4aOmBxaQ6qQySB6FuJsNKOXgE4OikJWpyQqnzANilUFuov-9qAtA9OqjLpZz_iivFvh4EtjzYlHiw1BeOKqp85bK_Q9qowF6y4tDy7880FB6IlfjZl6GR-HdPyKVngiIILbZkNYHH_3oKjre8Go4cZ_G1pTYcvQJS2snMKtwfjdBXyLdO75cRxoIvx94UBuPHnlkjV1T6fffV1mgNFXZh8BSwSx0h-NnYY0FEds3htNquXp5kjgKiAtoAklhE91IUyQ64UufIpZO8LZSJ2L4nRL8RRo0QMzBOF6C8Nx2yd8XiuGCt3BPcmvCT5ZBN8cTiaGdSHvz6BBYgcwOx7k9cN9lRNTlhvYIkltsK5_tQBMhGgteqFSkUDeXGdTN6CnACEsBUE.SWh9hojG5ekCB0vHRhTMriGRKFETqhVnYetzl2zi3J6_RwijP1CuIJ_HBoCPl86j4Cb5n8uIFsVbl4fPbchIrXHWdAavj-TgkNH3ToBYHUAwXknywTBj17OUqphpeBXN5ZyvNqYjmpKZZG9TOSFMmYnogfA6qohy0Ss3i_lYyyjtZS7SgcH4K2EohdL2AIB4u2k7leaVV3W2gJ-hY-6hVK9qwkxQVmXsqjt1FF5TE-62JzyRDZubEd0RagsJLaciatwIGB1W0Thc7S_Q4UK9zpKxEJum7iHPxNiMRr5M7IvYlA6dgKTCZZutpUtNFISjW7EpjhLCK9ILK32Nyf6loQ.BRKoIMa-j6ACaygx8u-EWJcEz3ucNbDjo3UjOY-glHB2UEcpWcPw_A1_jFqkRzoeq337iuXYqjkQ78lDWsDaZjGPcuDvKXs9UCOB3kBBlfj60DPsVcCCRME6YjhMbX6dcE5gkb-yG9gufvLQwksSElRvTTfZMG5lDzXwMcEcu35J4cGrnItgr-lny8UXSDrx8-2lIDvP1NfVh54pJ6D10r2PXQ2PO7VM8veB69NS3JzLEsZkbk_ZX-g424r8mNstPcOdaSt1k4AvdC2dswltLj9_FLTJeU6gbLX7vBQM4lsd5BLtn_HA6oWpzi_UNhVpv2ORO0aV19n8_JCJDxi8TQ.tky68xvxXVioJsMR5TYhcsYsXanJwYDtQK7lafGOW1_k53fdBCza0XNQgJhJruFuiLLSjABRcYBqI0cOjqDizjnzT6bu2MXnT_UuRxmNc7lD7Ukt1YVqKTjukXQFJTRP2_tTIqysn1tSC6OGtOkHcsga6J4OjWbSiW0UT1UGBNA5M-NeTPG6fGjBc2xJQ6EAU4btaCBOIJRqlGoBOhcsZueGpnV7gHahG_XC7ri8LBiEJ82azo5_EmjdIL3tcI-iV4c_9x3jBt_qDX-hBlh0V-nmCKbtG1B-lDOKfS4PYDxBSO7LVf3ynlgMMBqtAjAvOXVhgI-TJQ-cQ-6I0SlqfBQd1R9dP2rrcScIFphKSBKZYFysX7WQBRf90pkxYmm8aXioJ8bHxQtKt5N947vMDQfLxA2kxCi1Wy-Bi8moJLPtEfadavU53VG2vriNYiMyuZaSSf3HR_6PC4x9UdXO-5TqOtKh19a-RhCRT_cDFM0DZ_ZwA91txyR8-yhzzb0PpdPMGQkKeNTuSdXwZg5TrNR7w1iohfxE8hrmfUyIOMVdmdAMwq455r6y2TtqxZXvcWbxQQea5e6iLCou1BzorOJ1YsLq6PYkl0iRTBmLaMH2y3eTNRvZJd64uiD6F2EQF9Fi3rWeY4PB0TFgmOCA1BMLJN4js8EsECB_sc_MhoM.82hXi04A8QNalB5kqZ9wN4Qq-U6HZCxQwtZuGt54cu7CYjPP-QE_x8_qvHLwXxkVk145agCyqplbzbzeR7m6Nci-oOgmUfD0nHGDviWEe5Fbg24ReWpqY_Uf-zIc48suRUac8ivv5Y3kCWL9OJ7re0xn0qAE5-JvR74byPBZyoed2Yjp30n4EJiTVLas553-axaWrK5GW1o8xqmR-nuN6IOwzn9n7LRizSNqUn9qnN_J_RuoG9RwB5DcYgcqWYDwoCwt54n3QGaOrOvcNs8Kppj17VUNEOLlKJv1eUC-YdnOPIcwcc0jJOA3907yzKQTo8mDanvnX1gF389rgqDjIQ.v7sVeJlxcEmHaAaoxEbCTduX1-e-DSd3os8V9AUKWCUFIP4sbXDnfdtT1c3ls5VkVbmVPeqtCf_gPI9f9ywqYNfKU1KukQmQ4uOnraNCw9kj5wK8oVey01b6TvAmpmQ8E3XxQUtF6U6XpBGsToRV1dnbCjWBEyGV8H94IUNkxt4_MdWu1QlV0af3UL1sjz1xg1YUWxT5TjKL4KfT-TnKzplC0l6Ha9pNZobGUtwUEapTM-OJZ651e10fjy74ASXPH7hsL18v-cOcQIbruQGCKp52I2m7zmjIGJFW0ZxXKjlRq6xk0PXK5FR-8cXj77RivSrn6YhI_xbcDvz94PdZIw.xMDjLiKuQKFM38IZ6Ne4RoaMO39YrXb00qyHPwixmVAnxsLMFiMcUYx1baADk9K5VsGhS_KTDNMukoxZYK2unghpQ1MLXTV3rzYCqROACJGJIIjXZ-Fe_cqbvC6thiWzc6L1_1GqqNxzkKhK6SfH6Oe6qnt4G-pNuGWbkaK3AfvSBrZodcaAgS9xBdm7Tnns0kq-IeLgYKmdc-TpRozQDtCzG18_aMe3DTTb-lIbIuy9PfKDnYQFDnAUdn0s_XBJdcdsA75eGIZLfB_jWC1O92LIO7t1oZJKdiOSD_B4JX6XI7AqdDJaD_F1uhZ5O10HfcF3L24GZItJvqi9UsHOPw",
        "apub": "tky68xvxXVioJsMR5TYhcsYsXanJwYDtQK7lafGOW1_k53fdBCza0XNQgJhJruFuiLLSjABRcYBqI0cOjqDizjnzT6bu2MXnT_UuRxmNc7lD7Ukt1YVqKTjukXQFJTRP2_tTIqysn1tSC6OGtOkHcsga6J4OjWbSiW0UT1UGBNA5M-NeTPG6fGjBc2xJQ6EAU4btaCBOIJRqlGoBOhcsZueGpnV7gHahG_XC7ri8LBiEJ82azo5_EmjdIL3tcI-iV4c_9x3jBt_qDX-hBlh0V-nmCKbtG1B-lDOKfS4PYDxBSO7LVf3ynlgMMBqtAjAvOXVhgI-TJQ-cQ-6I0SlqfBQd1R9dP2rrcScIFphKSBKZYFysX7WQBRf90pkxYmm8aXioJ8bHxQtKt5N947vMDQfLxA2kxCi1Wy-Bi8moJLPtEfadavU53VG2vriNYiMyuZaSSf3HR_6PC4x9UdXO-5TqOtKh19a-RhCRT_cDFM0DZ_ZwA91txyR8-yhzzb0PpdPMGQkKeNTuSdXwZg5TrNR7w1iohfxE8hrmfUyIOMVdmdAMwq455r6y2TtqxZXvcWbxQQea5e6iLCou1BzorOJ1YsLq6PYkl0iRTBmLaMH2y3eTNRvZJd64uiD6F2EQF9Fi3rWeY4PB0TFgmOCA1BMLJN4js8EsECB_sc_MhoM"
    }
};

try {
    //const identity = await Facade.use(await WorkerConsumer.from('/thoregon.identity/lib/identityservice.mjs'));
    // const identity = me;
    const other    = await SEA.pair(); // this is another one

    // let is = await identity.is('lucky');
    // console.log(is);


    // identity.subscribe('signon', (evt) => console.log(">> Signon: ", evt));

    // await universe.Identity.delete("lucky", "1passwort");
    // let created = await universe.Identity.create("lucky", "1passwort");
    // console.log("created", created);

    await universe.Identity.auth("lucky", "1passwort");

    let identity = me;
    // await identity.hosted(TESTIDENTITY);
    console.log("signedon", await identity.is);

    let test = await universe.random(10);
    console.log('random test', test);
    await identity.setSecretProperty('test', test);
    test = await identity.getSecretProperty('test');
    console.log('property test', test);

/!*
    let pubkeys = await identity.pubKeys;
    console.log("pub keys", pubkeys);

    let signed = await identity.sign({ a: 'A' });
    // console.log("signed", signed);

    let verified = await SEA.verify(signed, pubkeys.spub);
    console.log("verified", verified);

    verified = await identity.verify(signed);
    console.log("identity verified", verified);

    let encrypted, decrypted;

    encrypted = await SEA.encryptPub("Hello THOREGON", pubkeys.apub);
    decrypted = await identity.decryptPriv(encrypted);
    console.log("decrypt priv", decrypted);

    let secret  = await identity.secret(other.epub);
    let secret2 = await SEA.secret(pubkeys.epub, other);
    console.log('Secret', secret === secret2 ? "EQUAL" : "NOT EQUAL");

    encrypted = await identity.encrypt({ anchor: 'abcdefg' });
    decrypted = await identity.decrypt(encrypted);
    console.log("identity decrypt", decrypted);
*!/

} catch (e) {
    console.log(">> Error", e);
}


import SEA           from '/evolux.everblack/lib/crypto/sea.mjs';

try {
    let keypairs = await SEA.pair();
    let others   = await SEA.pair();
    // console.log(keypairs);

    console.log('\nECDSA sign/verify');

    let obj = { name:' Susi' };
    let signed = await SEA.sign(obj, keypairs);

    // pass only the public key as this will be true in real life
    let verified = await SEA.verify(signed, keypairs.spub);

    console.log('Sig verification:', verified ? verified.name === obj.name ? 'VALID' : '???' : 'INVALID');

    console.log('\nRSA Asymmeric Encryption');

    let encrypted = await SEA.encryptPub("Hello THOREGON", keypairs);
    console.log('Encrypt Pub', encrypted);

    let decrypted = await SEA.decryptPriv(encrypted, keypairs);
    console.log('Decrypt Priv', decrypted);

    let salt = await SEA.rndstr(9);

    console.log('\nPBKDF2 Work');

    let work = await SEA.work("aarerberberbrtn", salt);
    console.log(work);

    let work2 = await SEA.work("aarerberberbrtn", salt);
    console.log('Work', work == work2 ? "EQUAL" : "NOT EQUAL");

    console.log('\nECDH Derive Secret Key');

    let secret  = await SEA.secret(others.epub, keypairs);
    let secret2 = await SEA.secret(keypairs.epub, others);
    console.log('Secret', secret == secret2 ? "EQUAL" : "NOT EQUAL");

    // let key = work;
    let key = secret;

    console.log('\nAES Symmetric Encryption');

    /!*let*!/ encrypted = await SEA.encrypt("Hello THOREGON", key);
    console.log("Encrypt", encrypted);

    key = secret2;
    /!*let*!/ decrypted = await SEA.decrypt(encrypted, key);
    console.log("Decrypt", decrypted);
} catch (e) {
    console.log(e);
}




const CRYPTO = window.crypto.subtle;
const ENCODE = (msg) => new TextEncoder().encode(msg);
const DECODE = (buf) => new TextDecoder('utf8').decode(buf);

const AESGCM   = 'AES-GCM';
const ECDSA    = 'ECDSA';
const P256     = 'P-256';
const ECHD     = 'ECDH';
const RSA      = 'RSA-OAEP';
const SHA256   = 'SHA-256';
const PUBEXP   = new Uint8Array([1, 0, 1]);
const KEYLEN   = 4096;

(async () => {
    /!*
    Get the encoded message, encrypt it and display a representation
    of the ciphertext in the "Ciphertext" element.
    *!/
    async function encryptMessage(key, message) {
        let enc        = new TextEncoder();
        let encoded    = enc.encode(message);
        let ciphertext = await CRYPTO.encrypt(
            {
                name: "RSA-OAEP"
            },
            key,
            encoded
        );

        return ciphertext;
    }

    /!*
    Fetch the ciphertext and decrypt it.
    Write the decrypted message into the "Decrypted" box.
    *!/
    async function decryptMessage(key, encrypted) {
        let decrypted = await CRYPTO.decrypt(
            {
                name: "RSA-OAEP"
            },
            key,
            encrypted
        );

        let dec = new TextDecoder();
        return dec.decode(decrypted);
    }

    /!*
    Generate an encryption key pair, then set up event listeners
    on the "Encrypt" and "Decrypt" buttons.
    *!/
    const keys = await CRYPTO.generateKey(
        {
            name          : "RSA-OAEP",
            // Consider using a 4096-bit key for systems that require long-term security
            modulusLength : 4096,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash          : "SHA-256",
        },
        true,
        ["encrypt", "decrypt"]
    )

    const pub = (await CRYPTO.exportKey('jwk', keys.publicKey)).n;
    const kp = (await CRYPTO.exportKey('jwk', keys.privateKey));
    const spriv = kp.d+'.'+kp.dp+'.'+kp.dq+'.'+kp.n+'.'+kp.p+'.'+kp.q+'.'+kp.qi;
    const ppriv = spriv.split('.');
    const priv = {
        kty: "RSA", alg: "RSA-OAEP-256", e: "AQAB", ext: true,
        d : ppriv[0],
        dp: ppriv[1],
        dq: ppriv[2],
        n : ppriv[3],
        p : ppriv[4],
        q : ppriv[5],
        qi: ppriv[6]
    };

    const xpub = await CRYPTO.importKey('jwk', { n: pub, kty: "RSA", alg: "RSA-OAEP-256", e: "AQAB", ext: true}, { name: RSA, hash: SHA256 }, false, ['encrypt']);
    const xpriv = await CRYPTO.importKey('jwk', priv, { name: RSA, hash: SHA256 }, false, ['decrypt'])

    const encrypted = await encryptMessage(xpub, 'Hallo THOREGON');

    const decrypted = await decryptMessage(xpriv, encrypted);

    console.log(decrypted);
})();




import Facade         from "/thoregon.crystalline/lib/facade.mjs";
import WorkerConsumer from "/thoregon.crystalline/lib/consumers/workerconsumer.mjs";

import ConsoleLogger from "/thoregon.crystalline/lib/consolelogger.mjs";
thoregon.archetimlogger = new ConsoleLogger();

(async () => {

    try {
        const srv = await Facade.use(await WorkerConsumer.from('/thoregon.crystalline/test/services/simplejs.mjs'));

        let result = await srv.doit();
        console.log("service:", result);

        result = await srv.oneParam(0);
        console.log("service:", result);

        result = await srv.twoParam(true, '$');
        console.log("service:", result);


        srv.onchange = (evt) => {
            console.log(evt);
        };

        /!*
            srv.subscribe('change', (evt) => {
                console.log(evt);
            });
        *!/

        let a = await srv.a;
        console.log("service a:", a);
        let b = await srv.b;
        console.log("1 service b:", b);
        srv.b = 'X';
        b     = await srv.b;
        console.log("2 service b:", b);

        await srv.forceTimeout();
    } catch (e) {
        console.log(">> Error", e);
    }
})();



import ServiceFacade from "/thoregon.crystalline/lib/servicefacade.mjs";
import JSConsumer    from "/thoregon.crystalline/lib/consumers/jsconsumer.mjs";
import SimpleJS      from "/thoregon.crystalline/test/services/simplejs.mjs";


(async () => {
    debugger;
    const srv = await ServiceFacade.use(await JSConsumer.with(new SimpleJS()));

    let result = await srv.doit();
    console.log("service:", result);

    result = await srv.oneParam(0);
    console.log("service:", result);

    result = await srv.twoParam(true, '$');
    console.log("service:", result);

    let a = await srv.a;
    console.log("service a:", a);
    let b = await srv.b;
    console.log("1 service b:", b);
    srv.b = 'X';
    b = await srv.b;
    console.log("2 service b:", b);
})();

