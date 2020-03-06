import React, { Component } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  InteractionManager,
  FlatList,
  StyleSheet,
  Keyboard,
  Platform
} from 'react-native';
import PropTypes from 'prop-types';
import { globalStyles } from 'app/styles/global';
import TagSelection from './tagSelection.component';

let styles;

export default class topics extends Component {
  static propTypes = {
    topics: PropTypes.array,
    actions: PropTypes.object,
    selectedTopic: PropTypes.object,
    type: PropTypes.string,
    createPost: PropTypes.object,
    action: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.renderItem = this.renderItem.bind(this);
  }

  componentDidMount() {
    InteractionManager.runAfterInteractions(() => {
      if (!this.props.topics.length) this.props.actions.getParentTags();
      if (this.props.selectedTopic) {
        this.goToElement = true;
      }
    });
  }

  componentDidUpdate(prev) {
    const { selectedTopic } = this.props;
    if (
      selectedTopic &&
      (!prev.selectedTopic || prev.selectedTopic._id !== selectedTopic._id)
    ) {
      this.goToElement = true;
    } else this.goToElement = false;
  }

  renderItem({ item, index }) {
    const topic = item;
    const i = index;
    let active = false;
    let innerView;

    if (this.props.selectedTopic && topic._id === this.props.selectedTopic._id) {
      active = true;
    }

    if (this.props.type === 'create' && active) {
      innerView = (
        <TagSelection
          key={topic._id}
          topic={topic}
          scrollToElement={() => {
            this.scrollView.scrollToIndex({ viewPosition: 0.2, index });
            const scroll = () => {
              setTimeout(
                () => this.scrollView.scrollToIndex({ viewPosition: 0.2, index }),
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
      <View key={i}>
        <TouchableOpacity
          onPress={() => this.props.action(topic)}
          style={[styles.categoryItem, { backgroundColor: active ? '#4d4eff' : 'white' }]}
        >
          <View
            style={{
              alignItems: 'center'
            }}
          >
            <Text style={[active ? { color: 'white' } : null]}>
              {Platform.OS === 'android' ? '#' : topic.emoji + ' '}
              {topic.categoryName}
            </Text>
          </View>
        </TouchableOpacity>
        {innerView}
      </View>
    );
  }

  render() {
    return (
      <FlatList
        style={{ flex: 1 }}
        container
        ref={c => (this.scrollView = c)}
        keyboardDismissMode={'interactive'}
        keyboardShouldPersistTaps={'always'}
        data={this.props.topics}
        renderItem={this.renderItem}
        keyExtractor={(item, index) => index.toString()}
        tagsView={this.tagsView}
        extraData={this.props.selectedTopic}
        removeClippedSubviews={false}
        initialNumToRender={20}
      />
    );
  }
}

const localStyles = StyleSheet.create({});

styles = { ...localStyles, ...globalStyles };
