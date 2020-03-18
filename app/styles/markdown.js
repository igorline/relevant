const codes = `
  .markdow-body {
    flex: 1;
  }
  .markdown-body code {
    padding: .2em .4em;
    margin: 0;
    font-size: 100%;
    background-color: rgba(27,31,35,.05);
    border-radius: 3px;
  }

  .markdown-body pre {
    word-wrap: normal;
  }

  .markdown-body pre>code {
    padding: 0;
    margin: 0;
    font-size: 100%;
    word-break: normal;
    white-space: pre;
    background: transparent;
    border: 0;
  }

  .markdown-body .highlight {
    margin-top: 8px;
    margin-bottom: 8px;
  }

  .markdown-body .highlight pre {
    margin-bottom: 0;
    word-break: normal;
  }

  .markdown-body .highlight pre,
  .markdown-body pre {
    padding: 16px;
    overflow: auto;
    font-size: 100%;
    line-height: 1.45;
    background-color: #f6f8fa;
    border-radius: 3px;
  }

  .markdown-body pre code {
    display: inline;
    max-width: auto;
    padding: 0;
    margin: 0;
    overflow: visible;
    line-height: inherit;
    word-wrap: normal;
    background-color: initial;
    border: 0;
  }
`;

export default `
  ${codes}

  .markdown-body blockquote {
    margin: 0;
  }

  .markdown-body blockquote {
    padding: 0 1em;
    color: #6a737d;
    border-left: .25em solid #dfe2e5;
  }


  .markdown-body ol,
  .markdown-body ul {
    padding-left: 0;
    margin-top: 0;
    margin-bottom: 0;
  }

  .markdown-body ol ol,
  .markdown-body ul ol {
    list-style-type: lower-roman;
  }

  .markdown-body ol ol ol,
  .markdown-body ol ul ol,
  .markdown-body ul ol ol,
  .markdown-body ul ul ol {
    list-style-type: lower-alpha;
  }

  .markdown-body ol,
  .markdown-body ul {
    padding-left: 2em;
  }

  .markdown-body li {
    word-wrap: break-all;
  }

  .markdown-body li>p {
    margin-top: 16px;
  }

  .markdown-body li+li {
    margin-top: .25em;
  }

  .markdown-body blockquote,
  .markdown-body details,
  .markdown-body dl,
  .markdown-body ol,
  .markdown-body p,
  .markdown-body pre,
  .markdown-body table,
  .markdown-body div,
  .markdown-body ul {
    margin-top: 8px;
    margin-bottom: 8px;
  }
`;
