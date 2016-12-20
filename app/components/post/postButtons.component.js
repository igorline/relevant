import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  TouchableWithoutFeedback,
  ActionSheetIOS,
} from 'react-native';
import { globalStyles, fullWidth, fullHeight, blue } from '../../styles/global';
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
    this.openComments = this.openComments.bind(this);
    this.toggleExpanded = this.toggleExpanded.bind(this);
    this.irrelevant = this.irrelevant.bind(this);
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

  goToPost() {
    console.log('go to post');
    this.props.navigator.goToPost(this.props.post);
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
      repost: this.props.post._id,
      repostBody: this.props.post.body,
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
      next: 'Post'
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
      next: 'Next'
    }, 'home');
  }

  openComments() {
    // this.props.actions.setSelectedPost(this.props.post._id);
    this.props.navigator.goToComments(this.props.post);
  }

  deletePost() {
    this.props.actions.deletePost(this.props.auth.token, this.props.post);
  }

  irrelevant() {
    // this.props.actions.irrelevant(this.props.auth.token, this.props.post._id);
    this.props.actions.invest(this.props.auth.token, -50, this.props.post, this.props.auth.user)
    .then((results) => {
      if (results) {
        console.log('irrelevant!');
        // this.props.actions.triggerAnimation('invest');
      } else {
        console.log('irrelevant failed');
      }
    });
  }

  toggleExpanded() {
    this.setState({ expanded: !this.state.expanded });
  }

  render() {
    let investButtonEl = null;
    const expanded = this.props.expanded;
    let post = this.props.post;
    let investable = false;
    let irrelevantButton;

    if (post) {
      if (post.comments) comments = post.comments;
    }

    if (post && post.user && this.props.auth.user) {
      if (post.user !== this.props.auth.user._id) {
        investable = true;
      }
    }

    if (post && post.commentCount) {
      if (post.commentCount === 1) commentString = '1 Comment';
      else commentString = post.commentCount + ' Comments';
    }

    if (investable) {
      investButtonEl = (<TouchableWithoutFeedback
        onPress={() => this.toggleModal()}
      >
        <View style={styles.investButton}>

          <Text style={[styles.font17, styles.bebasBold, styles.postButtonText]}>
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
          <Text style={[styles.font17, styles.strokeText, styles.postButtonText]}>
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
     //  <TouchableHighlight underlayColor={'transparent'} style={[styles.postButton, { marginRight: 5 }]} onPress={() => this.openComments()}>
     //    <Text style={[{ marginRight: 5 }, styles.font10, styles.postButtonText]}>
     //      {commentString}
     //    </Text>
     //  </TouchableHighlight>

    return (<View style={styles.postButtons}>
      {investButtonEl}

      {irrelevantButton}

      <TouchableHighlight
        underlayColor={'transparent'}
        style={[styles.postButton, { flex: 0.1 }]}
        onPress={() => this.showActionSheet()}
      >
        <Text style={[styles.font17, styles.strokeText, styles.postButtonText]}>
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
    paddingLeft: 20,
    paddingRight: 20,
    marginRight: 10,
    height: 30,
    flex: 0.4,

    shadowColor: '#4d4eff',
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

    paddingLeft: 10,
    paddingRight: 10,

    height: 30,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  postButtonText: {
    backgroundColor: 'transparent'
  },
});

styles = { ...globalStyles, ...localStyles };

