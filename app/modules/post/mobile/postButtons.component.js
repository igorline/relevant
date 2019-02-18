import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActionSheetIOS,
  Alert,
  Image,
  Platform
} from 'react-native';
import PropTypes from 'prop-types';
import Analytics from 'react-native-firebase-analytics';
import Share from 'react-native-share';
import IconI from 'react-native-vector-icons/Ionicons';
import RNBottomSheet from 'react-native-bottom-sheet';
import { globalStyles, greyText, fullHeight } from 'app/styles/global';
import { numbers } from 'app/utils';
import { get } from 'lodash';

let ActionSheet = ActionSheetIOS;

if (Platform.OS === 'android') {
  ActionSheet = RNBottomSheet;
  ActionSheet.showActionSheetWithOptions = RNBottomSheet.showBottomSheetWithOptions;
}

let styles;

// TODO refactor this
class PostButtons extends Component {
  static propTypes = {
    post: PropTypes.object,
    parentPost: PropTypes.object,
    setupReply: PropTypes.func,
    tooltip: PropTypes.bool,
    actions: PropTypes.object,
    auth: PropTypes.object,
    navigation: PropTypes.object,
    focusInput: PropTypes.func,
    myPostInv: PropTypes.object,
    link: PropTypes.object
  };

  constructor(props, context) {
    super(props, context);
    this.onShare = this.onShare.bind(this);
    this.goToPost = this.goToPost.bind(this);
    this.invest = this.invest.bind(this);
    this.flag = this.flag.bind(this);
    this.state = {
      editing: false,
      modalVisible: false,
      expanded: false
    };

    this.linkMenu = {
      buttons: ['Repost with Comment', 'Cancel'],
      cancelIndex: 3
    };

    this.menu = {
      buttons: ['Repost', 'Cancel'],
      cancelIndex: 2
    };

    this.ownerMenu = {
      myPost: true,
      buttons: ['Share', 'Edit', 'Delete', 'Cancel'],
      destructiveIndex: 2,
      cancelIndex: 3
    };

    this.toggleModal = this.toggleModal.bind(this);
    this.showActionSheet = this.showActionSheet.bind(this);
    this.irrelevant = this.irrelevant.bind(this);
    this.irrelevantPrompt = this.irrelevantPrompt.bind(this);
    this.goToPost = this.goToPost.bind(this);
    this.showInvestors = this.showInvestors.bind(this);
    this.initTooltips = this.initTooltips.bind(this);
    this.toggleTooltip = this.toggleTooltip.bind(this);
  }

  componentDidMount() {
    if (this.props.post.link) this.menu = this.linkMenu;
    if (this.props.tooltip) {
      this.initTooltips();
    }
  }

  onShare() {
    Share.open({
      title: 'Relevant',
      url: this.props.post.link
        ? this.props.post.link
        : 'http://relevant-community.herokuapp.com/',
      subject: 'Share Link',
      message: this.props.post.title
        ? 'Relevant post: ' + this.props.post.title
        : 'Relevant post:'
    });
  }

  initTooltips() {
    ['vote'].forEach(name => {
      this.props.actions.setTooltipData({
        name,
        toggle: () => this.toggleTooltip(name)
      });
    });
  }

  toggleTooltip(name) {
    if (!this.investButton) return;
    this.investButton.measureInWindow((x, y, w, h) => {
      const parent = { x, y, w, h };
      if (x + y + w + h === 0) return;
      if (y > fullHeight - 50) return;
      this.props.actions.setTooltipData({
        name,
        parent
      });
      this.props.actions.showTooltip(name);
    });
  }

  showInvestors() {
    this.props.actions.push({
      key: 'people',
      id: this.props.post._id,
      component: 'people',
      title: 'Votes',
      back: true
    });
  }

  toggleModal(bool) {
    if (!bool) bool = !this.state.modalVisible;
    this.setState({ modalVisible: bool });
  }

