import React, { Component } from 'react';
import { TextInput, Alert, StyleSheet, Keyboard } from 'react-native';
import { View } from 'modules/styled/uni';
import PropTypes from 'prop-types';
import { globalStyles } from 'app/styles/global';
import Tags from 'modules/tag/mobile/tags.component';
import styled from 'styled-components/primitives';
import { colors, sizing, layout } from 'app/styles';

const Input = styled(TextInput)`
  padding: ${sizing(1.5)};
  background-color: ${colors.white};
  ${layout.universalBorder()}
  ${p => (p.isFocused ? `border-color: ${colors.blue};}` : null)}
  margin-bottom: ${sizing(2)}
`;

let styles;

class TagSelection extends Component {
  static propTypes = {
    createPost: PropTypes.object,
    actions: PropTypes.object,
    communityTags: PropTypes.array
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      input: '',
      inputFocused: false,
      communityTags: []
    };

    this.toggleTag = this.toggleTag.bind(this);

    this.selectedTags = [];
    this.inputTags = [];
    this.tags = [];
    this.topicTags = [];
    this.bodyTags = [];
  }

  onFocus() {
    this.setState({ inputFocused: true });
  }

  onBlur() {
    this.setState({ inputFocused: false });
  }

  componentDidMount() {
    this.setState({
      communityTags: this.props.communityTags.map(tag => ({ _id: tag }))
    });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.communityTags !== this.props.communityTags) {
      this.setState({
        communityTags: this.props.communityTags.map(tag => ({ _id: tag }))
      });
    }
  }

  updateTags = () => {
    const props = this.props.createPost;
    if (props) {
      this.bodyTags = props.bodyTags.map(tag => ({ _id: tag, bodyTag: true }));
      this.tags = props.keywords.map(tag => ({ _id: tag }));
      this.selectedTags = [...new Set([...this.bodyTags, ...this.selectedTags])];
    }
  };

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
      const bodyTags = this.bodyTags.filter(t => tag !== t._id);
      this.bodyTags = bodyTags;
      this.props.actions.setCreatePostState({ bodyTags: bodyTags.map(t => t._id) });
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
    this.updateTags();
    const selectedTags = [...this.selectedTags, ...this.inputTags];
    let tags = [
      ...new Set([
        ...this.inputTags,
        ...this.state.communityTags,
        ...this.tags,
        ...this.bodyTags
      ])
    ];

    tags = [...new Set(tags.map(t => t._id))];
    // hide current category
    if (selectedTopic) {
      tags = tags.filter(tag => tag !== selectedTopic._id);
    }

    return (
      <View p={2} pt={3} style={{ flexDirection: 'column' }}>
        <Input
          autoCapitalize={'none'}
          autoCorrect={false}
          underlineColorAndroid={'transparent'}
          onChangeText={input => this.processInput(input)}
          ref={c => {
            this.input = c;
          }}
          onBlur={() => this.onBlur()}
          onFocus={() => this.onFocus()}
          value={this.state.input}
          multiline={false}
          isFocused={this.state.inputFocused}
          placeholderTextColor={colors.grey}
          style={{ color: colors.black }}
          placeholder={'Select additional topics or create your own'}
          onSubmitEditing={Keyboard.dismiss}
        />
        <View style={styles.break} />
        <Tags toggleTag={this.toggleTag} tags={{ tags, selectedTags }} />
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
