import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash.get';
import ULink from 'modules/navigation/ULink.component';
import Gradient from 'modules/post/gradient.component';
import styled from 'styled-components/primitives';
import { View, Image } from 'modules/styled/uni';
import { colors } from 'app/styles';
import { getFavIcon, getTitle } from 'app/utils/post';
import PostTitle from './postTitle.component';
import PostButtons from './postbuttons.component';

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

const IMAGE_HEIGHT = 40;
const PREVIEW_HEIGHT = 16;

export default function ImagePost(props) {
  const { post, link, goToPost, actions, preview, noLink } = props;

  if (!post) return null;
  const imageUrl = get(link, 'image');
  const favIcon = get(link, 'domain', null) && getFavIcon(link.domain);
  const title = getTitle({ post, link });

  const imgBg = (imageUrl || favIcon) && (
    <View flex={1}>
      <Image resizeMode="cover" flex={1} source={{ uri: imageUrl || favIcon }} />
      <GradientContainer>
        <Gradient flex={1} title={title} image={true} preview={preview} />
      </GradientContainer>
    </View>
  );

  const imageHeight = preview ? PREVIEW_HEIGHT : IMAGE_HEIGHT;

  const postContent = (
    <View fdirection={'row'}>
      <ULink
        onPress={goToPost}
        external
        to={post.url}
        target="_blank"
        onPress={() => actions.goToUrl(post.url)}
        noLink={noLink}
      >
        <View h={imageHeight} flex={1}>
          {imgBg || <Gradient flex={1} title={title} />}
        </View>
      </ULink>

      <TitleContainer fdirection={'row'} p={'0 2 2 0'} pl={preview ? 2 : 0}>
        {!preview && (
          <View w={7} pt={1}>
            <PostButtons color={colors.white} post={post} {...props} />
          </View>
        )}
        <PostTitle {...props} title={title} mobile />
      </TitleContainer>
    </View>
  );

  if (post.url) return <View>{postContent}</View>;
  return postContent;
}

ImagePost.propTypes = {
  noLink: PropTypes.bool,
  link: PropTypes.object,
  post: PropTypes.object,
  community: PropTypes.string,
  postUrl: PropTypes.string,
  firstPost: PropTypes.object
};
