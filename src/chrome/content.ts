import {debounce} from 'lodash';

import {Command, DecryptCommand, MessageResponse} from './types';
import {sendCommand} from './utils';

const injectCode = () => {
    if (document.querySelector('#degitcryptbtn')) {
        // already injected, skipping ...
        return;
    }

    const rawUrlBtn = document.querySelector('#raw-url');
    const btnGroup = rawUrlBtn?.parentElement;
    if (!rawUrlBtn || !btnGroup) {
        // btn-group not found, skipping ...
        return;
    }

    const decryptBtn = document.createElement('button');
    decryptBtn.setAttribute('id', 'degitcryptbtn');
    decryptBtn.setAttribute('class', 'btn btn-sm BtnGroup-item');
    decryptBtn.textContent = 'de-git-crypt it';
    decryptBtn.addEventListener('click', onDecryptClick);
    btnGroup.insertBefore(decryptBtn, rawUrlBtn);
};

const createErrorField = (errMsg: string): HTMLElement => {
    const span: HTMLSpanElement = document.createElement('span');
    span.setAttribute('class', 'degitcrypter-error');
    span.setAttribute(
        'style',
        'display: block; background: #f2dede; border-color: #ebccd1; padding: 15px; color: #a94442; border-radius: 4px; margin-bottom: 10px;',
    ); // in parent -> border: 1px solid transparent;
    span.textContent = `git-crypt-decrypter: ${errMsg}`;
    return span;
};

const clearErrors = () => Array.from(document.querySelectorAll('.degitcrypter-error')).forEach((el) => el.remove());

const onDecryptClick = () => {
    clearErrors();

    const rawUrl = Array.from<HTMLLinkElement>(document.querySelectorAll('div.Box-body a'))
        .map((link: HTMLLinkElement) => link.href)
        .find((href: string) => (href || '').endsWith('?raw=true'));

    if (rawUrl) {
        const cmd: DecryptCommand = {type: 'decrypt', payload: {rawUrl}};
        sendCommand(cmd).then((resp: MessageResponse) => {
            const div = document.querySelector('div[itemprop=text]');
            if (resp?.type !== 'decrypt') {
                return;
            }
            if (resp.error) {
                if (div) {
                    div.insertBefore(createErrorField(resp.error), div.firstChild);
                    return;
                }
            }
            if (div && resp?.payload?.cleartext) {
                // div.textContent = resp.payload.cleartext;
                div.innerHTML = resp.payload.cleartext;
                return;
            }
            // nothing to do ...
        });
    }
};

chrome.runtime.onMessage.addListener((cmd: Command, sender, sendResponse) => {
    switch (cmd.type) {
    }
    return true;
});

document.addEventListener('DOMNodeInserted', debounce(injectCode, 2000));
injectCode();
