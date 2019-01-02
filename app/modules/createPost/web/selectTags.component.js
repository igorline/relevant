import React, { Component } from 'react';
import PropTypes from 'prop-types';

if (process.env.BROWSER === true) {
  require('./selectTags.css');
}

export default class SelectTags extends Component {
  static propTypes = {
    tags: PropTypes.array,
    selectedTags: PropTypes.array,
    text: PropTypes.string,
    deselectTag: PropTypes.func,
    selectTag: PropTypes.func
  };

  shouldComponentUpdate(nextProps) {
    return (
      this.props.tags !== nextProps.tags ||
      this.props.selectedTags.length !== nextProps.selectedTags.length
    );
  }
  render() {
    const { tags, selectedTags, selectTag, deselectTag } = this.props;
    if (!tags || !tags.length) return null;

    const inner = tags.map((tag, i) => {
      tag = tag.replace(/\s/g, '');
      const selected = selectedTags.indexOf(tag) !== -1;
      if (selected) return null;
      return (
        <span
          key={i}
          className={selected ? 'selected' : ''}
          role="checkbox"
          aria-checked={selected}
          onClick={() => {
            if (selected) return deselectTag(tag);
            return selectTag(tag);
          }}
        >
          {'#'}
          {tag}
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
