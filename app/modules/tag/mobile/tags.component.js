import React, { Component } from 'react';
import { Text, ScrollView, TouchableHighlight, View } from 'react-native';
import PropTypes from 'prop-types';
import { globalStyles } from 'app/styles/global';

const styles = { ...globalStyles };

export default class Tags extends Component {
  static propTypes = {
    toggleTag: PropTypes.func,
    actions: PropTypes.object,
    tags: PropTypes.object,
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
          <Text style={[styles.font15, { color: selected ? 'white' : '#808080' }]}>
            {name}
          </Text>
        </View>
      </TouchableHighlight>
    );
  }

  render() {
    const { tags, selectedTags } = this.props.tags;
    if (selectedTags.length + tags.length === 0) return null;

    this.selectedLookup = {};
    selectedTags.forEach(tag => {
      this.selectedLookup[tag._id] = tag;
    });

    const allTags = tags.map((tag, i) => this.renderTag(tag, i));

    return (
      <ScrollView
        horizontal={!this.props.noScroll}
        scrollEnabled
        keyboardShouldPersistTaps={'always'}
        showsHorizontalScrollIndicator={false}
        automaticallyAdjustContentInsets={false}
        contentContainerStyle={[
          styles.tags,
          this.props.noScroll ? { flexWrap: 'wrap' } : null
        ]}
      >
        {allTags}
      </ScrollView>
    );
  }
}
