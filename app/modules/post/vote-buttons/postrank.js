import React from 'react';
import PropTypes from 'prop-types';
import { getPostType } from 'app/utils/post';
import { colors } from 'app/styles';
import Tooltip from 'modules/tooltip/tooltip.component';
import { View, Image, SmallText } from 'modules/styled/uni';
import { Platform } from 'react-native';

// const Platform = process.env.WEB !== 'true' ? require('react-native').Platform : null;

PostRank.propTypes = {
  horizontal: PropTypes.bool,
  color: PropTypes.string,
  post: PropTypes.object
};

export default function PostRank({ horizontal, color, post }) {
  const type = getPostType({ post });
  const tipText =
    type === 'link'
      ? "This is the article's reputation score"
      : `This is the ${type}'s reputation scroe`;
  const tooltipData = { text: tipText, position: 'right' };
  const postRank = post.data
    ? Math.round(post.data.pagerank) + post.data.upVotes - post.data.downVotes
    : 0;

  return (
    <View
      h={horizontal ? 2 : 4}
      minwidth={horizontal ? 8 : null}
      justify={'center'}
      align={'center'}
    >
      <Tooltip name="vote" data={tooltipData} />
      <View m={horizontal ? '0 1' : null} fdirection={'row'} align={'center'}>
        <Image
          h={1.2}
          w={1.2}
          style={{
            opacity: 0.5,
            transform: [
              {
                ...Platform.select({
                  ios: {
                    translateY: 1.0
                  },
                  android: {
                    translateY: 1.0
                  },
                  default: {
                    translateY: 0.5
                  }
                })
              }
            ]
          }}
          resizeMode={'contain'}
          resizeMethod={'resize'}
          mr={0.2}
          source={require('app/public/img/r.png')}
        />
        <SmallText
          // weird spacing discrepant between android and ios
          h={Platform && Platform.OS === 'android' ? 1.7 : 2}
          c={color || colors.secondaryText}
        >
          {postRank || 0}
        </SmallText>
      </View>
    </View>
  );
}
