import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableWithoutFeedback } from 'react-native';
import PropTypes from 'prop-types';
import { globalStyles } from 'app/styles/global';
import TextBody from 'modules/text/mobile/textBody.component';

let styles;

class PostBody extends Component {
  static propTypes = {
    actions: PropTypes.object,
    post: PropTypes.object,
    short: PropTypes.bool,
    repost: PropTypes.bool,
    preview: PropTypes.bool,
    comment: PropTypes.object,
    avatarText: PropTypes.func
  };

  constructor(props, context) {
    super(props, context);
    this.showInvestors = this.showInvestors.bind(this);
    this.goToPost = this.goToPost.bind(this);
  }

  componentDidMount() {}

  goToPost() {
    const { post, actions } = this.props;
    if (!actions || !post || !post._id) return;
    actions.goToPost({ ...post, _id: post.parentPost || post._id });
  }

  showInvestors() {
    this.props.actions.push({
      key: 'people',
      id: this.props.post._id,
      component: 'people',
      title: 'Votes',
      back: true
    });
  }

  render() {
    const { post, short, repost, preview, comment, avatarText } = this.props;
    let body;
    if (post) {
      if (post.body) body = post.body.trim();
      if (body === '') body = null;
    }

    let maxTextLength = 100;

    let numberOfLines = 9999999999999;
    let postStyle = styles.bodyText;

    if (short) {
      maxTextLength = 60;
      postStyle = styles.bodyText;
    }

    if (repost) {
      numberOfLines = 2;
      maxTextLength = 60;
      postStyle = styles.repostText;
    }

    if (comment) {
      postStyle = styles.bodyText;
    }

    if (preview) {
      numberOfLines = 2;
      maxTextLength = 10;
      postStyle = styles.previewText;
    }

    const textBody = (
      <TouchableWithoutFeedback
        style={{ flex: 1 }}
        onPressIn={e => {
          this.touchable1x = e.nativeEvent.pageX;
        }}
        onPress={e => {
          const x = e.nativeEvent.pageX;
          if (Math.abs(this.touchable1x - x) > 5) {
            return;
          }
          this.goToPost();
        }}
      >
        <View
          style={[
            styles.postBody,
            this.props.preview ? { marginTop: 10 } : null,
            avatarText ? { marginLeft: 6 * 8 } : null
          ]}
        >
          <Text style={[styles.darkGrey, postStyle]}>
            <TextBody
              style={postStyle}
              numberOfLines={numberOfLines}
              maxTextLength={maxTextLength}
              post={post}
              body={body}
              {...this.props}
            />
          </Text>
        </View>
      </TouchableWithoutFeedback>
    );

    return <View style={{ flex: 1 }}>{textBody}</View>;
  }
}

export default PostBody;

const localStyles = StyleSheet.create({
  postBody: {
    marginTop: 24,
    flex: 1,
    justifyContent: 'center',
    marginBottom: 15
  },
  bodyText: {
    fontFamily: 'Georgia',
    fontSize: 36 / 2,
    lineHeight: 54 / 2
  },
  commentaryText: {
    fontFamily: 'Georgia',
    fontSize: 36 / 2,
    lineHeight: 54 / 2
  },
  repostText: {
    fontFamily: 'Georgia',
    fontSize: 32 / 2,
    lineHeight: 48 / 2,
    marginTop: -5,
    marginBottom: 15
  },
  previewText: {
    fontFamily: 'Georgia',
    fontSize: 30 / 2,
    lineHeight: 40 / 2
  },
  shortBodyText: {
    fontFamily: 'Libre Caslon Display',
    fontSize: 63 / 2,
    lineHeight: 82 / 2
  }
});

styles = { ...globalStyles, ...localStyles };
