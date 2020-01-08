import {StoreMappingCommand} from './types';
import {sendCommand} from './utils';

const ta = document.querySelector<HTMLTextAreaElement>('#repoSecretMapping');
const saveBtn = document.querySelector<HTMLButtonElement>('#repoSecretMappingSaveBtn');

const onSave = () => {
    console.log('popup-change');
    const text = ta?.value;
    const cmd: StoreMappingCommand = {type: 'storeMapping', payload: {mapping: text || ''}};
    sendCommand(cmd).then((response) => {
        console.log('success', response);
    });
};
saveBtn?.addEventListener('click', onSave);

sendCommand({type: 'loadMapping', payload: {}}).then((resp) => {
    if (!ta || resp.type !== 'loadMapping') {
        return;
    }
    if (resp.error) {
        console.log('loadMapping error was:', resp.error);
    }
    ta.value = resp.payload?.mapping || '';
});
