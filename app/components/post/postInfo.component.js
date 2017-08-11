import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  ActionSheetIOS,
  TouchableOpacity,
  Text,
  Image,
  Platform
} from 'react-native';
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
      buttons: [
        'Edit',
        'Delete',
        'Cancel',
      ],
      destructiveIndex: 2,
      cancelIndex: 3,
    };

    this.showActionSheet = this.showActionSheet.bind(this);
  }

  componentDidMount() {
    if (this.props.post) this.checkTime(this.props);

    if (this.props.auth && this.props.post.user && this.props.post.user._id && this.props.auth.user._id) {
      if (this.props.post.user._id === this.props.auth.user._id) {
        this.menu = this.ownerMenu;
        this.myPost = true;
      }
    }
  }

  componentWillReceiveProps(next) {
    this.checkTime(next);
  }

  deletePost() {
    let redirect = false;
    if (this.props.scene) {
      if (this.props.scene.component === 'singlePost') redirect = true;
    }
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
        description: this.props.post.description,
      },
      edit: true,
      editPost: this.props.post,
    });
    this.props.actions.push({
      key: 'createPost',
      back: true,
      title: 'Edit Post',
      next: 'Update'
    }, 'home');
  }

  setTag(tag) {
    if (!tag) return;
    this.props.actions.selectTag(tag);
    this.props.actions.changeTab('discover');
  }

  setSelected() {
    if (!this.props.actions) return;
    if (this.props.scene && this.props.scene.id === this.props.post.user._id) return;
    this.props.actions.goToProfile({
      name: this.props.post.embeddedUser.name,
      _id: this.props.post.user._id || this.props.post.user
    });
  }

  checkTime(props) {
    if (props.post) {
      let postTime = moment(props.post.createdAt);
      let fromNow = postTime.fromNow();
      let timeNow = moment();
      let dif = timeNow.diff(postTime);
      let threshold = 21600000;
      let passed = true;
      // if (dif >= threshold) passed = true;

      this.setState({
        passed,
        timeUntilString: moment.duration(threshold - dif).humanize(),
        timePassedPercent: dif / threshold,
      });

      this.setState({ posted: fromNow });
    }
  }

  showActionSheet() {
    if (this.myPost) {
      ActionSheet.showActionSheetWithOptions({
        options: this.menu.buttons,
        cancelButtonIndex: this.menu.cancelIndex,
        destructiveButtonIndex: this.menu.destructiveIndex,
      },
      (buttonIndex) => {
        switch (buttonIndex) {
          case 0:
            this.toggleEditing();
            break;
          case 1:
            this.deletePost();
            break;
          default:
            return;
        }
      });
    }
  }

  render() {
    let post = null;
    let postActions;

    post = this.props.post;

    let postTime = moment(post.createdAt);
    postTime = ' • ' + numbers.timeSince(postTime) + ' ago';

        // <Text
        //   allowFontScaling={false}
        //   style={[styles.greyText, styles.postButtonText, styles.dots]}
        // >
        //   ...
        // </Text>

    if (this.myPost) {
      postActions = (<TouchableOpacity
        style={[styles.postButton, { paddingRight: 10 }]}
        onPress={() => this.showActionSheet()}
      >
        <Icon name="ios-more" size={24} color={greyText} />
      </TouchableOpacity>);
    }

    // if (this.state.passed) {
    //   postInfo = (<Stats type={'value'} entity={post} />);
    // } else {
    //   postInfo = (
    //     <View style={[styles.countdown]}>
    //       <ToolTip
    //         ref={(tooltip) => { this.tooltip = tooltip; }}
    //         actions={[
    //           { text: 'Post value revealed 6 hours after creation' }
    //         ]}
    //         underlayColor={'transparent'}
    //         arrowDirection={'up'}
    //       >
    //         <View style={{ flexDirection: 'row' }}>
    //           <Progress.Pie
    //             style={styles.progressCirc}
    //             color={'#4d4eff'}
    //             progress={this.state.timePassedPercent}
    //             size={17}
    //           />
    //           <Text
    //             style={[styles.font17, styles.textRight, styles.darkGrey, styles.bebas]}
    //           >
    //             {this.state.timeUntilString}
    //           </Text>
    //         </View>
    //       </ToolTip>
    //     </View>
    //   );
    // }


    let user = post.user;
    if (user && !user.name) {
      user = {};
      user._id = post.user;
      user.image = post.embeddedUser.image;
      user.name = post.embeddedUser.name;
    }

    let userEl = (
      <UserName
        big={this.props.big}
        user={user}
        setSelected={this.setSelected}
        postTime={postTime}
      />
    );

    let info = (<View style={[styles.postHeader, this.props.preview ? { paddingTop: 10 } : null]}>
      <View style={styles.postInfo}>
        {userEl}
        <View
          style={[styles.infoRight]}
        >
          {this.props.repost ? null : postActions}
        </View>
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
            <View
              style={[styles.infoRight]}
            >
              {this.props.repost ? null : postActions}
            </View>
          </View>
        </View>
      );
    }

    // return this.myPost ? info : null;
    return info;
  }
}

export default PostInfo;

const localStyles = StyleSheet.create({
  countdown: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    flexDirection: 'row',
  },
  postInfo: {
    flex: 1,
    flexDirection: 'row',
    overflow: 'visible',
    alignItems: 'center',
    justifyContent: 'center',
  },
  repost: {
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'visible',
    paddingTop: 5,
    paddingBottom: 0,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'visible',
    paddingTop: 20,
  },
  progressCirc: {
    marginTop: -1,
    marginRight: 5,
  },
  infoLeft: {
    justifyContent: 'flex-start',
  },
  infoRight: {
    justifyContent: 'flex-end',
    overflow: 'visible',
  },
  innerInfo: {
    flex: 1,
    overflow: 'visible',
  },
});

styles = { ...globalStyles, ...localStyles };

