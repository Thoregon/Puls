/**
 *
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

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

    fn() {
    //    await timeout(100);
        return "done: " + this.i;
    }
}

try {
    const { proxy } = PromiseChain.with((resolve, reject) => { resolve(new Test()); });
    const x = proxy;
    /*
        debugger;

        const y = await x.x.x.x;
        console.log(await y.fn());
    */

    const z = x.x.x;

    debugger;
    console.log(await z.fn());
} catch (e) {
    debugger;
    console.log(e);
}

// console.log("PromiseChain ", await x.x.x.x.fn());

/******************************************************************/
/* directory property delete & reload                             */
/******************************************************************/

/*
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
*/

/******************************************************************/
/* peristent property delete                                      */
/******************************************************************/
/*

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
a.ref = await TestBO.initiate();

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
*/

/******************************************************************/
/* autocomplete collection & directory                            */
/******************************************************************/

/*
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
*/

/******************************************************************/
/* decorated instances                                            */
/******************************************************************/
/*

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
const b = await TestBO.initiate({ b: 'B' });
a.b = b;

await timeout(2000);
console.log(a);

debugger;
const a2 = await TestBO.from(refA);
const b2 = await a2.b;
console.log(b2);

debugger;
*/

// import { TelegramProvider } from "/thatsme-module-message-provider/lib/providers/telegramprovider.mjs";

// import Query, { EMPTY_QUERY }   from "/thoregon.truCloud/lib/query.mjs";
// import Channel from "/thatsme-application-broadcastgreen/lib/entities/channel.mjs";

import Facade         from "/thoregon.crystalline/lib/facade.mjs";
import WorkerConsumer from "/thoregon.crystalline/lib/consumers/workerconsumer.mjs";
import ConsoleLogger  from "/thoregon.crystalline/lib/consolelogger.mjs";
import SEA            from '/evolux.everblack/lib/crypto/sea.mjs';

// thoregon.archetimlogger = new ConsoleLogger();

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
    const identity = await Facade.use(await WorkerProvider.from('/thoregon.identity/lib/identityservice.mjs'));
    const other    = await SEA.pair(); // this is another one

    // let is = await identity.is('lucky');
    // console.log(is);

    // let created = await identity.create("lucky", "1passwort");
    // console.log("created", created);

    identity.subscribe('signon', (evt) => console.log(">> Signon: ", evt));

    // let signedon = await identity.signon("lucky", "1passwort");
    let signedon = await identity.hosted(TESTIDENTITY);
    console.log("signedon", await identity.is);

    let pubkeys = await identity.pubKeys();
    // console.log("pub keys", pubkeys);

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

} catch (e) {
    console.log(">> Error", e);
}


/*
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
*/


/*

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

*/

/*

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
*/


/*
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
*/
