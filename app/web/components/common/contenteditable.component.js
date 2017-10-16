import React from 'react';

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

  shouldComponentUpdate(nextProps) {
    let { props, htmlEl } = this;

    // We need not rerender if the change of props simply reflects the user's edits.
    // Rerendering in this case would make the cursor/caret jump

    // Rerender if there is no element yet... (somehow?)
    if (!htmlEl) {
      return true;
    }

    // ...or if html really changed... (programmatically, not by user edit)
    if (nextProps.html !== props.html) {
      return true;
    }

    let optional = ['style', 'className', 'disable', 'tagName'];

    // Handle additional properties
    return optional.some(name => props[name] !== nextProps[name]);
  }

  componentDidUpdate() {
    if (this.htmlEl && this.props.html !== this.htmlEl.innerHTML) {
      // Perhaps React (whose VDOM gets outdated because we often prevent
      // rerendering) did not update the DOM. So we update it manually now.
      this.htmlEl.innerHTML = this.props.html;
    }
    const lengthWithoutNewlines = this.props.body.replace(/\n/, '').replace(/&[^;]+;/g, ' ').length + 1;
    const newPosition = this.position + (this.hitEnter ? 1 : 0);
    // console.log(this.position, lengthWithoutNewlines);
    if (newPosition <= lengthWithoutNewlines) {
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
      e.target = { value: html };
      this.props.onChange(e);
    }
    this.lastHtml = html;
    this.position = getCurrentCursorPosition('editor');
  }

  render() {
    const { tagName, html, body, ...props } = this.props;

    return React.createElement(
      tagName || 'div',
      {
        ...props,
        id: 'editor',
        ref: (e) => this.htmlEl = e,
        onInput: this.emitChange,
        onKeyDown: this.handleKeydown,
        onBlur: this.props.onBlur || this.emitChange,
        onPaste,
        contentEditable: !this.props.disabled,
        dangerouslySetInnerHTML: { __html: html },
      });
  }
}
