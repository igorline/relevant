import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { LinkFont, Tag, View } from 'modules/styled/uni';
import { Input } from 'modules/styled/web';
import { colors } from 'app/styles';

if (process.env.BROWSER === true) {
  require('./selectTags.css');
}

export default class TagInput extends Component {
  static propTypes = {
    placeholderText: PropTypes.string,
    selectedTags: PropTypes.array,
    deselectTag: PropTypes.func,
    selectTag: PropTypes.func
  };

  state = {
    input: ''
  };

  render() {
    const { selectedTags, deselectTag, selectTag } = this.props;
    const tagEls = selectedTags.map((tag, i) => (
      <Tag
        key={i}
        m={0}
        mr={1}
        mt={1}
        disabled={false}
        role={'checkbox'}
        aria-checked
        onClick={() => deselectTag(tag)}
      >
        #{tag}
      </Tag>
    ));

    return (
      <div>
        <View>
          <LinkFont c={colors.black}>Your Tags </LinkFont>
          <View display="flex" fdirection="row" wrap="wrap">
            {tagEls}
          </View>
        </View>
        <View flex={1}>
          <Input
            placeholder={this.props.placeholderText}
            value={this.state.input}
            onKeyDown={e => {
              if (e.keyCode === 13) {
                const tag = e.target.value.trim().replace('#', '');
                selectTag(tag);
                return this.setState({ input: '' });
              }
              return null;
            }}
            onBlur={e => {
              let tags = e.target.value.split(/,|#/);
              tags = tags.map(t => t.trim().replace('#', '')).filter(t => t.length);
              if (tags.length) {
                selectTag(tags);
              }
              return this.setState({ input: '' });
            }}
            onChange={e => {
              const tags = e.target.value;
              let tagsArr = tags.split(/,|#/);
              tagsArr = tagsArr.map(t => t.trim()).filter(t => t.length);
              if (tagsArr.length > 1) {
                selectTag(tagsArr[0]);
                return this.setState({ input: tagsArr[1] });
              }
              return this.setState({ input: tags });
            }}
          />
        </View>
      </div>
    );
  }
}
