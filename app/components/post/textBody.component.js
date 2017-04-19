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

  render() {
    const expanded = this.props.singlePost;
    let maxTextLength = this.props.maxTextLength || Math.pow(10, 1000);
    let body = this.props.body || '';
    let post = this.props.post || {};

    let bodyEl = null;

    let bodyObj = [];

    let extraTags = post.tags || [];

    let textArr = body
    .replace((/(\.\s+)|(\.$)/g), a => '`' + a + '`')
    .replace((/[,!?\s+]/g), a => '`' + a + '`')
    .split(/`/);

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
      } else if (utils.post.URL_REGEX.test(section)) {
        word.type = 'url';
      }
      bodyObj.push(word);
    });

    let breakText;

    let tagsOnEnd = false;

    extraTags.forEach(tag => {
      bodyObj.push({ type: 'hashtag', text: ' #' + tag });
    });

    bodyEl = bodyObj.map((word, i) => {
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
          onPress={() => Linking.openURL(word.text)}
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

    return (
      <Text style={this.props.style}>
        {bodyEl}
      </Text>
    );
  }

}

export default TextBody;

const localStyles = StyleSheet.create({
  postBody: {
    marginTop: 25,
    // marginBottom: 25,
  },
  bodyText: {
    fontFamily: 'Georgia',
    fontSize: 38 / 2,
    lineHeight: 55 / 2,
  },
  commentaryText: {
    fontFamily: 'Georgia',
    fontSize: 32 / 2,
    lineHeight: 40 / 2,
  },
  shortBodyText: {
    fontFamily: 'Libre Caslon Display',
    fontSize: 63 / 2,
    lineHeight: 82 / 2,
  }
});

styles = { ...globalStyles, ...localStyles };
