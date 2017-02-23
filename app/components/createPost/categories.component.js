import React, { Component } from 'react';
import {
  Text,
  View,
  TouchableHighlight,
  ScrollView,
  TextInput,
  KeyboardAvoidingView
} from 'react-native';
import { globalStyles } from '../../styles/global';
import Tags from '../tags.component';

class Categories extends Component {
  constructor(props, context) {
    super(props, context);
    this.setCategory.bind(this);
    this.state = {
      input: ''
    };
    this.toggleTag = this.toggleTag.bind(this);
    this.inputTags = [];
  }

  componentWillMount() {
    this.selectedTags = this.props.createPost.bodyTags.map(tag => {
      return { _id: tag };
    });

    this.tags = this.props.createPost.articleTags.map((tag, i) => {
      if (i < 3) this.selectedTags.push({ _id: tag });
      return { _id: tag };
    });

    this.tags = [...this.tags, ...this.selectedTags];
  }

  setCategory(tag) {
    this.props.actions.setPostCategory(tag);
  }

  processInput(input) {
    this.setState({ input: input.toLowerCase() });
    if (input === '') this.inputTags = [];
    let words = input.split(' ');
    if (input[input.length - 1] !== ' ' && input[input.length - 1] !== ',') return;
    let tags = words.map((word) => {
      word = word.replace('#', '').replace(/(\,|\.|!|\?)\s*$/, '').toLowerCase();
      if (word === '') return null;
      return { _id: word };
    })
    .filter(el => el !== null);
    this.inputTags = tags;
  }

  toggleTag(tag) {
    let index = this.selectedTags.indexOf(tag);
    let indexInput = this.inputTags.indexOf(tag);

    if (index > -1) {
      this.selectedTags.splice(index, 1);
    } else if (indexInput === -1) {
      this.selectedTags.push(tag);
    }
    this.forceUpdate();
  }

  render() {
    let categoryEl = null;
    let selectedTag = this.props.createPost.postCategory;
    let styles = globalStyles;

    let selectedTags = [...this.selectedTags, ...this.inputTags];
    let tags = [...this.tags];

    let tagSelectionView = (
      <View
        // onStartShouldSetResponder={evt => false}
        // onMoveShouldSetResponderCapture={evt => false}
      >
        <TextInput
          onChangeText={input => this.processInput(input)}
          ref={(c) => { this.input = c; }}
          style={[styles.font15, styles.categoryItem, { height: 50 }]}
          value={this.state.input}
          multiline={false}
          placeholder={'Add your own tags'}
        />
        <Tags
          toggleTag={this.toggleTag}
          tags={{ tags, selectedTags }}
        />
      </View>
    );

    if (this.props.tags) {
      categoryEl = this.props.tags.map((tag, i) => {
        let active = false;
        if (selectedTag) {
          if (selectedTag._id) {
            if (tag._id === selectedTag._id) active = true;
          }
        }
        return (
          <View key={i}>
            <TouchableHighlight
              onPress={() => this.setCategory(tag)}
              underlayColor={'transparent'}
              style={[styles.categoryItem, { backgroundColor: active ? '#4d4eff' : 'white' }]}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center' }}
              >
                <Text style={[active ? { color: 'white' } : null]} >{tag.emoji}{tag.categoryName}</Text>
              </View>
            </TouchableHighlight>
            { active ? tagSelectionView : null }
          </View>
        );
      });
    }

    return (
      <KeyboardAvoidingView>
        <ScrollView
          canCancelContentTouches
        >
          {categoryEl}
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
}

export default Categories;
