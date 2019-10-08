import React from 'react';
import PropTypes from 'prop-types';
import Tag from 'modules/tag/tag.component';
import get from 'lodash/get';
import ULink from 'modules/navigation/ULink.component';
import { View, Title, SecondaryText, InlineText } from 'modules/styled/uni';
import styled from 'styled-components/primitives';
import { colors, sizing } from 'app/styles';

const Mobile = styled.View`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  color: white;
  padding: ${sizing(2)};
`;

export default function PostTitle(props) {
  const { children, postUrl, post, link, community, title, mobile } = props;

  const c = mobile ? colors.white : null;
  const Wrapper = mobile ? Mobile : View;

  if (!post) return null;
  const tags = post.tags && post.tags.length ? get(post, 'tags', []) : [];

  const titleEl = postUrl ? (
    <ULink to={postUrl}>
      <Title c={c} flex={1}>
        {title}
      </Title>
    </ULink>
  ) : (
    <Title c={c} flex={1} mb={4}>
      {title}
    </Title>
  );

  const commentEl =
    post.commentCount && postUrl ? (
      <InlineText>
        <ULink to={postUrl}>
          <InlineText>
            {post.commentCount} Comment{post.commentCount > 1 ? 's' : ''}
          </InlineText>
        </ULink>
        <InlineText> • </InlineText>
      </InlineText>
    ) : null;

  const tagEl = tags.length ? (
    <InlineText>
      {tags.map(tag => (
        <Tag name={tag} community={community} key={tag} />
      ))}
      <InlineText>• </InlineText>
    </InlineText>
  ) : null;

  const domainEl = get(link, 'domain') && (
    <InlineText>
      <ULink external to={post.url} target="_blank" disabled={!postUrl}>
        <InlineText c={c}>{link.domain && `${link.domain} ↗`}</InlineText>
      </ULink>
    </InlineText>
  );

  // const userSet = new Set();
  // (get(post, 'commentary', []) || []).forEach(user => userSet.add(user.id));

  // const timestamp = getTimestamp(post.postDate);
  // const uniqueUsers = userSet.size - 1;
  // let postUser;
  // if (get(post, 'embeddedUser.handle')) {
  //   postUser = post.embeddedUser;
  // } else if (get(firstPost, 'embeddedUser.handle')) {
  //   postUser = firstPost.embeddedUser;
  // }

  // const userEl = get(postUser, 'handle') &&
  //   <TextView>
  //     <Text>Posted by: </Text>
  //     <ULink to={`/user/profile/${postUser.handle}`} disabled={!postUrl}>
  //       {`@${get(postUser, 'handle')}`}
  //     </ULink>
  //   </TextView>;

  return (
    <Wrapper flex={1} fdirection={'column'}>
      <View>
        {titleEl}
        {/* {postUrl && timestamp }{' • '} */}
        <SecondaryText c={c}>
          <InlineText>
            {commentEl}
            {tagEl}
            {domainEl}
          </InlineText>
        </SecondaryText>
        {children}
      </View>
    </Wrapper>
  );
}

PostTitle.propTypes = {
  mobile: PropTypes.bool,
  children: PropTypes.node,
  link: PropTypes.object,
  post: PropTypes.object,
  community: PropTypes.string,
  postUrl: PropTypes.string,
  title: PropTypes.string
};
