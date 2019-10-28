import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Image,
  TouchableWithoutFeedback,
  Platform,
  TouchableOpacity,
  FlatList
} from 'react-native';
import PropTypes from 'prop-types';
import Prompt from 'rn-prompt';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as adminActions from 'modules/admin/admin.actions';
import * as authActions from 'modules/auth/auth.actions';
import { globalStyles, fullWidth, fullHeight, smallScreen } from 'app/styles/global';
import { get } from 'lodash';

let styles;

class Auth extends Component {
  static propTypes = {
    auth: PropTypes.object,
    // need this prop to pass to child components
    // eslint-disable-next-line
    navigation: PropTypes.object
  };

  constructor(props, context) {
    super(props, context);
    this.slides = [1, 2, 3, 4];
    this.state = {
      visibleHeight: Dimensions.get('window').height,
      xOffset: 0,
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
    const { contentOffset } = e.nativeEvent;
    const viewSize = e.nativeEvent.layoutMeasurement;

    // Divide the horizontal offset by the width of the view to see which page is visible
    const pageNum = Math.floor(contentOffset.x / viewSize.width);
    this.setState({ currentIndex: pageNum });
  }

  login() {
    this.props.navigation.navigate({ routeName: 'login' });
  }

  signup() {
    return this.props.navigation.navigate({
      routeName: 'twitterSignup',
      title: 'Signup'
    });
  }

  changeRow(event, changed) {
    if (event && event.s1) this.setState({ currentIndex: event.s1 });
    if (changed && changed.s1) this.setState({ changed: changed.s1 });
  }

  scrollToPage(index) {
    this.setState({ currentIndex: index });
    this.listview.scrollToIndex({ index });
  }

  renderIndicator() {
    const indicator = [];
    if (!this.slides) return indicator;
    if (this.slides.length) {
      this.slides.forEach((slide, i) => {
        const active = this.state.currentIndex === i;
        indicator.push(
          <TouchableWithoutFeedback onPress={() => this.scrollToPage(i)} key={i}>
            <View
              style={[
                styles.indicatorItem,
                { backgroundColor: active ? 'black' : 'white' }
              ]}
            />
          </TouchableWithoutFeedback>
        );
      });
    }
    return indicator;
  }

  renderRow({ index }) {
    function sentance(text, special) {
      const words = text.split(/\s/);
      const l = words.length - 1;
      return words.map((t, j) => {
        if (special.find(w => t.replace(/\.|,/, '') === w)) {
          return (
            <Text
              key={j + t}
              allowFontScaling={false}
              style={[styles.strokeText, styles.relevant]}
            >
              {t + (l === j ? '' : ' ')}
            </Text>
          );
        }
        return (
          <Text key={j + t} allowFontScaling={false} style={[styles.slideText]}>
            {t + (l === j ? '' : ' ')}
          </Text>
        );
      });
    }

    switch (index) {
      case 0:
        return (
          <View>
            <View style={[styles.authSlide, { background: 'pink' }]}>
              {sentance(
                'Curated by communities, not clicks',

                ['Relevant', 'communities', 'clicks']
              )}
              <Text allowFontScaling={false} style={styles.slideText} />
            </View>
            <View style={styles.splashEmojiContainer}>
              <Text style={styles.splashEmoji}>✌️</Text>
            </View>
          </View>
        );
      case 1:
        return (
          <View style={styles.authSlide}>
            {sentance('Discover content that’s relevant to you', ['relevant', 'you'])}
            <Text allowFontScaling={false} style={styles.slideText} />
          </View>
        );
      case 2:
        return (
          <View key={index} style={styles.authSlide}>
            {sentance('Connect with thought leaders, build trust and earn rewards', [
              'rewards',
              'trust'
            ])}
            <Text allowFontScaling={false} style={styles.slideText} />
          </View>
        );
      case 3:
        return (
          <View style={styles.authSlide}>
            {sentance(
              'Find your community and help us build a better information environment for all',
              ['Join', 'community', 'for', 'all']
            )}
            <Text allowFontScaling={false} style={styles.slideText} />
          </View>
        );
      default:
        return <View key={index} style={styles.authSlide} />;
    }
  }

  render() {
    const share = get(this.props.navigation, 'state.params');
    const { auth } = this.props;
    const { isAuthenticated } = auth;

    let intro = (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <FlatList
          horizontal
          scrollEnabled
          ref={c => {
            this.listview = c;
          }}
          decelerationRate={'fast'}
          showsHorizontalScrollIndicator={false}
          automaticallyAdjustContentInsets={false}
          contentContainerStyle={styles.authSlidesParent}
          renderItem={this.renderRow}
          keyExtractor={(item, index) => index.toString()}
          data={this.slides}
          onMomentumScrollEnd={this.onScrollEnd}
          pagingEnabled
        />
        <View style={styles.indicatorParent}>{this.renderIndicator()}</View>
      </View>
    );

    if (share) intro = <View style={{ flex: 1 }} />;

    let cta = (
      <View style={styles.authPadding}>
        <TouchableOpacity onPress={this.signup} style={styles.largeButton}>
          <Text style={styles.largeButtonText}>Sign Up Now</Text>
        </TouchableOpacity>

        <TouchableOpacity style={{}} onPress={this.login}>
          <View style={{ flexDirection: 'row', alignSelf: 'center' }}>
            <Text allowFontScaling={false} style={styles.signInText}>
              Already have an account?
            </Text>
            <Text style={[styles.signInText, { color: '#3E3EFF' }]}> Sign In.</Text>
          </View>
        </TouchableOpacity>
      </View>
    );

    if (share) {
      cta = (
        <View style={{ flex: 1, alignSelf: 'center' }}>
          <Text
            style={{
              fontFamily: 'Libre Caslon Display',
              fontSize: 34,
              alignSelf: 'center',
              textAlign: 'center',
              padding: 20,
              lineHeight: 44
            }}
          >
            Ooops{'\n'}You are not logged in{'\n'}Please sign in via{'\n'}Relevant App
          </Text>
        </View>
      );
    }

    return (
      <View
        style={[
          {
            height: isAuthenticated
              ? this.state.visibleHeight - 60
              : this.state.visibleHeight
          },
          styles.authParent
        ]}
      >
        <View style={styles.logoContainer}>
          <Image source={require('app/public/img/logo.png')} style={styles.authLogo} />
        </View>
        <View style={styles.authPadding}>
          <View style={styles.authDivider} />
        </View>

        {share ? null : intro}

        {cta}

        <Prompt
          title={this.promptTitle || ''}
          visible={this.state.promptVisible}
          onCancel={() => this.setState({ promptVisible: false })}
          onSubmit={() => {
            this.props.navigation.navigate({
              key: 'twitterSignup',
              title: 'Signup'
            });
            this.setState({ promptVisible: false });
          }}
        />
      </View>
    );
  }
}

const localStyles = StyleSheet.create({
  adjust: {
    fontSize: 38,
    lineHeight: 30
  },
  strokeText: {
    fontSize: smallScreen ? 32 : 36,
    fontFamily: 'HelveticaNeueLTStd-BdOu',
    lineHeight: Platform.OS === 'ios' ? (smallScreen ? 47 : 55) : smallScreen ? 39 : 46,
    color: 'black'
  },
  slideText: {
    fontFamily: 'HelveticaNeue',
    fontSize: smallScreen ? 30 : 34,
    lineHeight: smallScreen ? 40 : 45,
    color: 'black'
  },
  relevant: {
    height: smallScreen ? 40 : 45
    // width: 200,
  },
  authSlidesParent: {
    marginTop: 20,
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'flex-start'
  },
  authSlide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: fullWidth - 40,
    marginHorizontal: 20
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
    borderWidth: 1
  },
  authDivider: {
    height: 5,
    marginTop: fullHeight / 40,
    marginBottom: 0,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderBottomColor: 'black',
    borderTopColor: 'black'
  },
  logoContainer: {
    marginTop: fullHeight / 40,
    height: fullHeight / 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    width: 'auto',
    flexDirection: 'row'
  },
  authLogo: {
    resizeMode: 'contain',
    flex: 1
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
    paddingHorizontal: 20
  },
  splashEmojiContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1
  },
  splashEmoji: {
    alignSelf: 'center',
    fontSize: Platform.OS === 'android' ? 50 : 65
  }
});

styles = { ...localStyles, ...globalStyles };

const mapStateToProps = state => ({
  auth: state.auth,
  admin: state.admin
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(
    {
      ...authActions,
      ...adminActions
    },
    dispatch
  )
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Auth);
