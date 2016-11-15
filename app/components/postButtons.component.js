import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  TouchableWithoutFeedback,
  AlertIOS,
  ActionSheetIOS,
  Modal,
} from 'react-native';
import { globalStyles, fullWidth, fullHeight } from '../styles/global';
import InvestModal from './investModal.component.js';
import Share from 'react-native-share';

let styles;

class PostButtons extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      editing: false,
      modalVisible: false,
      expanded: false,
      buttons: [
        'Share',
        'Irrelevant',
        'Cancel',
      ],
      cancelIndex: 2,
    };
    this.toggleModal = this.toggleModal.bind(this);
    this.showActionSheet = this.showActionSheet.bind(this);
    this.openComments = this.openComments.bind(this);
    this.toggleExpanded = this.toggleExpanded.bind(this);
  }

  componentDidMount() {
    const self = this;
    if (self.props.post.user && self.props.auth.user) {
      if (self.props.post.user._id === self.props.auth.user._id) {
        self.setState({
          myPost: true,
          buttons: [
            'Share',
            'Edit',
            'Delete',
            'Cancel',
          ],
          destructiveIndex: 2,
          cancelIndex: 3,
        });
      }
    }
  }

  // saveEdit() {
  //   const self = this;
  //   let title = self.state.editedTitle;
  //   let body = self.state.editedBody;
  //   let bodyTags = body.match(/#\S+/g);
  //   let bodyMentions = body.match(/@\S+/g);
  //   let tags = [];
  //   let mentions = [];
  //   let preTags = [];
  //   if (self.props.post.tags) {
  //     self.props.post.tags.forEach((tag) => {
  //       preTags.push(tag.name);
  //     });
  //   }

  //   if (bodyTags) {
  //     bodyTags.forEach((eachTag) => {
  //       let tagReplace = eachTag.replace('#', '');
  //       tags.push(tagReplace);
  //     });
  //   }
  //   if (bodyMentions) {
  //     bodyMentions.forEach((eachName) => {
  //       let nameReplace = eachName.replace('@', '');
  //       mentions.push(nameReplace);
  //     });
  //   }

  //   let finalTags = tags.concat(preTags);
  //   let postBody = {
  //     user: self.props.auth.user._id,
  //     _id: self.props.post._id,
  //     body,
  //     tags: finalTags,
  //     title,
  //     mentions,
  //   };

  //   // Update post action here
  //   self.props.actions.editPost(postBody, self.props.auth.token).then((results) => {
  //     if (!results) {
  //       AlertIOS.alert('Update error please try again');
  //     } else {
  //       AlertIOS.alert('Updated');
  //       self.setState({ editing: false });
  //     }
  //   });
  // }

  // extractDomain(url) {
  //   let domain;
  //   if (url.indexOf('://') > -1) {
  //     domain = url.split('/')[2];
  //   } else {
  //     domain = url.split('/')[0];
  //   }
  //   domain = domain.split(':')[0];

  //   let noPrefix = domain;

  //   if (domain.indexOf('www.') > -1) {
  //     noPrefix = domain.replace('www.', '');
  //   }
  //   return noPrefix;
  // }

  showActionSheet() {
    const self = this;
    if (self.state.myPost) {
      ActionSheetIOS.showActionSheetWithOptions({
        options: self.state.buttons,
        cancelButtonIndex: self.state.cancelIndex,
        destructiveButtonIndex: self.state.destructiveIndex,
      },
      (buttonIndex) => {
        switch (buttonIndex) {
          case 0:
            self.onShare();
            break;
          case 1:
            self.toggleEditing();
            break;
          case 2:
            self.deletePost();
            break;
          default:
            return;
        }
      });
    } else {
      ActionSheetIOS.showActionSheetWithOptions({
        options: self.state.buttons,
        cancelButtonIndex: self.state.cancelIndex,
        destructiveButtonIndex: self.state.destructiveIndex,
      },
      (buttonIndex) => {
        switch (buttonIndex) {
          case 0:
            self.onShare();
            break;
          case 1:
            self.irrelevant();
            break;
          default:
            return;
        }
      });
    }
  }

  toggleModal(bool) {
    const self = this;
    if (!bool) bool = !self.state.modalVisible;
    self.setState({ modalVisible: bool });
  }

  onShare() {
    const self = this;
    Share.open({
      title: 'Relevant',
      url: self.props.post.link ? self.props.post.link : 'http://relevant-community.herokuapp.com/',
      subject: 'Share Link',
      message: self.props.post.title ? 'Relevant post: ' + self.props.post.title : 'Relevant post:'
    }, (e) => {
      console.log(e);
    });
  }

  openComments() {
    this.props.actions.setSelectedPost(this.props.post._id);
    this.props.navigator.goToComments(this.props.post);
  }

  deletePost() {
    this.props.actions.deletePost(this.props.auth.token, this.props.post);
  }

  irrelevant() {
    const self = this;
    self.props.actions.irrelevant(self.props.auth.token, self.props.post._id);
  }

  toggleExpanded() {
    const self = this;
    self.setState({ expanded: !self.state.expanded });
  }


  render() {
    const self = this;
    let commentString = 'Add comment';
    let investButtonEl = null;
    const comments = this.props.comments;
    const expanded = this.props.expanded;
    let post = this.props.post;

    if (post && post.user && this.props.auth.user) {
      if (post.user._id !== this.props.auth.user._id) {
        investable = true;
      }
    }

    if (comments) {
      if (comments.length === 1) commentString = '1 Comment';
      if (comments.length > 1) commentString = comments.length + ' Comments';
    }

    if (investable) {
        investButtonEl = (<TouchableWithoutFeedback
          onPress={() => self.toggleModal()}
          style={[styles.postButton, { marginRight: 5, backgroundColor: '#F0F0F0' }]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}><Text style={[styles.font10, styles.postButtonText]}>Invest</Text><Text style={styles.font10}>💰</Text></View>
        </TouchableWithoutFeedback>);
    }

    return (<View style={styles.postButtons}>
      {investButtonEl}
      <TouchableHighlight underlayColor={'transparent'} style={[styles.postButton, { marginRight: 5 }]} onPress={() => self.toggleExpanded()}><Text style={[styles.font10, styles.postButtonText]}>{expanded ? 'Read less' : 'Read more'}</Text></TouchableHighlight>
      <TouchableHighlight underlayColor={'transparent'} style={[styles.postButton, { marginRight: 5 }]} onPress={() => self.openComments()}><Text style={[{ marginRight: 5 }, styles.font10, styles.postButtonText]}>{commentString}</Text></TouchableHighlight>
      <TouchableHighlight underlayColor={'transparent'} style={styles.postButton} onPress={() => self.showActionSheet()}><Text style={[styles.font10, styles.postButtonText]}>...</Text></TouchableHighlight>
      <InvestModal toggleFunction={this.toggleModal} visible={this.state.modalVisible} />
    </View>);
  }
}

export default PostButtons;

const localStyles = StyleSheet.create({

});

styles = { ...globalStyles, ...localStyles };

