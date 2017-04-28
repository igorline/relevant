import React from 'react';
import {
  Text,
  Image,
  View,
  StyleSheet
} from 'react-native';
import { globalStyles, fullWidth } from '../../styles/global';
import { numbers } from '../../utils';

let styles;

exports.data = {};
exports.text = {};

// list of tooltips to initalize on app load
exports.tooltips = [
  'relevance',
  'coin',
  'topics',
  'subscriptions',
  'activity',
  'shareTip',
];

exports.data.relevance = {
  name: 'relevance',
  vertical: 'bottom',
  horizontal: 'right',
  horizontalOffset: 0,
  verticalOffset: 10,
};

exports.text.relevance = function (props) {
  if (!props.auth.user) return null;
  return (
    <Text style={props.style}>
      This is your relevance:{' '}
      <Text style={[styles.bebas]}>
        <Image
          style={[styles.r, { marginBottom: -2 }]}
          source={require('../../assets/images/r.png')}
        />
        {numbers.abbreviateNumber(props.auth.user.relevance)}
      </Text>
      {'\n\n'}
      As your relevance grows, you will become more influential and your upvotes will have more impact
    </Text>
  );
};

exports.data.coin = {
  name: 'coin',
  vertical: 'bottom',
  horizontal: 'right',
  horizontalOffset: 0,
  verticalOffset: 10,
};

exports.text.coin = function (props) {
  if (!props.auth.user) return null;
  return (
    <Text style={props.style}>
      These are your coins:{' '}
      <Text style={[styles.bebas]}>
        <Image
          style={[styles.r, { marginBottom: -2 }]}
          source={require('../../assets/images/relevantcoin.png')}
        />
        {numbers.abbreviateNumber(props.auth.user.balance)}
      </Text>
      {'\n\n'}
      You can use them to upvote posts. If you run out, don\t worry, you will get more tomorrow.
    </Text>
  );
};

exports.data.topics = {
  name: 'topics',
  vertical: 'bottom',
  horizontal: 'right',
  horizontalOffset: 0,
  verticalOffset: 10,
};

exports.text.topics = function (props) {
  if (!props.auth.user) return null;
  return (
    <Text style={[props.style, { textAlign: 'center' }]}>
      Press on Discover to toggle specific topics
    </Text>
  );
};

exports.data.subscriptions = {
  name: 'subscriptions',
  vertical: 'bottom',
  horizontal: 'right',
  horizontalOffset: 0,
  verticalOffset: 10,
};

exports.text.subscriptions = function (props) {
  if (!props.auth.user) return null;
  return (
    <Text style={[props.style, { textAlign: 'center' }]}>
      Whenever you upvote a post, you subscribe to the next 3 posts from the author.
    </Text>
  );
};

exports.data.activity = {
  name: 'activity',
  vertical: 'bottom',
  horizontal: 'right',
  horizontalOffset: 0,
  verticalOffset: 5,
};

exports.text.activity = function (props) {
  if (!props.auth.user) return null;
  let text = 'When others upvote your posts you earn relevance and coins. You get more relevance from users that are more relevant than you.';
  if (props.type && props.type.match('partial')) {
    text = 'You can also earn relevance from upvoting a post early.\n\n\Tip: for best results find new posts no one upvoted yet.';
  }
  return (
    <Text style={[props.style]}>
      {text}
    </Text>
  );
};

exports.data.shareTip = {
  name: 'shareTip',
  vertical: 'top',
  horizontal: 'right',
  horizontalOffset: 0,
  verticalOffset: 10,
};

exports.text.shareTip = function (props) {
  let width = (fullWidth - 20) / 2;
  const Video = require('react-native-video').default;

  return (
    <View style={styles.videoTip}>
      <View style={{ flex: 0.5 }}>
        <View style={styles.ol}>
          <Text style={[styles.textP, { fontWeight: 'bold' }]}>Enable posting from Chrome, Safari and other apps:</Text>
        </View>
        <View style={styles.ol}>
          <Text style={styles.textP}>1 </Text>
          <Text style={styles.textP}>Tap on share icon</Text>
        </View>

        <View style={styles.ol}>
          <Text style={styles.textP}>2 </Text>
          <Text style={styles.textP}>Tap on 'More'</Text>
        </View>

        <View style={styles.ol}>
          <Text style={styles.textP}>3 </Text>
          <Text style={styles.textP}>Find and toggle Relevant app</Text>
        </View>

        <View style={styles.ol}>
          <Text style={styles.textP}>4 </Text>
          <Text style={styles.textP}>Rearrange Relevant icon as you like</Text>
        </View>
      </View>
      <View
        style={{ width, height: width + 40, overflow: 'hidden' }}
      >
        <Video
          resizeMode={'contain'}
          source={require('../../assets/images/shareTip.mp4')}
          style={{ width, height: width * 16 / 9, bottom: 0, position: 'absolute' }}
          repeat
        />
      </View>
    </View>
  );
};

const localStyles = StyleSheet.create({
  ol: {
    flexDirection: 'row',
    paddingRight: 15,
    // alignItems: 'center'
  },
  textP: {
    fontSize: 12,
    flex: 0,
    marginBottom: 10,
  },
  videoTip: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

styles = { ...globalStyles, ...localStyles };

