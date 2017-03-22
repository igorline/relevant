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
    if (!this.props.actions) return;
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
    let body = '';
    if (post) {
      if (post.body) body = post.body.trim();
      // else return null;
      // else if (post.description) body = '\"' + post.description + '\"';
    }

    let maxTextLength = 100;

    let numberOfLines = 9999999999999;
    let postStyle = styles.bodyText;

    if (this.props.short) {
      // numberOfLines = 2;
      maxTextLength = 30;
      postStyle = styles.commentaryText;
    }

    if (this.props.repost) {
      numberOfLines = 4;
      maxTextLength = 60;
      postStyle = styles.bodyText;
    }

    let upvotes;

    if ((post.downVotes || post.upVotes) && !this.props.short && !this.props.repost) {
      let r = Math.round(post.relevance);
      upvotes = (
        <Text
          onPress={this.showInvestors}
          style={[styles.font12, styles.greyText, { paddingTop: 5 }]}
        >
          {post.upVotes ? post.upVotes + ' upvote' + (post.upVotes > 1 ? 's' : '') + ' • ' : null}
          {post.downVotes ? post.downVotes + ' downvote' + (post.downVotes > 1 ? 's' : '') + ' • ' : ''}
          {r + ' relevant point' + (Math.abs(r) > 1 ? 's' : '')}
        </Text>
      );
    }

    return (
      <View>
        <TouchableWithoutFeedback onPress={this.goToPost}>
          <View style={[styles.postBody]}>
            <Text style={[styles.darkGrey, postStyle]}>
              <TextBody
                numberOfLines={numberOfLines}
                maxTextLength={maxTextLength}
                post={post}
                body={body}
                {...this.props}
              />
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

