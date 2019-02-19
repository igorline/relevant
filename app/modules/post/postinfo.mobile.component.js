import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash.get';
import ULink from 'modules/navigation/ULink.component';
import Gradient from 'modules/post/gradient.component';
import styled from 'styled-components/primitives';
import { View, Image } from 'modules/styled/uni';
import { colors } from 'app/styles';
import { getFavIcon } from 'app/utils/post';
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

export default function ImagePost(props) {
  const { post, link, title, goToPost, actions } = props;

  if (!post) return null;
  const imageUrl = get(link, 'image') || (link.domain && getFavIcon(link.domain));

  const imgBg = imageUrl && (
    <View flex={1}>
      <Image resizeMode="cover" flex={1} source={{ uri: imageUrl }} />
      <GradientContainer>
        <Gradient flex={1} title={title} image={true} />
      </GradientContainer>
    </View>
  );

  const postContent = (
    <View fdirection={'row'}>
      <ULink
        onPress={goToPost}
        external
        to={post.url}
        target="_blank"
        onPress={() => actions.goToUrl(post.url)}
      >
        <View h={IMAGE_HEIGHT} flex={1}>
          {imgBg || <Gradient flex={1} title={title} />}
        </View>
      </ULink>

      <TitleContainer fdirection={'row'} p={'0 2 2 0'}>
        <View w={7} pt={1}>
          <PostButtons color={colors.white} post={post} {...props} />
        </View>
        <PostTitle {...props} title={title} mobile={true} />
      </TitleContainer>
    </View>
  );

  if (post.url) return <View>{postContent}</View>;
  return postContent;
}

ImagePost.propTypes = {
  link: PropTypes.object,
  post: PropTypes.object,
  community: PropTypes.string,
  postUrl: PropTypes.string,
  firstPost: PropTypes.object
};
