import React, { Component } from 'react';
import { StyleSheet, Text, Linking } from 'react-native';
import PropTypes from 'prop-types';
import { globalStyles } from 'app/styles/global';
import * as utils from 'app/utils';

let styles;

class TextBody extends Component {
  static propTypes = {
    actions: PropTypes.object,
    post: PropTypes.object,
    body: PropTypes.string,
    children: PropTypes.node,
    singlePost: PropTypes.bool,
    maxTextLength: PropTypes.number,
    showAllMentions: PropTypes.bool,
    numberOfLines: PropTypes.number,
    style: Text.propTypes.style
  };

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

  setSelected = user => this.props.actions && this.props.actions.goToProfile(user);

  goToTopic(tag) {
    const topic = {
      _id: tag.replace('#', '').trim(),
      categoryName: tag
    };
    this.props.actions.goToTopic(topic);
  }

  goToPost = () => {
    const { actions, post } = this.props;
    actions && post && post._id && actions.goToPost(this.props.post);
  };

  shouldComponentUpdate(next) {
    if (this.props.body !== next.body || this.props.children !== next.children) {
      return true;
    }
    return false;
  }

  render() {
    const expanded = this.props.singlePost;
    const maxTextLength = this.props.maxTextLength || 100 ** 10;
    const body = this.props.body || this.props.children || '';
    const post = this.props.post || {};
    const { showAllMentions } = this.props;

    let bodyEl = null;
    const bodyObj = [];
    const extraTags = post.tags || [];
    const textArr = utils.text.getWords(body);

    textArr.forEach(section => {
      const word = {};
      word.text = section;
      if (section.match(/^#/) && section.replace(/#/g, '') !== '') {
        word.type = 'hashtag';
        const ind = extraTags.indexOf(word.text.replace('#', '').trim());
        if (ind > -1) extraTags.splice(ind, 1);
      } else if (section.match(/^@/) && section.replace(/@/g, '') !== '') {
        const m = section.replace('@', '');
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

    const reduced = [];
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
        return (
          <Text
            key={i}
            onPress={() => this.goToTopic(word.text)}
            style={[this.props.style, styles.active]}
          >
            {word.text + space}
          </Text>
        );
      }
      if (word.type === 'mention') {
        if (i >= maxTextLength) tagsOnEnd = true;
        return (
          <Text
            key={i}
            onPress={() => this.setSelected(word.text)}
            style={[this.props.style, styles.active]}
          >
            {word.text + space}
          </Text>
        );
      }
      if (word.type === 'url') {
        return (
          <Text
            key={i}
            onPress={() => {
              const link = word.text;
              if (!link.match(/http:\/\//i) && !link.match(/https:\/\//i)) {
                word.text = 'http://' + word.text;
              }
              return Linking.openURL(word.text);
            }}
            style={[this.props.style, styles.active]}
          >
            {word.text + space}
          </Text>
        );
      }
      if (i < maxTextLength || expanded) {
        return (
          <Text style={this.props.style} key={i}>
            {word.text}
          </Text>
        );
      }
      if (!breakText) {
        breakText = i;
        return (
          <Text style={this.props.style} key={'break'}>
            ...{' '}
          </Text>
        );
      }
      return null;
    });

    if (breakText) {
      bodyEl.push(
        <Text style={[this.props.style, styles.greyText]} key={'readmore'}>
          {tagsOnEnd ? '...' : ''}read more
        </Text>
      );
    }

    return (
      <Text
        numberOfLines={this.props.numberOfLines}
        ellipsizeMode={'tail'}
        style={[this.props.style]}
      >
        {bodyEl}
      </Text>
    );
  }
}

export default TextBody;

const localStyles = StyleSheet.create({});

styles = { ...globalStyles, ...localStyles };
