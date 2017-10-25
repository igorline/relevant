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
    const selectedTags = props.selectedTags.map(x => x._id);
    let inner = props.tags.map((tag, i) => {
      const selected = selectedTags.indexOf(tag) !== -1;
      return (
        // eslint-disable-next-line jsx-a11y/no-static-element-interactions
        <span
          key={i}
          className={selected ? 'selected' : ''}
          role="checkbox"
          aria-checked={selected}
          onClick={() => {
            if (selected) {
              props.actions.deselectTag({ _id: tag });
            } else {
              props.actions.selectTag({ _id: tag });
            }
          }}
        >
          {'#'}{tag}
        </span>
      );
    });
    return (
      <div className="selectTags">
        {'suggested tags: '}
        {inner}
      </div>
    );
  }
}
