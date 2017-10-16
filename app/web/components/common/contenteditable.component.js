import React from 'react';

const HTML_REGEX = new RegExp(/<[^>]*>/, 'gm');

function stripContentEditableHTML(text) {
  return (text || '')
    .replace(/<div><br>/g, '\n')
    .replace(/<div>/g, '\n')
    .replace(/<br>\u200B/g, '\n')
    .replace(HTML_REGEX, '');
}

function renderBody(lines) {
  return lines.split('\n')
    .map((line) =>
      line.split(' ')
        .map((word) => {
          if (word[0] === '#' || word[0] === '@') {
            return '<b>' + word + '</b>';
          }
          return word;
        })
        .join(' ')
    )
    .join('<br>\u200B');
}

function onPaste(e) {
  // cancel paste
  e.preventDefault();

  // get text representation of clipboard
  const text = e.clipboardData.getData('text/plain')
    .replace(/&/g, '&amp')
    .replace(/</g, '&lt')
    .replace(/>/g, '&gt');

  // insert text manually
  document.execCommand('insertHTML', false, text);
}

function isChildOf(node, parentId) {
  while (node !== null) {
    if (node.id === parentId) {
      return true;
    }
    node = node.parentNode;
  }

  return false;
}

function getCurrentCursorPosition(parentId) {
  let selection = window.getSelection();
  let charCount = -1;
  let node;

  if (selection.focusNode) {
    if (isChildOf(selection.focusNode, parentId)) {
      node = selection.focusNode;
      charCount = selection.focusOffset;

      while (node) {
        if (node.id === parentId) {
          break;
        }
        if (node.previousSibling) {
          node = node.previousSibling;
          charCount += node.textContent.length;
        } else {
          node = node.parentNode;
          if (node === null) {
            break;
          }
        }
      }
    }
  }

  return charCount;
}

function createRange(node, chars, range) {
  if (!range) {
    range = document.createRange();
    range.selectNode(node);
    range.setStart(node, 0);
  }

  if (chars.count === 0) {
    range.setEnd(node, chars.count);
  } else if (node && chars.count > 0) {
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.textContent.length < chars.count) {
        chars.count -= node.textContent.length;
      } else {
        range.setEnd(node, chars.count);
        chars.count = 0;
      }
    } else {
      for (let lp = 0; lp < node.childNodes.length; lp++) {
        range = createRange(node.childNodes[lp], chars, range);

        if (chars.count === 0) {
          break;
        }
      }
    }
  }

  return range;
}

function setCurrentCursorPosition(node, chars) {
  if (chars >= 0) {
    const selection = window.getSelection();
    const range = createRange(node, { count: chars });
    if (range) {
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }
}

export default class ContentEditable extends React.Component {
  constructor() {
    super();
    this.emitChange = this.emitChange.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
  }

  componentDidUpdate() {
    // if (this.htmlEl && this.props.html !== this.htmlEl.innerHTML) {
    //   // Perhaps React (whose VDOM gets outdated because we often prevent
    //   // rerendering) did not update the DOM. So we update it manually now.
    //   this.htmlEl.innerHTML = this.lastHTML;
    // }
    const lengthWithoutNewlines = this.props.body.replace(/\n/, '').replace(/&[^;]+;/g, ' ').length + 1;
    const newPosition = this.position + (this.hitEnter ? 1 : 0);
    // console.log(this.position, lengthWithoutNewlines);
    if (this.props.lengthDelta) {
      setCurrentCursorPosition(this.htmlEl, this.position += this.props.lengthDelta);
    } else if (newPosition <= lengthWithoutNewlines) {
      setCurrentCursorPosition(this.htmlEl, newPosition);
      this.hitEnter = false;
    } else {
      setCurrentCursorPosition(this.htmlEl, lengthWithoutNewlines - 1);
    }
  }

  handleKeydown(e) {
    this.hitEnter = e.keyCode === 13;
  }

  emitChange(e) {
    if (!this.htmlEl) return;
    const html = this.htmlEl.innerHTML;
    if (this.props.onChange && html !== this.lastHtml) {
      e.target = { value: stripContentEditableHTML(html) };
      this.props.onChange(e);
    }
    this.lastHtml = html;
    this.position = getCurrentCursorPosition('editor');
  }

  render() {
    const { body, className, ...props } = this.props;

    this.lastHTML = renderBody(body);

    // eslint-disable-next-line jsx-a11y/no-static-element-interactions react/no-danger
    return (<div
      id="editor"
      className={className}
      role="textbox"
      ref={(e) => this.htmlEl = e}
      onInput={this.emitChange}
      onKeyDown={this.handleKeydown}
      onBlur={this.props.onBlur || this.emitChange}
      onPaste={onPaste}
      contentEditable={!this.props.disabled}
      dangerouslySetInnerHTML={{ __html: this.lastHTML }}
    />);
  }
}
