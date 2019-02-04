import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash.get';
import ULink from 'modules/navigation/ULink.component';
import Tag from 'modules/tag/tag.component';
import Gradient from 'modules/post/gradient.component';
import { ActivityIndicator } from 'react-native-web';
import { View, Image, Title, SecondaryText, InlineText } from 'modules/styled/uni';


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

  const titleEl = postUrl ?
    <ULink to={postUrl}><Title flex={1}>{title}</Title></ULink> :
    <Title flex={1}>{title}</Title>;

  const commentEl = post.commentCount && postUrl ?
    <InlineText>
      <ULink to={postUrl} styles={'text-decoration: underline'} >
        {post.commentCount} Comment{post.commentCount > 1 ? 's' : ''}
      </ULink>
      <InlineText> • </InlineText>
    </InlineText> : null;

  const tagEl = tags.length ?
    <InlineText>
      {tags.map(tag => <Tag name={tag} community={community} key={tag} />)}
      <InlineText>• </InlineText>
    </InlineText> : null;

  const domainEl = get(link, 'domain') &&
    <InlineText style={{ whiteSpace: 'nowrap' }}>
      <ULink external to={post.url} target="_blank" disabled={!postUrl} >
        {link.domain && `${link.domain} ↗`}
      </ULink>
    </InlineText>;

  // const userEl = get(postUser, 'handle') &&
  //   <TextView>
  //     <Text>Posted by: </Text>
  //     <ULink to={`/user/profile/${postUser.handle}`} disabled={!postUrl}>
  //       {`@${get(postUser, 'handle')}`}
  //     </ULink>
  //   </TextView>;

  const postContent = (
    <View direction={'row'}>
      <ULink external to={post.url} target="_blank">
        <View flex={1} w={20} h={10} mr={2}>
          {imageUrl ?
            <Image flex={1} source={{ uri: imageUrl }} /> :
            <Gradient flex={1} title={title} />}
        </View>
      </ULink>

      <View flex={1} direction={'column'}>
        {titleEl}
        {/* {postUrl && timestamp }{' • '} */}
        <SecondaryText>
          <InlineText>
            {commentEl}
            {tagEl}
            {domainEl}
          </InlineText>
        </SecondaryText>
        {props.children}
      </View>
    </View>
  );

  if (post.url) return <View>{postContent}</View>;
  return postContent;
}

PostInfo.propTypes = {
  link: PropTypes.object,
  post: PropTypes.object,
  community: PropTypes.string,
  postUrl: PropTypes.string,
  firstPost: PropTypes.object,
};
