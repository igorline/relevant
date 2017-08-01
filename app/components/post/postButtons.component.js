import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  TouchableWithoutFeedback,
  TouchableOpacity,
  ActionSheetIOS,
  Alert,
  Image,
  Platform
} from 'react-native';
import Analytics from 'react-native-firebase-analytics';
import Share from 'react-native-share';
import Icon from 'react-native-vector-icons/SimpleLineIcons';
import IconE from 'react-native-vector-icons/EvilIcons';

import { globalStyles, fullWidth, blue, greyText } from '../../styles/global';
import InvestModal from './investModal.component';
import { numbers } from '../../utils';

import RNBottomSheet from 'react-native-bottom-sheet';

let ActionSheet = ActionSheetIOS;

if (Platform.OS === 'android') {
  ActionSheet = RNBottomSheet;
  ActionSheet.showActionSheetWithOptions = RNBottomSheet.showBottomSheetWithOptions;
}

let styles;

class PostButtons extends Component {
  constructor(props, context) {
    super(props, context);
    this.onShare = this.onShare.bind(this);
    this.goToPost = this.goToPost.bind(this);
    this.invest = this.invest.bind(this);
    this.flag = this.flag.bind(this);
    this.state = {
      editing: false,
      modalVisible: false,
      expanded: false,
    };

    this.linkMenu = {
      buttons: [
        // 'New Post',
        'Repost with Comment',
        // 'Share via...',
        'Cancel',
      ],
      cancelIndex: 3,
    };

    this.menu = {
      buttons: [
        'Repost',
        // 'Share',
        'Cancel',
      ],
      cancelIndex: 2,
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
    this.showInvestors = this.showInvestors.bind(this);
  }

  componentDidMount() {
    if (this.props.post.link) this.menu = this.linkMenu;
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
      this.props.actions.showTooltip({
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
        setTimeout(() => {
          this.props.actions.reloadTab('read');
          // this.props.navigator.reloadTab('myProfile');
          let name = this.props.post.embeddedUser.name;
          // let title = 'New subscripion!';
          // if (results.subscription.amount > 3 ) {
          //   title = 'Subscription increase';
          // }
          Alert.alert('You have subscribed to receive ' + results.subscription.amount + ' posts from ' + name);
          Analytics.logEvent('upvote');
        }, 1500);
      }
    })
    .catch(err => {
      let text1 = err.message;
      if (text1.match('coin')) {
        text1 = 'Oops! Looks like you ran out of coins, but don\'t worry, you\'ll get more tomorrow';
      }
      Alert.alert(text1);
    });
  }


