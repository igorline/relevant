import React, { Component } from 'react';

if (process.env.BROWSER === true) {
  require('./selectTags.css');
}

export default class SelectTags extends Component {
  shouldComponentUpdate(nextProps) {
    return this.props.tags !== nextProps.tags
      || this.props.selectedTags.length !== nextProps.selectedTags.length;
  }
  render() {
    const props = this.props;
    if (!props.tags || !props.tags.length) return null;
    const selectedTags = props.selectedTags;

    let inner = props.tags.map((tag, i) => {
      tag = tag.replace(/\s/g, '');
      const selected = selectedTags.indexOf(tag) !== -1;
      if (selected) return null;
      return (
        // eslint-disable-next-line jsx-a11y/no-static-element-interactions
        <span
          key={i}
          className={selected ? 'selected' : ''}
          role="checkbox"
          aria-checked={selected}
          onClick={() => {
            if (selected) {
              props.deselectTag(tag);
            } else {
              props.selectTag(tag);
            }
          }}
        >
          {'#'}{tag}
        </span>
      );
    });
    return (
      <div className="selectTags">
        <p>{this.props.text + ': '}</p>
        {inner}
      </div>
    );
  }
}
