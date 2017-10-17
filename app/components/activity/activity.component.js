import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableWithoutFeedback,
  Image,
  TouchableOpacity
} from 'react-native';

import { numbers } from '../../utils';
import { globalStyles, fullWidth, green, smallScreen, greyText, mainPadding } from '../../styles/global';
import UrlPreview from '../createPost/urlPreview.component';

let moment = require('moment');

let styles;

export default function (props) {
  let singleActivity = props.singleActivity;
  let amount = numbers.abbreviateNumber(singleActivity.amount);
  if (!singleActivity) return null;

  let fromNow = moment(singleActivity.createdAt).fromNow();
  // let fromNow = numbers.timeSince(activityTime);
  let postTitle = 'Untitled';
  let tooltipParent = {};

  if (singleActivity.post) {
    if (singleActivity.post.title) {
      postTitle = singleActivity.post.title;
    } else if (singleActivity.post.body) {
      postTitle = singleActivity.post.body.substring(0, 130);
      if (singleActivity.post.body.length > 130) postTitle += '...';
    }
    singleActivity.post.title = postTitle;
  }

  let toggleTooltip = (name, type) => {
    if (!tooltipParent[name]) return;
    tooltipParent[name].measureInWindow((x, y, w, h) => {
      let parent = { x, y, w, h };
      if (x + y + w + h === 0) return;
      props.navigator.setTooltipData({
        name,
        parent,
        type
      });
      props.navigator.showTooltip(name);
    });
  };

  let setSelected = (user) => {
    props.navigator.goToProfile(user);
  };

  let goToPost = (post) => {
    props.navigator.goToPost(post);
  };

  let renderRight = () => {
    if (singleActivity.type) {
      return (<View style={styles.time}>
        <View style={styles.border} />
        <Text
          style={[{
            paddingHorizontal: 5,
            // marginBottom: -6,
            fontSize: 10,
            color: greyText,
            textAlign: 'center',
            backgroundColor: 'white'
          }]}
        >
          {fromNow}
        </Text>
      </View>);
    }
    return null;
  };

  let renderName = (user) => {
    // TODO depricated!
    if (!user && singleActivity.byUsers) {
      return <Text style={styles.activityText}>{singleActivity.byUsers.length} users</Text>;
    }

    if (!user && singleActivity.totalUsers) {
      let s = '';
      if (singleActivity.totalUsers > 1) s = 's';
      return <Text style={styles.activityText}>{singleActivity.totalUsers} user{s}</Text>;
    }

    if (user && singleActivity.totalUsers - 1) {
      let s = '';
      if (singleActivity.totalUsers - 1 > 1) s = 's';
      return (<Text style={styles.activityText}>
        <Text
          style={[styles.link, styles.activityText]}
          onPress={() => setSelected(user)}
        >
          {user.name}{' '}
        </Text>
        and {singleActivity.totalUsers - 1} other{s}
      </Text>);
    }

    // if (singleActivity.amount < 0) {
    //   return <Text style={styles.activityText}>someone</Text>;
    // }

    return (<Text style={[styles.link, styles.activityText]} onPress={() => setSelected(user)}>
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
      <View style={{ marginLeft: 55, marginRight: mainPadding }}>
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
      let image = (
        <View style={styles.activityImage}>
          <Image
            resizeMode={'contain'}
            style={styles.activityImage}
            source={require('../../assets/images/r.png')}
          />
        </View>
        );
      return image;
    } else if (!user) return null;

    let image = (
      <TouchableWithoutFeedback onPress={() => setSelected(singleActivity.byUser)}>
        <Image style={styles.activityImage} source={require('../../assets/images/default_user.jpg')} />
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
        let coinText = singleActivity.coin ? 'you got a coin and ' : '';
        return (
          <Text style={styles.activityText}>
            {renderName(singleActivity.byUser)} upvoted your post → {coinText}your relevance increased by {amount}
          </Text>
        );

      case 'downvote':
        return (
          <Text style={styles.activityText}>
            {renderName(singleActivity.byUser)} downvoted your post → your relevance decreased by {amount}
          </Text>
        );

      case 'partialUpvote':
        return (
          <Text style={styles.activityText}>
            {renderName(singleActivity.byUser)} {also}upvoted this post → your relevance {action} by {amount}
          </Text>
        );

      case 'partialDownvote':
        return (
          <Text style={styles.activityText}>
            {renderName(singleActivity.byUser)} {also}downvoted this post → your relevance {action} by {amount}
          </Text>
        );

      case 'basicIncome':
        return (
          <Text style={styles.activityText}>
            You got {singleActivity.coin} extra coin{singleActivity.coin > 1 ? 's' : ''} so you can upvote more posts!
          </Text>
        );

      case 'commentAlso':
        return (
          <Text style={styles.activityText}>
            &nbsp;also commented on a post
          </Text>
        );

      case 'comment':
        return (
          <Text style={styles.activityText}>
            &nbsp;commented on your post
          </Text>
        );

      case 'repost':
        return (
          <Text style={styles.activityText}>
            &nbsp;reposted your post
          </Text>
        );

      case 'postMention':
      case 'mention':
        return (
          <Text style={styles.activityText}>
            &nbsp;mentioned you in the post
          </Text>
        );

      case 'commentMention':
        return (
          <Text style={styles.activityText}>
            &nbsp;mentioned you in a comment
          </Text>
        );

      case 'topPost':
        return (
          <Text style={styles.activityText}>
            In case you miseed this top-ranked post:
          </Text>
        );

      default:
        if (singleActivity.text) {
          return <Text style={styles.activityText}>{singleActivity.text}</Text>;
        }
        return null;
    }
  };

  let renderMiddle = () => {
    let icon = require('../../assets/images/rup.png');
    let color = { color: green };
    let coin;
    if (singleActivity.amount < 0) {
      color = { color: 'red' };
      icon = require('../../assets/images/rdown.png');
    }

    if (singleActivity.coin) {
      coin = (
        <TouchableOpacity
          onPress={() => toggleTooltip('activity')}
          allowFontScaling={false}
          style={styles.textRow}
        >
          <Image
            resizeMode={'contain'}
            style={[styles.r, { height: 15, width: 22 }]}
            source={require('../../assets/images/coinup.png')}
          />
          <Text style={[styles.bebas, color, { lineHeight: 17, fontSize: 17 }]}>
            {Math.abs(numbers.abbreviateNumber(singleActivity.coin))}
            { !smallScreen && singleActivity.amount ?
              <Text style={styles.darkGrey}>{'•'}</Text> : null}
          </Text>
        </TouchableOpacity>
      );
    }

    switch (singleActivity.type) {
      case 'upvote':
      case 'partialUpvote':
      case 'downvote':
      case 'partialDownvote':
        return (
          <View
            style={[smallScreen ? styles.activityMiddleSmall : styles.activityMiddle]}
            ref={(c) => tooltipParent.activity = c}
            onLayout={() => null}
          >
            { coin }
            {coin && smallScreen ?
              <View style={styles.divide} /> : null
            }
            <TouchableOpacity
              onPress={() => toggleTooltip('activity', singleActivity.type)}
              allowFontScaling={false}
              style={styles.textRow}
            >
              <Image
                resizeMode={'contain'}
                style={[styles.r, { height: 16, width: 20 }]}
                source={icon}
              />
              <Text style={[styles.bebas, color, { lineHeight: 17, fontSize: 17 }]}>
                {Math.abs(numbers.abbreviateNumber(singleActivity.amount))}
              </Text>
            </TouchableOpacity>

          </View>
        );
      case 'basicIncome':
        return (
          <View style={[styles.activityMiddle]}>
            {coin}
          </View>
        );
      default:
        if (singleActivity.coin) return <View style={[styles.activityMiddle]} >{coin}</View>;
        return <View style={[styles.activityMiddle]} />;
    }
  };

  let renderLeft = () => {
    switch (singleActivity.type) {

      case 'upvote':
      case 'partialUpvote':
      case 'downvote':
      case 'partialDownvote':
        // console.log(singleActivity);
        return (
          <View style={styles.activityLeft}>
            <View style={styles.activityLeft}>
              {singleActivity.byUser ? renderImage(singleActivity.byUser) :
                (<Text allowFontScaling={false} style={styles.incomeEmoji}>
                  🤑
                </Text>)}
              <Text style={[{ flex: 1 }, styles.activityText]}>
                {getText(singleActivity)}
              </Text>
            </View>
          </View>
        );

      // case 'downvote':
      // case 'partialDownvote':
      //   return (
      //     <View style={styles.activityLeft}>
      //       <Text allowFontScaling={false} style={styles.incomeEmoji}>😡</Text>
      //       <Text numberOfLines={2} style={[{ flex: 1 }, styles.darkGrey, styles.georgia]}>
      //         {getText(singleActivity)}
      //       </Text>
      //     </View>
      //   );

      // DEPRICATED
      case 'partialEarning':
        return (
          <View style={styles.activityLeft}>
            <Text allowFontScaling={false} style={styles.incomeEmoji}>🤑</Text>
            <Text numberOfLines={2} style={[{ flex: 1 }, styles.darkGrey, styles.georgia]}>
              {getText(singleActivity)}
            </Text>
            {renderPost(singleActivity.post)}
          </View>
        );
      case 'basicIncome':
      case 'reward':
        return (
          <View style={styles.activityLeft}>
            <Text allowFontScaling={false} style={styles.incomeEmoji}>🤑</Text>

            <Text numberOfLines={2} style={[{ flex: 1 }, styles.darkGrey, styles.georgia]}>
              {getText(singleActivity)}
            </Text>
          </View>
        );
      case 'topPost':
        return (
          <View style={styles.activityLeft}>
            <Image
              style={[styles.activityImage, { borderRadius: 0, width: 25, height: 25 }]}
              resizeMode={'contain'} source={require('../../assets/images/r.png')}
            />
            <Text numberOfLines={2} style={[{ flex: 1 }, styles.darkGrey, styles.georgia]}>
              {getText(singleActivity)}
            </Text>
          </View>
        );
      default:
        return (
          <View style={styles.activityLeft}>
            {renderImage(singleActivity.byUser)}
            <Text numberOfLines={2} style={[{ flex: 1 }, styles.darkGrey, styles.georgia]}>
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
      </View>
      {renderPost(singleActivity.post)}
      <View>
        {renderRight()}
      </View>
    </View>
  );
}

const localStyles = StyleSheet.create({
  divide: {
    width: 25,
    margin: 2,
  },
  activityText: {
    fontSize: 15,
    fontFamily: 'Georgia'
  },
  time: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
  },
  border: {
    alignItems: 'center',
    borderBottomColor: '#dddddd',
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginHorizontal: 60,
    position: 'absolute',
    width: fullWidth - 120,
    bottom: 6,
  },
  singleActivity: {
    padding: mainPadding,
    paddingTop: 15,
    width: fullWidth,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'stretch',
    flex: 1,
    overflow: 'visible',
    // backgroundColor: 'white'
  },
  activityMiddleSmall: {
    flex: 0.16,
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginLeft: 3,
  },
  activityMiddle: {
    flex: 0.25,
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
    fontSize: 24,
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

