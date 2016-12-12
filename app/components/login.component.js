import React, { Component } from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableHighlight,
  AlertIOS,
  Dimensions,
  StyleSheet,
  Keyboard,
  ScrollView,
  KeyboardAvoidingView
} from 'react-native';
import { globalStyles, fullHeight, fullWidth } from '../styles/global';

let localStyles;
let styles;

class Login extends Component {
  constructor(props, context) {
    super(props, context);
    this.back = this.back.bind(this);
    this.login = this.login.bind(this);
    this.state = {
      bool: false,
      notifText: null,
      email: null,
      password: null,
      // visibleHeight: Dimensions.get('window').height,
    };
  }

  componentDidMount() {
    // this.showListener = Keyboard.addListener('keyboardWillShow', this.keyboardWillShow.bind(this));
    // this.hideListener = Keyboard.addListener('keyboardWillHide', this.keyboardWillHide.bind(this));
  }

  componentWillUpdate(nextProps) {
    const self = this;
    if (nextProps.auth.statusText && !self.props.auth.statusText) {
      AlertIOS.alert(nextProps.auth.statusText);
    }
  }

  componentWillUnmount() {
    const self = this;
    self.props.actions.setAuthStatusText();
    // this.showListener.remove();
    // this.hideListener.remove();
  }

  // keyboardWillShow(e) {
  //   const newSize = (Dimensions.get('window').height - e.endCoordinates.height);
  //   this.setState({ visibleHeight: newSize });
  // }

  // keyboardWillHide(e) {
  //   this.setState({ visibleHeight: Dimensions.get('window').height });
  // }

  login() {
    const self = this;
    if (!self.state.email) {
      AlertIOS.alert('must enter email');
      return;
    }

    if (!self.state.password) {
      AlertIOS.alert('must enter password');
      return;
    }

    this.props.actions.loginUser({ email: self.state.email, password: self.state.password });
  }

  back() {
    this.props.actions.pop(this.props.navigation.main);
  }

  render() {
    const self = this;
    styles = { ...localStyles, ...globalStyles };

    return (
      <KeyboardAvoidingView
        behavior={'padding'}
        style={{ height: fullHeight }}
      >
        <ScrollView
          keyboardShouldPersistTaps
          keyboardDismissMode={'interactive'}
          scrollEnabled={false}
          contentContainerStyle={styles.fieldsParent}
        >

          <View style={styles.fieldsInner}>

            <View style={styles.fieldsInputParent}>
              <TextInput autoCorrect={false} autoCapitalize={'none'} keyboardType={'email-address'} clearTextOnFocus={false} placeholder="email" onChangeText={email => this.setState({ email })} value={this.state.email} style={styles.fieldsInput} />
            </View>

            <View style={styles.fieldsInputParent}>
              <TextInput autoCapitalize={'none'} autoCorrect={false} secureTextEntry keyboardType={'default'} clearTextOnFocus={false} placeholder="password" onChangeText={password => this.setState({ password })} value={this.state.password} style={styles.fieldsInput} />
            </View>
          </View>

          <TouchableHighlight onPress={self.login} underlayColor={'transparent'} style={[styles.mediumButton]}>
            <Text style={styles.mediumButtonText}>Submit</Text>
          </TouchableHighlight>


          <TouchableHighlight onPress={self.back} underlayColor={'transparent'} style={[styles.mediumButton, { marginTop: 10 }]}>
            <Text style={styles.mediumButtonText}>Back</Text>
          </TouchableHighlight>

        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
}

Login.propTypes = {
  actions: React.PropTypes.object,
};

localStyles = StyleSheet.create({
});


export default Login;
