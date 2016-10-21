import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableHighlight,
  Keyboard
} from 'react-native';

import { connect } from 'react-redux';
import * as authActions from '../actions/auth.actions';
import { bindActionCreators } from 'redux';
import { globalStyles } from '../styles/global';

const localStyles = StyleSheet.create({
  authScroll: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  alignAuth: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  }
});

let styles = { ...localStyles, ...globalStyles };

class Auth extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      visibleHeight: Dimensions.get('window').height
    };
  }

  keyboardWillShow(e) {
    let newSize = (Dimensions.get('window').height - e.endCoordinates.height);
    this.setState({ visibleHeight: newSize });
  }

  keyboardWillHide(e) {
    this.setState({ visibleHeight: Dimensions.get('window').height });
  }

  componentDidMount() {
    const self = this;
    this.props.actions.getUser(null, true);
    this.showListener = Keyboard.addListener('keyboardWillShow', this.keyboardWillShow.bind(this));
    this.hideListener = Keyboard.addListener('keyboardWillHide', this.keyboardWillHide.bind(this));
  }

  componentWillUnmount() {
    this.showListener.remove();
    this.hideListener.remove();
  }

  login() {
    const self = this;
    self.props.navigator.push({ name: 'login' });
  }

  signup() {
    const self = this;
    self.props.navigator.push({ name: 'signup' });
  }

  render() {
    const self = this;
    const { isAuthenticated, user } = this.props.auth;

    return (
      <View style={[{ height: isAuthenticated ? self.state.visibleHeight - 60 : self.state.visibleHeight, backgroundColor: '#F0F0F0' }]}>
        <View style={styles.alignAuth}>
          <Text style={[styles.textCenter, styles.font20, styles.darkGray, { marginBottom: 10 }]}>Relevant</Text>
          <TouchableHighlight
            style={[styles.whiteButton]}
            onPress={() => self.login()}
          >
            <Text style={styles.buttonText}>Log In</Text>
          </TouchableHighlight>
          <TouchableHighlight
            onPress={() => self.signup()}
            style={[styles.whiteButton, styles.marginTop]}
          >
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableHighlight>
        </View>
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    auth: state.auth,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      { ...authActions }, dispatch),
  };
}


export default connect(mapStateToProps, mapDispatchToProps)(Auth);

