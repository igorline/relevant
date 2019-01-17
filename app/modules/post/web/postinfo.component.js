import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components/primitives';
import { ActivityIndicator } from 'react-native-web';
import ULink from 'modules/navigation/ULink.component';
import { Title, SecondaryText } from 'modules/styled/Text.component';
import { colors } from 'app/styles/globalStyles';
import { numbers } from 'app/utils';
import get from 'lodash.get';
import Tag from 'modules/tag/tag.component';

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
`;

export default function PostInfo(props) {
  const { post, link, community, postUrl } = props;
  if (post.loading) {
    return (
      <View>
        <ActivityIndicator />
      </View>
    );
  }
  const title = get(link, 'title') || get(post, 'title');
  if (!title) {
    return <View />;
  }

  let timestamp;
  if (post.postDate) {
    timestamp = ' • ' + numbers.timeSince(Date.parse(post.postDate)) + ' ago';
  }

  const postContent = (
    <Wrapper>
      <View>
        <Image source={{ uri: link.image || '' }} />
      </View>
      <PostText>
        <PostTitle>{title}</PostTitle>
        <SecondaryText>
          {get(post, 'embeddedUser.handle') ? `Posted by: @${get(post, 'embeddedUser.handle')} and HOW MANY OTHERS?` : null}
          {timestamp}
          <ULink external to={post.url} target="_blank">
            <SecondaryText>{link.domain && ` • ${link.domain} ↗`}</SecondaryText>
          </ULink>
        </SecondaryText>
        { post.commentCount ?
          <SecondaryText color={colors.blue}>
            {post.commentCount} Comments
          </SecondaryText>
          : null}
        <SecondaryText>{
          post.tags.map(tag => <Tag name={tag} community={community} key={tag} />)}
        </SecondaryText>
      </PostText>
    </Wrapper>
  );

  if (post.url) {
    return (
      <View>
        <ULink to={postUrl} rel="noopener noreferrer">
          {postContent}
        </ULink>
      </View>
    );
  }
  return postContent;
}

PostInfo.propTypes = {
  link: PropTypes.object,
  post: PropTypes.object,
  community: PropTypes.string,
  // date: PropTypes.string,
  // small: PropTypes.bool,
  // preview: PropTypes.bool
};
