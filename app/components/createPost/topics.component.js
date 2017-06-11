import React, { Component } from 'react';
import {
  Text,
  View,
  TouchableHighlight,
  InteractionManager,
  FlatList,
  StyleSheet,
  Keyboard,
  Platform
} from 'react-native';
import { globalStyles } from '../../styles/global';
import TagSelection from './tagSelection.component';

let styles;

export default class topics extends Component {
  constructor(props) {
    super(props);
    this.renderItem = this.renderItem.bind(this);
  }

  componentWillMount() {
    InteractionManager.runAfterInteractions(() => {
      if (!this.props.topics.length) this.props.actions.getParentTags();
    });
  }

  componentWillReceiveProps(next) {
    if (next.selectedTopic &&
      (!this.props.selectedTopic ||
        this.props.selectedTopic._id !== next.selectedTopic._id)
      ) {
      this.goToElement = true;
    } else this.goToElement = false;
  }

  renderItem({ item, index }) {
    let topic = item;
    let i = index;
    let active = false;
    let innerView;

    if (this.props.selectedTopic &&
      topic._id === this.props.selectedTopic._id) {
      active = true;
    }

    if (this.props.type === 'create' && active) {
      innerView = (
        <TagSelection
          key={topic._id}
          topic={topic}
          scrollToElement={() => {
            this.scrollView.scrollToIndex({ viewPosition: 0.1, index });
            let scroll = () => {
              setTimeout(() =>
                this.scrollView.scrollToIndex({ viewPosition: 0.1, index }),
                1
              );
              Keyboard.removeListener('keyboardDidShow', scroll);
            };
            if (Platform.OS === 'android') {
              Keyboard.addListener('keyboardDidShow', scroll);
            }
          }}
          actions={this.props.actions}
          createPost={this.props.createPost}
        />
      );
    }

    if (active && this.goToElement) {
      setTimeout(() => {
        this.scrollView.scrollToIndex({ viewPosition: 0.1, index });
      }, 10);
    }

    return (
      <View
        key={i}
      >
        <TouchableHighlight
          onPress={() => this.props.action(topic)}
          underlayColor={'transparent'}
          style={[styles.categoryItem, { backgroundColor: active ? '#4d4eff' : 'white' }]}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center' }}
          >
            <Text style={[active ? { color: 'white' } : null, styles.darkGrey]} >{topic.emoji}{topic.categoryName}</Text>
          </View>
        </TouchableHighlight>
        {innerView}
      </View>
    );
  }

  render() {
    return (
      <FlatList
        ref={c => this.scrollView = c}
        keyboardDismissMode={'interactive'}
        keyboardShouldPersistTaps={'always'}
        data={this.props.topics}
        renderItem={this.renderItem}
        keyExtractor={(item, index) => index}
        tagsView={this.tagsView}
        extraData={this.props.selectedTopic}
      />
    );
  }
}

const localStyles = StyleSheet.create({

});

styles = { ...localStyles, ...globalStyles };
