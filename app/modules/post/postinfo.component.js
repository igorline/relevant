import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash.get';
import ULink from 'modules/navigation/ULink.component';
import Gradient from 'modules/post/gradient.component';
import { ActivityIndicator } from 'react-native-web';
import { View, Image } from 'modules/styled/uni';
import { getTitle, getFavIcon } from 'app/utils/post';
import PostTitle from './postTitle.component';

export default function PostInfo(props) {
  const { post, link, firstPost, noLink } = props;
  if (post.loading) {
    return (
      <View>
        <ActivityIndicator />
      </View>
    );
  }
  if (!post) return null;
  const imageUrl = get(link, 'image') || null;
  const favIcon = get(link, 'domain') && getFavIcon(link.domain);
  const title = getTitle({ post, link, firstPost });

  const postContent = (
    <View fdirection={['row', 'column']}>
      <ULink external to={post.url} target="_blank" noLink={noLink}>
        <View flex={1} w={20} h={10} mr={2}>
          {imageUrl ? (
            <Image flex={1} source={{ uri: imageUrl }} />
          ) : favIcon ? (
            <Image resizeMode="cover" flex={1} source={{ uri: favIcon }} />
          ) : (
            <Gradient flex={1} title={title} />
          )}
        </View>
      </ULink>
      <PostTitle {...props} title={title} noLink={noLink} />
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
  noLinks: PropTypes.bool
};