  async invest(newVote) {
    try {
      const { actions, auth, post } = this.props;
      if (!auth || !auth.user) return;
      const amount = 1;

      // DEBUG ANIMATION
      // this.props.actions.triggerAnimation('invest', { amount: investment });
      // this.investButton.measureInWindow((x, y, w, h) => {
      //   let parent = { x, y, w, h };
      //   if (x + y + w + h === 0) return;
      //   this.props.actions.triggerAnimation('upvote', { parent, amount: investment });
      // });
      // return;

      await actions.vote(amount, post, auth.user, !newVote);

      this.investButton.measureInWindow((x, y, w, h) => {
        const parent = { x, y, w, h };
        if (x + y + w + h === 0) return;
        actions.triggerAnimation('upvote', { parent, amount });
      });
      setTimeout(() => {
        // this.props.actions.reloadTab('read');
        // let name = this.props.post.embeddedUser.name;
        // Alert.alert('You have subscribed to receive ' +
        //  results.subscription.amount + ' posts from ' + name);
        Analytics.logEvent('upvote');
      }, 1500);
    } catch (err) {
      // TODO: catch error
    }
  }

  irrelevantPrompt(newVote) {
    if (!newVote) return this.irrelevant(newVote);

    let t1 = "Downvote poor quality content to reduce the post's relevant score.";
    let t2 =
      'If you see something innapropriate, you can notify the admins by pressing "REPORT".';
    if (Platform.OS === 'android') {
      t1 = null;
      t2 =
        'Downvote poor quality content to reduce the post\'s relevant score.\n\nIf you see something innapropriate, you can notify the admins by pressing "REPORT".';
    }
    return Alert.alert(t1, t2, [
      { text: 'Cancel', onPress: () => {}, style: 'cancel' },
      { text: 'Downvote', onPress: () => this.irrelevant(newVote) },
      { text: '🚫Report', onPress: () => this.flag() }
    ]);
  }

  async irrelevant(newVote) {
    try {
      // DEBUG
      // this.props.actions.triggerAnimation('irrelevant', -1);
      // return;

      await this.props.actions.vote(-1, this.props.post, this.props.auth.user, !newVote);
      if (!newVote) return;
      this.props.actions.triggerAnimation('irrelevant', -1);
    } catch (err) {
      let text1 = err.message;
      if (text1.match('coin')) {
        text1 =
          "Oops! Looks like you ran out of coins, but don't worry, you'll get more tomorrow";
      }
      Alert.alert(text1);
    }
  }

  showActionSheet() {
    ActionSheet.showActionSheetWithOptions(
      {
        options: this.menu.buttons,
        cancelButtonIndex: this.menu.cancelIndex,
        destructiveButtonIndex: this.menu.destructiveIndex
      },
      buttonIndex => {
        if (this.props.post.link) {
          switch (buttonIndex) {
            case 0:
              if (this.props.post.link) this.repostUrl();
              break;
            case 1:
              this.repostCommentary();
              break;
            default:
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
          }
        }
      }
    );
  }

  repostCommentary() {
    let { link } = this.props;
    if (!link) link = {};
    this.props.actions.setCreatePostState({
      postBody: '',
      repost: this.props.post,
      urlPreview: {
        image: link.image,
        title: link.title ? link.title : 'Untitled',
        description: link.description
      }
    });
    this.props.actions.push({
      key: 'createPost',
      component: 'createPost',
      back: 'Cancel',
      title: 'Repost',
      next: 'Post',
      direction: 'vertical',
      left: 'Cancel'
    });
  }

  repostUrl() {
    const { link } = this.props;
    if (!link) return;
    this.props.actions.setCreatePostState({
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
    });
    this.props.actions.push({
      key: 'createPost',
      back: true,
      title: 'Add Commentary',
      next: 'Next',
      direction: 'vertical',
      left: 'Cancel'
    });
  }

  goToPost(comment) {
    const { focusInput, navigation, actions, setupReply, post } = this.props;
    const parentPost = this.props.parentPost || post;

    if (get(navigation, 'state.params.id') === parentPost._id) {
      setupReply(post);
      if (this.props.focusInput) focusInput();
      return;
    }

    const openComment = comment || false;
    actions.goToPost(parentPost, openComment);
  }

  flag() {
    this.props.actions.flag(this.props.post);
  }

