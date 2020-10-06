import {changeRawUrlRef} from './utils';

test('sample test', () => expect(2 + 3).toBe(5));

function createUrl(ref: string, asRaw: boolean = true): string {
    return `https://github.com/sgeisbacher/git-crypt-test/blob/${ref}/text.txt${asRaw ? '?raw=true' : ''}`;
}

describe('changeRawUrlRef', () => {
    const baseUrl = createUrl('69c12099087c075ca3366d0bc18ca0e1400249fa');
    it('can handle full-raw-url', () => expect(changeRawUrlRef(baseUrl, 'develop')).toEqual(createUrl('develop')));
});
