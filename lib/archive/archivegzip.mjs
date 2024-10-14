/**
 * Browser archive unpacker using DecompressionStream
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

export async function unpackArchive(gzippedArrayBuffer) {
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


/*
export async function unpackArchive(gzippedArrayBuffer) {
    // Create a DecompressionStream for gzip
    const decompressionStream = new DecompressionStream('gzip');
    const decompressedStream = gzippedArrayBuffer./!*stream().*!/pipeThrough(decompressionStream);

    // Read the decompressed data
    const reader = decompressedStream.getReader();
    let remaining = new Uint8Array(0);
    const files = {};

    while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        remaining = new Uint8Array([...remaining, ...value]);

        while (remaining.length > 0) {
            if (remaining.length < 4) break;

            const nameLength = new DataView(remaining.buffer).getUint32(0);

            if (remaining.length < 4 + nameLength + 4) break;

            const filename = new TextDecoder().decode(remaining.slice(4, 4 + nameLength));
            const mimeLength = new DataView(remaining.buffer).getUint32(4 + nameLength);

            if (remaining.length < 4 + nameLength + 4 + mimeLength + 4) break;

            const mimetype = new TextDecoder().decode(remaining.slice(4 + nameLength + 4, 4 + nameLength + 4 + mimeLength));
            const fileLength = new DataView(remaining.buffer).getUint32(4 + nameLength + 4 + mimeLength);

            if (remaining.length < 4 + nameLength + 4 + mimeLength + 4 + fileLength) break;

            const fileContent = remaining.slice(4 + nameLength + 4 + mimeLength + 4, 4 + nameLength + 4 + mimeLength + 4 + fileLength);

            // Store the file content in the files object along with the mime type
            files[filename] = {
                mimetype,
                fileContent: new TextDecoder().decode(fileContent)
            };

            // Remove the processed file from the remaining buffer
            remaining = remaining.slice(4 + nameLength + 4 + mimeLength + 4 + fileLength);
        }
    }

    return files;
}
*/

