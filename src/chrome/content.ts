import {Command, DecryptCommand, MessageResponse} from './types';

console.log('starting ...');

const rawUrl = Array.from<HTMLLinkElement>(document.querySelectorAll('div.Box-body a'))
    .map((link: HTMLLinkElement) => link.href)
    .find((href: string) => (href || '').endsWith('?raw=true'));

if (rawUrl) {
    const cmd: DecryptCommand = {type: 'decrypt', payload: {rawUrl}};
    chrome.runtime.sendMessage(cmd, (resp: MessageResponse) => {
        const div = document.querySelector('div.Box-body > div.p-3');
        if (resp.error) {
            if (div) {
                const content = div.textContent;
                div.textContent = `<span class="decrypterError">${resp.error}</span>${content}`;
                return;
            }
        }
        if (div && resp.cleartext) {
            div.textContent = resp.cleartext;
            // const button = document.createElement('button');
            // button.textContent = 'asdf';
            // div.parentNode?.insertBefore(button, div);
            return;
        }
        console.log('decrypter: nothing to do');
    });
}

chrome.runtime.onMessage.addListener((cmd: Command, sender, sendResponse) => {
    switch (cmd.type) {
    }
    return true;
});
