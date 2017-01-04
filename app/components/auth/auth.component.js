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
  TouchableWithoutFeedback,
  ListView
} from 'react-native';

import { globalStyles, fullWidth } from '../../styles/global';

let styles;

class Auth extends Component {
  constructor(props, context) {
    super(props, context);
    let ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    this.slides = [1, 2, 3];
    this.state = {
      visibleHeight: Dimensions.get('window').height,
      xOffset: 0,
      dataSource: ds.cloneWithRows(this.slides),
    };
    this.scrollToPage = this.scrollToPage.bind(this);
    this.signup = this.signup.bind(this);
    this.login = this.login.bind(this);
    this.renderIndicator = this.renderIndicator.bind(this);
    this.listview = null;
    this.changeRow = this.changeRow.bind(this);
    this.renderRow = this.renderRow.bind(this);
  }

  login() {
    this.props.actions.push({
      key: 'login',
      title: 'Login',
      showBackButton: true,
      back: true
    }, 'auth');
  }

  signup() {
    this.props.actions.push({
      key: 'signup',
      title: 'Signup',
      showBackButton: true,
      back: true
    }, 'auth');
  }

  renderIndicator() {
    let indicator = [];
    if (!this.slides) return indicator;
    if (this.slides.length) {
      this.slides.forEach((slide, i) => {
        let active = false;
        if (this.state.currentIndex) {
          if (this.state.currentIndex[i]) active = true;
        } else {
          if (i === 0) active = true;
        }
        indicator.push(<TouchableWithoutFeedback onPress={() => this.scrollToPage(i)} key={i} >
          <View style={[styles.indicatorItem, { backgroundColor: active ? 'black' : 'white' }]} />
        </TouchableWithoutFeedback>);
      });
    }
    return indicator;
  }

  changeRow(event) {
    if (!event) return;
    if (!event.s1) return;
    this.setState({ currentIndex: event.s1 });
  }

  scrollToPage(index) {
    let num = (index * (fullWidth - 40)) + (index * 20);
    this.listview.scrollTo({ x: num, animated: true });
  }

  renderRow(data, i) {
    return (<View key={i} style={styles.authSlide}>
      <Text style={{ fontFamily: 'Georgia', fontSize: 26 }}>
        <Text style={styles.strokeText}>Relevant</Text>
        &nbsp;is sit amet, consectetur adipiscing elit, eiusmod tempor incididunt
        &nbsp;<Text style={styles.strokeText}>labore et</Text> dolore magna aliqua ad minim.
      </Text>
    </View>);
  }

  render() {
    const { isAuthenticated } = this.props.auth;

    return (
      <View
        style={[{
          height: isAuthenticated ? this.state.visibleHeight - 60 : this.state.visibleHeight },
          styles.authParent
        ]}
      >
        <View style={styles.logoContainer}>
          <Image source={require('../../assets/images/logo.png')} resizeMode={'contain'} style={styles.authLogo} />
        </View>

        <View style={styles.authDivider} />

        <ListView
          horizontal
          scrollEnabled
          ref={(c) => { this.listview = c; }}
          decelerationRate={'fast'}
          showsHorizontalScrollIndicator={false}
          automaticallyAdjustContentInsets={false}
          snapToInterval={(fullWidth - 20)}
          contentContainerStyle={styles.authSlidesParent}
          onChangeVisibleRows={this.changeRow}
          renderRow={this.renderRow}
          dataSource={this.state.dataSource}
          onScroll={this.checkScroll}
        />

        <View style={styles.indicatorParent}>
          {this.renderIndicator()}
        </View>

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
  authSlidesParent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'nowrap',
    justifyContent: 'flex-start'
  },
  authSlide: {
    width: (fullWidth - 40),
    marginRight: 20,
  },
  indicatorParent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40
  },
  indicatorItem: {
    marginLeft: 5,
    marginRight: 5,
    height: 10,
    width: 10,
    borderRadius: 5,
    borderColor: 'black',
    borderWidth: 1,
  },
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

