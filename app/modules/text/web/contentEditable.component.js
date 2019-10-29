import React from 'react';
import PropTypes from 'prop-types';

const HTML_REGEX = new RegExp(/<[^>]*>/, 'gm');

function stripContentEditableHTML(text) {
  return (text || '')
    .replace(/<div><br>/g, '\n')
    .replace(/<\/div>/g, '\n')
    .replace(/<br>/g, '\n')
    .replace(HTML_REGEX, '');
}

function renderBody(lines) {
  return lines
    .split('\n')
    .map(line =>
      line
        .split(' ')
        .map(word => {
          if (word[0] === '#' || word[0] === '@') {
            return '<b>' + word + '</b>';
          }
          return word;
        })
        .join(' ')
    )
    .join('\n');
}

function onPaste(e) {
  // cancel paste
  e.preventDefault();

  // get text representation of clipboard
  const text = e.clipboardData
    .getData('text/plain')
    .replace(/&/g, '&amp')
    .replace(/</g, '&lt')
    .replace(/>/g, '&gt');

  // insert text manually
  document.execCommand('insertHTML', false, text);
}

function getCurrentCursorPosition(parentId) {
  const el = document.getElementById(parentId);
  let caretOffset = 0;
  if (typeof window.getSelection !== 'undefined') {
    const range = window.getSelection().getRangeAt(0);
    const selected = range.toString().length;
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(el);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    caretOffset = preCaretRange.toString().length - selected;
  }
  return caretOffset;
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
  static propTypes = {
    body: PropTypes.string,
    lengthDelta: PropTypes.number,
    onKeyDown: PropTypes.func,
    onChange: PropTypes.func,
    className: PropTypes.string,
    placeholder: PropTypes.string,
    onBlur: PropTypes.func,
    disabled: PropTypes.object
  };

  constructor() {
    super();
    this.emitChange = this.emitChange.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  componentDidMount() {
    this.el.focus();
    document.execCommand('defaultParagraphSeparator', false, 'br');
  }

  componentDidUpdate(lastProps) {
    // if (this.el && this.props.html !== this.el.innerHTML) {
    //   // Perhaps React (whose VDOM gets outdated because we often prevent
    //   // rerendering) did not update the DOM. So we update it manually now.
    //   this.el.innerHTML = this.lastHTML;
    // }
    if (lastProps.body === this.props.body) return;

    const lengthWithoutNewlines =
      this.props.body.replace(/\n/, '').replace(/&[^;]+;/g, ' ').length + 1;

    const newPosition = this.position + (this.hitEnter ? 1 : 0);

    if (this.props.lengthDelta) {
      setCurrentCursorPosition(this.el, (this.position += this.props.lengthDelta));
    } else if (newPosition <= lengthWithoutNewlines) {
      setCurrentCursorPosition(this.el, newPosition);
      this.hitEnter = false;
    } else {
      setCurrentCursorPosition(this.el, lengthWithoutNewlines - 1);
    }
    this.el.focus();
  }

  handleKeyDown(e) {
    if (this.props.onKeyDown && this.props.onKeyDown(e) === false) {
      return false;
    }
    this.hitEnter = e.keyCode === 13;
    return true;
  }

  emitChange(e) {
    if (!this.el) return;
    const html = this.el.innerHTML;
    if (this.props.onChange && html !== this.lastHtml) {
      const value = stripContentEditableHTML(html);

      e.target = { value };
      this.props.onChange(e);
    }
    this.lastHtml = html;
    this.position = getCurrentCursorPosition('editor');
  }

  render() {
    this.lastHTML = renderBody(this.props.body);
    const className = [this.props.className];
    if (this.props.body.length) className.push('active');
    return (
      <div
        id="editor"
        className={this.props.className}
        placeholder={this.props.placeholder}
        role="textbox"
        ref={el => (this.el = el)}
        onInput={this.emitChange}
        onKeyDown={this.handleKeyDown}
        onBlur={this.props.onBlur || this.emitChange}
        onPaste={onPaste}
        contentEditable={!this.props.disabled}
        dangerouslySetInnerHTML={{ __html: this.lastHTML }}
      />
    );
  }
}
