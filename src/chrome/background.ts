import {githubTablePostProcessor, PostProcessor} from './postProcessors';
import {Command, DecryptCommand, MessageResponse} from './types';
import {isValidKey} from './utils';

console.log('starting background ...');

const getStorageValue = (): Promise<any> =>
    new Promise((res, rej) => {
        chrome.storage.local.get(['mapping'], (result) => res(result));
    });

chrome.runtime.onMessage.addListener((cmd: Command, sender, sendResponse: (resp: MessageResponse) => void) => {
    console.log('received message:', cmd.type);
    switch (cmd.type) {
        case 'decrypt':
            runDecryption(cmd)
                .then((cleartext) => sendResponse({type: 'decrypt', payload: {cleartext}}))
                .catch((e) => sendResponse({type: 'decrypt', error: e?.message || e || 'unknown error'}));
            break;
        case 'storeMapping':
            chrome.storage.local.set({mapping: cmd.payload.mapping}, () =>
                sendResponse({type: 'storeMapping', payload: {success: true}}),
            );
            break;
        case 'loadMapping':
            getStorageValue().then((obj?: {mapping?: string}) => {
                sendResponse({
                    type: 'loadMapping',
                    error: !obj?.mapping ? 'could load mapping' : undefined,
                    payload: {mapping: obj?.mapping ? obj.mapping : undefined},
                });
            });
            break;
        default:
            console.log('received unknown cmd:', cmd);
    }
    return true;
});

const postProcessors: PostProcessor[] = [githubTablePostProcessor];

const runDecryption = (cmd: DecryptCommand): Promise<string> => {
    const respBufProm = fetch(cmd.payload.rawUrl, {redirect: 'follow', headers: {}}).then((resp) => resp.arrayBuffer());
    return Promise.all([respBufProm, getSecretForUrl(cmd.payload.rawUrl)]).then(async ([respBuf, keyHex]) => {
        if (!respBuf) {
            throw new Error('could get raw-data');
        }
        if (!keyHex) {
            throw new Error('could not find secret');
        }
        if (!isValidKey(keyHex)) {
            throw new Error('key is not valid');
        }
        const plainText = await decrypt(new Uint8Array(respBuf), keyHex);
        return postProcessors.reduce((data, processor) => processor(data), plainText);
    });
};

const getSecretForUrl = async (url: string): Promise<string | null | undefined> => {
    // url: https://github.com/sgeisbacher/git-crypt-test/blob/master/text.txt?raw=true
    // todo regex
    const rawUrlRepoNameMatch = url.match(/https:\/\/github.com\/([a-zA-Z0-9-]+\/[a-zA-Z0-9-]+)\/([a-zA-Z0-9-]+)\/.*/);
    if (!rawUrlRepoNameMatch) {
        throw new Error(`wrong raw-url '${url}'`);
    }
    const rawUrlRepoName = rawUrlRepoNameMatch[1];

    const result: {mapping: string} = await getStorageValue();
    const {mapping: mappingStr} = result;
    if (!mappingStr) {
        throw new Error('no mapping found');
    }

    if (mappingStr.split('\n').some((line) => line.split(':').length !== 2)) {
        throw new Error(`wrong mapping`);
    }

    const mapping = mappingStr
        .split('\n')
        .map((line) => ({repoName: line.split(':')[0], secret: line.split(':')[1]}))
        .find(({repoName}) => repoName === rawUrlRepoName);
    return mapping ? mapping.secret : null;
};

const decrypt = async (cipherTextBytes: Uint8Array, keyFileHexData: string): Promise<string> => {
    const hex2ArrayBuffer = (hex: string): Uint8Array =>
        new Uint8Array((hex.match(/[\da-f]{2}/gi) || []).map((h) => parseInt(h, 16)));
    const createIV = (nonce: Uint8Array) => new Uint8Array(16).map((v, i) => nonce[i] || 0);

    const AES_KEY_START = 40;
    const AES_KEY_SIZE = 32;

    const HEADER_LEN = 10;
    const NONCE_LEN = 12;

    const keyFileBytes = hex2ArrayBuffer(keyFileHexData);

    const header = new TextDecoder().decode(cipherTextBytes.slice(0, HEADER_LEN));
    const aeskey = keyFileBytes.slice(AES_KEY_START, AES_KEY_START + AES_KEY_SIZE);
    const nonce = cipherTextBytes.slice(HEADER_LEN, HEADER_LEN + NONCE_LEN);
    const ciphertext = cipherTextBytes.slice(HEADER_LEN + NONCE_LEN);
    const iv = createIV(nonce);

    if (header.indexOf('GITCRYPT') < 0) {
        throw new Error(`file isn't encrypted with GITCRYPT but was '${header}'`);
    }
    // console.log('ciphertextfile:', arrayBuffer2Hex(cipherTextBytes))
    // console.log('aeskey:', arrayBuffer2Hex(aeskey))
    // console.log('nonce:', arrayBuffer2Hex(nonce))
    // console.log('iv:', arrayBuffer2Hex(iv))
    // console.log('ciphertext:', arrayBuffer2Hex(ciphertext))

    const key = await window.crypto.subtle.importKey('raw', aeskey, 'AES-CTR', false, ['encrypt', 'decrypt']);

    const decrypted = await window.crypto.subtle.decrypt(
        {
            name: 'AES-CTR',
            counter: iv,
            length: 32,
        },
        key,
        ciphertext,
    );
    return new TextDecoder().decode(decrypted);
};
