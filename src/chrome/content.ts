import {debounce} from 'lodash';

import {Command, DecryptCommand, DiffCommand, MessageResponse} from './types';
import {changeRawUrlRef, sendCommand} from './utils';

type CodeInjector = () => boolean;

const injectCode = () => {
    const injectors: CodeInjector[] = [tryInsertIntoFileDetailView, tryInsertIntoPRView];
    injectors.some((injector) => injector());
};

const tryInsertIntoFileDetailView = (): boolean => {
    if (document.querySelector('#degitcryptbtn')) {
        // already injected, skipping ...
        return false;
    }

    const rawUrlBtn = document.querySelector('#raw-url');
    const btnGroup = rawUrlBtn?.parentElement;
    if (!rawUrlBtn || !btnGroup) {
        // btn-group not found, skipping ...
        return false;
    }

    const decryptBtn = createDecryptBtn(onDecryptClick);
    btnGroup.insertBefore(decryptBtn, rawUrlBtn);
    return true;
};

const tryInsertIntoPRView = (): boolean => {
    if (document.querySelector('#degitcryptbtn')) {
        // already injected, skipping ...
        return false;
    }

    const diffStatSpans = Array.from(document.querySelectorAll('span.diffstat[aria-label="Binary file modified"]'));
    return diffStatSpans?.reduce<boolean>((inserted, diffStatSpan) => {
        const fileHeaderDiv = diffStatSpan?.parentElement?.parentElement;
        if (!fileHeaderDiv) {
            // btn-group not found, skipping ...
            console.log('did not find fileHeaderDiv');
            return inserted || false;
        }
        const fileActionsDiv = fileHeaderDiv.querySelector<HTMLDivElement>('div.file-actions');
        if (!fileActionsDiv) {
            console.log(`did not find file-actions-div`);
            return inserted || false;
        }

        const btn = createDecryptBtn(onDecryptDiffClick(fileActionsDiv));
        fileActionsDiv.insertBefore(btn, fileActionsDiv.children[0]);
        return true;
    }, false);
};

const createDecryptBtn = (clickEventListener: () => void) => {
    const decryptBtn = document.createElement('button');
    decryptBtn.setAttribute('id', 'degitcryptbtn');
    decryptBtn.setAttribute('class', 'btn btn-sm BtnGroup-item');
    decryptBtn.textContent = 'de-gitcrypt it';
    decryptBtn.addEventListener('click', clickEventListener);
    return decryptBtn;
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

const onDecryptDiffClick = (fileActionsDiv: HTMLDivElement) => async () => {
    const baseRefLink = document.querySelector<HTMLLinkElement>('.gh-header-meta span.base-ref a');
    if (!baseRefLink) {
        console.log('could not find baseRefLink');
        return;
    }
    const baseRef = baseRefLink.innerText;

    const [headRefRawUrl] = Array.from<HTMLLinkElement>(fileActionsDiv.querySelectorAll('a.btn-link'))
        .filter((link: HTMLLinkElement) => link.textContent?.trim().toLowerCase() === 'view file')
        .filter((link: HTMLLinkElement) => !!link.href)
        .map((link: HTMLLinkElement) => (link.href.endsWith('?raw=true') ? link.href : `${link.href}?raw=true`));

    if (headRefRawUrl) {
        const fromRawUrl = changeRawUrlRef(headRefRawUrl, baseRef);
        const toRawUrl = headRefRawUrl;
        const cmd: DiffCommand = {type: 'diff', payload: {fromRawUrl, toRawUrl}};
        return sendCommand(cmd).then((resp: MessageResponse) => {
            if (resp?.type !== 'diff') {
                throw new Error(`invalid response-type: ${resp?.type}`);
            }
            if (resp.error) {
                throw new Error(resp.error);
            }
            if (!resp?.payload?.cleartext) {
                throw new Error(`invalid resp: ${resp}`);
            }
            const div = fileActionsDiv.parentElement?.parentElement?.querySelector('.js-file-content .data');
            if (!div?.innerHTML) {
                throw new Error('could not find content-div');
            }
            div.innerHTML = resp.payload.cleartext;
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
