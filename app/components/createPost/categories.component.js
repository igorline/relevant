import React, { Component } from 'react';
import {
  View,
  TextInput,
  KeyboardAvoidingView,
  AlertIOS,
  Text,
  StyleSheet,
} from 'react-native';
import { globalStyles } from '../../styles/global';
import Tags from '../tags.component';
import Topics from './topics.component';

let styles;

class Categories extends Component {
  constructor(props, context) {
    super(props, context);
    this.setTopic = this.setTopic.bind(this);
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
    let props = this.props.createPost;
    this.selectedLookup = {};
    if (props) {
      this.bodyTags = props.bodyTags.map(tag => {
        return { _id: tag, bodyTag: true };
      });

      this.tags = props.articleTags.map((tag, i) => {
        let tagObj = { _id: tag };
        // this codes pre-selects first three tags
        // if (i < 3) this.bodyTags.push(tagObj);
        return tagObj;
      });
      if (props.postCategory) this.setTopicTags(props.postCategory, true);
      else this.selectedTags = [...new Set(this.bodyTags)];
    }
  }

  componentWillReceiveProps(next) {
    if (next.createPost && next.createPost.postCategory) {
      let updateSelected = false;
      if (next.createPost.postCategory !== this.props.createPost.postCategory) {
        updateSelected = true;
      }
      this.setTopicTags(next.createPost.postCategory, updateSelected);
    }
  }

  setTopicTags(selectedTopic, updateSelected) {
    this.selectedTopic = selectedTopic;
    if (!this.selectedTopic) return;
    let children = this.selectedTopic.children || [];
    children = children.map(topic => { return { _id: topic }; });

    let main = this.selectedTopic.main || [];
    main = main.map(topic => { return { _id: topic }; });
    if (!main.length) main = [this.selectedTopic];

    this.topicTags = [...main, ...children];

    if (updateSelected) {
      let bodyTags = this.bodyTags.filter(tag => main.findIndex(t => tag._id === t._id) === -1);
      this.selectedTags = [...new Set([...main, ...bodyTags])];
    }
  }

  setTopic(topic) {
    if (this.props.createPost.postCategory === topic) {
      this.selectedTopic = null;
      this.props.actions.setPostCategory(null);
    } else {
      this.selectedTopic = topic;
      this.props.actions.setPostCategory(topic);

      setTimeout(() =>
        this.topicsEl.tagsView.measure((fx, fy) => {
          this.num = fy;
          this.topicsEl.scrollView.scrollTo({ x: 0, y: this.num - 60, animated: true });
        }), 30);
    }

    this.setTopicTags(this.selectedTopic, true);

    this.props.actions.setCreaPostState({ allTags: [...this.inputTags, ...this.selectedTags] });
    return null;
  }

  processInput(input) {
    this.setState({ input: input.toLowerCase() });
    if (input === '') {
      this.inputTags = [];
      this.props.actions.setCreaPostState({ allTags: [...this.inputTags, ...this.selectedTags] });
    }
    let words = input.split(' ');
    // if (input[input.length - 1] !== ' ' && input[input.length - 1] !== ',') return null;
    let tags = words.map((word) => {
      word = word.replace('#', '').replace(/(,|\.|!|\?)\s*$/, '').toLowerCase();
      if (word === '') return null;
      return { _id: word };
    })
    .filter(el => el !== null);
    if (this.selectedTags.length + tags.length >= 7) {
      return AlertIOS.alert('You can\'t selecte more than 7 topics');
    }
    this.inputTags = tags;
    this.props.actions.setCreaPostState({ allTags: [...this.inputTags, ...this.selectedTags] });
    return null;
  }

  toggleTag(tag) {
    let index = this.selectedTags.findIndex(t => t._id === tag);
    let indexInput = this.inputTags.findIndex(t => t._id === tag);
    if (tag.bodyTag) {
      return AlertIOS.alert('text tag', 'You can remove this topic by going back and editing the text');
    }
    if (index > -1) {
      this.selectedTags.splice(index, 1);
    } else if (indexInput === -1) {
      if (this.selectedTags.length + this.inputTags.length >= 7) {
        return AlertIOS.alert('You can\'t selecte more than 7 tags');
      }
      this.selectedTags.push({ _id: tag });
    }
    // else {
      // this.setState({
      //   input: this.state.input.replace(tag._id, '')
      //   .trim()
      //   .replace(/(^,)|(,$)/g, '')
      // });
      // setTimeout(() => this.processInput(this.state.input), 100);
    // }

    this.props.actions.setCreaPostState({ allTags: [...this.inputTags, ...this.selectedTags] });
    this.forceUpdate();
    return null;
  }

  render() {
    let categoryEl;
    let selectedTopic = this.selectedTopic;

    let selectedTags = [...this.selectedTags, ...this.inputTags];
    let tags = [...this.inputTags, ...this.topicTags, ...this.tags];

    tags = [...new Set(tags.map(t => t._id))];
    // hide current category
    if (selectedTopic) {
      tags = tags.filter(tag => tag !== selectedTopic._id);
    }

    // <Text style={[styles.font10, styles.greyText, { padding: 10 }]}>Add these topics to your post</Text>

    let tagSelectionView = (
      <View >
        <TextInput
          autoCapitalize={'none'}
          onFocus={() => this.topicsEl.tagsView.measure((fx, fy) => {
            this.num = fy;
            this.topicsEl.scrollView.scrollTo({ x: 0, y: this.num - 60, animated: true });
          })
          }
          onChangeText={input => this.processInput(input)}
          ref={(c) => { this.input = c; }}
          style={[styles.font15, styles.topicInput]}
          value={this.state.input}
          multiline={false}
          placeholder={'Select additional topics or create your own'}
        />
        <View style={styles.break} />
        <Tags
          noReorder
          noScroll
          toggleTag={this.toggleTag}
          tags={{ tags, selectedTags }}
        />
        <View style={styles.break} />
      </View>
    );

    if (this.props.tags) {
      categoryEl = (<Topics
        ref={c => this.topicsEl = c}
        topics={this.props.tags}
        selectedTopic={selectedTopic}
        innerView={tagSelectionView}
        action={this.setTopic}
        actions={this.props.actions}
      />);
    }

    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={'padding'}
      >
        <View style={{ flex: 1 }}>
          {categoryEl}
        </View>
      </KeyboardAvoidingView>
    );
  }
}


const localStyles = StyleSheet.create({
  topicInput: {
    height: 45,
    padding: 10,
    backgroundColor: 'white',
    // borderBottomWidth: StyleSheet.hairlineWidth,
    // borderBottomColor: 'black',
  },
  break: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0F0F0',
    // marginHorizontal: 10,
    // marginBottom: 1,
  }
});

styles = { ...localStyles, ...globalStyles };
export default Categories;
