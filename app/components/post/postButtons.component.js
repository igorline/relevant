import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  TouchableWithoutFeedback,
  ActionSheetIOS,
  Alert,
  Image
} from 'react-native';
import Share from 'react-native-share';

import { globalStyles, fullWidth } from '../../styles/global';
import InvestModal from './investModal.component';
import { numbers } from '../../utils';

let styles;

class PostButtons extends Component {
  constructor(props, context) {
    super(props, context);
    this.onShare = this.onShare.bind(this);
    this.goToPost = this.goToPost.bind(this);
    this.invest = this.invest.bind(this);
    this.state = {
      editing: false,
      modalVisible: false,
      expanded: false,
    };

    this.linkMenu = {
      buttons: [
        'New Post',
        'Repost Commentary',
        'Share',
        'Cancel',
      ],
      cancelIndex: 4,
    };

    this.menu = {
      buttons: [
        'Repost Commentary',
        'Share',
        'Cancel',
      ],
      cancelIndex: 3,
    };

    this.ownerMenu = {
      myPost: true,
      buttons: [
        'Share',
        'Edit',
        'Delete',
        'Cancel',
      ],
      destructiveIndex: 2,
      cancelIndex: 3,
    };

    // this.toggleModal = this.toggleModal.bind(this);
    this.showActionSheet = this.showActionSheet.bind(this);
    this.irrelevant = this.irrelevant.bind(this);
    this.irrelevantPrompt = this.irrelevantPrompt.bind(this);
    this.goToPost = this.goToPost.bind(this);
  }

  componentDidMount() {
    if (this.props.post.link) this.menu = this.linkMenu;
  }

  onShare() {
    Share.open({
      title: 'Relevant',
      url: this.props.post.link ? this.props.post.link : 'http://relevant-community.herokuapp.com/',
      subject: 'Share Link',
      message: this.props.post.title ? 'Relevant post: ' + this.props.post.title : 'Relevant post:'
    }, (e) => {
      console.log(e);
    });
  }

  toggleTooltip() {
    let your = 'upvote';
    if (this.props.post.user._id === this.props.auth.user._id) {
      your = 'post';
    }
    this.tooltipData = {
      vertical: 'top',
      horizontal: 'left',
      horizontalOffset: 3,
      name: 'earnings',
      verticalOffset: 16,
      text: 'This is how much\nrelevance you earned\nfrom your ' + your
    };

    this.tooltipParent.measureInWindow((x, y, w, h) => {
      let parent = { x, y, w, h };
      this.props.navigator.showTooltip({
        ...this.tooltipData,
        parent
      });
    });
  }

  toggleModal(bool) {
    if (!bool) bool = !this.state.modalVisible;
    this.setState({ modalVisible: bool });
  }

  invest() {
    let investAmount = 1;
    // this.props.actions.triggerAnimation('invest');
    // return;

    this.props.actions.invest(
      this.props.auth.token,
      investAmount,
      this.props.post,
      this.props.auth.user
    )
    .then((results) => {
      if (results) {
        this.props.actions.triggerAnimation('invest');
        if (!this.props.posts.feed.length) {
          this.props.navigator.reloadTab('read');
        }
        setTimeout(() => {
          let name = this.props.post.embeddedUser.name;
          Alert.alert('You have subscribed to receive ' + results.subscription.amount + ' posts from ' + name);
        }, 1500);
      }
    });
  }

  showActionSheet() {
    ActionSheetIOS.showActionSheetWithOptions({
      options: this.menu.buttons,
      cancelButtonIndex: this.menu.cancelIndex,
      destructiveButtonIndex: this.menu.destructiveIndex,
    },
    (buttonIndex) => {
      if (this.props.post.link) {
        switch (buttonIndex) {
          case 0:
            if (this.props.post.link) this.repostUrl();
            else return;
            break;
          case 1:
            this.repostCommentary();
            break;
          case 2:
            this.onShare();
            break;
          default:
            return;
        }
      } else {
        switch (buttonIndex) {
          case 0:
            this.repostCommentary();
            break;
          case 1:
            this.onShare();
            break;
          default:
            return;
        }
      }
    });
  }

