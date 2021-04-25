/**
 *
 *
 * @author: blukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

importScripts('../ipfs.min.js');

console.log('$$ ipfsloader');

(async () => {
    let ipfs = await Ipfs.create();
    console.log('$$ ipfs created');
    debugger;
})();
