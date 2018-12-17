import React, { Component } from 'react';
import { View } from 'react-native';
import PropTypes from 'prop-types';
import Topics from './topics.component';

export default class Categories extends Component {
  static propTypes = {
    createPost: PropTypes.object,
    actions: PropTypes.object,
    tags: PropTypes.array
  };

  constructor(props, context) {
    super(props, context);
    this.setTopic = this.setTopic.bind(this);
  }

  componentWillMount() {
    if (this.props.createPost.postCategory) {
      this.selectedTopic = this.props.createPost.postCategory;
    }
  }

  setTopic(topic) {
    if (this.props.createPost.postCategory === topic) {
      this.selectedTopic = null;
      this.props.actions.setPostCategory(null);
    } else {
      this.selectedTopic = topic;
      this.props.actions.setPostCategory(topic);
    }
    return null;
  }

  render() {
    const { createPost, actions, tags } = this.props;
    const { selectedTopic } = this;
    let categoryEl;

    if (this.props.tags) {
      categoryEl = (
        <Topics
          ref={c => (this.topicsEl = c)}
          topics={tags}
          selectedTopic={selectedTopic}
          type={'create'}
          action={this.setTopic}
          actions={actions}
          createPost={createPost}
        />
      );
    }

    return (
      <View style={{ flex: 1 }} behavior={'padding'}>
        <View style={{ flex: 1 }}>{categoryEl}</View>
      </View>
    );
  }
}
