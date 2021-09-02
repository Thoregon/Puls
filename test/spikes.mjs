/**
 *
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

import SEA from '/evolux.everblack/lib/crypto/sea.mjs';

try {
    let keypairs = await SEA.pair();
    console.log(keypairs);

/*
    let encrypted = await SEA.encryptWithPub("Hello THOREGON", keypairs);
    console.log(encrypted);

    let decrypted = await SEA.decryptWithPriv(encrypted, keypairs);
    console.log(decrypted);
*/

    let work = await SEA.work("aarerberberbrtn");
    console.log(work);

    let encrypted = await SEA.encrypt("Hello THOREGON", work);
    console.log(encrypted);

    let decrypted = await SEA.decrypt(encrypted, work);
    console.log(decrypted);
} catch (e) {
    console.log(e);
}

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
import WorkerProvider from "/thoregon.crystalline/lib/providers/workerprovider.mjs";

import ConsoleLogger from "/thoregon.crystalline/lib/consolelogger.mjs";
thoregon.archetimlogger = new ConsoleLogger();

(async () => {

    try {
        const srv = await Facade.use(await WorkerProvider.from('/thoregon.crystalline/test/services/simplejs.mjs'));

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
import JSProvider    from "/thoregon.crystalline/lib/providers/jsprovider.mjs";
import SimpleJS      from "/thoregon.crystalline/test/services/simplejs.mjs";


(async () => {
    debugger;
    const srv = await ServiceFacade.use(await JSProvider.with(new SimpleJS()));

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
