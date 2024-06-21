export const editorStyleCss = `
    overflow: scroll;
    line-height: 20px;
    outline: none;
    font-family: monospace;
    display: grid;
    align-items: center;
    white-space: pre;
    > div {
        background-color:blue !important;
    }
`;

export const lineColumnStyleCss = `
    width: 30px;
    height: 100%;
    border-right: 1px solid black;
    display: flex;
    flex-direction: column;
`;

export const lineCountStyleCss = `
    height: 20px;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: bold;
    font-family: monospace;
    font-size: 14px;
`;

export const instanceStyleCss = `
    max-width: 750px;
    max-height: 300px;
    overflow: auto;
    overflow-wrap: break-word;
    border: 1px solid #000;
    display: grid;
    grid-template-columns: 30px 1fr;
`;