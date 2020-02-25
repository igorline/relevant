import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  ActionSheetIOS,
  TouchableOpacity,
  Platform,
  Linking
} from 'react-native';
import PropTypes from 'prop-types';
import RNBottomSheet from 'react-native-bottom-sheet';
import Icon from 'react-native-vector-icons/Ionicons';
import { globalStyles, greyText } from 'app/styles/global';
import CommentAuthor from 'modules/comment/comment.author';

let ActionSheet = ActionSheetIOS;
if (Platform.OS === 'android') {
  ActionSheet = RNBottomSheet;
  ActionSheet.showActionSheetWithOptions = RNBottomSheet.showBottomSheetWithOptions;
}
let styles;

class PostInfo extends Component {
  static propTypes = {
    post: PropTypes.object,
    auth: PropTypes.object,
    singlePost: PropTypes.bool,
    actions: PropTypes.object,
    edit: PropTypes.func,
    delete: PropTypes.func,
    preview: PropTypes.bool,
    repost: PropTypes.bool,
    user: PropTypes.object,
    avatarText: PropTypes.func
  };

  constructor(props, context) {
    super(props, context);
    this.setTag = this.setTag.bind(this);
    this.setSelected = this.setSelected.bind(this);
    this.state = {
      passed: false,
      invested: false,
      timeUntilString: null,
      timePassedPercent: 0,
      time: 0,
      posted: null,
      input: null
    };

    this.ownerMenu = {
      myPost: true,
      buttons: ['Edit', 'Delete', 'Cancel'],
      destructiveIndex: 1,
      cancelIndex: 2
    };

    this.showActionSheet = this.showActionSheet.bind(this);
  }

  componentDidMount() {
    const { auth, user } = this.props;
    if (!user) return;
    if (auth && auth.user && user._id === auth.user._id) {
      this.menu = this.ownerMenu;
      this.myPost = true;
    }
  }

  deletePost() {
    const { singlePost, actions, post } = this.props;
    let redirect = false;
    if (singlePost) redirect = true;
    actions.deletePost(post, redirect);
  }

  toggleEditing() {
    const { post, actions } = this.props;
    actions.setCreatePostState({
      postBody: post.body,
      nativeImage: true,
      postUrl: post.link,
      postImage: post.image,
      allTags: post.tags,
      urlPreview: {
        image: post.image,
        title: post.title ? post.title : 'Untitled',
        description: post.description
      },
      edit: true,
      editPost: post
    });
    actions.push({
      key: 'createPost',
      back: true,
      title: 'Edit Post',
      next: 'Update',
      left: 'Cancel'
    });
  }

  setTag(tag) {
    const { actions } = this.props;
    if (!tag) return;
    actions.selectTag(tag);
    actions.changeTab('discover');
  }

  setSelected() {
    const { actions, post } = this.props;
    if (!actions) return null;

    if (this.props.post.twitter) {
      return Linking.openURL('https://twitter.com/' + post.embeddedUser.handle);
    }

    return actions.goToProfile(post.embeddedUser);
  }

  showActionSheet() {
    const { post, actions } = this.props;
    if (this.myPost) {
      return ActionSheet.showActionSheetWithOptions(
        {
          options: this.menu.buttons,
          cancelButtonIndex: this.menu.cancelIndex,
          destructiveButtonIndex: this.menu.destructiveIndex
        },
        buttonIndex => {
          switch (buttonIndex) {
            case 0:
              if (this.props.edit) this.props.edit();
              else this.toggleEditing();
              break;
            case 1:
              if (this.props.delete) this.props.delete();
              else this.deletePost();
              break;
            default:
          }
        }
      );
    }

    return ActionSheet.showActionSheetWithOptions(
      {
        options: ['Flag Inappropriate Content', 'Cancel'],
        cancelButtonIndex: 1
      },
      buttonIndex => {
        switch (buttonIndex) {
          case 0:
            actions.flag(post);
            break;
          default:
        }
      }
    );
  }

  render() {
    const { post, preview, repost, user, avatarText } = this.props;
    if (!user) return null;

    const postActions = (
      <TouchableOpacity
        style={[styles.postButton, { paddingRight: 10 }]}
        onPress={() => this.showActionSheet()}
      >
        <Icon name="ios-more" size={24} color={greyText} />
      </TouchableOpacity>
    );

    const popup = <View style={[styles.infoRight]}>{repost ? null : postActions}</View>;

    return (
      <CommentAuthor
        avatarText={avatarText}
        comment={post}
        user={user}
        popup={!preview && popup}
        preview={preview}
      />
    );
  }
}

export default PostInfo;

const localStyles = StyleSheet.create({
  infoRight: {
    justifyContent: 'flex-end',
    overflow: 'visible'
  }
});

styles = { ...globalStyles, ...localStyles };