  repostCommentary() {
    this.props.actions.setCreaPostState({
      postBody: '',
      repost: this.props.post,
      urlPreview: {
        image: this.props.post.image,
        title: this.props.post.title ? this.props.post.title : 'Untitled',
        description: this.props.post.description,
      }
    });
    this.props.actions.push({
      key: 'createPost',
      back: true,
      title: 'Create Post',
      next: 'Post',
      direction: 'vertical'
    }, 'home');
  }

  repostUrl() {
    this.props.actions.setCreaPostState({
      postBody: '',
      nativeImage: true,
      postUrl: this.props.post.link,
      postImage: this.props.post.image,
      urlPreview: {
        image: this.props.post.image,
        title: this.props.post.title ? this.props.post.title : 'Untitled',
        description: this.props.post.description,
      }
    });
    this.props.actions.push({
      key: 'createPost',
      back: true,
      title: 'Create Post',
      next: 'Next',
      direction: 'vertical'
    }, 'home');
  }

  goToPost() {
    if (this.props.scene) {
      if (this.props.scene.id === this.props.post._id) return;
    }
    let openComment = false;
    if (!this.props.post.commentCount) openComment = true;
    this.props.navigator.goToPost(this.props.post, openComment);
  }

  irrelevantPrompt() {
    Alert.alert(
      'Irrelevant',
      'Do you feel this post is irrelevant? Marking something irrelevant costs 1 coin and will reduce the author\'s relevance score',
      [
        { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
        { text: 'OK', onPress: () => this.irrelevant() },
      ]
    );
  }

  irrelevant() {
    // this.props.actions.triggerAnimation('invest', -1);
    // this.props.actions.triggerAnimation('irrelevant', -1);
    // return;

    this.props.actions.invest(this.props.auth.token, -1, this.props.post, this.props.auth.user)
    .then((results) => {
      if (results) {
        this.props.actions.triggerAnimation('invest', -1);
        this.props.actions.triggerAnimation('irrelevant', -1);
      } else {
        console.log('irrelevant failed');
      }
    });
  }

  render() {
    let investButtonEl = null;
    let post = this.props.post;
    let investable = false;
    let irrelevantButton;
    let commentString = 'comment';
    let earnings;

    if (post && post.user && this.props.auth.user) {
      if (post.user._id !== this.props.auth.user._id) {
        if (this.props.myInvestments.indexOf(post._id) === -1) {
          investable = true;
        }
      }
      earnings = this.props.myEarnings[post._id];
    }

    if (post && post.commentCount) {
      if (post.commentCount === 1) commentString = '1 comment';
      else commentString = post.commentCount + ' comments';
    }

    investButtonEl = (<TouchableWithoutFeedback
      onPress={() => investable ? this.invest() : null}
    >
      <View style={[styles.investButton, !investable ? { opacity: 0.3, shadowOpacity: 0 } : null]}>
        <Text
          suppressHighlighting={false}
          allowFontScaling={false}
          style={[styles.font15, styles.bold, styles.postButtonText]}
        >
          <Image
            style={styles.rup}
            source={require('../../assets/images/rup.png')}
          />
          relevant
        </Text>
      </View>
    </TouchableWithoutFeedback>);

    // if (!investable) {
    //   let image = require('../../assets/images/up.png');
    //   let amount = earnings ? earnings.amount : 0;
    //   if (amount < 0) image = require('../../assets/images/down.png');
    //   let userImage;
    //   if (this.props.auth && this.props.auth.user.image) {
    //     userImage = { uri: this.props.auth.user.image };
    //   } else userImage = require('../../assets/images/default_user.jpg');
    //   investButtonEl = (
    //     <TouchableHighlight
    //       underlayColor={'transparent'}
    //       // style={styles.earnings}
    //       ref={c => this.tooltipParent = c}
    //       onPress={() => this.toggleTooltip()}
    //     >
    //       <View style={styles.earnings}>
    //         <Image
    //           source={userImage}
    //           style={styles.investImage}
    //         />
    //         <Image
    //           style={[styles.investArrow]}
    //           source={image}
    //         />
    //         <Text style={[styles.bebas]}>
    //           {numbers.abbreviateNumber(amount)}
    //         </Text>
    //       </View>
    //     </TouchableHighlight>
    //   );
    // }

    irrelevantButton = (
      <TouchableHighlight
        underlayColor={'transparent'}
        style={styles.postButton}
        onPress={() => investable ? this.irrelevantPrompt() : null}
      >
        <Text
          allowFontScaling={false}
          style={[styles.font12, styles.greyText, styles.postButtonText, !investable ? { opacity: 0.6 } : null ]}
        >
          irrelevant
        </Text>
      </TouchableHighlight>
    );

    // if (!investable) irrelevantButton = null;
    // <TouchableHighlight
    //  underlayColor={'transparent'}
    //  style={[styles.postButton, { marginRight: 5 }]}
    //  onPress={this.goToPost}
    // >
    //    <Text style={[styles.font10, styles.postButtonText]}>
    //     Read more
    //    </Text>
    //  </TouchableHighlight>
    let comments = (<TouchableHighlight
      underlayColor={'transparent'}
      style={[styles.postButton]}
      onPress={() => this.goToPost()}
    >
      <Text
        allowFontScaling={false}
        style={[{ marginRight: 5 }, styles.greyText, styles.font12, styles.postButtonText]}
      >
        {commentString}
      </Text>
    </TouchableHighlight>);

      // <View style={styles.postButtons}>
      //   <Text>{earnings ? 'you earned: ' + earnings.amount : null}</Text>
      //   <Text>{earnings ? 'post relevance: ' + post.relevance : null}</Text>
      // </View>

    return (<View style={styles.postButtonsContainer}>

      <View style={styles.postButtons}>
        {investButtonEl}
        {irrelevantButton}

        <TouchableHighlight
          underlayColor={'transparent'}
          style={[styles.postButton]}
          onPress={() => this.showActionSheet()}
        >
          <Text
            allowFontScaling={false}
            style={[styles.font12, styles.greyText, styles.postButtonText]}
          >
            share
          </Text>
        </TouchableHighlight>

        {comments}


        <InvestModal
          toggleFunction={this.toggleModal}
          post={this.props.post}
          visible={this.state.modalVisible}
        />
      </View>
    </View>);
  }
}

export default PostButtons;

const localStyles = StyleSheet.create({
  earnings: {
    flexDirection: 'row',
    alignItems: 'center',
    width: (fullWidth / 2) - 25
  },
  investImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    resizeMode: 'cover',
    marginLeft: 5,
    marginRight: 9
  },
  investArrow: {
    position: 'absolute',
    left: 22,
    top: 3,
    marginRight: 0,
    width: 14,
    height: 20,
    resizeMode: 'contain',
  },
  investButton: {
    borderWidth: 1,
    backgroundColor: 'white',
    borderColor: 'black',
    paddingHorizontal: 10,
    height: 30,
    shadowColor: 'black',
    shadowOffset: { width: 2, height: 2 },
    shadowRadius: 0,
    shadowOpacity: 1,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  postButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  postButtonsContainer: {
    paddingBottom: 10,
    marginTop: 35,
  },
  postButton: {
    padding: 3,
    paddingHorizontal: 5,
    height: 30,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  postButtonText: {
    lineHeight: 28,
    backgroundColor: 'transparent'
  },
});

styles = { ...globalStyles, ...localStyles };

