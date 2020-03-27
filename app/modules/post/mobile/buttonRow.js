import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { ActionSheetIOS, TouchableOpacity, Platform, Linking } from 'react-native';
import RNBottomSheet from 'react-native-bottom-sheet';
import Share from 'react-native-share';
import { getPostUrl, getTitle } from 'app/utils/post';
import { push, goToPost } from 'modules/navigation/navigation.actions';
import { setCreatePostState } from 'modules/createPost/createPost.actions';
import { CTALink, View } from 'modules/styled/uni';
import { colors } from 'app/styles';
import { useAuth } from 'modules/auth/hooks';

let ActionSheet = ActionSheetIOS;

if (Platform.OS === 'android') {
  ActionSheet = RNBottomSheet;
  ActionSheet.showActionSheetWithOptions = RNBottomSheet.showBottomSheetWithOptions;
}

const linkMenu = {
  buttons: ['Repost Article', 'Share Via...', 'Open Link in Browser', 'Cancel'],
  cancelIndex: 3
};

const defaultMenu = {
  buttons: ['Share Via...', 'Cancel'],
  cancelIndex: 2
};

ButtonRow.propTypes = {
  singlePost: PropTypes.bool,
  focusInput: PropTypes.func,
  link: PropTypes.object,
  comment: PropTypes.object,
  setupReply: PropTypes.func,
  post: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  parentPost: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  auth: PropTypes.object
};

export default memo(ButtonRow);

function ButtonRow({
  link,
  post,
  parentPost,
  singlePost,
  focusInput,
  comment,
  setupReply,
  auth
}) {
  const dispatch = useDispatch();

  const menu = link ? linkMenu : defaultMenu;
  const hasAuth = useAuth();

  const onShare = () => {
    const { community } = auth;
    if (!hasAuth()) return;
    const postUrl = getPostUrl(community, post);
    const title = getTitle({ post });
    Share.open({
      title: title || '',
      url: 'https://relevant.community' + postUrl,
      subject: 'Share Link'
    }).catch(err => console.log(err)); // eslint-disable-line
  };

  function showActionSheet() {
    if (!hasAuth()) return;
    ActionSheet.showActionSheetWithOptions(
      {
        options: menu.buttons,
        cancelButtonIndex: menu.cancelIndex,
        destructiveButtonIndex: menu.destructiveIndex
      },
      buttonIndex => {
        if (link) {
          switch (buttonIndex) {
            case 0:
              return repostUrl();
            case 1:
              return onShare();
            case 2:
              return Linking.openURL(link.url);
            default:
              return null;
          }
        }
        switch (buttonIndex) {
          case 0:
            return onShare();
          default:
            return null;
        }
      }
    );
  }

  function repostUrl() {
    if (!hasAuth()) return;
    if (!link) return;
    dispatch(
      setCreatePostState({
        postBody: '',
        component: 'createPost',
        nativeImage: true,
        postUrl: link.url,
        postImage: link.image,
        urlPreview: {
          image: link.image,
          title: link.title ? link.title : 'Untitled',
          description: link.description
        }
      })
    );

    dispatch(push({ key: 'createPost', title: 'Add Commentary' }));
  }

  function NavigateToPost(openComment) {
    if (openComment && !hasAuth()) return;

    const _parentPost = parentPost || post;
    const parentPostId = _parentPost._id || _parentPost;

    // console.log('click NAVIGATE TO POST', parentPostId);
    if (singlePost) {
      // console.log('setup reply');
      // console.log('post id', get(navigation, 'state.params.id'));
      if (setupReply) setupReply(post);
      if (focusInput) focusInput();
      return;
    }

    dispatch(goToPost({ _id: parentPostId, comment }, openComment));
  }

  const isLink = !post.parentPost && post.url;

  return (
    <View fdirection={'row'}>
      <TouchableOpacity
        onPress={() => (isLink ? repostUrl() : NavigateToPost(true))}
        style={{ paddingHorizontal: 12 }}
      >
        <View style={[{ flexDirection: 'row', alignItems: 'center' }]}>
          <CTALink c={colors.blue}>{isLink ? 'Comment' : 'Reply'}</CTALink>
          {post.commentCount && !isLink ? (
            <CTALink> ({post.commentCount})</CTALink>
          ) : null}
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={{ paddingRight: 8 }} onPress={() => showActionSheet()}>
        <View style={[{ flexDirection: 'column', alignItems: 'center' }]}>
          <CTALink c={colors.blue}>Share</CTALink>
        </View>
      </TouchableOpacity>
    </View>
  );
}
