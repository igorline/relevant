import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  ActionSheetIOS,
  TouchableOpacity,
  Text,
  Image,
  Platform,
  Linking
} from 'react-native';
import PropTypes from 'prop-types';
import RNBottomSheet from 'react-native-bottom-sheet';
import Icon from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import UserName from '../userNameSmall.component';
import { globalStyles, greyText } from '../../styles/global';
import { numbers } from '../../utils';

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
    edit: PropTypes.bool,
    delete: PropTypes.func,
    users: PropTypes.array,
    big: PropTypes.bool,
    preview: PropTypes.bool,
    repost: PropTypes.object
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
    // if (this.props.post) this.checkTime(this.props);
    const user = this.props.post.user;
    if (!user) return;
    const userId = user._id || user;
    if (this.props.auth && userId && userId === this.props.auth.user._id) {
      this.menu = this.ownerMenu;
      this.myPost = true;
    }
  }

  componentWillReceiveProps(next) {
    // this.checkTime(next);
  }

  deletePost() {
    let redirect = false;
    if (this.props.singlePost) redirect = true;
    this.props.actions.deletePost(this.props.post, redirect);
  }

  toggleEditing() {
    this.props.actions.setCreaPostState({
      postBody: this.props.post.body,
      nativeImage: true,
      postUrl: this.props.post.link,
      postImage: this.props.post.image,
      allTags: this.props.post.tags,
      urlPreview: {
        image: this.props.post.image,
        title: this.props.post.title ? this.props.post.title : 'Untitled',
        description: this.props.post.description
      },
      edit: true,
      editPost: this.props.post
    });
    this.props.actions.push(
      {
        key: 'createPost',
        back: true,
        title: 'Edit Post',
        next: 'Update'
      },
      'home'
    );
  }

  setTag(tag) {
    if (!tag) return;
    this.props.actions.selectTag(tag);
    this.props.actions.changeTab('discover');
  }

  setSelected() {
    if (!this.props.actions) return null;

    if (this.props.post.twitter) {
      return Linking.openURL('https://twitter.com/' + this.props.post.embeddedUser.handle);
    }

    return this.props.actions.goToProfile({
      name: this.props.post.embeddedUser.name,
      _id: this.props.post.user._id || this.props.post.user
    });
  }

  // checkTime(props) {
  //   if (props.post) {
  //     let postTime = moment(props.post.createdAt);
  //     let fromNow = postTime.fromNow();
  //     let timeNow = moment();
  //     let dif = timeNow.diff(postTime);
  //     let threshold = 21600000;
  //     let passed = true;
  //     // if (dif >= threshold) passed = true;

  //     this.setState({
  //       passed,
  //       timeUntilString: moment.duration(threshold - dif).humanize(),
  //       timePassedPercent: dif / threshold,
  //     });

  //     this.setState({ posted: fromNow });
  //   }
  // }

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
              this.props.edit ? this.props.edit() : this.toggleEditing();
              break;
            case 1:
              this.props.delete ? this.props.delete() : this.deletePost();
              break;
            default:
          }
        }
      );
    }
  }

  render() {
    let post = null;
    let postActions;

    post = this.props.post;

    if (!post.embeddedUser) return null;

    let postTime = moment(post.createdAt);
    postTime = ' • ' + numbers.timeSince(postTime) + ' ago';

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
    let user = this.props.users[userId];

    if (!user || !user._id) {
      user = {};
      user = post.embeddedUser;
      if (post.twitter) {
        user._id = user.handle;
      }
    }

    const userEl = (
      <UserName
        big={this.props.big}
        user={user}
        setSelected={this.setSelected}
        postTime={postTime}
        twitter={post.twitter}
      />
    );

    let info = (
      <View style={[styles.postHeader, this.props.preview ? { paddingTop: 10 } : null]}>
        <View style={styles.postInfo}>
          {userEl}
          <View style={[styles.infoRight]}>{this.props.repost ? null : postActions}</View>
        </View>
      </View>
    );

    if (this.props.repost) {
      info = (
        <View style={styles.repost}>
          <View style={styles.postInfo}>
            <UserName
              repost
              big={this.props.big}
              user={user}
              setSelected={this.setSelected}
              postTime={postTime}
            />
            <View style={[styles.infoRight]}>{this.props.repost ? null : postActions}</View>
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
