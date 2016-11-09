import React, { Component } from 'react';
import {
  Text,
  ScrollView,
} from 'react-native';
import { globalStyles } from '../styles/global';

let styles = { ...globalStyles };

export default class Tags extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {};
    this.toggleTag = this.toggleTag.bind(this);
  }

  componentDidMount() {
  }

  toggleTag(tag) {
    if (this.selectedLookup[tag._id]) {
      this.props.actions.deselectTag(tag);
    }
    else this.props.actions.selectTag(tag);
  }

  renderTag(tag, selected) {
    return (
      <Text
        style={
          [styles.tagBox, {
            backgroundColor: selected ? '#007aff' : '#F0F0F0',
            color: selected ? 'white' : '#808080' }]}
        onPress={() => this.toggleTag(tag)}
        key={tag._id}
      >
        {tag.name}
      </Text>
    );
  }

  render() {
    let tagsEl = null;
    let el = null;
    let selectedEl = null;
    let tags = this.props.tags.tags;
    let selectedTags = this.props.tags.selectedTags;
    this.selectedLookup = {};

    selectedEl = selectedTags.map((tag) => {
      this.selectedLookup[tag._id] = tag;
      return this.renderTag(tag, true);
    });

    tagsEl = tags.map((tag) => {
      if (!this.selectedLookup[tag._id]) {
        return this.renderTag(tag, false);
      }
    });

    if (selectedTags.length + tags.length > 0) {
      el = (
        <ScrollView
          horizontal
          keyboardShouldPersistTaps
          showsHorizontalScrollIndicator={false}
          automaticallyAdjustContentInsets={false}
          contentContainerStyle={styles.tags}
        >
          {selectedEl}
          {tagsEl}
        </ScrollView>
      );
    }

    return el;
  }
}

Tags.propTypes = {
  posts: React.PropTypes.object,
  actions: React.PropTypes.object,
};