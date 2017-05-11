import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  Linking
} from 'react-native';
import { globalStyles } from '../../styles/global';
import * as utils from '../../utils';

let styles;

class TextBody extends Component {
  constructor(props, context) {
    super(props, context);
    this.goToPost = this.goToPost.bind(this);
    this.goToTopic = this.goToTopic.bind(this);
  }
  setTag(tag) {
    if (!this.props.actions) return;
    this.props.actions.selectTag({ _id: tag.replace('#', '') });
    this.props.actions.changeTab('discover');
    this.props.actions.resetRoutes('discover');
  }

  setSelected(user) {
    if (!this.props.actions) return;
    let userId = user._id || user.replace('@', '');
    if (!user) return;
    if (this.props.scene && this.props.scene.id === userId) return;
    this.props.actions.goToProfile(user);
  }

  goToTopic(tag) {
    let topic = {
      _id: tag.replace('#', '').trim(),
      categoryName: tag
    };
    this.props.actions.goToTopic(topic);
  }

  goToPost() {
    if (!this.props.actions || !this.props.post || !this.props.post._id) return;
    if (this.props.scene && this.props.scene.id === this.props.post._id) return;
    this.props.actions.goToPost(this.props.post);
  }

  shouldComponentUpdate(next) {
    if (this.props.body !== next.body ||
      this.props.children !== next.children) {
      return true;
    }
    return false;
  }

  render() {
    const expanded = this.props.singlePost;
    let maxTextLength = this.props.maxTextLength || Math.pow(10, 10);
    let body = this.props.body || this.props.children || '';
    let post = this.props.post || {};
    let showAllMentions = this.props.showAllMentions;

    let bodyEl = null;

    let bodyObj = [];

    let extraTags = post.tags || [];

    let textArr = utils.text.getWords(body);

    textArr.forEach((section) => {
      let word = {};
      word.text = section;
      if (section.match(/^#/)) {
        word.type = 'hashtag';
        let ind = extraTags.indexOf(word.text.replace('#', '').trim());
        if (ind > -1) extraTags.splice(ind, 1);
      } else if (section.match(/^@/)) {
        let m = section.replace('@', '');
        if (post.mentions && post.mentions.find(mention => mention === m)) {
          word.type = 'mention';
        }
        if (showAllMentions) word.type = 'mention';
      } else if (utils.post.URL_REGEX.test(section)) {
        word.type = 'url';
      } else word.type = 'text';
      bodyObj.push(word);
    });

    let breakText;

    let tagsOnEnd = false;

    extraTags.forEach(tag => {
      bodyObj.push({ type: 'hashtag', text: ' #' + tag });
    });

    let reduced = [];
    let currentText = '';
    bodyObj.forEach((word, i) => {
      if (word.type === 'text' && i <= maxTextLength) {
        currentText += word.text;
      } else {
        if (currentText.length) {
          reduced.push({ type: 'text', text: currentText });
        }
        reduced.push(word);
        currentText = '';
      }
    });
    if (currentText.length) {
      reduced.push({ type: 'text', text: currentText });
    }

    bodyEl = reduced.map((word, i) => {
      let space = '';
      if (breakText) space = ' ';

      if (word.type === 'hashtag') {
        if (i >= maxTextLength) tagsOnEnd = true;
        return (<Text
          key={i}
          onPress={() => this.goToTopic(word.text)}
          style={styles.active}
        >
          {word.text + space}
        </Text>);
      } else if (word.type === 'mention') {
        if (i >= maxTextLength) tagsOnEnd = true;
        return (<Text
          key={i}
          onPress={() => this.setSelected(word.text)}
          style={styles.active}
        >
          {word.text + space}
        </Text>);
      } else if (word.type === 'url') {
        return (<Text
          key={i}
          onPress={() => {
            let link = word.text;
            if (!link.match(/http:\/\//i) && !link.match(/https:\/\//i)) {
              word.text = 'http://' + word.text;
            }
            return Linking.openURL(word.text);
          }}
          style={styles.active}
        >
          {word.text + space}
        </Text>);
      }
      if (i < maxTextLength || expanded) {
        return (<Text key={i}>{word.text}</Text>);
      } else if (!breakText) {
        breakText = i;
        return <Text key={'break'}>... </Text>;
      }
      return null;
    });

    if (breakText) {
      bodyEl.push(<Text key={'readmore'} style={[styles.greyText]}>{tagsOnEnd ? '...' : ''}read more</Text>);
    }

    // console.log('rendering', reduced)

    return (
      <Text
        numberOfLines={this.props.numberOfLines}
        ellipsizeMode={'tail'}
        style={this.props.style}
      >
        {bodyEl}
      </Text>
    );
  }

}

export default TextBody;

const localStyles = StyleSheet.create({
});

styles = { ...globalStyles, ...localStyles };
