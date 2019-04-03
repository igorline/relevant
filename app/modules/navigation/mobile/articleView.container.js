import React, { Component } from 'react';
import {
  StyleSheet,
  WebView,
  View,
  Image,
  TouchableHighlight,
  ActivityIndicator,
  InteractionManager,
  Platform,
  Alert
} from 'react-native';
import PropTypes from 'prop-types';
import Share from 'react-native-share';
import Orientation from 'react-native-orientation';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { globalStyles, fullWidth, blue } from 'app/styles/global';
import * as navigationActions from 'modules/navigation/navigation.actions';

let styles;
let RWebView;

if (Platform.OS === 'android') {
  RWebView = WebView;
} else {
  RWebView = WebView;
}

class ArticleView extends Component {
  static propTypes = {
    navigation: PropTypes.object,
    actions: PropTypes.object
  };

  constructor(props, context) {
    super(props, context);
    // this.showInvestors = this.showInvestors.bind(this);
    this.back = this.back.bind(this);
    this.onShare = this.onShare.bind(this);
    this.state = {
      backButtonEnabled: false,
      forwardButtonEnabled: false,
      url: null,
      initalUrl: null,
      status: '',
      loading: true,
      progress: 0
    };
  }

  componentWillMount() {
    this.onInteraction = InteractionManager.runAfterInteractions(() => {
      this.setState({
        initalUrl: this.props.navigation.state.params.uri,
        url: this.props.navigation.state.params.uri
      });
    });
    Orientation.unlockAllOrientations();
  }

  componentWillUnmount() {
    if (this.onInteraction) this.onInteraction.cancel();
    Orientation.lockToPortrait();
  }

  back() {
    if (this.backButtonEnabled) {
      return () => this.webview.goBack();
    }
    return () => this.props.actions.pop('home');
  }

  // showShareActionSheet() {
  //   ActionSheetIOS.showShareActionSheetWithOptions({
  //     url: this.url,
  //   },
  //   (error) => AlertIOS.alert(error),
  //   (completed, method) => {

  //   });
  // }

  onShare() {
    Share.open({
      title: 'Relevant',
      url: this.url,
      subject: 'Article from Relevant',
      message: this.url
    }).catch(err => {
      Alert.alert(err);
    });
  }

  renderBack() {
    const back = (
      <View style={{ paddingHorizontal: 10, marginLeft: -10 }}>
        <Image
          resizeMode={'contain'}
          style={{ width: 11, height: 19 }}
          source={require('app/public/img/backarrow.png')}
        />
      </View>
    );
    return (
      <TouchableHighlight
        style={[styles.leftButton]}
        underlayColor={'transparent'}
        onPress={this.back()}
      >
        {back}
      </TouchableHighlight>
    );
  }

  renderShare() {
    return (
      <TouchableHighlight
        style={[styles.leftButton]}
        underlayColor={'transparent'}
        onPress={() => this.onShare()}
      >
        <View style={{ paddingHorizontal: 10, marginLeft: 0 }}>
          <Image
            resizeMode={'contain'}
            style={{ width: 22, height: 22 }}
            source={require('app/public/img/shareOut.png')}
          />
        </View>
      </TouchableHighlight>
    );
  }

  renderFooter() {
    return (
      <View style={styles.webMenu}>
        {this.renderBack()}
        {this.renderShare()}
      </View>
    );
  }

  render() {
    let activity;
    let progressEl;

    if (this.state.loading) {
      activity = (
        <View
          pointerEvents={'none'}
          style={{ position: 'absolute', bottom: 0, top: 0, left: 0, right: 0 }}
        >
          <ActivityIndicator
            style={{ position: 'absolute', bottom: 0, top: 0, left: 0, right: 0 }}
            animating={this.state.loading}
            size={'small'}
          />
        </View>
      );
    }

    let webView = <View style={{ flex: 1 }} />;
    if (this.state.progress > 0 && this.state.progress < 1) {
      progressEl = (
        <View
          style={{
            position: 'absolute',
            height: 3,
            width: fullWidth * this.state.progress,
            backgroundColor: blue
          }}
        />
      );
      activity = null;
    }

    if (this.state.initalUrl) {
      webView = (
        <RWebView
          ref={ref => {
            this.webview = ref;
          }}
          scalesPageToFit
          onNavigationStateChange={navState => {
            this.url = navState.url;
            this.backButtonEnabled = navState.canGoBack;
          }}
          onError={err => {
            Alert.error(err);
          }}
          onLoadStart={() => this.setState({ loading: true })}
          onLoadEnd={() => this.setState({ loading: false })}
          style={{ flex: 1, backgroundColor: 'transparent', marginTop: 0 }}
          source={{ uri: this.state.initalUrl }}
          onProgress={progress =>
            progress ? this.setState({ progress }) : this.setState({ progress: 0 })
          }
        />
      );
    }

    return (
      <View style={{ flex: 1, backgroundColor: 'white', paddingTop: 0 }}>
        {progressEl}
        {activity}
        {webView}
        {this.renderFooter()}
      </View>
    );
  }
}

const localStyles = StyleSheet.create({
  webMenu: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'black',
    zIndex: 1
  },
  leftButton: {
    flex: 0,
    width: 50,
    alignItems: 'center',
    justifyContent: 'center'
  }
});

styles = { ...globalStyles, ...localStyles };

export default connect(
  () => ({}),
  dispatch => ({
    actions: bindActionCreators(navigationActions, dispatch)
  })
)(ArticleView);
