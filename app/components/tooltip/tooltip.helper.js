import React from 'react';
import {
  Text,
  Image,
} from 'react-native';
import { globalStyles } from '../../styles/global';
import { numbers } from '../../utils';

let styles = { ...globalStyles };

exports.data = {};
exports.text = {};
exports.tooltips = ['relevance', 'coin', 'topics', 'subscriptions', 'activity'];

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