  irrelevantPrompt() {
    Alert.alert(
      'Downvote poor quality content to reduce the post\'s relevant score',
      'If you see innapropriate content you can notify the admins by pressing "Innapropriate".',
      [
        { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
        { text: 'Downvote', onPress: () => this.irrelevant() },
        { text: '🚫Innapropriate', onPress: () => this.flag() },
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
    })
    .catch(err => {
      let text1 = err.message;
      if (text1.match('coin')) {
        text1 = 'Oops! Looks like you ran out of coins, but don\'t worry, you\'ll get more tomorrow';
      }
      Alert.alert(text1);
    });
  }

  showActionSheet() {
    ActionSheet.showActionSheetWithOptions({
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
          // case 2:
          //   this.onShare();
          //   break;
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
      title: 'Repost',
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

  goToPost(comment) {
    if (this.props.scene) {
      if (this.props.scene.id === this.props.post._id) return;
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
    let post = this.props.post;
    let investable = false;
    let irrelevantButton;
    // let commentIcon = <Icon name="ios-chatbubbles" size={18} color={styles.greyText} />;
    let commentString = '';
    let earnings;
    let smallScreen = fullWidth <= 320 || false;

    if (post && post.user && this.props.auth.user) {
      if (post.user._id !== this.props.auth.user._id) {
        if (this.props.myInvestments.indexOf(post._id) === -1) {
          investable = true;
        }
      }
      earnings = this.props.myEarnings[post._id];
    }

    if (post && post.commentCount) {
      if (post.commentCount === 1) commentString = '1';
      else {
        commentString = <Text>{post.commentCount}</Text>;
      }
    }


    // invest section spacing
    let space = 10;
    let opacity = !investable ? 0.3 : 1;

    investButtonEl = (
      <TouchableOpacity
        style={{ paddingRight: space, opacity }}
        onPress={() => investable ? this.invest() : null}
      >
        <Image
          resizeMode={'contain'}
          style={styles.vote}
          source={require('../../assets/images/icons/upvote.png')}
        />
      </TouchableOpacity>
    );

          // <Text style={styles.smallInfo}>
          //   {post.upVotes + post.downVotes}
          // </Text>
          // <View style={{ width: 15, borderBottomWidth: 1, borderColor: greyText }} />
        // </View>


    let r = post.relevance;

    let rIcon = (<Image
      resizeMode={'contain'}
      style={styles.smallR}
      source={require('../../assets/images/icons/smallR.png')}
    />);


    let totalVotes = post.upVotes + post.downVotes;
    let s = 's';
    if (totalVotes === 1) s = '';
    let votes = (
      <View>
        <View style={{ width: 30, borderBottomWidth: 1, borderColor: greyText }} />
        <Text style={styles.smallInfo}>
          {totalVotes} vote{s}
        </Text>
      </View>
    );

    if (totalVotes === 0) {
      r = 'Vote';
      rIcon = null;
      votes = null;
    }


    let stat = (
      <TouchableOpacity
        onPress={this.showInvestors}
      >
        <View style={{ flexDirection: 'column', alignItems: 'center', paddingHorizontal: space }}>
          <View style={[styles.textRow, { alignItems: 'center' }]}>
            {rIcon}
            <Text style={[styles.smallInfo, styles.greyText]}>
              {r}
            </Text>
          </View>
          {votes}
        </View>
      </TouchableOpacity>
    );

    irrelevantButton = (
      <TouchableOpacity
        style={{ paddingLeft: space, opacity }}
        onPress={() => investable ? this.irrelevantPrompt() : null}
      >
        <Image
          resizeMode={'contain'}
          style={styles.vote}
          source={require('../../assets/images/icons/downvote.png')}
        />
      </TouchableOpacity>
    );


    let comments = (<TouchableOpacity
      onPress={() => this.goToPost(true)}
      style={{ paddingHorizontal: space }}
    >
      <View style={[styles.textRow, { alignItems: 'center', }]}>
        <Image
          resizeMode={'contain'}
          style={styles.vote}
          source={require('../../assets/images/icons/comment.png')}
        />
        <Text style={styles.smallInfo}>{commentString}</Text>
      </View>
    </TouchableOpacity>);

        // <Image
        //   resizeMode={'contain'}
        //   style={styles.vote}
        //   source={require('../../assets/images/icons/share.png')}
        // />

    let repost = (
      <TouchableOpacity
        style={{ paddingHorizontal: 0 }}
        onPress={() => this.repostCommentary()}
      >
        <View style={[styles.textRow, { alignItems: 'center' }]}>
          <IconE name="retweet" size={28} color={greyText} />
          <Text style={styles.smallInfo}></Text>
        </View>


      </TouchableOpacity>
    );

    let newCommentary = (
      <TouchableOpacity
        style={{ paddingHorizontal: 10 }}
        onPress={() => this.repostUrl()}
      >
        <Icon name="pencil" size={19} color={greyText} />
      </TouchableOpacity>
    );

    return (<View style={styles.postButtonsContainer}>
      <View style={styles.postButtons}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {investButtonEl}
          {stat}
          {irrelevantButton}
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
          {post.link ? newCommentary : null}
          {comments}
          {repost}
        </View>

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
  vote: {
    width: 25,
    height: 23,
  },
  earnings: {
    flexDirection: 'row',
    alignItems: 'center',
    width: (fullWidth / 2) - 25
  },
  smallerR: {
    width: 20,
    height: 18,
    marginRight: 0
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
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingVertical: 5,
  },
  invSmall: {
    paddingHorizontal: 5,
    height: 28,
  },
  postButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  postButtonsContainer: {
    paddingBottom: 10,
    marginTop: 30,
  },
  postButton: {
    padding: 3,
    paddingHorizontal: 2,
    height: 30,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  postButtonText: {
    alignSelf: 'flex-end',
    backgroundColor: 'transparent',
    paddingVertical: 3,
  },
  postButtonTextSmall: {
    fontSize: 13,
    lineHeight: 26,
  }
});

styles = { ...globalStyles, ...localStyles };

