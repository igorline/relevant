import React, { memo, useState } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import ULink from 'modules/navigation/ULink.component';
import Gradient from 'modules/post/gradient.component';
import { ActivityIndicator } from 'react-native-web';
import { View, Image } from 'modules/styled/uni';
import { getTitle, getFavIcon } from 'app/utils/post';
import PostInfoMobile from 'modules/post/postinfo.mobile.component';
import { POST_IMAGE_W, POST_IMAGE_H } from 'styles/layout';
import PostTitle from './postTitle.component';

PostInfo.propTypes = {
  noLink: PropTypes.bool,
  link: PropTypes.object,
  post: PropTypes.object,
  singlePost: PropTypes.bool,
  preview: PropTypes.bool
};

export default memo(PostInfo);

function PostInfo({ post, link, noLink, singlePost, preview }) {
  const [showImage, setShowImage] = useState(true);
  const [showFavIcon, setShowFavIcon] = useState(true);
  const screenSize = useSelector(state => state.navigation.screenSize);

  if (screenSize)
    return (
      <PostInfoMobile
        preview={preview}
        post={post}
        singlePost={singlePost}
        noLink={noLink}
        link={link}
      />
    );

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
  const title = getTitle({ post, link });

  const postImage = (
    <ULink external to={post.url} target="_blank" noLink={noLink}>
      <View flex={1} w={POST_IMAGE_W} h={POST_IMAGE_H} mr={2}>
        {showImage && imageUrl ? (
          <Image
            flex={1}
            source={{ uri: imageUrl }}
            onError={() => setShowImage(false)}
          />
        ) : showFavIcon && favIcon ? (
          <Image
            resizeMode="cover"
            flex={1}
            source={{ uri: favIcon }}
            onError={() => setShowFavIcon(false)}
          />
        ) : (
          <Gradient flex={1} title={title} />
        )}
      </View>
    </ULink>
  );

  const postContent = (
    <View fdirection={['row', 'column']}>
      {postImage}
      <PostTitle
        post={post}
        link={link}
        noLink={noLink}
        title={title}
        singlePost={singlePost}
        preview={preview}
      />
    </View>
  );

  if (post.url) return <View>{postContent}</View>;
  return postContent;
}
