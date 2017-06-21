import React, { Component } from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import { globalStyles } from '../../styles/global';
import Topics from './topics.component';

export default class Categories extends Component {
  constructor(props, context) {
    super(props, context);
    this.setTopic = this.setTopic.bind(this);
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
    let categoryEl;
    let selectedTopic = this.selectedTopic;

    if (this.props.tags) {
      categoryEl = (<Topics
        ref={c => this.topicsEl = c}
        topics={this.props.tags}
        selectedTopic={selectedTopic}
        type={'create'}
        action={this.setTopic}
        actions={this.props.actions}
        createPost={this.props.createPost}
      />);
    }

    return (
      <View
        style={{ flex: 1 }}
        behavior={'padding'}
      >
        <View style={{ flex: 1 }}>
          {categoryEl}
        </View>
      </View>
    );
  }
}
