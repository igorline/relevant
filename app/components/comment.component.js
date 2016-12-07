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
import ErrorComponent from '../components/error.component';
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

  editComment() {
    console.log('editComment')
    this.setState({ editedText: this.props.comment.text });
    this.setState({ editing: !this.state.editing });
  }

  saveEdit() {
    this.props.actions.updateComment(comment, this.props.auth.token)
    .then((results) => {
      if (results) {
        this.setState({ editing: !this.state.editing });
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
      this.refs.singleComment.measure( (fx, fy, width, height, px, py) => {
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

  render() {
    const self = this;
    let comment = this.props.comment;
    let postTime = moment(comment.createdAt);
    let timeNow = moment();
    let dif = timeNow.diff(postTime);
    let createdTime = moment.duration(dif).humanize();
    let bodyEl = null;

    if (this.state.editing) {
      bodyEl = (<CommentEditing
        comment={comment}
        toggleFunction={this.editComment}
        saveEditFuction={this.saveEdit}
      />);
    } else {
      bodyEl = (<Text style={styles.darkGray}>
        {this.state.editedText}
      </Text>);
    }

    let image = null;
    let name = null;
    let commentUserId = null;

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

    let authId = null;
    if (this.props.auth.user) {
      if (this.props.auth.user._id) authId = this.props.auth.user._id;
    }

    let owner = false;
    if (authId && commentUserId) {
      if (authId === commentUserId) owner = true;
    }

    let imageEl;

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

    return (
      <View
        ref="singleComment" 
        style={[styles.commentContainer]}
      >
        <View style={[styles.flexRow]}>
          {imageEl}
          <View style={{ flex: 1 }}>
            <View style={styles.commentHeaderTextContainer}>
              <Text style={{ fontSize: 12, color: '#aaaaaa' }}>{createdTime} ago</Text>
              <Text style={{ fontSize: 12, color: '#aaaaaa' }}>{name}</Text>
            </View>
            <View style={styles.commentBody}>
              {bodyEl}
            </View>
            {owner ?
              <View
                style={{ flex: 1, justifyContent: 'flex-end', flexDirection: 'row' }}
              >
                <TouchableHighlight
                  underlayColor={'transparent'}
                  onPress={this.showActionSheet}
                >
                  <Text style={[{ fontSize: 20, color: '#808080' }]}>...</Text>
                </TouchableHighlight>
              </View>
            : null}
          </View>
        </View>
      </View>
    );
  }
}

export default Comment;

const localStyles = StyleSheet.create({
  editingCommentButtons: {
    flexDirection: 'row',
    paddingTop: 10,
    justifyContent: 'flex-end',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  editingCommentButton: {
    backgroundColor: 'white',
    padding: 10,
    marginLeft: 10,
    height: 30,
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 3,
    borderColor: 'lightgray',
    alignItems: 'center',
    justifyContent: 'center'
  },
  editingCommentButtonText: {
    color: '#808080'
  },
  commentHeaderTextContainer: {
    height: 50
  },
  commentContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0'
  },
  commentAvatar: {
    height: 25,
    width: 25,
    borderRadius: 12.5,
    marginRight: 10,
  },
  editingInput: {
    backgroundColor: 'transparent',
    flex: 1,
    fontSize: 14,
    padding: 10,
    borderRadius: 5,
    borderColor: 'lightgray',
    borderWidth: 1,
  },
});

styles = { ...localStyles, ...globalStyles };

