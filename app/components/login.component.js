import React, { Component } from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableHighlight,
  AlertIOS,
  Dimensions,
  Keyboard,
} from 'react-native';
import { globalStyles } from '../styles/global';
import * as authActions from '../actions/auth.actions';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

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
      visibleHeight: Dimensions.get('window').height,
    };
  }

  componentDidMount() {
    this.showListener = Keyboard.addListener('keyboardWillShow', this.keyboardWillShow.bind(this));
    this.hideListener = Keyboard.addListener('keyboardWillHide', this.keyboardWillHide.bind(this));
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
    this.showListener.remove();
    this.hideListener.remove();
  }

  keyboardWillShow(e) {
    const newSize = (Dimensions.get('window').height - e.endCoordinates.height);
    this.setState({ visibleHeight: newSize });
  }

  keyboardWillHide(e) {
    this.setState({ visibleHeight: Dimensions.get('window').height });
  }

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
    const self = this;
    console.log('back');
    self.props.navigator.push({name: 'auth'});
  }

  render() {
    const self = this;
    const styles = globalStyles;
    return (
      <View style={[{ height: self.state.visibleHeight, backgroundColor: '#F0F0F0', alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={[styles.textCenter, styles.font20, styles.darkGray]}>
          Stay Relevant {'\n'} Log in
        </Text>
        <View style={styles.marginTop}>
          <TextInput autoCapitalize={'none'} keyboardType={'default'} clearTextOnFocus={false} placeholder="email" onChangeText={(email) => this.setState({ email })} value={this.state.email} style={styles.authInput} />
        </View>

        <View style={styles.marginTop}>
          <TextInput autoCapitalize={'none'} secureTextEntry={true} keyboardType='default' clearTextOnFocus={false} placeholder="password" onChangeText={(password) => this.setState({password})} value={this.state.password} style={styles.authInput} />
        </View>

        <View style={styles.margin}>
          <TouchableHighlight onPress={self.login} style={[styles.whiteButton]}>
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableHighlight>
        </View>

        <TouchableHighlight onPress={self.back} style={[styles.whiteButton]}><Text style={styles.buttonText} >Back</Text></TouchableHighlight>
      </View>
    );
  }
}

Login.propTypes = {
  actions: React.PropTypes.object,
};

function mapStateToProps(state) {
  return {
    auth: state.auth,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...authActions,
    }, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);
