import React, { Component } from 'react';
import {
  StyleSheet,
  WebView,
  View,
  Image,
  TouchableHighlight,
  Linking,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  InteractionManager,
  ActionSheetIOS,
  AlertIOS
} from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { globalStyles } from '../../styles/global';
import * as navigationActions from '../../actions/navigation.actions';

let styles;

class ArticleView extends Component {
  constructor(props, context) {
    super(props, context);
    // this.showInvestors = this.showInvestors.bind(this);
    this.back = this.back.bind(this);
    this.state = {
      backButtonEnabled: false,
      forwardButtonEnabled: false,
      url: null,
      status: '',
      loading: true,
    };
  }

  componentWillMount() {
    this.onInteraction = InteractionManager.runAfterInteractions(() => {
      this.setState({ url: this.props.scene.uri });
    });
  }

  componentWillUnmount() {
    if (this.onInteraction) this.onInteraction.cancel();
  }

  back() {
    if (this.state.backButtonEnabled) {
      return () => this.webview.goBack();
    }
    return () => this.props.actions.pop('home');
  }

  showShareActionSheet() {
    ActionSheetIOS.showShareActionSheetWithOptions({
      url: this.state.url,
      // message: 'message to go with the shared url',
      // subject: 'a subject to go in the email heading',
      // excludedActivityTypes: [
      //   'com.apple.UIKit.activity.PostToTwitter'
      // ]
    },
    (error) => AlertIOS.alert(error),
    (completed, method) => {
      // var text;
      // if (completed) {
      //   text = `Shared via ${method}`;
      // } else {
      //   text = 'You didn\'t share';
      // }
      // // this.setState({ text });
    });
  }

  renderBack() {
    let back = (
      <View style={{ paddingHorizontal: 10, marginLeft: -10 }}>
        <Image
          resizeMode={'contain'}
          style={{ width: 11, height: 19 }}
          source={require('../../assets/images/backarrow.png')}
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
        onPress={() => this.showShareActionSheet()}
      >
        <View style={{ paddingHorizontal: 10, marginLeft: 0 }}>
          <Image
            resizeMode={'contain'}
            style={{ width: 22, height: 22 }}
            source={require('../../assets/images/shareOut.png')}
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

  render () {
    let activity;

    if (this.state.loading) {
      activity = (
        <View
          pointerEvents={'none'}
          style={{ zIndex: 10, position: 'absolute', bottom: 0, top: 0, left: 0, right: 0 }}
        >
          <ActivityIndicator
            style={{ position: 'absolute', bottom: 0, top: 0, left: 0, right: 0 }}
            animating={this.state.loading}
            size={'small'}
          />
        </View>);
    }

    let webView = <View style={{ flex: 1 }} />;

    if (this.state.url) {
      webView = (<WebView
        ref={(ref) => { this.webview = ref; }}
        scalesPageToFit
        onNavigationStateChange={(navState) => {
          if (navState.navigationType === 'other' &&
            navState.url.split('?')[0].split('#')[0] === this.state.url) return;
          this.setState({
            backButtonEnabled: navState.canGoBack,
            forwardButtonEnabled: navState.canGoForward,
            url: navState.url.split('?')[0],
            status: navState.title,
          });
        }}
        onLoadStart={() => this.setState({ loading: true })}
        onLoadEnd={() => this.setState({ loading: false })}
        style={{ flex: 1, backgroundColor: 'transparent', marginTop: 0 }}
        source={{ uri: this.state.url }}
      />);
    }

    return (
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <StatusBar
          hidden={true}
          networkActivityIndicatorVisible
          // backgroundColor={'white'}
        />
        {activity}
        {webView}
        {this.renderFooter()}
      </View>
    );
  }
};

const localStyles = StyleSheet.create({
  webMenu: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'black',
  },
  leftButton: {
    // borderColor: 'red',
    // borderWidth: 1,
    flex: 0,
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
    // paddingVertical: 10,
  },
});

styles = { ...globalStyles, ...localStyles };

export default connect(
  state => ({
    // auth: state.auth,
    // admin: state.admin
  }),
  dispatch => ({
    actions: bindActionCreators(navigationActions, dispatch)
  })
)(ArticleView);