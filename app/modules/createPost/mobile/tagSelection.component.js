import React, { Component } from 'react';
import { View, TextInput, Alert, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { globalStyles } from 'app/styles/global';
import Tags from 'modules/tag/mobile/tags.component';

let styles;

class TagSelection extends Component {
  static propTypes = {
    createPost: PropTypes.object,
    actions: PropTypes.object,
    scrollToElement: PropTypes.func
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      input: ''
    };

    this.toggleTag = this.toggleTag.bind(this);

    this.selectedTags = [];
    this.inputTags = [];
    this.tags = [];
    this.topicTags = [];
    this.bodyTags = [];
  }

  componentWillMount() {
    const props = this.props.createPost;
    if (props) {
      this.bodyTags = props.bodyTags.map(tag => ({ _id: tag, bodyTag: true }));
      this.tags = props.keywords.map(tag => ({ _id: tag }));
      if (props.postCategory) this.setTopicTags(props.postCategory, true);
      else this.selectedTags = [...new Set(this.bodyTags)];
    }
  }

  setTopicTags(selectedTopic, updateSelected) {
    this.selectedTopic = selectedTopic;
    if (!this.selectedTopic) return;
    let children = this.selectedTopic.children || [];
    children = children.map(topic => ({ _id: topic }));

    let main = this.selectedTopic.main || [];
    main = main.map(topic => ({ _id: topic }));
    if (!main.length) main = [this.selectedTopic];

    this.topicTags = [...main, ...children];

    if (updateSelected) {
      const bodyTags = this.bodyTags.filter(
        tag => main.findIndex(t => tag._id === t._id) === -1
      );
      this.selectedTags = [...new Set([...main, ...bodyTags])];
    }
  }

  processInput(input) {
    this.setState({ input: input.toLowerCase() });
    if (input === '') {
      this.inputTags = [];
      this.props.actions.setCreatePostState({
        allTags: [...this.inputTags, ...this.selectedTags]
      });
    }
    const words = input.split(' ');
    // if (input[input.length - 1] !== ' ' && input[input.length - 1] !== ',') return null;
    const tags = words
    .map(word => {
      word = word
      .replace('#', '')
      .replace(/(,|\.|!|\?)\s*$/, '')
      .toLowerCase();
      if (word === '') return null;
      return { _id: word };
    })
    .filter(el => el !== null);
    if (this.selectedTags.length + tags.length >= 7) {
      return Alert.alert('👋 too many topics!');
    }
    this.inputTags = tags;
    this.props.actions.setCreatePostState({
      allTags: [...this.inputTags, ...this.selectedTags]
    });
    return null;
  }

  toggleTag(tag) {
    const index = this.selectedTags.findIndex(t => t._id === tag);
    const indexInput = this.inputTags.findIndex(t => t._id === tag);
    if (tag.bodyTag) {
      return Alert.alert(
        'text tag',
        'You can remove this topic by going back and editing the text'
      );
    }
    if (index > -1) {
      this.selectedTags.splice(index, 1);
    } else if (indexInput === -1) {
      if (this.selectedTags.length + this.inputTags.length >= 7) {
        return Alert.alert('👋 too many topics!');
      }
      this.selectedTags.push({ _id: tag });
    }

    this.props.actions.setCreatePostState({
      allTags: [...this.inputTags, ...this.selectedTags],
      selectedTags: this.selectedTags
    });
    this.forceUpdate();
    return null;
  }

  render() {
    const { selectedTopic } = this;
    const selectedTags = [...this.selectedTags, ...this.inputTags];
    let tags = [...this.inputTags, ...this.topicTags, ...this.tags];

    tags = [...new Set(tags.map(t => t._id))];
    // hide current category
    if (selectedTopic) {
      tags = tags.filter(tag => tag !== selectedTopic._id);
    }

    return (
      <View style={{ flexDirection: 'column' }}>
        <TextInput
          autoCapitalize={'none'}
          autoCorrect={false}
          underlineColorAndroid={'transparent'}
          onFocus={() => this.props.scrollToElement()}
          onChangeText={input => this.processInput(input)}
          ref={c => {
            this.input = c;
          }}
          style={[styles.font15, styles.topicInput]}
          value={this.state.input}
          multiline={false}
          placeholder={'Select additional topics or create your own'}
        />
        <View style={styles.break} />
        <Tags
          noScroll
          toggleTag={this.toggleTag}
          tags={{ tags, selectedTags }}
        />
        <View style={styles.break} />
      </View>
    );
  }
}

const localStyles = StyleSheet.create({
  topicInput: {
    height: 45,
    padding: 10,
    backgroundColor: 'white'
  },
  break: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0F0F0'
  }
});

styles = { ...globalStyles, ...localStyles };

export default TagSelection;
