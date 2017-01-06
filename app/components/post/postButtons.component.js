import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  TouchableWithoutFeedback,
  ActionSheetIOS,
} from 'react-native';
import { globalStyles, fullWidth, fullHeight } from '../../styles/global';
import InvestModal from './investModal.component.js';
import Share from 'react-native-share';

let styles;

class PostButtons extends Component {
  constructor(props, context) {
    super(props, context);
    this.onShare = this.onShare.bind(this);
    this.goToPost = this.goToPost.bind(this);
    this.state = {
      editing: false,
      modalVisible: false,
      expanded: false,
    };

    this.linkMenu = {
      buttons: [
        'Share',
        'Irrelevant',
        'Repost Commentary',
        'Repost Link',
        'Cancel',
      ],
      cancelIndex: 4,
    };

    this.menu = {
      buttons: [
        'Share',
        'Irrelevant',
        'Repost Commentary',
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

    this.toggleModal = this.toggleModal.bind(this);
    this.showActionSheet = this.showActionSheet.bind(this);
    this.irrelevant = this.irrelevant.bind(this);
    this.goToPost = this.goToPost.bind(this);
  }

  componentDidMount() {
    if (this.props.post.user && this.props.auth.user) {
      if (this.props.post.user === this.props.auth.user._id) {
        this.menu = this.ownerMenu;
        this.myPost = true;
      } else if (this.props.post.link) {
        this.menu = this.linkMenu;
      }
    }
  }

  showActionSheet() {
    if (this.myPost) {
      ActionSheetIOS.showActionSheetWithOptions({
        options: this.menu.buttons,
        cancelButtonIndex: this.menu.cancelIndex,
        destructiveButtonIndex: this.menu.destructiveIndex,
      },
      (buttonIndex) => {
        switch (buttonIndex) {
          case 0:
            this.onShare();
            break;
          case 1:
            this.toggleEditing();
            break;
          case 2:
            this.deletePost();
            break;
          default:
            return;
        }
      });
    } else {
      ActionSheetIOS.showActionSheetWithOptions({
        options: this.menu.buttons,
        cancelButtonIndex: this.menu.cancelIndex,
        destructiveButtonIndex: this.menu.destructiveIndex,
      },
      (buttonIndex) => {
        switch (buttonIndex) {
          case 0:
            this.onShare();
            break;
          case 1:
            this.irrelevant();
            break;
          case 2:
            this.repostCommentary();
            break;
          case 3:
            if (this.props.post.link) this.repostUrl();
            else return;
            break;
          default:
            return;
        }
      });
    }
  }

  toggleModal(bool) {
    if (!bool) bool = !this.state.modalVisible;
    this.setState({ modalVisible: bool });
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

  toggleEditing() {
    this.props.actions.setCreaPostState({
      postBody: this.props.post.body,
      nativeImage: true,
      postUrl: this.props.post.link,
      postImage: this.props.post.image,
      urlPreview: {
        image: this.props.post.image,
        title: this.props.post.title ? this.props.post.title : 'Untitled',
        description: this.props.post.description,
      },
      edit: true,
      editPost: this.props.post,
    });
    this.props.navigator.push({
      key: 'createPost',
      back: true,
      title: 'Edit Post',
      next: 'Update'
    }, 'home');
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
      if (this.props.scene.route) {
        if (this.props.scene.route.id) {
          if (this.props.scene.route.id === this.props.post._id) return;
        }
      }
    }
    this.props.navigator.goToPost(this.props.post);
  }

  deletePost() {
    this.props.actions.deletePost(this.props.auth.token, this.props.post);
  }

  irrelevant() {
    // this.props.actions.irrelevant(this.props.auth.token, this.props.post._id);
    this.props.actions.invest(this.props.auth.token, -100, this.props.post, this.props.auth.user)
    .then((results) => {
      if (results) {
        this.props.actions.triggerAnimation('invest');
        this.props.actions.triggerAnimation('irrelevant');
      } else {
        console.log('irrelevant failed');
      }
    });
  }

  render() {
    let investButtonEl = null;
    const expanded = this.props.expanded;
    let post = this.props.post;
    let investable = false;
    let irrelevantButton;
    let commentString = 'add comment';

    if (post && post.user && this.props.auth.user) {
      if (post.user !== this.props.auth.user._id) {
        investable = true;
      }
    }

    if (post && post.commentCount) {
      if (post.commentCount === 1) commentString = '1 comment';
      else commentString = post.commentCount + ' comments';
    }

    if (investable) {
      investButtonEl = (<TouchableWithoutFeedback
        onPress={() => this.toggleModal()}
      >
        <View style={styles.investButton}>

          <Text style={[styles.font15, styles.bold, styles.postButtonText]}>
            💰Invest
          </Text>
        </View>
      </TouchableWithoutFeedback>);

      irrelevantButton = (
        <TouchableHighlight
          underlayColor={'transparent'}
          style={styles.postButton}
          onPress={this.irrelevant}
        >
          <Text style={[styles.font12, styles.greyText, styles.postButtonText]}>
           irrelevant
          </Text>
        </TouchableHighlight>
      );
    } else {
      investButtonEl = <View style={[styles.investButton, { opacity: 0 }]} />;
      irrelevantButton = <View style={[styles.postButton, { opacity: 0 }]} />;
    }

     // <TouchableHighlight underlayColor={'transparent'} style={[styles.postButton, { marginRight: 5 }]} onPress={this.goToPost}>
     //    <Text style={[styles.font10, styles.postButtonText]}>
     //     Read more
     //    </Text>
     //  </TouchableHighlight>
    let comments = (<TouchableHighlight
      underlayColor={'transparent'}
      style={[styles.postButton]}
      onPress={() => this.goToPost()}
    >
      <Text style={[{ marginRight: 5 }, styles.greyText, styles.font12, styles.postButtonText]}>
        {commentString}
      </Text>
    </TouchableHighlight>);

    return (<View style={styles.postButtons}>
      {investButtonEl}

      {irrelevantButton}

      {comments}

      <TouchableHighlight
        underlayColor={'transparent'}
        style={[styles.postButton, { flex: 0.1 }]}
        onPress={() => this.showActionSheet()}
      >
        <Text style={[styles.font12, styles.greyText, styles.postButtonText]}>
          ...
        </Text>
      </TouchableHighlight>

      <InvestModal
        toggleFunction={this.toggleModal}
        post={this.props.post}
        visible={this.state.modalVisible}
      />
    </View>);
  }
}

export default PostButtons;

const localStyles = StyleSheet.create({
  investButton: {
    borderWidth: 1,
    backgroundColor: 'white',
    borderColor: 'black',
    paddingLeft: 15,
    paddingRight: 15,
    // marginRight: 10,
    height: 30,
    flex: 0.4,

    shadowColor: 'black',
    // shadowColor: '#4d4eff',
    shadowOffset: { width: 2, height: 2 },
    shadowRadius: 0,
    shadowOpacity: 1,

    flexDirection: 'row',
    justifyContent: 'center'
  },
  postButtons: {
    flexDirection: 'row',
    paddingBottom: 10,
    paddingTop: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  postButton: {
    // borderWidth: 1,
    // borderColor: 'black',
    flex: 0.4,
    padding: 3,

    paddingHorizontal: 5,
    // paddingRight: 10,

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