  render() {
    const { post, auth, myPostInv, link } = this.props;
    let investButtonEl = null;
    let investible = false;
    let commentString = '';
    let myVote;

    if (post && auth.user) {
      if (!post.user || post.user !== auth.user._id) {
        if (!myPostInv) {
          investible = true;
        } else {
          myVote = myPostInv;
        }
      }
    }

    if (post && post.commentCount) {
      if (post.commentCount === 1) commentString = '1';
      else {
        commentString = post.commentCount;
      }
    }
    const space = 8;

    const opacity = 1;
    let upvoteIcon = require('app/public/img/icons/upvote.png');
    if (myVote && myVote.amount > 0) {
      upvoteIcon = require('app/public/img/icons/upvoteActive.png');
    }

    investButtonEl = (
      <TouchableOpacity
        style={{ paddingRight: space }}
        ref={c => (this.investButton = c)}
        onPress={() => this.invest(investible)}
      >
        <Image
          resizeMode={'contain'}
          style={[styles.vote, { opacity }]}
          source={upvoteIcon}
        />
      </TouchableOpacity>
    );

    let r = post.data ? post.data.relevance : null;
    const rel = r;

    let rIcon = (
      <Image
        resizeMode={'contain'}
        style={styles.smallR}
        source={require('app/public/img/icons/smallR.png')}
      />
    );

    const totalVotes = post.data ? post.data.upVotes + post.data.downVotes : 0;

    if (!r) {
      r = 'Vote';
      rIcon = null;
    }

    const stat = (
      <TouchableOpacity
        onPress={() =>
          totalVotes !== 0 || rel ? this.showInvestors() : this.toggleTooltip('vote')
        }
      >
        <View
          style={{
            flexDirection: 'column',
            alignItems: 'center',
            width: 60
          }}
        >
          <View style={[styles.textRow, { alignItems: 'center' }]}>
            {rIcon}
            <Text style={[styles.smallInfo, styles.greyText]}>
              {typeof r !== 'number' ? r : numbers.abbreviateNumber(r)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );

    let downvoteIcon = require('app/public/img/icons/downvote.png');
    if (myVote && myVote.amount < 0) {
      downvoteIcon = require('app/public/img/icons/downvoteActive.png');
    }

    const irrelevantButton = (
      <TouchableOpacity
        style={{ paddingLeft: space }}
        onPress={() => this.irrelevantPrompt(investible)}
      >
        <Image
          resizeMode={'contain'}
          style={[styles.vote, { opacity }]}
          source={downvoteIcon}
        />
      </TouchableOpacity>
    );

    const comments = (
      <TouchableOpacity
        onPress={() => this.goToPost(true)}
        style={{ paddingHorizontal: 12 }}
      >
        <View style={[{ flexDirection: 'row', alignItems: 'center' }]}>
          <IconI
            style={{ transform: [{ scaleX: -1 }] }}
            name="ios-redo-outline"
            size={28}
            color={greyText}
          />
          <Text style={styles.smallInfo}> {commentString}</Text>
        </View>
      </TouchableOpacity>
    );

    const newCommentary = (
      <TouchableOpacity style={{ paddingRight: 8 }} onPress={() => this.repostUrl()}>
        {/* <Icon name="pencil" size={18} color={greyText} /> */}
        <View style={[{ flexDirection: 'column', alignItems: 'center' }]}>
          <Image
            resizeMode={'contain'}
            style={styles.vote}
            source={require('app/public/img/icons/comment.png')}
          />
        </View>
      </TouchableOpacity>
    );

    const twitter = link && link.twitter === true;
    const isComment = post.type === 'comment';

    return (
      <View style={styles.postButtonsContainer}>
        <View style={styles.postButtons}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {investButtonEl}
            {stat}
            {irrelevantButton}
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {link && link.url && !isComment ? newCommentary : null}
            {twitter || isComment ? null : comments}
          </View>

          {/*          <InvestModal
            toggleFunction={this.toggleModal}
            post={this.props.post}
            visible={this.state.modalVisible}
          /> */}
        </View>
      </View>
    );
  }
}

export default PostButtons;

const localStyles = StyleSheet.create({
  vote: {
    width: 25,
    height: 23
  },
  smallerR: {
    width: 24,
    height: 24,
    marginRight: 0
  },
  investImage: {
    width: 25,
    height: 25,
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
    resizeMode: 'contain'
  },
  postButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  postButtonsContainer: {
    paddingBottom: 10,
    marginTop: 15
  }
});

styles = { ...globalStyles, ...localStyles };
