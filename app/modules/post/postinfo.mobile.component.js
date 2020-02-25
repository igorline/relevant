import React, { memo } from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import ULink from 'modules/navigation/ULink.component';
import Gradient from 'modules/post/gradient.component';
import styled from 'styled-components/primitives';
import { View, Image } from 'modules/styled/uni';
import { getFavIcon, getTitle } from 'app/utils/post';
import UrlPreview from 'modules/createPost/mobile/urlPreview.component';
import { goToUrl } from 'modules/navigation/navigation.actions';
import PostTitle from './postTitle.component';

const GradientContainer = styled(View)`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
`;

const TitleContainer = styled(View)`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
`;

const IMAGE_HEIGHT = 30;
const PREVIEW_HEIGHT = 16;

ImagePost.propTypes = {
  noLink: PropTypes.bool,
  link: PropTypes.object,
  post: PropTypes.object,
  singlePost: PropTypes.bool,
  preview: PropTypes.bool,
  goToPost: PropTypes.func
};

export default memo(ImagePost);

function ImagePost(props) {
  const dispatch = useDispatch();
  const { post, link, goToPost, preview, noLink } = props;

  if (!post) return null;
  const imageUrl = get(link, 'image');
  const favIcon = get(link, 'domain', null) && getFavIcon(link.domain);
  const title = getTitle({ post, link });
  const image = imageUrl || favIcon;

  const imgBg = image && (
    <View flex={1}>
      <Image resizeMode="cover" flex={1} source={{ uri: image }} />
      <GradientContainer>
        <Gradient flex={1} title={title} image={true} preview={preview} />
      </GradientContainer>
    </View>
  );

  const imageHeight = preview ? PREVIEW_HEIGHT : IMAGE_HEIGHT;
  const postContent = (
    <View
      // shouldRasterizeIOS
      // renderToHardwareTextureAndroid
      fdirection={'row'}
    >
      <ULink
        onPress={goToPost || (() => dispatch(goToUrl(post.url)))}
        external
        to={post.url}
        target="_blank"
        noLink={noLink}
        style={{ flex: 1 }}
      >
        <View h={imageHeight}>{imgBg || <Gradient flex={1} title={title} />}</View>
      </ULink>

      <TitleContainer fdirection={'row'} p={'0 2 2 2'} pl={preview ? 2 : 0}>
        <PostTitle ml={2} {...props} title={title} mobile />
      </TitleContainer>
    </View>
  );

  if (preview) {
    return (
      <UrlPreview
        size="small"
        urlPreview={link || post}
        title={title}
        image={image}
        noLink={noLink}
      />
    );
  }

  if (post.url) return <View>{postContent}</View>;
  return postContent;
}
