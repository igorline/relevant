import React, { Component } from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableHighlight,
  Dimensions,
  AlertIOS,
  Keyboard,
} from 'react-native';
import { globalStyles } from '../styles/global';

class SignUp extends Component {
  constructor(props, context) {
    super(props, context);
    this.back = this.back.bind(this);
    this.validate = this.validate.bind(this);
    this.state = {
      message: '',
      visibleHeight: Dimensions.get('window').height,
    };
  }

  componentDidMount() {
    this.showListener = Keyboard.addListener('keyboardWillShow', this.keyboardWillShow.bind(this));
    this.hideListener = Keyboard.addListener('keyboardWillHide', this.keyboardWillHide.bind(this));
  }

  componentWillUpdate(nextProps) {
    if (nextProps.auth.statusText && !this.props.auth.statusText) {
      AlertIOS.alert(nextProps.auth.statusText);
    }
  }

  componentWillUnmount() {
    this.showListener.remove();
    this.hideListener.remove();
  }

  keyboardWillShow(e) {
    const newSize = (Dimensions.get('window').height - e.endCoordinates.height);
    this.setState({ visibleHeight: newSize });
  }

  keyboardWillHide() {
    this.setState({ visibleHeight: Dimensions.get('window').height });
  }

  back() {
    this.props.actions.pop(this.props.navigation.main);
  }

  // not used!
  checkPass(user) {
    if (this.state.password) {
      if (this.state.password === this.state.cPassword) {
        this.props.actions.createUser(user);
      } else {
        AlertIOS.alert("passwords don't match");
      }
    } else {
      AlertIOS.alert('no password');
    }
  }

  validate() {
    const user = {
      name: this.state.name,
      phone: this.state.phone,
      email: this.state.email,
      password: this.state.password
    };

    if (this.state.name) {
      if (this.state.name.length > 15) {
        AlertIOS.alert('name must be less than 15 characters');
        return;
      }
    } else {
      AlertIOS.alert('name required');
      return;
    }

    if (!this.state.email) {
      AlertIOS.alert('email required');
      return;
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(this.state.email)) {
      AlertIOS.alert('invalid email address');
      return;
    }


    if (!this.state.phone) {
      AlertIOS.alert('phone number required');
      return;
    }


    if (this.state.password) {
      if (this.state.password != this.state.cPassword) {
        AlertIOS.alert("Passwords don't match");
        return;
      }
    } else {
      AlertIOS.alert('Password required');
      return;
    }

    this.props.actions.createUser(user);
  }

  render() {
    const styles = { ...globalStyles };

    return (
      <View style={[styles.fieldsContainer, { height: this.state.visibleHeight }]}>
        <Text style={[styles.textCenter, styles.font20, styles.darkGray]}>
          Get Relevant { '\n' } Sign up
        </Text>

        <View style={styles.marginTop}>
          <TextInput autoCapitalize={'none'} autoCorrect={false} keyboardType={'default'} clearTextOnFocus={false} placeholder="username" onChangeText={name => this.setState({ name })} value={this.state.name} style={styles.authInput} />
        </View>

        <View style={styles.marginTop}>
          <TextInput autoCapitalize={'none'} autoCorrect={false} keyboardType={'email-address'} clearTextOnFocus={false} placeholder="email" onChangeText={email => this.setState({ email })} value={this.state.email} style={styles.authInput} />
        </View>

        <View style={styles.marginTop}>
          <TextInput autoCapitalize={'none'} keyboardType={'phone-pad'} clearTextOnFocus={false} placeholder="phone number" onChangeText={phone => this.setState({ phone })} value={this.state.phone} style={styles.authInput} />
        </View>

        <View style={styles.marginTop}>
          <TextInput autoCapitalize={'none'} secureTextEntry keyboardType={'default'} clearTextOnFocus={false} placeholder="password" onChangeText={password => this.setState({ password })} value={this.state.password} style={styles.authInput} />
        </View>

        <View style={styles.marginTop}>
          <TextInput autoCapitalize={'none'} secureTextEntry keyboardType={'default'} clearTextOnFocus={false} placeholder="confirm password" onChangeText={cPassword => this.setState({ cPassword })} value={this.state.cPassword} style={styles.authInput} />
        </View>

        <View style={styles.margin}>
          <TouchableHighlight underlayColor={'transparent'} style={[styles.whiteButton]} onPress={this.validate}><Text style={styles.buttonText}>Submit</Text></TouchableHighlight>
        </View>

        <TouchableHighlight underlayColor={'transparent'} style={[styles.whiteButton]} onPress={this.back}><Text style={styles.buttonText}>Back</Text></TouchableHighlight>

      </View>
    );
  }
}

SignUp.propTypes = {
  actions: React.PropTypes.object,
};

export default SignUp;

