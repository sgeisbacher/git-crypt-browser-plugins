import {Command, MessageResponse} from './types';

const hex2a = (hex: string): string => {
    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return str;
};

export const isValidKey = (keyHex: string): boolean => hex2a(keyHex.substr(2, 21)).startsWith('GITCRYPT');

const regexpRawUrl = /(https:\/\/github.com\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+\/blob\/)[a-zA-Z0-9-]+(\/.*)/;

export const changeRawUrlRef = (rawUrl: string, toRef: string): string => {
    const matchGroups = rawUrl.match(regexpRawUrl);
    if (!matchGroups || matchGroups?.length < 3) {
        throw new Error(`could not parse rawUrl '${rawUrl}'`);
    }
    return `${matchGroups[1]}${toRef}${matchGroups[2]}`;
};
export const sendCommand = async (command: Command): Promise<MessageResponse> => {
    return new Promise((res, rej) => chrome.runtime.sendMessage(command, (response) => res(response)));
};
