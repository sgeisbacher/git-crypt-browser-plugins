import {Command, MessageResponse} from './types';

export const sendCommand = async (command: Command): Promise<MessageResponse> => {
    return new Promise((res, rej) => chrome.runtime.sendMessage(command, (response) => res(response)));
};

const hex2a = (hex: string): string => {
    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return str;
};

export const isValidKey = (keyHex: string): boolean => hex2a(keyHex.substr(2, 21)).startsWith('GITCRYPT');
