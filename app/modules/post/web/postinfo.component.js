import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components/primitives';
import { ActivityIndicator } from 'react-native-web';
import ULink from 'modules/navigation/ULink.component';
import { Title, SecondaryText } from 'modules/styled/Text.component';
import { colors } from 'app/styles/globalStyles';
import { numbers } from 'app/utils';

if (process.env.BROWSER === true) {
  require('./post.css');
}

const Wrapper = styled.View`
  display: flex;
  flex-flow: row;
  width: 100%;
  flex-wrap: wrap;
`;

const View = styled.View`
  position: relative;
`;

const PostText = styled.View`
  /* margin: 0 1em; */
`;

const Image = styled.Image`
  background-color: 'blue';
  height: 202;
  width: 368;
  margin-right: 1em;
  margin-bottom: 1em;
`;


const PostTitle = styled(Title)`
  // margin: 0 1em;
`;

export default function PostInfo(props) {
  const { post, date, user } = props;

  if (post.loading) {
    return (
      <View>
        <ActivityIndicator />
      </View>
    );
  }
  if (!post.title) {
    return <View />;
  }

  let timestamp;
  if (date) {
    timestamp = ' • ' + numbers.timeSince(Date.parse(date)) + ' ago';
  }

  const postContent = (
    <Wrapper>
      <View>
        <Image source={{ uri: post.image || '' }} />
      </View>
      <PostText>
        <PostTitle>{post.title}</PostTitle>
        <SecondaryText>Posted by: @{user.handle} and HOW MANY OTHERS? {timestamp} {post.domain && `• ${post.domain} ↗`}</SecondaryText>
        <SecondaryText color={colors.blue}>#OF COMMENTS  #TAGS</SecondaryText>
      </PostText>
    </Wrapper>
  );

  if (post.url) {
    return (
      <View>
        <ULink to={post.url} target="_blank" rel="noopener noreferrer">
          {postContent}
        </ULink>
      </View>
    );
  }
  return postContent;
}

PostInfo.propTypes = {
  link: PropTypes.string,
  post: PropTypes.object,
  user: PropTypes.object,
  date: PropTypes.string,
  small: PropTypes.bool,
  preview: PropTypes.bool
};
