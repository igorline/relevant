import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { LinkFont, Tag, View } from 'modules/styled/uni';
import { colors } from 'app/styles';

if (process.env.BROWSER === true) {
  require('modules/createPost/web/selectTags.css');
}

export default class TagsForm extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  static propTypes = {
    placeholderText: PropTypes.string,
    onChange: PropTypes.func,
    input: PropTypes.object
  };

  state = {
    input: '',
    // tags: this.props.initialTags
    tags: []
  };

  componentDidUpdate() {
    this.props.onChange(this.state.tags);
  }

  selectTag = tag => {
    // console.log('selecting tag', tag);
    this.setState({ tags: [...this.state.tags, tag] });
  };

  deselectTag = tag => {
    // console.log('deselect tag');
    const tags = this.state.tags.filter(t => t !== tag);
    this.setState({ tags });
  };

  handleBlur = () => {};
  // null
  // console.log('on blur');
  // let inputTags = e.target.value.split(/,|#/);
  // // debugger;
  // // if (inputTags) {
  // inputTags = inputTags.map(t => t.trim().replace('#', '')).filter(t => t.length);
  // if (inputTags.length) {
  //   this.selectTag(inputTags);
  // }
  // // }
  // return this.setState({ input: '' });

  handleChange(e) {
    this.setState({ input: e.target.value });
    return null;
    // console.log('on change!');
    // e.preventDefault();
    // const inputTags = e.target.value;
    // let tagsArr = inputTags.split(/,|#/);
    // if (tagsArr) {
    //   tagsArr = tagsArr.map(t => t.trim()).filter(t => t.length);
    // }
    // let newTags;
    // if (tagsArr && tagsArr.length > 1) {
    //   this.selectTag(tagsArr[0]);
    //   newTags = tagsArr[1];
    // } else {
    //   newTags = inputTags;
    // }
    // // console.log('setting state', newTags);
    // this.setState({ input: newTags });
  }

  handleKeyDown() {
    // this.setState({ input: e.target.value });
    return null;
    // if (e.keyCode !== 13 && e.keyCode !== 9) {
    //   return null;
    // }
    // // console.log('keydow', e);
    // if (e.keyCode === 13) {
    //   e.preventDefault();
    // }
    // const tag = e.target.value.trim().replace('#', '');
    // // console.log('val and tag', e.target.value, tag);
    // // If there is a value we prevent default on the tab key
    // // if not we let it proceed for accessibility reasons (i.e. navigating the form)
    // if (e.target.value.trim() && e.keyCode === 9) {
    //   e.preventDefault();
    // }
    // // debugger
    // this.selectTag(tag);
    // return this.setState({ input: '' });
    // return null;
  }

  render() {
    const { tags, input } = this.state;
    // console.log('tags', tags);
    let tagEls;
    if (!tags || !tags.length) {
      tagEls = null;
    } else {
      tagEls = tags.map((tag, i) => (
        <Tag
          key={i}
          m={0}
          mr={1}
          mt={1}
          disabled={false}
          role={'checkbox'}
          aria-checked
          onClick={() => this.deselectTag(tag)}
        >
          #{tag}
        </Tag>
      ));
    }
    // const input = this.state.input || '';

    return (
      <View display="flex" fdirection="column" mt={3}>
        <View>
          <LinkFont c={colors.black}>Your Tags </LinkFont>
          <View display="flex" fdirection="row" wrap="wrap">
            {tagEls}
          </View>
        </View>
        <div className="tagInput">
          <input
            key="tags-input"
            placeholder={this.props.placeholderText}
            value={this.props.input.value}
            onKeyDown={this.handleKeyDown}
            onBlur={this.handleBlur}
            onChange={this.handleChange}
          />
        </div>
      </View>
    );
  }
}
