import React, { Component } from 'react';
import {
  Text,
  ScrollView,
} from 'react-native';
import { globalStyles } from '../styles/global';

let styles;

export default class Tags extends Component {

  constructor(props, context) {
    super(props, context);
    this.state = {};
  }

  componentDidMount() {
    if (!this.props.posts.discoverTags.length) this.props.actions.getDiscoverTags();
  }

  setTag(tag) {
    this.props.actions.setTag(tag);
  }

  clearTag() {
    this.props.actions.setTag(null);
  }

  render() {
    let tagsEl = null;
    let tags = null;
    let id = null;

    if (this.props.posts.tag) id = this.props.posts.tag._id;
    tags = this.props.posts.discoverTags;
    tagsEl = tags.map((data, i) => (
      <Text
        style={
          [styles.tagBox, {
            backgroundColor: data._id === id ? '#007aff' : '#F0F0F0',
            color: data._id === id ? 'white' : '#808080' }]}
        onPress={data._id === id ? () => this.clearTag() : () => this.setTag(data)}
        key={i}
      >
        {data.name}
      </Text>
    ));

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        automaticallyAdjustContentInsets={false}
        contentContainerStyle={styles.tags}
      >
        {tagsEl}
      </ScrollView>
    );
  }
}

Tags.propTypes = {
  posts: React.PropTypes.Object,
  actions: React.PropTypes.Object,
};

styles = { ...globalStyles };
