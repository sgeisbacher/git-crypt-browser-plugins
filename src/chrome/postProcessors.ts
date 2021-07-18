export type PostProcessor = (data: string) => string;

export const lineBreakToHtmlPostProcessor: PostProcessor = (data: string): string => {
    return data.split('\n').join('<br/>');
};

export const githubTablePostProcessor: PostProcessor = (data: string): string => {
    const body = data
        .split('\n')
        .map(
            (line, index) => `<tr>
                <td id="L${index + 1}" class="blob-num js-line-number" data-line-number="${index + 1}"></td>
                <td id="LC${index + 1}" class="blob-code blob-code-inner js-file-line">${line}</td>
            </tr>`,
        )
        .join('');
    return `<table class="highlight tab-size js-file-line-container" data-tab-size="8" data-paste-markdown-skip=""><tbody>${body}</tbody></table>`;
};

const regexpReverseDiffBlock = /\}\}\}\}(dedda|devomer|dne)\{\{\{\{/;
export const determineUnterminatedBlock = (line: string): string | null => {
    const rvrsLine = line.split('').reverse().join('');
    const groups = rvrsLine.match(regexpReverseDiffBlock);
    if (!groups || groups.length === 1) {
        return null;
    }
    const lastDirective = groups[1].split('').reverse().join('');
    if (lastDirective === 'end') {
        return null;
    }
    return lastDirective;
};

export const breakMultilineDiffBlocks = (data: string): string => {
    const {lines} = data.split('\n').reduce(
        (ctx, line) => {
            if (ctx.currentBlock) {
                line = `{{{{${ctx.currentBlock}}}}}${line}`;
            }
            const unterminatedBlock = determineUnterminatedBlock(line);
            if (unterminatedBlock) {
                line = `${line}{{{{end}}}}`;
            }
            return {currentBlock: unterminatedBlock, lines: ctx.lines.concat(line)};
        },
        {currentBlock: null, lines: []} as {currentBlock: string | null; lines: string[]},
    );
    return lines.join('\n');
};

export const diffBlocksToHtml = (data: string): string =>
    [
        {block: 'added', rpl: '<span class="diff_green">'},
        {block: 'removed', rpl: '<span class="diff_red">'},
        {block: 'end', rpl: '</span>'},
    ].reduce((text, ctx) => text.split(`{{{{${ctx.block}}}}}`).join(ctx.rpl), data);
