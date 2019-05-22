import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { LinkFont, View, Tag } from 'modules/styled/uni';
import { colors } from 'app/styles';

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
      // tag = tag.replace(/\s/g, '');
      // tag = tag
      // .replace(/tag:|publication:|elevated:false|lockedpostsource:0/g, '');

      const selected = selectedTags.indexOf(tag) !== -1;
      if (selected) return null;
      return (
        <Tag
          key={i}
          m={0}
          mr={1}
          mt={1}
          disabled={!selected}
          role="checkbox"
          aria-checked={selected}
          onClick={() => {
            if (selected) return deselectTag(tag);
            return selectTag(tag);
          }}
        >
          {'#'}
          {tag}
        </Tag>
      );
    });
    return (
      <View>
        <LinkFont c={colors.black}>{this.props.text + ': '}</LinkFont>
        <View mt={1} display="flex" fdirection="row" wrap="wrap" justify="flex-start">
          {inner}
        </View>
      </View>
    );
  }
}
