import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components/primitives';
import { ActivityIndicator } from 'react-native-web';
import ULink from 'modules/navigation/ULink.component';
import { Title, SecondaryText } from 'modules/styled/Text.component';
import { colors } from 'app/styles/globalStyles';
import { getTimestamp } from 'app/utils/numbers';
import get from 'lodash.get';
import Tag from 'modules/tag/tag.component';


const Wrapper = styled.View`
  display: flex;
  flex-direction: row;
  max-width: 100%;
`;

const View = styled.View`
  position: relative;
  /* flex-direction: column; */
`;

const TextView = styled.View`
  display: inline;
`;

const Text = styled.Text`
  position: relative;
`;

const Image = styled.Image`
  height: 202px;
  width: 368px;
  margin-right: 1em;
  margin-bottom: 1em;
`;

const PostText = styled.View`
  flex-shrink: 1;
`;


const PostTitle = styled(Title)`
  /* max-width: 100%; */
  /* flex-shrink: 1 */
  /* flex-wrap: wrap; */
  /* flex: 1; */
`;

export default function PostInfo(props) {
  const { post, link, community, postUrl, firstPost } = props;
  if (post.loading) {
    return (
      <View>
        <ActivityIndicator />
      </View>
    );
  }
  const title = get(link, 'title') || get(post, 'title') || get(post, 'body');

  let timestamp;
  if (post.postDate) {
    timestamp = getTimestamp(post.postDate);
  }

  const imageUrl = get(link, 'image') || null;

  const userSet = new Set();
  (get(post, 'commentary', []) || []).forEach(user => userSet.add(user.id));
  const uniqueUsers = userSet.size - 1;

  let postUser;
  if (get(post, 'embeddedUser.handle')) {
    postUser = get(post, 'embeddedUser');
  } else if (get(firstPost, 'embeddedUser.handle')) {
    postUser = get(firstPost, 'embeddedUser');
  }
  const tags = post.tags && post.tags.length ? get(post, 'tags', []) : [];
  const postContent = (
    <Wrapper>
      {imageUrl ?
        <View>
          <ULink external to={post.url} target="_blank">
            <Image source={{ uri: imageUrl }} />
          </ULink>
        </View>
        : <View />}
      <PostText>
        {postUrl ?
          <ULink to={postUrl}>
            <PostTitle>{title}</PostTitle>
          </ULink>
          : <PostTitle>{title}</PostTitle>}
        <SecondaryText>

          {get(postUser, 'handle') ?
            (<TextView><Text>Posted by: </Text><ULink to={`/user/profile/${postUser.handle}`} disabled={!postUrl}>{`@${get(postUser, 'handle')}`}</ULink></TextView>) : ''}
          { postUrl && (
            <ULink to={postUrl}>
              {uniqueUsers > 1 ? `and ${uniqueUsers} others` : ''}
              {timestamp}
            </ULink>)
          }
          { get(link, 'domain') ?
            <ULink external to={post.url} external target="_blank" disabled={!postUrl} >
              {link.domain && ` • ${link.domain} ↗`}
            </ULink>
            : null}
        </SecondaryText>
        { post.commentCount ?
          <ULink external to={postUrl} >
            <SecondaryText color={colors.blue}>
              {post.commentCount} Comments
            </SecondaryText>
          </ULink>
          : null}
        <SecondaryText>{tags.length ?
          tags.map(tag => <Tag name={tag} community={community} key={tag} />)
          : null}
        </SecondaryText>
      </PostText>

    </Wrapper>
  );

  if (post.url) {
    return (
      <View>
        {postContent}
      </View>
    );
  }
  return postContent;
}

PostInfo.propTypes = {
  link: PropTypes.object,
  post: PropTypes.object,
  community: PropTypes.string,
  postUrl: PropTypes.string,
  firstPost: PropTypes.object,
};
