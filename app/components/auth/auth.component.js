import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableHighlight,
  Image,
  TouchableWithoutFeedback,
  ListView,
  AlertIOS
} from 'react-native';

import { globalStyles, fullWidth } from '../../styles/global';

let styles;

class Auth extends Component {
  constructor(props, context) {
    super(props, context);
    let ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    this.slides = [1];
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

  componentDidMount() {
    setTimeout(() => this.setState({ changed: [false, false, false] }), 100);
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
    if (this.props.admin.currentInvite) {
      return this.props.actions.push({
        key: 'signup',
        title: 'Signup',
        showBackButton: true,
        back: true,
        code: this.props.admin.currentInvite.code,
        email: this.props.admin.currentInvite.email
      }, 'auth');
    }
    AlertIOS.prompt(
      'Enter invitiation code',
      'Relevant is an invitation-only community',
      [
        { text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel'
        },
        { text: 'OK',
          onPress: code => {
            let action = this.props.actions.checkInviteCode(code);
            action.then(invite => {
              if (invite) {
                this.props.actions.push({
                  key: 'signup',
                  title: 'Signup',
                  showBackButton: true,
                  back: true,
                  email: invite.email,
                  code: invite.code
                }, 'auth');
              }
            });
          } }
      ]);
  }

  renderIndicator() {
    let indicator = [];
    if (!this.slides) return indicator;
    if (this.slides.length) {
      this.slides.forEach((slide, i) => {
        let active = false;

        if (this.state.currentIndex) {
          if (this.state.currentIndex[i]) active = true;
          if (this.state.changed && this.state.changed[i]) active = false;
          if (i === 0 && this.state.currentIndex[0] && !this.state.currentIndex[1]) active = true;
        } else if (i === 0) active = true;

        indicator.push(<TouchableWithoutFeedback onPress={() => this.scrollToPage(i)} key={i} >
          <View style={[styles.indicatorItem, { backgroundColor: active ? 'black' : 'white' }]} />
        </TouchableWithoutFeedback>);
      });
    }
    return indicator;
  }

  changeRow(event, changed) {
    if (event && event.s1) this.setState({ currentIndex: event.s1 });
    if (changed && changed.s1) this.setState({ changed: changed.s1 });
  }

  scrollToPage(index) {
    let num = (index * (fullWidth));
    this.listview.scrollTo({ x: num, animated: true });
  }

  renderRow(data, section, i) {
    // <View style={{ height: 24, width: 115 }}><Text style={[styles.strokeText, styles.adjust]}>Relevant</Text></View>&nbsp;

    switch (i) {
      case '0':
        return (<View key={i} style={styles.authSlide}>
          <Text allowFontScaling={false} style={{ fontFamily: 'Georgia', fontSize: 36, lineHeight: 46 }}>
            <Text allowFontScaling={false} style={[styles.strokeText, styles.relevant]}>Relevant</Text> is a social news reader that emphasizes quality over quantity.
          </Text>
        </View>);
      case '1':
        return (<View key={i} style={styles.authSlide}>
          <Text allowFontScaling={false} style={{ fontFamily: 'Georgia', fontSize: 26, lineHeight: 36 }}>
            Post <Text
              allowFontScaling={false}
              style={[styles.strokeText, styles.adjust]}
            >
            insightful
            </Text> commentary and watch your <Text allowFontScaling={false} style={[styles.strokeText, styles.adjust]}>relevance</Text> rise.
          </Text>
        </View>);
      case '2':
        return (<View key={i} style={styles.authSlide}>
          <Text allowFontScaling={false} style={{ fontFamily: 'Georgia', fontSize: 26, lineHeight: 36 }}>
            <Text allowFontScaling={false} style={[styles.strokeText, styles.adjust]}>Invest</Text> in relevant posts to curate <Text allowFontScaling={false} style={[styles.strokeText, styles.adjust]}>your</Text> feed and watch your money grow.
          </Text>
        </View>);
      default: return <View key={i} style={styles.authSlide} />;
    }
  }

  render() {
    const { isAuthenticated } = this.props.auth;

    // let intro = (
    //   <View style={{ flex: 1, justifyContent: 'center' }}>
    //     <ListView
    //       horizontal
    //       scrollEnabled
    //       ref={(c) => { this.listview = c; }}
    //       decelerationRate={'fast'}
    //       showsHorizontalScrollIndicator={false}
    //       automaticallyAdjustContentInsets={false}
    //       snapToInterval={(fullWidth)}
    //       contentContainerStyle={styles.authSlidesParent}
    //       onChangeVisibleRows={this.changeRow}
    //       renderRow={this.renderRow}
    //       dataSource={this.state.dataSource}
    //       onScroll={this.checkScroll}
    //     />
    //     <View style={styles.indicatorParent}>
    //       {this.renderIndicator()}
    //     </View>
    //   </View>
    // );

    let intro = (
      <View style={{ flex: 1, paddingHorizontal: 20, alignItems: 'stretch' }}>
        <Image
          resizeMode={'contain'}
          style={{ flex: 1, width: null, height: null }}
          source={require('../../assets/images/intro3.jpg')}
        />
      </View>
    )

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
        <View style={styles.authPadding}>
          <View style={styles.authDivider} />
        </View>

        {intro}

        <View style={styles.authPadding}>
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
            <Text allowFontScaling={false} style={styles.signInText}>
              Already have an account? <Text style={{ color: '#3E3EFF' }}>Sign In.</Text>
            </Text>
          </TouchableHighlight>
        </View>
      </View>
    );
  }
}

const localStyles = StyleSheet.create({
  adjust: {
    fontSize: 38,
    lineHeight: 30,
  },
  relevant: {
    height: 30,
    width: 70,
  },
  authSlidesParent: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
    justifyContent: 'flex-start'
  },
  authSlide: {
    width: (fullWidth - 40),
    marginHorizontal: 20,
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
    marginBottom: 0,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderBottomColor: 'black',
    borderTopColor: 'black',
  },
  logoContainer: {
    marginTop: 10,
    height: 90,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  authLogo: {
    width: fullWidth - 40,
    flex: 1,
  },
  authParent: {
    backgroundColor: 'white',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
    paddingVertical: 20
  },
  authPadding: {
    paddingHorizontal: 20,
  }
});

styles = { ...localStyles, ...globalStyles };

export default Auth;

