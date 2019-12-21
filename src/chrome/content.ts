import {MessageResponse} from './types';

console.log('starting ...');

const rawUrl = Array.from<HTMLLinkElement>(document.querySelectorAll('div.Box-body a'))
    .map((link: HTMLLinkElement) => link.href)
    .find((href: string) => (href || '').endsWith('?raw=true'));

if (rawUrl) {
    chrome.runtime.sendMessage({url: rawUrl}, (resp: MessageResponse) => {
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
            return;
        }
        console.log('decrypter: nothing to do');
    });
}
