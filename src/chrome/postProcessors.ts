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
