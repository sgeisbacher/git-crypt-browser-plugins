import {breakMultilineDiffBlocks, determineUnterminatedBlock} from './postProcessors';

describe('determineUnterminatedBlock', () => {
    const func = determineUnterminatedBlock;
    test('no block', () => expect(func('hello world!')).toBeNull());
    test('one terminated block', () => expect(func('hello{{{{added}}}} {{{{end}}}}world!')).toBeNull());
    test('one unterminated block', () => expect(func('hello{{{{added}}}} world!')).toEqual('added'));
    test('two blocks, one unterminated', () =>
        expect(func('{{{{removed}}}}hello{{{{end}}}}{{{{added}}}} world!')).toEqual('added'));
});

describe('breakMultilineDiffBlocks', () => {
    test('simple single-line block', () => {
        const simpleLine = `hello{{{{added}}}} world{{{{end}}}}!`;
        const result = breakMultilineDiffBlocks(simpleLine);
        expect(result).toEqual(simpleLine);
    });
    test('simple two-line block', () => {
        const simpleTwoLine = `hello{{{{added}}}}
        world{{{{end}}}}!`;
        const result = breakMultilineDiffBlocks(simpleTwoLine);
        expect(result).toMatchInlineSnapshot(`
"hello{{{{added}}}}{{{{end}}}}
{{{{added}}}}        world{{{{end}}}}!"
`);
    });
    test('multi-change two-line block', () => {
        const simpleTwoLine = `this{{{{added}}}} a{{{{end}}}} change{{{{added}}}} that
        spans over{{{{end}}}} two lines{{{{added}}}}!{{{{end}}}}`;
        const result = breakMultilineDiffBlocks(simpleTwoLine);
        expect(result).toMatchInlineSnapshot(`
"this{{{{added}}}} a{{{{end}}}} change{{{{added}}}} that{{{{end}}}}
{{{{added}}}}        spans over{{{{end}}}} two lines{{{{added}}}}!{{{{end}}}}"
`);
    });
});
