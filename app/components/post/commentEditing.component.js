import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableHighlight
} from 'react-native';
import { globalStyles, blue } from '../../styles/global';

let styles;

class CommentEditing extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      height: 0
    };
    this.singleComment = null;
  }

  componentWillMount() {
    this.setState({ text: this.props.text });
  }

  componentDidMount() {
    this.textInput.focus();
  }

  render() {
    return (<View style={{ flex: 1 }}>
      <TextInput
        multiline
        autoGrow
        placeholder={this.props.placeholder}
        ref={c => this.textInput = c}
        style={[
          styles.darkGray,
          styles.editingInput,
          { height: Math.max(50, this.state.height) }
        ]}
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
          onPress={() => { this.props.toggleFunction(); }}
          style={styles.editingCommentButton}
        >
          <Text style={[styles.font10, styles.editingCommentButtonText]}>Cancel</Text>
        </TouchableHighlight>

        <TouchableHighlight
          underlayColor={'transparent'}
          style={styles.editingCommentButton}
          onPress={() => this.props.saveEditFunction(this.state.text)}
        >
          <Text style={[styles.font10, styles.editingCommentButtonText]}>Save changes</Text>
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
    borderWidth: StyleSheet.hairlineWidth,
    // borderRadius: 3,
    borderColor: blue,
    alignItems: 'center',
    justifyContent: 'center'
  },
  editingCommentButtonText: {
    color: blue
  },
  commentHeaderTextContainer: {
    height: 50
  },
  commentContainer: {
    padding: 10,
    borderWidth: StyleSheet.hairlineWidth,
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
    // paddingVertical: 10,
    // borderRadius: 5,
    borderColor: 'lightgrey',
    // borderBottomWidth: StyleSheet.hairlineWidth,
    // borderWidth: StyleSheet.hairlineWidth,
    // padding: 10,

  },
});

styles = { ...localStyles, ...globalStyles };

