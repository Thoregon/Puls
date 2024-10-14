/**
 *
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */
import { unpackArchive } from "../lib/archive/archivegzip.mjs";

async function handleGzippedData(gzippedArrayBuffer) {
    const start = Date.now();
    const files = await unpackArchive(gzippedArrayBuffer);
    console.log(">> Unpacked", Date.now() - start);
    console.log(files);
}

// Assuming you have an ArrayBuffer from a gzipped file
const start = Date.now();
const res = await fetch('/test/data/thoregonB.neuarch.gz');  // test.arch.gz
if (res.ok) {
    const gzippedArrayBuffer = await res.body;
    console.log(">> Fetched", Date.now() - start);

    handleGzippedData(gzippedArrayBuffer);
} else {
    console.log(">> Fetched failed");
}