import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableHighlight
} from 'react-native';
import { globalStyles } from '../../styles/global';

let moment = require('moment');

let styles;

class CommentEditing extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      height: 0
    };
    this.singleComment = null;
    this.saveEdit = this.saveEdit.bind(this);
  }

  componentDidMount() {
    this.setState({ text: this.props.comment.text });
  }

  saveEdit() {
    if (this.state.text !== this.props.comment.text) {
      let comment = this.props.comment || null;
      if (comment) {
        comment.text = this.state.text;
        this.props.saveEditFunction(comment);
      }
    } else {
      this.props.toggleFunction();
    }
  }

  render() {
    const self = this;
    let comment = this.props.comment;
    let postTime = moment(comment.createdAt);
    let timeNow = moment();
    let dif = timeNow.diff(postTime);
    let createdTime = moment.duration(dif).humanize();

    return (<View style={{ flex: 1 }}>
      <TextInput
        multiline
        autoGrow
        style={[
          styles.darkGray,
          styles.editingInput,
          { height: Math.max(75, this.state.height)
        }]}
        onChange={(event) => {
          this.setState({
            text: event.nativeEvent.text,
            height: event.nativeEvent.contentSize.height,
          });
        }}
        value={this.state.text}
      />
      <View style={styles.editingCommentButtons}>
        <TouchableHighlight
          underlayColor={'transparent'}
          style={styles.editingCommentButton}
          onPress={this.saveEdit}
        >
          <Text style={[styles.font10, styles.editingCommentButtonText]}>Save changes</Text>
        </TouchableHighlight>
        <TouchableHighlight
          underlayColor={'transparent'}
          onPress={() => { this.props.toggleFunction(); }}
          style={styles.editingCommentButton}
        >
          <Text style={[styles.font10, styles.editingCommentButtonText]}>Cancel</Text>
        </TouchableHighlight>
      </View>
    </View>);
  }
}

export default CommentEditing;

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

