import {StoreMappingCommand} from './types';
import {Command} from './types';

// todo import from utils
const sendCommand = async (command: Command): Promise<any> => {
    return new Promise((res, rej) => chrome.runtime.sendMessage(command, (response) => res(response)));
};

const ta = document.querySelector<HTMLTextAreaElement>('#repoSecretMapping');

const onChange = () => {
    console.log('popup-change');
    const text = ta?.value;
    const cmd: StoreMappingCommand = {type: 'storeMapping', payload: {mapping: text || ''}};
    sendCommand(cmd).then((response) => {
        console.log('success', response);
    });
};
console.log('register onchange-event-handler ...');
ta?.addEventListener('change', onChange);

sendCommand({type: 'loadMapping', payload: {}}).then((resp) => {
    if (ta) {
        ta.value = resp.mapping;
    }
});
