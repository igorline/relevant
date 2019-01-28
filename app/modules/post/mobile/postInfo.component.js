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
import AvatarBox from 'modules/user/avatarbox.component';
import { globalStyles, greyText } from 'app/styles/global';

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
    users: PropTypes.object,
    big: PropTypes.bool,
    preview: PropTypes.bool,
    repost: PropTypes.bool
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
      destructiveIndex: 2,
      cancelIndex: 3
    };

    this.showActionSheet = this.showActionSheet.bind(this);
  }

  componentDidMount() {
    const { post, auth } = this.props;
    const { user } = post;
    if (!user) return;
    const userId = user._id || user;
    if (auth && userId && userId === auth.user._id) {
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
    actions.push(
      {
        key: 'createPost',
        back: true,
        title: 'Edit Post',
        next: 'Update',
        left: 'Cancel'
      }
    );
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

    return actions.goToProfile({
      name: post.embeddedUser.name,
      _id: post.user._id || post.user
    });
  }

  showActionSheet() {
    if (this.myPost) {
      ActionSheet.showActionSheetWithOptions(
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
  }

  render() {
    const { post, users, big, preview, repost } = this.props;
    let postActions;

    if (!post.embeddedUser) return null;

    if (this.myPost) {
      postActions = (
        <TouchableOpacity
          style={[styles.postButton, { paddingRight: 10 }]}
          onPress={() => this.showActionSheet()}
        >
          <Icon name="ios-more" size={24} color={greyText} />
        </TouchableOpacity>
      );
    }

    let userId = post.user ? post.user._id || post.user : null;
    if (post.twitterUser) userId = post.twitterUser;
    let user = users[userId];

    if (!user || !user._id) {
      user = {};
      user = post.embeddedUser;
      if (post.twitter) {
        user._id = user.handle;
      }
    }

    const userEl = (
      <AvatarBox
        user={user}
        setSelected={this.setSelected}
        postTime={post.postDate}
        twitter={post.twitter}
        showRelevance
      />
    );

    let info = (
      <View style={[styles.postHeader, preview ? { paddingTop: 10 } : null]}>
        <View style={styles.postInfo}>
          {userEl}
          <View style={[styles.infoRight]}>{repost ? null : postActions}</View>
        </View>
      </View>
    );

    if (repost) {
      info = (
        <View style={styles.repost}>
          <View style={styles.postInfo}>
            <UserName
              repost
              big={big}
              user={user}
              setSelected={this.setSelected}
              postTime={post.postDate}
            />
            <View style={[styles.infoRight]}>
              {this.props.repost ? null : postActions}
            </View>
          </View>
        </View>
      );
    }

    return info;
  }
}

export default PostInfo;

const localStyles = StyleSheet.create({
  countdown: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    flexDirection: 'row'
  },
  postInfo: {
    flex: 1,
    flexDirection: 'row',
    overflow: 'visible',
    alignItems: 'center',
    justifyContent: 'center'
  },
  repost: {
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'visible',
    paddingTop: 5,
    paddingBottom: 0
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'visible',
    paddingTop: 20
  },
  progressCirc: {
    marginTop: -1,
    marginRight: 5
  },
  infoLeft: {
    justifyContent: 'flex-start'
  },
  infoRight: {
    justifyContent: 'flex-end',
    overflow: 'visible'
  },
  innerInfo: {
    flex: 1,
    overflow: 'visible'
  }
});

styles = { ...globalStyles, ...localStyles };
