chrome.extension.getBackgroundPage().console.log('starting background 2 ...');

const arrayBuffer2Hex = (buffer) => Array.prototype.map.call(buffer, (x) => ('00' + x.toString(16)).slice(-2)).join('');

const url = 'https://github.com/sgeisbacher/git-crypt-test/blob/master/text.txt?raw=true';
fetch(url, { redirect: 'follow', headers: {}})
    .then((resp, err) => resp.arrayBuffer())
    .then((resp) => decrypt(new Uint8Array(resp)));

const keyfilehexdata = '0047495443525950544b455900000002000000000000000100000004000000000000000300000020aefbbe588691ab9bde9953c93c738b14e4f99249f83b7509c115c2c5d15b585f000000050000004025aa91d937d04602ab97ebb24e7e5636332e8d17de8862c10011c2409a90937344348c05df063946815f3ee1ad94e7abf2a68f2f58fe6b7175aee93cfb548bfb00000000';

const decrypt = async (cipherTextBytes) => {
    console.log('decrypting ...')

    const hex2ArrayBuffer = (hex) => new Uint8Array(hex.match(/[\da-f]{2}/gi).map((h) => parseInt(h, 16)));
    const createIV = (nonce) => new Uint8Array(16).map((v, i) => nonce[i] || 0)

    const AES_KEY_START = 40;
    const AES_KEY_SIZE = 32;

    const HEADER_LEN = 10;
    const NONCE_LEN = 12;

    const keyFileHexData = keyfilehexdata;
    const keyFileBytes = hex2ArrayBuffer(keyFileHexData);

    const header = cipherTextBytes.slice(0, HEADER_LEN);
    const aeskey = keyFileBytes.slice(AES_KEY_START, AES_KEY_START+AES_KEY_SIZE);
    const nonce = cipherTextBytes.slice(HEADER_LEN, HEADER_LEN+NONCE_LEN);
    const ciphertext = cipherTextBytes.slice(HEADER_LEN + NONCE_LEN);
    const iv = createIV(nonce);

    console.log('header:', new TextDecoder().decode(header));
    // console.log('ciphertextfile:', arrayBuffer2Hex(cipherTextBytes))
    // console.log('aeskey:', arrayBuffer2Hex(aeskey))
    // console.log('nonce:', arrayBuffer2Hex(nonce))
    // console.log('iv:', arrayBuffer2Hex(iv))
    // console.log('ciphertext:', arrayBuffer2Hex(ciphertext))

    const key = await window.crypto.subtle.importKey(
            "raw",
            aeskey,
            { name: "AES-CTR"},
            false,
            ["encrypt", "decrypt"]
        )

    const decrypted = await window.crypto.subtle.decrypt({
                name: 'AES-CTR',
                counter: iv,
                length: 32,
            },
            key,
            ciphertext,
        )
    console.log('decrypted:', new TextDecoder().decode(decrypted));
}

// decrypt();