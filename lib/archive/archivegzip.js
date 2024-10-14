/**
 *
 * @param gzippedArrayBuffer
 * @returns {Promise<{}>}
 */

async function unpackArchive(gzippedArrayBuffer) {
    const decompressionStream = new DecompressionStream('gzip');
    const decompressedStream = gzippedArrayBuffer.pipeThrough(decompressionStream);

    const reader = decompressedStream.getReader();
    let remaining = new Uint8Array(0);
    const files = {};

    const appendToRemaining = (chunk) => {
        const newRemaining = new Uint8Array(remaining.length + chunk.length);
        newRemaining.set(remaining);
        newRemaining.set(chunk, remaining.length);
        return newRemaining;
    };

    while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        remaining = appendToRemaining(value);

        while (remaining.length > 0) {
            if (remaining.length < 4) break;

            const dataView = new DataView(remaining.buffer);
            const nameLength = dataView.getUint32(0);

            if (remaining.length < 4 + nameLength + 4) break;

            const filename = new TextDecoder().decode(remaining.slice(4, 4 + nameLength));
            const mimeLength = dataView.getUint32(4 + nameLength);

            if (remaining.length < 4 + nameLength + 4 + mimeLength + 4) break;

            const mimetype = new TextDecoder().decode(remaining.slice(4 + nameLength + 4, 4 + nameLength + 4 + mimeLength));
            const fileLength = dataView.getUint32(4 + nameLength + 4 + mimeLength);

            if (remaining.length < 4 + nameLength + 4 + mimeLength + 4 + fileLength) break;

            const fileContent = remaining.slice(4 + nameLength + 4 + mimeLength + 4, 4 + nameLength + 4 + mimeLength + 4 + fileLength);

            files[filename] = {
                mimetype,
                fileContent
            };

            remaining = remaining.slice(4 + nameLength + 4 + mimeLength + 4 + fileLength);
        }
    }

    return files;
}