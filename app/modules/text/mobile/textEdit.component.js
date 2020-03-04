import React, { Component } from 'react';
import { StyleSheet, View, TextInput, Platform } from 'react-native';
import PropTypes from 'prop-types';
import { globalStyles, greyText } from 'app/styles/global';
import TextBody from 'modules/text/mobile/textBody.component';
import { Button } from 'modules/styled/uni';
import { colors } from 'styles';

let styles;

class TextEdit extends Component {
  static propTypes = {
    text: PropTypes.string,
    placeholder: PropTypes.string,
    style: PropTypes.object,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    onContentSizeChange: PropTypes.func,
    toggleFunction: PropTypes.func,
    saveEditFunction: PropTypes.func
  };

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

    return (
      <View style={{ flex: 1 }}>
        <TextInput
          multiline
          underlineColorAndroid={'transparent'}
          placeholder={this.props.placeholder}
          placeholderTextColor={greyText}
          ref={c => (this.textInput = c)}
          style={[
            {
              height: Math.min(this.state.height, 120) + buttonAdjust,
              maxHeight: 120 + buttonAdjust,
              minHeight: 50,
              paddingBottom: buttonAdjust,
              paddingHorizontal: 0
            },
            this.props.style
          ]}
          textAlignVertical={'top'}
          onFocus={this.props.onFocus}
          onBlur={this.props.onBlur}
          onChange={evt =>
            this.setState({
              text: evt.nativeEvent.text
            })
          }
          onContentSizeChange={e => {
            this.setState({
              height: Math.max(e.nativeEvent.contentSize.height, 50)
            });
            if (this.props.onContentSizeChange) this.props.onContentSizeChange();
          }}
          // fix for android enter bug!
          blurOnSubmit={false}
          onSubmitEditing={() => {
            if (this.bug) {
              let { text } = this.state.text;
              text += '\n';
              this.setState({
                text
              });
              return (this.bug = false);
            }
            return (this.bug = true);
          }}
        >
          <TextBody style={{ flex: 1 }} showAllMentions>
            {this.state.text}
          </TextBody>
        </TextInput>

        <View style={[styles.editingCommentButtons, { marginTop: -1 * buttonAdjust }]}>
          <Button
            mr={1}
            h={5}
            p={['0 2']}
            bg={colors.lightGrey}
            c={colors.black}
            onPress={() => {
              this.props.toggleFunction();
            }}
          >
            Cancel
          </Button>

          <Button
            h={5}
            p={['0 2']}
            onPress={() => this.props.saveEditFunction(this.state.text)}
          >
            Save changes
          </Button>
        </View>
      </View>
    );
  }
}

const localStyles = StyleSheet.create({
  editingCommentButtons: {
    flexDirection: 'row',
    paddingVertical: 30,
    justifyContent: 'flex-end',
    alignItems: 'center',
    flexWrap: 'wrap'
  }
});

TextEdit.propTypes = {
  text: PropTypes.string,
  placeholder: PropTypes.string,
  toggleFunction: PropTypes.func,
  saveEditFunction: PropTypes.func,
  style: PropTypes.array
};

styles = { ...localStyles, ...globalStyles };

export default TextEdit;
