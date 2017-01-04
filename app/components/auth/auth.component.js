import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableHighlight,
  Keyboard,
  Image,
  ScrollView,
} from 'react-native';

import { globalStyles, fullWidth } from '../../styles/global';

let styles;

class Auth extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      visibleHeight: Dimensions.get('window').height
    };
    this.signup = this.signup.bind(this);
    this.login = this.login.bind(this);
    this.renderSlides = this.renderSlides.bind(this);
  }

  componentDidMount() {
    this.showListener = Keyboard.addListener('keyboardWillShow', this.keyboardWillShow.bind(this));
    this.hideListener = Keyboard.addListener('keyboardWillHide', this.keyboardWillHide.bind(this));
  }

  componentWillUnmount() {
    this.showListener.remove();
    this.hideListener.remove();
  }

  keyboardWillShow(e) {
    let newSize = (Dimensions.get('window').height - e.endCoordinates.height);
    this.setState({ visibleHeight: newSize });
  }

  keyboardWillHide() {
    this.setState({ visibleHeight: Dimensions.get('window').height });
  }

  login() {
    this.props.actions.push({
      key: 'login',
      title: 'Login',
      showBackButton: true
    }, this.props.navigation.main);
  }

  signup() {
    this.props.actions.push({
      key: 'signup',
      title: 'Signup',
      showBackButton: true
    }, this.props.navigation.main);
  }

  renderSlides() {
    let slides = [];

    slides.push(<View style={{ width: (fullWidth - 20), borderWidth: 1, borderColor: 'red' }}>
      <Text style={{ fontFamily: 'Georgia', fontSize: 26 }}>
        <Text style={styles.strokeText}>Relevant</Text>
        &nbsp;is sit amet, consectetur adipiscing elit, eiusmod tempor incididunt
        &nbsp;<Text style={styles.strokeText}>labore et</Text> dolore magna aliqua ad minim.
      </Text>
    </View>);

    slides.push(<View style={{ width: (fullWidth - 20), borderWidth: 1, borderColor: 'blue' }}>
      <Text style={{ fontFamily: 'Georgia', fontSize: 26 }}>
        <Text style={styles.strokeText}>Relevant</Text>
        &nbsp;is sit amet, consectetur adipiscing elit, eiusmod tempor incididunt
        &nbsp;<Text style={styles.strokeText}>labore et</Text> dolore magna aliqua ad minim.
      </Text>
    </View>);

    slides.push(<View style={{ width: (fullWidth - 20), borderWidth: 1, borderColor: 'blue' }}>
      <Text style={{ fontFamily: 'Georgia', fontSize: 26 }}>
        <Text style={styles.strokeText}>Relevant</Text>
        &nbsp;is sit amet, consectetur adipiscing elit, eiusmod tempor incididunt
        &nbsp;<Text style={styles.strokeText}>labore et</Text> dolore magna aliqua ad minim.
      </Text>
    </View>);

    return slides;
  }

  render() {
    const { isAuthenticated } = this.props.auth;

    return (
      <View
        style={[
          {
            height: isAuthenticated ? this.state.visibleHeight - 60 : this.state.visibleHeight
          },
          styles.authParent
        ]}
      >
        <View style={styles.logoContainer}>
          <Image source={require('../../assets/images/logo.png')} resizeMode={'contain'} style={styles.authLogo} />
        </View>

        <View style={styles.authDivider} />

        <ScrollView
          horizontal
          scrollEnabled
          decelerationRate={'fast'}
          showsHorizontalScrollIndicator={true}
          automaticallyAdjustContentInsets={false}
          snapToInterval={(fullWidth * 0.92) + 8}
          contentContainerStyle={{ flexDirection: 'row', borderWidth: 1, borderColor: 'orange', alignItems: 'flex-start', flexWrap: 'nowrap', justifyContent: 'flex-start' }}
          snapToAlignment={'center'}
        >
          {this.renderSlides()}
        </ScrollView>

        <TouchableHighlight
          onPress={this.signup}
          style={styles.largeButton}
          underlayColor={'transparent'}
        >
          <Text style={styles.largeButtonText}>
            Sign Up Now
          </Text>
        </TouchableHighlight>

        <TouchableHighlight
          style={{}}
          onPress={this.login}
          underlayColor={'transparent'}
        >
          <Text style={styles.signInText}>
            Already have an account? <Text style={{ color: '#3E3EFF' }}>Sign In.</Text>
          </Text>
        </TouchableHighlight>
      </View>
    );
  }
}

const localStyles = StyleSheet.create({
  authDivider: {
    height: 5,
    marginTop: 20,
    marginBottom: 30,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderBottomColor: 'black',
    borderTopColor: 'black',
  },
  logoContainer: {
    marginTop: 10,
    flex: 0.25,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  authLogo: {
    width: fullWidth * 0.8,
    flex: 1,
  },
  authParent: {
    backgroundColor: 'white',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
    padding: 20
  },
});

styles = { ...localStyles, ...globalStyles };

export default Auth;

