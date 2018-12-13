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

// import Icon from 'react-native-vector-icons/SimpleLineIcons';
// import IconE from 'react-native-vector-icons/EvilIcons';
// import IconEn from 'react-native-vector-icons/Entypo';
// import IconO from 'react-native-vector-icons/Octicons';

import { globalStyles, greyText, fullHeight } from '../../styles/global';
import InvestModal from './investModal.component';
import { numbers } from '../../utils';

let ActionSheet = ActionSheetIOS;

if (Platform.OS === 'android') {
  ActionSheet = RNBottomSheet;
  ActionSheet.showActionSheetWithOptions = RNBottomSheet.showBottomSheetWithOptions;
}

let styles;

class PostButtons extends Component {
  static propTypes = {
    post: PropTypes.object,
    tooltip: PropTypes.object,
    actions: PropTypes.object,
    auth: PropTypes.object,
    scene: PropTypes.object,
    focusInput: PropTypes.func,
    myPostInv: PropTypes.array,
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
      buttons: [
        // 'New Post',
        'Repost with Comment',
        // 'Share via...',
        'Cancel'
      ],
      cancelIndex: 3
    };

    this.menu = {
      buttons: [
        'Repost',
        // 'Share',
        'Cancel'
      ],
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
    // let post = this.props.metaPost || this.props.post;
    // if (this.props.tooltip.upvote === post._id) {
    if (this.props.tooltip) {
      this.initTooltips();
    }
  }

  // componentWillReceiveProps(newProps) {
  //   let post = newProps.metaPost || newProps.post;
  //   if (this.props.tooltip.upvote === post._id) {
  //     this.initTooltips();
  //   }
  // }

