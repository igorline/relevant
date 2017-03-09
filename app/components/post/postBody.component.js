import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableWithoutFeedback,
} from 'react-native';
import { globalStyles } from '../../styles/global';

let styles;

class PostBody extends Component {
  constructor(props, context) {
    super(props, context);
    this.goToPost = this.goToPost.bind(this);
    this.goToTopic = this.goToTopic.bind(this);
  }

  componentDidMount() {
  }

  goToTopic(tag) {
    let topic = {
      _id: tag.replace('#', '').trim(),
      categoryName: tag
    };
    this.props.actions.goToTopic(topic);
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

  goToPost() {
    if (!this.props.actions) return;
    if (this.props.scene && this.props.scene.id === this.props.post._id) return;
    this.props.actions.goToPost(this.props.post);
  }

  render() {
    const expanded = this.props.singlePost;
    let body = '';
    let post = this.props.post;
    if (post) {
      if (post.body) body = post.body.trim();
      // else return null;
      // else if (post.description) body = '\"' + post.description + '\"';
    }
    let bodyEl = null;

    let bodyObj = [];

    let extraTags = post.tags || [];

    let textArr = body
    .replace((/[,.!?\s+]/g), a => '`' + a + '`')
    .split(/`/);

    textArr.forEach((section) => {
      let word = {};
      word.text = section;
      if (section.match(/^#/)) {
        word.hashtag = true;
        let ind = extraTags.indexOf(word.text.replace('#', '').trim());
        if (ind > -1) extraTags.splice(ind, 1);
      } else if (section.match(/^@/)) {
        word.mention = true;
      }
      bodyObj.push(word);
    });

    let breakText;

    let tagsOnEnd = false;

    let maxTextLength = 100;

    // bodyObj.push({ text: ' ' });
    // bodyObj.push({ hashtag: true, text: '' + post.categoryName });
    extraTags.forEach(tag => {
      bodyObj.push({ hashtag: true, text: ' #' + tag });
    });

    bodyEl = bodyObj.map((word, i) => {
      let space = '';
      if (breakText) space = ' ';

      if (word.hashtag) {
        if (i >= maxTextLength) tagsOnEnd = true;
        return (<Text
          key={i}
          onPress={() => this.goToTopic(word.text)}
          style={styles.active}
        >
          {word.text + space}
        </Text>);
      } else if (word.mention) {
        if (i >= maxTextLength) tagsOnEnd = true;
        return (<Text
          key={i}
          onPress={() => this.setSelected(word.text)}
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
    });

    if (breakText) {
      bodyEl.push(<Text key={'readmore'} style={[styles.greyText]}>{tagsOnEnd ? '...' : ''}read more</Text>);
    }

    let numberOfLines = 9999999999999;
    let postStyle = styles.bodyText;

    if (this.props.short) {
      numberOfLines = 2;
      postStyle = styles.commentaryText;
    }

    if (this.props.repost) {
      numberOfLines = 4;
      postStyle = styles.bodyText;
    }

    let upvotes;

    if (post.upVotes && !this.props.short && !this.props.repost) {
      let text = 'people think this is relevant';
      if (post.upVotes === 1) text = 'person thinks this is relevant';
      upvotes = (<Text style={[styles.font10, styles.greyText, { paddingTop: 5 }]}>
        {post.upVotes} {text}
      </Text>);
    }

    return (
      <View>
        <TouchableWithoutFeedback onPress={this.goToPost}>
          <View style={[styles.postBody]}>
            <Text
              style={[styles.darkGrey, postStyle]}
              numberOfLines={numberOfLines}
            >
              {bodyEl}
            </Text>
          </View>
        </TouchableWithoutFeedback>
        {upvotes}
      </View>
    );
  }
}

export default PostBody;

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

