import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableHighlight
} from 'react-native';
import PropTypes from 'prop-types';
import { globalStyles, blue, greyText } from '../../styles/global';
import TextBody from '../post/textBody.component';

let styles;

class TextEdit extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      height: 0
    };
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
        // autoGrow
        placeholder={this.props.placeholder}
        placeholderTextColor={greyText}
        ref={c => this.textInput = c}
        style={[
          { height: 'auto', maxHeight: 120, minHeight: 50 },
          this.props.style
        ]}
        onFocus={this.props.onFocus}
        onBlur={this.props.onBlur}
        onChange={(evt) => this.setState({ text: evt.nativeEvent.text })}
        // onChangeText={text => {
        //   this.text = text;
        //   clearTimeout(this.textTimeout);
        //   this.textTimeout = setTimeout(() => this.setState({ text: this.text }), 300);
        // }}
        onContentSizeChange={this.props.onContentSizeChange}
      >
        <TextBody showAllMentions>{this.state.text}</TextBody>
      </TextInput>

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


const localStyles = StyleSheet.create({
  editingCommentButtons: {
    flexDirection: 'row',
    paddingTop: 20,
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
    borderColor: blue,
    alignItems: 'center',
    justifyContent: 'center'
  },
  editingCommentButtonText: {
    color: blue
  },
});

TextEdit.propTypes = {
  text: PropTypes.string,
  placeholder: PropTypes.string,
  toggleFunction: PropTypes.func,
  saveEditFunction: PropTypes.func,
  style: PropTypes.array,
};

styles = { ...localStyles, ...globalStyles };

export default TextEdit;

