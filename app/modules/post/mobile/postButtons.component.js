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
import RNBottomSheet from 'react-native-bottom-sheet';
import { globalStyles, fullHeight } from 'app/styles/global';
import { CTALink } from 'modules/styled/uni';
import { colors } from 'app/styles';
import get from 'lodash/get';
import { getPostUrl, getTitle } from 'app/utils/post';

let ActionSheet = ActionSheetIOS;

if (Platform.OS === 'android') {
  ActionSheet = RNBottomSheet;
  ActionSheet.showActionSheetWithOptions = RNBottomSheet.showBottomSheetWithOptions;
}

let styles;

// TODO refactor this
class PostButtons extends Component {
  static propTypes = {
    post: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    parentPost: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    setupReply: PropTypes.func,
    tooltip: PropTypes.bool,
    actions: PropTypes.object,
    auth: PropTypes.object,
    navigation: PropTypes.object,
    focusInput: PropTypes.func,
    // myPostInv: PropTypes.object,
    link: PropTypes.object,
    comment: PropTypes.object
  };

  constructor(props, context) {
    super(props, context);
    this.goToPost = this.goToPost.bind(this);
    this.invest = this.invest.bind(this);
    this.flag = this.flag.bind(this);
    this.state = {
      editing: false,
      modalVisible: false,
      expanded: false
    };

    this.linkMenu = {
      buttons: ['Repost Article', 'Share Via...', 'Cancel'],
      cancelIndex: 3
    };

    this.menu = {
      buttons: ['Share Via...', 'Cancel'],
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
    if (this.props.link) this.menu = this.linkMenu;
    if (this.props.tooltip) {
      this.initTooltips();
    }
  }

  onShare = () => {
    const { post, auth } = this.props;
    const { community } = auth;
    const postUrl = getPostUrl(community, post);
    const title = getTitle(post);
    Share.open({
      title: title || '',
      url: 'https://relevant.community' + postUrl,
      subject: 'Share Link'
    }).catch(err => console.log(err)); // eslint-disable-line
  };

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

      const voteResult = await actions.vote(amount, post, auth.user, !newVote);

      if (!newVote || !voteResult || voteResult.undoInvest) return;

      const startRank = post.data ? post.data.pagerank : 0;
      const total = startRank + voteResult.rankChange + 1;
      const upvoteAmount = Math.round(total) - Math.round(startRank);

      this.investButton.measureInWindow((x, y, w, h) => {
        const parent = { x, y, w, h };
        if (x + y + w + h === 0) return;
        actions.triggerAnimation('upvote', { parent, amount: upvoteAmount });
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
        if (this.props.link) {
          switch (buttonIndex) {
            case 0:
              this.repostUrl();
              break;
            case 1:
              this.onShare();
              break;
            default:
          }
        } else {
          switch (buttonIndex) {
            case 0:
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

  goToPost(openComment) {
    const { focusInput, navigation, actions, setupReply, post, comment } = this.props;
    const parentPost = this.props.parentPost || post;
    const parentPostId = parentPost._id || parentPost;

    if (get(navigation, 'state.params.id') === parentPostId) {
      if (setupReply) setupReply(post);
      if (this.props.focusInput) focusInput();
      return;
    }

    actions.goToPost({ _id: parentPostId, comment }, openComment);
  }

  flag() {
    this.props.actions.flag(this.props.post);
  }

  render() {
    const { post, auth, link } = this.props;
    let investButtonEl = null;
    // let investible = false;
    // let myVote;

    const isLink = !post.parentPost && post.url;

    const ownPost = auth.user && auth.user._id === post.user;
    const vote = ownPost ? true : post.myVote;
    const votedUp = vote && vote.amount > 0;
    const votedDown = vote && vote.amount < 0;

    // if (post && auth.user) {
    //   if (!post.user || post.user !== auth.user._id) {
    //     if (!myPostInv) {
    //       investible = true;
    //     } else {
    //       myVote = myPostInv;
    //     }
    //   }
    // }

    const space = 8;

    const opacity = 1;
    const upvoteIcon = votedUp
      ? require('app/public/img/icons/upvoteActive.png')
      : require('app/public/img/icons/upvote.png');

    investButtonEl = (
      <TouchableOpacity
        style={{ paddingRight: space }}
        ref={c => (this.investButton = c)}
        onPress={() => this.invest(!vote)}
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

    const totalVotes = post.data ? post.data.upVotes + post.data.downVotes : 0;

    if (!r) {
      r = 'Vote';
    }

    const postRank = post.data
      ? Math.round(post.data.pagerank) + post.data.upVotes - post.data.downVotes
      : 0;

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
            <Text style={[styles.smallInfo, styles.greyText]}>
              {typeof r !== 'number' ? r : postRank}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );

    const downvoteIcon = votedDown
      ? require('app/public/img/icons/downvoteActive.png')
      : require('app/public/img/icons/downvote.png');

    const irrelevantButton = (
      <TouchableOpacity
        style={{ paddingLeft: space }}
        onPress={() => this.irrelevantPrompt(!vote)}
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
        onPress={() => (isLink ? this.repostUrl() : this.goToPost(true))}
        style={{ paddingHorizontal: 12 }}
      >
        <View style={[{ flexDirection: 'row', alignItems: 'center' }]}>
          <CTALink c={colors.blue}>{isLink ? 'Comment' : 'Reply'}</CTALink>
          {post.commentCount ? (
            <CTALink style={styles.smallInfo}> ({post.commentCount})</CTALink>
          ) : null}
        </View>
      </TouchableOpacity>
    );

    const shareButton = (
      <TouchableOpacity
        style={{ paddingRight: 8 }}
        onPress={() => this.showActionSheet()}
      >
        <View style={[{ flexDirection: 'column', alignItems: 'center' }]}>
          <CTALink c={colors.blue}>Share</CTALink>
        </View>
      </TouchableOpacity>
    );

    const twitter = link && link.twitter === true;

    return (
      <View style={styles.postButtonsContainer}>
        <View style={styles.postButtons}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {investButtonEl}
            {stat}
            {irrelevantButton}
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {twitter ? null : comments}
            {shareButton}
          </View>
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
