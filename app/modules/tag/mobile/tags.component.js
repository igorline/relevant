import React, { Component } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { View } from 'modules/styled/uni';
import PropTypes from 'prop-types';
import { globalStyles } from 'app/styles/global';
import { colors } from 'app/styles';

const styles = { ...globalStyles };

export default class Tags extends Component {
  static propTypes = {
    toggleTag: PropTypes.func,
    actions: PropTypes.object,
    tags: PropTypes.object
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
      <TouchableOpacity
        style={[
          styles.tagBox,
          {
            backgroundColor: selected ? '#4d4eff' : '#F0F0F0'
          }
        ]}
        onPress={() => this.toggleTag(tag)}
        key={i}
      >
        <View fdirection="row">
          <Text style={[styles.font15, { color: selected ? 'white' : '#808080' }]}>
            {name}
          </Text>
        </View>
      </TouchableOpacity>
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
      <View fdirection="row" wrap align="center" justify="flex-start" bg={colors.white}>
        {allTags}
      </View>
    );
  }
}
