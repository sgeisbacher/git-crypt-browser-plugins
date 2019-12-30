import {Command} from './types';

export const sendCommand = async (command: Command): Promise<any> => {
    return new Promise((res, rej) => chrome.runtime.sendMessage(command, (response) => res(response)));
};
