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
  AlertIOS,
  Platform
} from 'react-native';
import Prompt from 'react-native-prompt';
import { globalStyles, fullWidth, fullHeight, smallScreen } from '../../styles/global';

let styles;

class Auth extends Component {
  constructor(props, context) {
    super(props, context);
    let ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    this.slides = [1, 2, 3, 4];
    this.state = {
      visibleHeight: Dimensions.get('window').height,
      xOffset: 0,
      dataSource: ds.cloneWithRows(this.slides),
      currentIndex: 0
    };
    this.scrollToPage = this.scrollToPage.bind(this);
    this.signup = this.signup.bind(this);
    this.login = this.login.bind(this);
    this.renderIndicator = this.renderIndicator.bind(this);
    this.listview = null;
    this.changeRow = this.changeRow.bind(this);
    this.renderRow = this.renderRow.bind(this);
    this.onScrollEnd = this.onScrollEnd.bind(this);
  }

  componentDidMount() {
    setTimeout(() => this.setState({ changed: [false, false, false] }), 100);
  }

  onScrollEnd(e) {
    let contentOffset = e.nativeEvent.contentOffset;
    let viewSize = e.nativeEvent.layoutMeasurement;

    // Divide the horizontal offset by the width of the view to see which page is visible
    let pageNum = Math.floor(contentOffset.x / viewSize.width);
    this.setState({ currentIndex: pageNum });
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

    // Android
    if (Platform.OS === 'android') {
      this.promptTitle = 'Enter invitation code';
      this.setState({ promptVisible: true });
      return null;
    }

    // IOS
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
        let active = this.state.currentIndex === i;
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

    function sentance(text, special) {
      let words = text.split(/\s/);
      let l = words.length - 1;
      return words.map((t, i) => {
        if (special.find(w => t === w)) {
          return (
            <Text key={i + t} allowFontScaling={false} style={[styles.strokeText, styles.relevant]}>
              {t + (l === i ? '' : ' ')}
            </Text>
          );
        }
        return (<Text key={i + t} allowFontScaling={false} style={[styles.slideText]}>
          {t + (l === i ? '' : ' ')}
        </Text>);
      });
    }

    switch (i) {
      case '0':
        return (
          <View>
            <View key={i} style={styles.authSlide}>
              {sentance('Relevant is a social news reader that values quality over clicks', ['Relevant', 'quality', 'clicks'])}
              <Text allowFontScaling={false} style={styles.slideText}></Text>
            </View>
            <View style={styles.splashEmojiContainer}><Text style={styles.splashEmoji}>✌️</Text></View>
          </View>
        );
      case '1':
        return (
          <View>
            <View key={i} style={styles.authSlide}>
              {sentance('Discover relevant content and silence the noise of the attention economy', ['relevant', 'noise', 'content'])}
              <Text allowFontScaling={false} style={styles.slideText}></Text>
            </View>
          </View>
        );
      case '2':
        return (
          <View>
            <View key={i} style={styles.authSlide}>
              {sentance('Earn rewards by sharing articles that are worth reading', [ 'rewards', 'Earn', 'worth', 'reading'])}
              <Text allowFontScaling={false} style={styles.slideText}></Text>
            </View>
{/*            <Image
              resizeMode={'contain'}
              style={[styles.r, { width: 60, height: 60, marginTop: 10, alignSelf: 'center' }]}
              source={require('../../assets/images/relevantcoin.png')}
            />*/}
          </View>
        );
      case '3':
        return (<View key={i} style={styles.authSlide}>
          {sentance('Join the community and help us build a better information environment for all', ['Join', 'community', 'for', 'all'])}
          <Text allowFontScaling={false} style={styles.slideText}></Text>
        </View>);
      default: return <View key={i} style={styles.authSlide} />;
    }
  }

  render() {
    const { isAuthenticated } = this.props.auth;

    let intro = (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ListView
          horizontal
          scrollEnabled
          ref={(c) => { this.listview = c; }}
          decelerationRate={'fast'}
          showsHorizontalScrollIndicator={false}
          automaticallyAdjustContentInsets={false}
          snapToInterval={(fullWidth)}
          contentContainerStyle={styles.authSlidesParent}
          renderRow={this.renderRow}
          dataSource={this.state.dataSource}
          onMomentumScrollEnd={this.onScrollEnd}
          pagingEnabled
        />
        <View style={styles.indicatorParent}>
          {this.renderIndicator()}
        </View>
      </View>
    );
{/* 
    let intro = (
      <View style={{ flex: 1, paddingHorizontal: 20, alignItems: 'stretch' }}>
        <Image
          resizeMode={'contain'}
          style={{ flex: 1, width: null, height: null }}
          source={require('../../assets/images/intro3.jpg')}
        />
      </View>
    ); */}

    if (this.props.share) intro = <View style={{ flex: 1 }} />;


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

        <Prompt
          title={this.promptTitle || ''}
          // placeholder=""
          // defaultValue="Hello"
          visible={this.state.promptVisible}
          onCancel={() => this.setState({ promptVisible: false })}
          onSubmit={code => {
            this.props.actions.checkInviteCode(code)
            .then(invite => {
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
              this.setState({ promptVisible: false });
            });
          }}
        />
      </View>
    );
  }
}

const localStyles = StyleSheet.create({
  adjust: {
    fontSize: 38,
    lineHeight: 30,
  },
  strokeText: {
    fontSize: smallScreen ? 32 : 38,
    fontFamily: 'HelveticaNeueLTStd-BdOu',
    lineHeight: Platform.OS === 'ios' ? (smallScreen ? 47 : 55) : (smallScreen ? 39 : 46),
    // lineHeight: 45,rr
    // flexDirection: 'row',
    // alignSelf: 'flex-start'
    // marginTop: 8
  },
  slideText: {
    fontFamily: 'Georgia',
    fontSize: smallScreen ? 30 : 36,
    lineHeight: smallScreen ? 40 : 46
  },
  relevant: {
    height: smallScreen ? 40 : 46,
    // width: 200,
  },
  authSlidesParent: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'nowrap',
    justifyContent: 'flex-start'
  },
  authSlide: {
    flexDirection: 'row',
    // alignItems: 'flex-start',
    // justifyContent: 'center',
    flexWrap: 'wrap',
    width: (fullWidth - 40),
    marginHorizontal: 20,
  },
  indicatorParent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 30
  },
  indicatorItem: {
    marginLeft: 5,
    marginRight: 5,
    height: 8,
    width: 8,
    borderRadius: 4,
    borderColor: 'black',
    borderWidth: 1,
  },
  authDivider: {
    height: 5,
    marginTop: fullHeight / 40,
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
  },
  splashEmojiContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1
  },
  splashEmoji: {
    alignSelf: 'center',
    // justifyContent: 'center',
    fontSize: Platform.OS === 'android' ? 50 : 65,
    fontFamily: Platform.OS === 'android' ? 'NotoColorEmoji' : 'Georgia',
  }

});

styles = { ...localStyles, ...globalStyles };

export default Auth;

