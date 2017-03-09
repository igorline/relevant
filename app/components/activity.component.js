import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableWithoutFeedback,
  Image,
} from 'react-native';

import { numbers } from '../utils';
import { globalStyles, fullWidth, green } from '../styles/global';
import UrlPreview from './createPost/urlPreview.component';

let moment = require('moment');

let styles;

export default function (props) {
  let singleActivity = props.singleActivity;
  let amount = numbers.abbreviateNumber(singleActivity.amount);
  if (!singleActivity) return null;

  let activityTime = moment(singleActivity.createdAt);
  let fromNow = numbers.timeSince(activityTime);
  let postTitle = 'Untitled';

  if (singleActivity.post) {
    if (singleActivity.post.title) {
      postTitle = singleActivity.post.title;
    } else if (singleActivity.post.body) {
      postTitle = singleActivity.post.body.substring(0, 130);
      if (singleActivity.post.body.length > 130) postTitle += '...';
    }
    singleActivity.post.title = postTitle;
  }

  let setSelected = (user) => {
    props.navigator.goToProfile(user);
  };

  let goToPost = (post) => {
    props.navigator.goToPost(post);
  };

  let renderRight = () => {
    if (singleActivity.type) {
      let amountEl = null;
      return (<View style={styles.activityRight}>
        {amountEl}
        <Text style={[{ marginBottom: -2, fontSize: 11, color: '#B0B3B6', flex: 0.4, textAlign: 'right' }]}>{fromNow}</Text>
      </View>);
    }
    return null;
  };

  let renderName = (user) => {
    if (!user && singleActivity.byUsers) {
      return <Text>{singleActivity.byUsers.length} users</Text>;
    } else if (!user) return null;
    if (singleActivity.amount < 0) {
      return <Text>someone</Text>;
    }
    return (<Text style={styles.link} onPress={() => setSelected(user)}>
      {user.name}
    </Text>);
  };

  let renderPost = (post) => {
    if (!post) return null;
    // return (<Text
    //   onPress={() => goToPost(post)}
    //   style={[styles.link, { fontStyle: 'italic' }]}
    // >
    //   {post.title}
    // </Text>);
    let previewProps = { urlPreview: post, domain: post.domain };
    return (
      <View style={{ marginLeft: 50, marginRight: 40, marginTop: -10 }}>
        <UrlPreview
          onPress={() => goToPost(post)}
          size={'small'}
          {...previewProps}
        />
      </View>
    );
  };

  let renderImage = (user) => {
    if (!user && singleActivity.byUsers) {
      let image = <Image style={styles.activityImage} source={require('../assets/images/r.png')} />;
      return image;
    } else if (!user) return null;

    let image = (
      <TouchableWithoutFeedback onPress={() => setSelected(singleActivity.byUser)}>
        <Image style={styles.activityImage} source={require('../assets/images/default_user.jpg')} />
      </TouchableWithoutFeedback>);
    if (user && user.image) {
      image = (<TouchableWithoutFeedback onPress={() => setSelected(singleActivity.byUser)}>
        <Image style={styles.activityImage} source={{ uri: singleActivity.byUser.image }} />
      </TouchableWithoutFeedback>);
    }
    return image;
  };

  let getText = () => {

    let action = 'increased';
    let also = 'also ';
    if (singleActivity.amount < 0) {
      action = 'decreased';
      also = '';
    }

    switch (singleActivity.type) {

      case 'upvote':
        return (
          <Text>
            {renderName(singleActivity.byUser)} upvoted your post ➩ your relevance increased by {amount}
          </Text>
        );

      case 'downvote':
        return (
          <Text>
            somone downvoted your post ➩ your relevance decreased by {amount}
          </Text>
        );

      case 'partialUpvote':
        return (
          <Text>
            {renderName(singleActivity.byUser)} {also}upvoted this post ➩ your relevance {action} by {amount}
          </Text>
        );

      case 'partialDownvote':
        return (
          <Text>
            {renderName(singleActivity.byUser)} {also}downvoted this post ➩ your relevance {action} by {amount}
          </Text>
        );

      // DEPRICATED
      case 'partialEarning':
        return (
          <Text>
            earned ${singleActivity.amount.toFixed(0)} from {renderName(singleActivity.byUser)}'s investment in post
          </Text>
        );

      case 'basicIncome':
        return (
          <Text>
            your relevance is recovering! you got {amount} points because it was too low
          </Text>
        );

      case 'comment':
        return (
          <Text>
            &nbsp;commented on your post
          </Text>
        );

      case 'repost':
        return (
          <Text>
            &nbsp;reposted your post
          </Text>
        );

      case 'postMention':
      case 'mention':
        return (
          <Text>
            &nbsp;mentioned you in the post
          </Text>
        );

      case 'commentMention':
        return (
          <Text>
            &nbsp;mentioned you in a comment
          </Text>
        );

      default:
        return null;
    }
  };

  let renderMiddle = () => {
    let icon = require('../assets/images/rup.png');
    let color = { color: green };
    if (singleActivity.amount < 0) {
      color = { color: 'red' };
      icon = require('../assets/images/rdown.png');
    }
    switch (singleActivity.type) {
      case 'upvote':
      case 'partialUpvote':
      case 'downvote':
      case 'partialDownvote':
        return (
          <View style={[styles.activityMiddle]}>
            <Text allowFontScaling={false} style={[styles.bebas, color]}>
              <Image
                style={[styles.r, { height: 18, width: 28, marginBottom: 0, marginRight: 2 }]}
                source={icon}
              />
              <Text style={{ lineHeight: 17, fontSize: 17 }}>
                {Math.abs(numbers.abbreviateNumber(singleActivity.amount))}
              </Text>
            </Text>
          </View>
        );
      case 'basicIncome':
        return (
          <View style={[styles.activityMiddle]}>
            <Text allowFontScaling={false} style={[styles.bebas, color]}>
              <Image
                style={[styles.r, { height: 18, width: 28, marginBottom: 0 }]}
                source={require('../assets/images/rup.png')}
              />
              <Text style={{ lineHeight: 17, fontSize: 17 }}>
                {singleActivity.amount}
              </Text>
            </Text>
          </View>
        );
      default: return <View style={[styles.activityMiddle]} />;
    }
  };

  let renderLeft = () => {
    switch (singleActivity.type) {

      case 'upvote':
      case 'partialUpvote':
        return (
          <View style={{ flex: 1 }}>
            <View style={styles.activityLeft}>
              {singleActivity.byUser ? renderImage(singleActivity.byUser) :
                (<Text allowFontScaling={false} style={styles.incomeEmoji}>
                  🤑
                </Text>)}
              <Text style={[{ flex: 1 }, styles.darkGray, styles.georgia]}>
                {getText(singleActivity)}
              </Text>
            </View>
          </View>
        );

      case 'downvote':
      case 'partialDownvote':
        return (
          <View style={styles.activityLeft}>
            <Text allowFontScaling={false} style={styles.incomeEmoji}>😡</Text>
            <Text numberOfLines={2} style={[{ flex: 1 }, styles.darkGray, styles.georgia]}>
              {getText(singleActivity)}
            </Text>
          </View>
        );

      // DEPRICATED
      case 'partialEarning':
        return (
          <View style={styles.activityLeft}>
            <Text allowFontScaling={false} style={styles.incomeEmoji}>🤑</Text>
            <Text numberOfLines={2} style={[{ flex: 1 }, styles.darkGray, styles.georgia]}>
              {getText(singleActivity)}
            </Text>
            {renderPost(singleActivity.post)}
          </View>
        );
      case 'basicIncome':
        return (
          <View style={styles.activityLeft}>
            <Text allowFontScaling={false} style={styles.incomeEmoji}>🤑</Text>

            <Text numberOfLines={2} style={[{ flex: 1 }, styles.darkGray, styles.georgia]}>
              {getText(singleActivity)}
            </Text>
          </View>
        );
      default:
        return (
          <View style={styles.activityLeft}>
            {renderImage(singleActivity.byUser)}
            <Text numberOfLines={2} style={[{ flex: 1 }, styles.darkGray, styles.georgia]}>
              {renderName(singleActivity.byUser)}
              {getText(singleActivity)}
            </Text>
          </View>
        );
    }
  };

  return (
    <View>
      <View style={[styles.singleActivity]}>
        {renderLeft()}
        {renderMiddle()}
        {renderRight()}
      </View>
      {renderPost(singleActivity.post)}
    </View>
  );
}

const localStyles = StyleSheet.create({
  singleActivity: {
    padding: 10,
    width: fullWidth,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'stretch',
    flex: 1,
    overflow: 'visible',
    backgroundColor: 'white'
  },
  activityMiddle: {
    flex: 0.2,
    justifyContent: 'flex-end',
    alignItems: 'center',
    flexDirection: 'row',
    marginLeft: 5,
  },
  activityRight: {
    flex: 0.1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexDirection: 'row',
    marginLeft: 5,
  },
  activityLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  link: {
    color: '#4d4eff',
  },
  incomeEmoji: {
    width: 30,
    height: 30,
    marginRight: 10,
    textAlign: 'center',
    fontSize: 28,
  },
  activityImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  activityImagePlaceholder: {
    height: 30,
    width: 30,
    marginRight: 10,
    backgroundColor: 'lightgrey',
    borderRadius: 15,
  }
});
styles = { ...localStyles, ...globalStyles };

