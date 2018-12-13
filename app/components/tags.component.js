import React, { Component } from 'react';
import { Text, ScrollView, TouchableHighlight, View } from 'react-native';
import PropTypes from 'prop-types';
import { globalStyles } from '../styles/global';

const styles = { ...globalStyles };

export default class Tags extends Component {
  static propTypes = {
    toggleTag: PropTypes.func,
    actions: PropTypes.object,
    tags: PropTypes.object,
    noReorder: PropTypes.bool,
    noScroll: PropTypes.bool
  };

  constructor(props, context) {
    super(props, context);
    this.state = {};
    this.toggleTag = this.toggleTag.bind(this);
  }

  toggleTag(tag) {
    if (this.props.toggleTag) return this.props.toggleTag(tag);
    if (this.selectedLookup[tag._id || tag]) {
      return this.props.actions.deselectTag(tag);
    }
    return this.props.actions.selectTag(tag);
  }

  renderTag(tag, i) {
    const selected = this.selectedLookup[tag._id || tag] || false;
    const name = `#${tag._id || tag}`;
    return (
      <TouchableHighlight
        style={[
          styles.tagBox,
          {
            backgroundColor: selected ? '#4d4eff' : '#F0F0F0'
          }
        ]}
        onPress={() => this.toggleTag(tag)}
        key={i}
      >
        <View style={{ flexDirection: 'row' }}>
          {/* <Text style={[styles.font15, styles.emoji]}>{tag.emoji}</Text> */}
          <Text style={[styles.font15, { color: selected ? 'white' : '#808080' }]}>{name}</Text>
        </View>
      </TouchableHighlight>
    );
  }

  render() {
    let tagsEl = null;
    let el = null;
    let selectedEl = null;
    const tags = this.props.tags.tags;
    const selectedTags = this.props.tags.selectedTags;
    let allTags;
    this.selectedLookup = {};

    selectedEl = selectedTags.map((tag, i) => {
      this.selectedLookup[tag._id] = tag;
      return this.renderTag(tag, i);
    });

    tagsEl = tags.map((tag, i) => {
      if (!this.selectedLookup[tag._id]) {
        return this.renderTag(tag, i);
      }
      return null;
    });

    allTags = [...new Set([...selectedEl, tagsEl])];

    if (this.props.noReorder) {
      allTags = tags.map((tag, i) => this.renderTag(tag, i));
    }

    if (selectedTags.length + tags.length > 0) {
      let horizontal = true;
      if (this.props.noScroll) horizontal = false;
      el = (
        <ScrollView
          horizontal={horizontal}
          scrollEnabled
          keyboardShouldPersistTaps={'always'}
          showsHorizontalScrollIndicator={false}
          automaticallyAdjustContentInsets={false}
          contentContainerStyle={[styles.tags, this.props.noScroll ? { flexWrap: 'wrap' } : null]}
        >
          {allTags}
        </ScrollView>
      );
    }

    return el;
  }
}
