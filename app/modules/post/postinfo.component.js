import React, { Component } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import ULink from 'modules/navigation/ULink.component';
import Gradient from 'modules/post/gradient.component';
import { ActivityIndicator } from 'react-native-web';
import { View, Image } from 'modules/styled/uni';
import { getTitle, getFavIcon } from 'app/utils/post';
import PostInfoMobile from 'modules/post/postinfo.mobile.component';
import PostTitle from './postTitle.component';

export default class PostInfo extends Component {
  state = {
    showImage: true,
    showFavIcon: true
  };

  render() {
    const { post, link, firstPost, noLink, screenSize } = this.props;
    const { showImage, showFavIcon } = this.state;

    if (screenSize) return <PostInfoMobile {...this.props} />;
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

    const postImage = (
      <ULink external to={post.url} target="_blank" noLink={noLink}>
        <View flex={1} w={20} h={10} mr={2}>
          {showImage && imageUrl ? (
            <Image
              flex={1}
              source={{ uri: imageUrl }}
              onError={() => this.setState({ showImage: false })}
            />
          ) : showFavIcon && favIcon ? (
            <Image
              resizeMode="cover"
              flex={1}
              source={{ uri: favIcon }}
              onError={() => this.setState({ showFavIcon: false })}
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
        <PostTitle {...this.props} title={title} noLink={noLink} />
      </View>
    );

    if (post.url) return <View>{postContent}</View>;
    return postContent;
  }
}

PostInfo.propTypes = {
  noLink: PropTypes.bool,
  link: PropTypes.object,
  post: PropTypes.object,
  community: PropTypes.string,
  postUrl: PropTypes.string,
  firstPost: PropTypes.object,
  noLinks: PropTypes.bool,
  screenSize: PropTypes.number,
  auth: PropTypes.object.isRequired
};
