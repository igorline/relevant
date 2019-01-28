import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components/primitives';
import { ActivityIndicator } from 'react-native-web';
import ULink from 'modules/navigation/ULink.component';
import { Title, SecondaryText } from 'modules/styled';
import { sizing } from 'app/styles';
// import { getTimestamp } from 'app/utils/numbers';
import get from 'lodash.get';
import Tag from 'modules/tag/tag.component';
import Gradient from 'modules/post/gradient.component';

const Wrapper = styled.View`
  display: flex;
  flex-direction: row;
  max-width: 100%;
`;

const View = styled.View`
  position: relative;
`;

// const TextView = styled.View`
//   display: flex;
//   flex-direction: row;
// `;

const Text = styled.Text`
  position: relative;
`;

const ImageContainer = styled.View`
  display: flex;
  flex: 1;
  width: ${sizing.byUnit(26)};
  height: ${sizing.byUnit(13)};
  margin-right: ${sizing.byUnit(2)};
`;

const Image = styled.Image`
  flex: 1;
`;

const PostText = styled.View`
  flex-shrink: 1;
`;


const PostTitle = styled(Title)`
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
  if (!post) return null;
  let title =
    get(link, 'title') ||
    get(post, 'title') ||
    get(post, 'body') ||
    get(firstPost, 'body');

  if (title && title.length > 160) title = title.substring(0, 160) + '...';
  title = title && title.trim();

  const imageUrl = get(link, 'image') || null;

  const userSet = new Set();
  (get(post, 'commentary', []) || []).forEach(user => userSet.add(user.id));
  const tags = post.tags && post.tags.length ? get(post, 'tags', []) : [];

  // const timestamp = getTimestamp(post.postDate);
  // const uniqueUsers = userSet.size - 1;
  // let postUser;
  // if (get(post, 'embeddedUser.handle')) {
  //   postUser = post.embeddedUser;
  // } else if (get(firstPost, 'embeddedUser.handle')) {
  //   postUser = firstPost.embeddedUser;
  // }

  const postContent = (
    <Wrapper>
      <View>
        <ULink external to={post.url} target="_blank">
          <ImageContainer>
            {imageUrl ? <Image source={{ uri: imageUrl }} /> : <Gradient title={title} />}
          </ImageContainer>
        </ULink>
      </View>
      <PostText>
        {postUrl ?
          <ULink to={postUrl}>
            <PostTitle>{title}</PostTitle>
          </ULink>
          : <PostTitle>{title}</PostTitle>
        }
        {/* <SecondaryText>
          { get(postUser, 'handle') &&
            <TextView>
              <Text>Posted by: </Text>
              <ULink to={`/user/profile/${postUser.handle}`} disabled={!postUrl}>
                {`@${get(postUser, 'handle')}`}
              </ULink>
            </TextView>
          }}
          { postUrl && timestamp }{' • '}
        </SecondaryText> */}

        <SecondaryText>
          { post.commentCount && postUrl ?
            <Text>
              <ULink to={postUrl} styles={'text-decoration: underline'} >
                {post.commentCount} Comment{post.commentCount > 1 ? 's' : ''}
              </ULink>
              <Text> • </Text>
            </Text> : null
          }
          {tags.length ?
            <Text>
              {tags.map(tag => <Tag name={tag} community={community} key={tag} />)}
              <Text>• </Text>
            </Text>
            : null}
          { get(link, 'domain') &&
            <Text>
              <ULink external to={post.url} external target="_blank" disabled={!postUrl} >
                {link.domain && `${link.domain} ↗`}
              </ULink>
            </Text>
          }
        </SecondaryText>
        {props.children}

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
