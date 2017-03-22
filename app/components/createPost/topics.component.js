import React, { Component } from 'react';
import {
  Text,
  View,
  TouchableHighlight,
  InteractionManager,
  ScrollView,
  Image
} from 'react-native';
import { globalStyles } from '../../styles/global';

let styles;

export default class Topics extends Component {

  componentWillMount() {
    InteractionManager.runAfterInteractions(() => {
      if (!this.props.topics.length) this.props.actions.getParentTags();
    });
  }

  render() {
    let topics = this.props.topics.map((topic, i) => {
      let active = false;
      if (this.props.selectedTopic && topic._id === this.props.selectedTopic._id) active = true;
      let x = (
        <Image
          style={styles.close}
          source={require('../../assets/images/x.png')}
        />
      );
      return (
        <View
          key={i}
          ref={c => {
            if (active) return this.tagsView = c;
            return null;
          }}
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
              <Text style={[active ? { color: 'white' } : null]} >{topic.emoji}{topic.categoryName}</Text>
              {active ? x : null}
            </View>
          </TouchableHighlight>
          { active ? this.props.innerView : null }
        </View>
      );
    });

    return (
      <ScrollView
        // centerContent={!this.props.selectedTopic}
        ref={c => this.scrollView = c}
        keyboardDismissMode={'interactive'}
        keyboardShouldPersistTaps={'always'}
      >
        {topics}
      </ScrollView>
    );
  }
}

styles = { ...globalStyles };
