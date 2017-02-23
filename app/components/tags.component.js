import React, { Component } from 'react';
import {
  Text,
  ScrollView,
  TouchableHighlight,
  View,
  PanResponder
} from 'react-native';
import { globalStyles } from '../styles/global';

let styles = { ...globalStyles };

export default class Tags extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {};
    this.toggleTag = this.toggleTag.bind(this);
  }

  componentWillMount() {
    this._panResponder = PanResponder.create({
      onPanResponderTerminationRequest: () => true,
      onStartShouldSetPanResponderCapture: () => false,
    });
  }

  toggleTag(tag) {
    if (this.props.toggleTag) return this.props.toggleTag(tag);
    if (this.selectedLookup[tag._id]) {
      this.props.actions.deselectTag(tag);
    } else this.props.actions.selectTag(tag);
  }

  renderTag(tag, selected) {
    let name = `#${tag._id}`;
    if (tag.category) name = tag.categoryName;
    return (
      <TouchableHighlight
        style={
          [styles.tagBox, {
            backgroundColor: selected ? '#4d4eff' : '#F0F0F0' }]}
        onPress={() =>  this.toggleTag(tag)}
        key={tag._id}
      >
        <View style={{ flexDirection: 'row' }} >
          <Text style={[styles.font15, styles.emoji]}>{tag.emoji}</Text>
          <Text style={[styles.font15, { color: selected ? 'white' : '#808080' }]}>{name}</Text>
        </View>
      </TouchableHighlight>
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
          forceSetResponder={false}
          // onStartShouldSetResponder={evt => false}
          // onMoveShouldSetResponder={evt => false}
          horizontal
          scrollEnabled
          keyboardShouldPersistTaps={'always'}
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

