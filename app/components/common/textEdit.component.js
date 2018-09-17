import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableHighlight,
  Platform,
  Keyboard,
  InteractionManager
} from 'react-native';
import PropTypes from 'prop-types';
import { globalStyles, blue, greyText } from '../../styles/global';
import TextBody from '../post/textBody.component';

let styles;

class TextEdit extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      height: 50
    };
  }

  componentWillMount() {
    this.setState({ text: this.props.text });
  }

  componentDidMount() {
    setTimeout(this.textInput.focus, 100);
  }

  render() {
    let buttonAdjust = 0;
    if (Platform.OS === 'android') buttonAdjust = 80;

    return (<View style={{ flex: 1 }}>
      <TextInput
        multiline
        underlineColorAndroid={'transparent'}
        placeholder={this.props.placeholder}
        placeholderTextColor={greyText}
        ref={c => this.textInput = c}
        style={[
          {
            height: Math.min(this.state.height, 120) + buttonAdjust,
            maxHeight: 120 + buttonAdjust,
            minHeight: 50,
            paddingBottom: buttonAdjust,
            paddingHorizontal: 0,
          },
          this.props.style
        ]}
        textAlignVertical={'top'}
        onFocus={this.props.onFocus}
        onBlur={this.props.onBlur}
        onChange={(evt) => this.setState({
          text: evt.nativeEvent.text
        })}
        onContentSizeChange={(e) => {
          this.setState({
            height: Math.max(e.nativeEvent.contentSize.height, 50)
          });
          if (this.props.onContentSizeChange) this.props.onContentSizeChange();
        }}
        // fix for android enter bug!
        blurOnSubmit={false}
        onSubmitEditing={() => {
          if (this.bug) {
            let text = this.state.text;
            text += '\n';
            this.setState({
              text,
            });

            return this.bug = false;
          }
          return this.bug = true;
        }}
      >
        <TextBody style={{ flex: 1 }} showAllMentions>{this.state.text}</TextBody>
      </TextInput>

      <View style={[ styles.editingCommentButtons, { marginTop: -1 * buttonAdjust }]}>

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

