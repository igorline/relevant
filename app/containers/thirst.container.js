import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  Dimensions,
  Keyboard,
  AlertIOS,
  TextInput
} from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { globalStyles, fullWidth, fullHeight } from '../styles/global';
import * as messageActions from '../actions/message.actions';

const localStyles = StyleSheet.create({
  commentInputParent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chooseTagContainer: {
    flex: 0.9,
    padding: 10,
  },
  thirstInput: {
    flex: 0.9,
    width: fullWidth,
    padding: 10
  },
  thirstSubmit: {
    flex: 0.1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

let styles = { ...localStyles, ...globalStyles };

class Thirst extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      visibleHeight: Dimensions.get('window').height - 120,
      tag: null,
      autoTags: [],
      preTag: null,
      text: null
    };
  }

  componentDidMount() {
    const self = this;
    this.showListener = Keyboard.addListener('keyboardWillShow', this.keyboardWillShow.bind(this));
    this.hideListener = Keyboard.addListener('keyboardWillHide', this.keyboardWillHide.bind(this));
  }

  componentWillUnmount() {
    this.showListener.remove();
    this.hideListener.remove();
  }

  keyboardWillHide(e) {
    this.setState({ visibleHeight: Dimensions.get('window').height - 120 });
  }

  keyboardWillShow(e) {
    let newSize = (Dimensions.get('window').height - e.endCoordinates.height) - 60;
    this.setState({ visibleHeight: newSize });
  }

  sendThirst() {
    const self = this;
    if (!self.state.text) {
      AlertIOS.alert('Add text');
      return;
    }
    let messageObj = {
      to: self.props.users.selectedUser._id,
      from: self.props.auth.user._id,
      type: 'thirst',
      text: self.state.text,
      tag: null
    };

    self.props.actions.createMessage(self.props.auth.token, messageObj).then((data) => {
      console.log(data, 'thirty data');
      if (data.status) {
        AlertIOS.alert('Message sent');
        self.setState({ tag: null, text: null });
      } else {
        AlertIOS.alert('Try again');
        self.setState({ tag: null, text: null });
      }
    });
  }

  addTagToMessage(tag) {
    const self = this;
    if (!self.state.tag) {
      self.setState({ preTag: null, tag, autoTags: [] });
    } else {
      AlertIOS.alert('Cannot add multiple tags');
    }
  }

  removeTag() {
    const self = this;
    self.setState({ tag: null });
  }

  render() {
    const self = this;
    let user = null;
    let name = null;
    if (self.props.users) {
      if (self.props.users.selectedUser) user = self.props.users.selectedUser;
      if (user) name = user.name;
    }
    let tagEl = null;

    return (
      <View style={[{ height: self.state.visibleHeight, backgroundColor: 'white' }]}>
        <View style={{ flex: 1}}>
          <TextInput
            style={[styles.thirstInput, styles.font15]}
            placeholder={'Enter your message for ' + name}
            multiline
            onChangeText={(text) => this.setState({ text })}
            value={self.state.text}
            returnKeyType={'done'}
          />
          <TouchableHighlight
            underlayColor={'transparent'}
            style={[styles.thirstSubmit]}
            onPress={() => self.sendThirst}
          >
            <Text
              style={[styles.font15, styles.active]}
            >
              Send
            </Text>
          </TouchableHighlight>
        </View>
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    auth: state.auth,
    messages: state.messages,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      { ...messageActions,
      }, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Thirst);