  onShare() {
    Share.open({
      title: 'Relevant',
      url: this.props.post.link ? this.props.post.link : 'http://relevant-community.herokuapp.com/',
      subject: 'Share Link',
      message: this.props.post.title ? 'Relevant post: ' + this.props.post.title : 'Relevant post:'
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
      // DEBUG ANIMATION
      if (!this.props.auth || !this.props.auth.user) return;
      const amount = 1;

      // this.props.actions.triggerAnimation('invest', { amount: investment });
      // this.investButton.measureInWindow((x, y, w, h) => {
      //   let parent = { x, y, w, h };
      //   if (x + y + w + h === 0) return;
      //   this.props.actions.triggerAnimation('upvote', { parent, amount: investment });
      // });
      // return;

      await this.props.actions.vote(amount, this.props.post, this.props.auth.user, !newVote);

      this.investButton.measureInWindow((x, y, w, h) => {
        const parent = { x, y, w, h };
        if (x + y + w + h === 0) return;
        this.props.actions.triggerAnimation('upvote', { parent, amount });
      });
      setTimeout(() => {
        // this.props.actions.reloadTab('read');
        // let name = this.props.post.embeddedUser.name;
        // Alert.alert('You have subscribed to receive ' +
        //  results.subscription.amount + ' posts from ' + name);
        Analytics.logEvent('upvote');
      }, 1500);
    } catch (err) {
      let text1 = err.message;
      if (text1.match('coin')) {
        text1 = "Oops! Looks like you ran out of coins, but don't worry, you'll get more tomorrow";
      }
      Alert.alert(text1);
    }
  }

  irrelevantPrompt(newVote) {
    if (!newVote) return this.irrelevant(newVote);

    let t1 = "Downvote poor quality content to reduce the post's relevant score.";
    let t2 = 'If you see something innapropriate, you can notify the admins by pressing "REPORT".';
    if (Platform.OS === 'android') {
      t1 = null;
      t2 =
        'Downvote poor quality content to reduce the post\'s relevant score.\n\nIf you see something innapropriate, you can notify the admins by pressing "REPORT".';
    }
    Alert.alert(t1, t2, [
      { text: 'Cancel', onPress: () => {}, style: 'cancel' },
      { text: 'Downvote', onPress: () => this.irrelevant(newVote) },
      { text: '🚫Report', onPress: () => this.flag() }
    ]);
  }

  async irrelevant(newVote) {
    try {
      // this.props.actions.triggerAnimation('invest', -1);
      // this.props.actions.triggerAnimation('irrelevant', -1);
      // return;

      await this.props.actions.vote(-1, this.props.post, this.props.auth.user, !newVote);
      if (!newVote) return;
      // this.props.actions.triggerAnimation('invest', -1);
      this.props.actions.triggerAnimation('irrelevant', -1);
    } catch (err) {
      let text1 = err.message;
      if (text1.match('coin')) {
        text1 = "Oops! Looks like you ran out of coins, but don't worry, you'll get more tomorrow";
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
              else return;
              break;
            case 1:
              this.repostCommentary();
              break;
            // case 2:
            //   this.onShare();
            //   break;
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
    const { link } = this.props;
    this.props.actions.setCreaPostState({
      postBody: '',
      repost: this.props.post,
      urlPreview: {
        image: link.image,
        title: link.title ? link.title : 'Untitled',
        description: link.description
      }
    });
    this.props.actions.push(
      {
        key: 'createPost',
        component: 'createPost',
        back: 'Cancel',
        title: 'Repost',
        next: 'Post',
        direction: 'vertical',
        left: 'Cancel'
      },
      'home'
    );
    this.props.actions.replaceRoute(
      {
        key: 'createPost',
        component: 'createPost',
        back: true,
        left: 'Cancel',
        title: 'Repost',
        next: 'Post',
        direction: 'vertical'
      },
      0,
      'createPost'
    );
  }

  repostUrl() {
    const { link } = this.props;
    this.props.actions.setCreaPostState({
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
    this.props.actions.push(
      {
        key: 'createPost',
        back: true,
        title: 'Add Commentary',
        next: 'Next',
        direction: 'vertical'
      },
      'home'
    );
    this.props.actions.replaceRoute(
      {
        key: 'createPost',
        component: 'createPost',
        back: true,
        left: 'Cancel',
        title: 'New Commentary',
        next: 'Next',
        direction: 'vertical'
      },
      0,
      'createPost'
    );
  }

  goToPost(comment) {
    if (this.props.scene) {
      if (this.props.scene.id === this.props.post._id) {
        if (this.props.focusInput) this.props.focusInput();
        return;
      }
    }
    let openComment = false;
    if (comment) openComment = true;
    this.props.actions.goToPost(this.props.post, openComment);
  }

  flag() {
    this.props.actions.flag(this.props.post);
  }

  render() {
    let investButtonEl = null;
    const post = this.props.post;
    let investible = false;
    let irrelevantButton;
    let commentString = '';
    let myVote;

    // let myPost = false;
    // if (post && post.user && post.user._id === this.props.auth.user._id) {
    //   myPost = true;
    // }
    // if (post.body.match('Trust')) {
    //   console.log('myPostInv ', this.props.myPostInv);
    // }

    if (post && this.props.auth.user) {
      if (!post.user || post.user !== this.props.auth.user._id) {
        if (!this.props.myPostInv) {
          investible = true;
        } else {
          myVote = this.props.myPostInv;
        }
      }
    }

    if (post && post.commentCount) {
      if (post.commentCount === 1) commentString = '1';
      else {
        commentString = post.commentCount;
      }
    }
    let canBet;

    // let now = new Date();
    // if (!myPost && !investible && now - new Date(post.createdAt) < 6 * 60 * 60 * 1000) {
    //   canBet = true;
    // }

    // invest section spacing
    const space = 8;
    // let opacity = investible ? 1 : 0.3;
    const opacity = 1;
    let upvoteIcon = require('../../assets/images/icons/upvote.png');
    if (myVote && myVote.amount > 0) {
      upvoteIcon = require('../../assets/images/icons/upvoteActive.png');
    } // else if (!investible) opacity = .3;

    // let investAction = canBet ? this.toggleModal : (investible ? this.invest : null);

    investButtonEl = (
      <TouchableOpacity
        style={{ paddingRight: space }}
        ref={c => (this.investButton = c)}
        onPress={() => this.invest(investible)}
      >
        {canBet ? (
          <Image
            resizeMode={'contain'}
            style={[
              styles.r,
              { width: 20, height: 20, zIndex: 1, position: 'absolute', bottom: 1, right: 0 }
            ]}
            source={require('../../assets/images/relevantcoin.png')}
          />
        ) : null}
        <Image resizeMode={'contain'} style={[styles.vote, { opacity }]} source={upvoteIcon} />
      </TouchableOpacity>
    );

    // <Text style={styles.smallInfo}>
    //   {post.upVotes + post.downVotes}
    // </Text>
    // <View style={{ width: 15, borderBottomWidth: 1, borderColor: greyText }} />
    // </View>

    let r = post.data ? post.data.pagerank : null;
    const rel = r;

    let rIcon = (
      <Image
        resizeMode={'contain'}
        style={styles.smallR}
        source={require('../../assets/images/icons/smallR.png')}
      />
    );

    const totalVotes = post.data ? post.data.upVotes + post.data.downVotes : 0;
    // let s = 's';
    // if (totalVotes === 1) s = '';
    // let votes = (
    //   <View>
    //     <View style={{ alignSelf: 'center', width: 30, borderBottomWidth: 1, borderColor: greyText }} />
    //     <Text style={styles.smallInfo}>
    //       {numbers.abbreviateNumber(totalVotes || 0)} vote{s}
    //     </Text>
    //   </View>
    // );

    if (canBet) {
      r = 'Place Bet!';
      rIcon = null;
      votes = null;
    } else if (!r) {
      r = 'Vote';
      rIcon = null;
      votes = null;
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
              {isNaN(r) ? r : numbers.abbreviateNumber(r)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );

    // opacity = 1;
    let downvoteIcon = require('../../assets/images/icons/downvote.png');
    if (myVote && myVote.amount < 0) {
      downvoteIcon = require('../../assets/images/icons/downvoteActive.png');
    }
    // else if (!investible) opacity = .3;
    irrelevantButton = (
      <TouchableOpacity
        style={{ paddingLeft: space }}
        onPress={() => this.irrelevantPrompt(investible)}
      >
        <Image resizeMode={'contain'} style={[styles.vote, { opacity }]} source={downvoteIcon} />
      </TouchableOpacity>
    );

    const comments = (
      <TouchableOpacity onPress={() => this.goToPost(true)} style={{ paddingHorizontal: 12 }}>
        <View style={[{ flexDirection: 'row', alignItems: 'center' }]}>
          <IconI
            style={{ transform: [{ scaleX: -1 }] }}
            name="ios-redo-outline"
            size={28}
            color={greyText}
          />
          <Text style={styles.smallInfo}> {commentString}</Text>

          {/* <Text style={styles.smallInfo}>reply</Text> */}
        </View>
      </TouchableOpacity>
    );

    // <Image
    //   resizeMode={'contain'}
    //   style={styles.vote}
    //   source={require('../../assets/images/icons/share.png')}
    // />

    const repost = (
      <TouchableOpacity
        style={{ paddingLeft: 10, paddingRight: 5 }}
        onPress={() => this.repostCommentary()}
      >
        <View style={[styles.textRow, { alignItems: 'center' }]}>
          <IconI name="ios-quote-outline" size={24} color={greyText} />

          {/* <Text style={styles.smallInfo}></Text> */}
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
            source={require('../../assets/images/icons/comment.png')}
          />
        </View>
      </TouchableOpacity>
    );

    const link = this.props.link;
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
            {(link && link.url) || !isComment ? newCommentary : null}
            {twitter || isComment ? null : comments}
            {twitter || isComment ? null : repost}
          </View>

          <InvestModal
            toggleFunction={this.toggleModal}
            post={this.props.post}
            visible={this.state.modalVisible}
          />
        </View>
      </View>
    );
  }
}

PostButtons.propTypes = {
  actions: PropTypes.object,
  post: PropTypes.object,
  tooltip: PropTypes.bool,
  link: PropTypes.object,
  myPostInv: PropTypes.object,
  auth: PropTypes.object,
  scene: PropTypes.object,
  focusInput: PropTypes.func
};

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
