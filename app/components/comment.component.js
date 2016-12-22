import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Image,
  ActionSheetIOS,
  AlertIOS,
  TouchableHighlight
} from 'react-native';
import { globalStyles } from '../styles/global';
import CommentEditing from '../components/commentEditing.component';

let moment = require('moment');
let styles;

class Comment extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      buttons: [
        'Edit',
        'Delete',
        'Cancel'
      ],
      destructiveIndex: 1,
      cancelIndex: 2,
      editedText: null,
      editing: false,
      height: 0
    };
    this.timeSince = this.timeSince.bind(this);
    this.singleComment = null;
    this.deleteComment = this.deleteComment.bind(this);
    this.showActionSheet = this.showActionSheet.bind(this);
    this.editComment = this.editComment.bind(this);
    this.saveEdit = this.saveEdit.bind(this);
  }

  componentDidMount() {
    if (this.props.comment.text) {
      let text = this.props.comment.text;
      this.setState({ editedText: text });
    }
  }

  saveEdit(comment) {
    this.props.actions.updateComment(comment, this.props.auth.token)
    .then((results) => {
      if (results) {
        this.setState({ editing: !this.state.editing, editedText: comment.text });
        AlertIOS.alert('Comment updated');
      }
    });
  }

  showActionSheet() {
    ActionSheetIOS.showActionSheetWithOptions({
      options: this.state.buttons,
      cancelButtonIndex: this.state.cancelIndex,
      destructiveButtonIndex: this.state.destructiveIndex,
    },
    (buttonIndex) => {
      switch(buttonIndex) {
        case 0:
          this.editComment();
          break;
        case 1:
          this.deleteComment();
          break;
        default:
          return;
      }
    });
  }

  componentWillUpdate(nextProps, nextState) {
    const self = this;
    if (nextState.editing !== this.state.editing) {
      this.singleComment.measure( (fx, fy, width, height, px, py) => {
        let num = 0;
        num = fy;
        self.props.parentEditing(nextState.editing, num);
      });
    }
  }

  deleteComment() {
    const self = this;
    this.props.actions.deleteComment(
      self.props.auth.token,
      self.props.comment._id,
      self.props.comment.post
    );
  }

  timeSince(date) {
    let seconds = Math.floor((new Date() - date) / 1000);
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) {
        return interval + 'y';
    }
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
        return interval + 'mo';
    }
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
        return interval + 'd';
    }
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
        return interval + 'hr';
    }
    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
        return interval + 'm';
    }
    return Math.floor(seconds) + 's';
  }

  setTag(tag) {
    this.props.actions.selectTag({ _id: tag.replace('#', '') });
    this.props.navigator.changeTab('discover');
  }

  setSelected(user) {
    if (!user) return;
    if (this.props.scene && this.props.scene.id === user._id) return;
    this.props.navigator.goToProfile(user);
  }

  editComment() {
    this.setState({ editedText: this.props.comment.text });
    this.setState({ editing: !this.state.editing });
  }

  render() {
    let comment = this.props.comment;
    if (!comment) return null;
    let body = comment.text;
    let postTime = moment(comment.createdAt);
    let timestamp = this.timeSince(postTime);
    let bodyEl = null;
    let bodyObj = {};
    let optionsEl = null;
    let editingEl = null;
    let authId = null;
    let textEl = null;
    let image = null;
    let owner = false;
    let name = null;
    let imageEl = null;
    let commentUserId = null;
    let textArr = body.replace((/[@#]\S+/g), (a) => { return '`' + a + '`'; }).split(/`/);
    textArr.forEach((section, i) => {
      bodyObj[i] = {};
      bodyObj[i].text = section;
      if (section.indexOf('#') > -1) {
        bodyObj[i].hashtag = true;
        bodyObj[i].mention = false;
      } else if (section.indexOf('@') > -1) {
        bodyObj[i].mention = true;
        bodyObj[i].hashtag = false;
      } else {
        bodyObj[i].hashtag = false;
        bodyObj[i].mention = false;
      }
    });

    textEl = Object.keys(bodyObj).map((key, i) => {
      let text = bodyObj[key].text;

      if (bodyObj[key].hashtag) {
        return (<Text
          key={key}
          onPress={() => this.setTag(text)}
          style={styles.active}
        >
          {text}
        </Text>);
      } else if (bodyObj[key].mention) {
        return (<Text
          key={key}
          onPress={() => this.setSelected(text)}
          style={styles.active}
        >
          {text}
        </Text>);
      }
      return (<Text key={i}>{text}</Text>);
    });

    if (!this.state.editing) {
      bodyEl = (<Text style={[styles.commentBodyText, styles.georgia]}>{textEl}</Text>);
    } else {
      editingEl = (<CommentEditing
        comment={comment}
        toggleFunction={this.editComment}
        saveEditFunction={this.saveEdit}
      />);
    }

    if (comment.embeddedUser) {
      if (comment.embeddedUser.image) image = comment.embeddedUser.image;
      if (comment.embeddedUser.name) name = comment.embeddedUser.name;
      if (comment.user) {
        if (typeof comment.user === 'object') {
          commentUserId = comment.user._id;
        } else {
          commentUserId = comment.user;
        }
      }
    }

    if (this.props.auth.user) {
      if (this.props.auth.user._id) authId = this.props.auth.user._id;
    }

    if (authId && commentUserId) {
      if (authId === commentUserId) owner = true;
    }

    if (image) {
      imageEl = (
        <TouchableHighlight
          underlayColor={'transparent'}
          onPress={() => this.props.navigator.goToProfile({
            _id: comment.user,
            name: comment.embeddedUser.name
          })}
        >
          <Image
            style={styles.commentAvatar}
            source={{ uri: image }}
          />
        </TouchableHighlight>
      );
    }

    if (owner) {
      optionsEl = (<View
        style={{ flex: 1, justifyContent: 'flex-end', flexDirection: 'row' }}
      >
        <TouchableHighlight
          underlayColor={'transparent'}
          onPress={this.showActionSheet}
        >
          <Text style={[{ fontSize: 20, color: '#808080' }]}>...</Text>
        </TouchableHighlight>
      </View>);
    }

    return (
      <View
        ref={(c) => { this.singleComment = c; }}
        style={[styles.commentContainer]}
      >
        <View style={styles.commentHeader}>
          <TouchableHighlight
            underlayColor={'transparent'}
            onPress={() => this.props.navigator.goToProfile({
              _id: comment.user,
              name: comment.embeddedUser.name
            })}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image
                style={styles.commentAvatar}
                source={{ uri: image }}
              />
              <Text style={[styles.bebas, styles.halfLetterSpacing]}>{name}</Text>
            </View>
          </TouchableHighlight>
          <Text style={[{ fontSize: 12 }, styles.timestampGray]}>{timestamp}</Text>
        </View>
        <View style={{ paddingLeft: 35, paddingRight: 10 }}>
          {bodyEl}
          {editingEl}
        </View>
        {optionsEl}
      </View>
    );
  }
}

export default Comment;

const localStyles = StyleSheet.create({
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
  },
  commentContainer: {
    padding: 10,
  },
  commentAvatar: {
    height: 25,
    width: 25,
    borderRadius: 12.5,
    marginRight: 10,
  },
  commentBodyText: {
    lineHeight: 20,
  }
});

styles = { ...localStyles, ...globalStyles };

