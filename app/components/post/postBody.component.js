import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableWithoutFeedback,
} from 'react-native';
import { globalStyles } from '../../styles/global';
import Stats from './stats.component';
import TextBody from './textBody.component';

let styles;

class PostBody extends Component {
  constructor(props, context) {
    super(props, context);
    this.showInvestors = this.showInvestors.bind(this);
    this.goToPost = this.goToPost.bind(this);
  }

  componentDidMount() {
  }

  goToPost() {
    if (!this.props.actions || !this.props.post || !this.props.post._id) return;
    if (this.props.scene && this.props.scene.id === this.props.post._id) return;
    this.props.actions.goToPost(this.props.post);
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
    let post = this.props.post;
    let body;
    if (post) {
      if (post.body) body = post.body.trim();
      if (body === '') body = null;
      // else return null;
      // else if (post.description) body = '\"' + post.description + '\"';
      // if (this.props.preview)
        // console.log(body)
    }

    let maxTextLength = 100;

    let numberOfLines = 9999999999999;
    let postStyle = styles.bodyText;

    if (this.props.short) {
      // numberOfLines = 2;
      maxTextLength = 60;
      postStyle = styles.commentaryText;
    }

    if (this.props.repost) {
      numberOfLines = 2;
      maxTextLength = 60;
      postStyle = styles.repostText;
    }

    if (this.props.preview) {
      numberOfLines = 2;
      maxTextLength = 20;
      postStyle = styles.previewText;
    }

    let upvotes = <Text style={{ paddingTop: 10 }}/>;
    if ((post.downVotes || post.upVotes) && !this.props.repost && !this.props.preview) {
      let r = Math.round(post.relevance);
      upvotes = (
        <Text
          onPress={this.showInvestors}
          style={[styles.font12, styles.greyText, { paddingTop: 15, paddingBottom: 10 }]}
        >
          {post.upVotes ? post.upVotes + ' upvote' + (post.upVotes > 1 ? 's' : '') + ' • ' : null}
          {post.downVotes ? post.downVotes + ' downvote' + (post.downVotes > 1 ? 's' : '') + ' • ' : ''}
          {r + ' relevant point' + (Math.abs(r) > 1 ? 's' : '')}
        </Text>
      );
    }

    let textBody;
    // if (body) {
      textBody = (
        <TouchableWithoutFeedback
          style={{ flex: 1 }}
          onPressIn={e =>{
            this.touchable1x = e.nativeEvent.pageX;
          }}
          onPress={(e) => {
            let x = e.nativeEvent.pageX;
            if (Math.abs(this.touchable1x - x) > 5) {
              return;
            }
            this.goToPost();
          }}
        >
          <View style={[styles.postBody]}>
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
    // }

    return (
      <View style={{ flex: 1 }}>
        {textBody}
        <Text>{post.link}</Text>
        {!this.props.preview && !this.props.repost ? upvotes : null}
      </View>
    );
  }
}

export default PostBody;

const localStyles = StyleSheet.create({
  postBody: {
    marginTop: 20,
    flex: 1,
    justifyContent: 'center'
  },
  bodyText: {
    fontFamily: 'Georgia',
    fontSize: 38 / 2,
    lineHeight: 55 / 2,
  },
  commentaryText: {
    fontFamily: 'Georgia',
    fontSize: 35 / 2,
    lineHeight: 52 / 2,
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
    lineHeight: 40 / 2,
    marginTop: -10,
  },
  shortBodyText: {
    fontFamily: 'Libre Caslon Display',
    fontSize: 63 / 2,
    lineHeight: 82 / 2,
  }
});

styles = { ...globalStyles, ...localStyles };

