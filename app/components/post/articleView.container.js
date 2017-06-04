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
  AlertIOS,
  Platform
} from 'react-native';
import Orientation from 'react-native-orientation';
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
      initalUrl: null,
      status: '',
      loading: true,
    };
  }

  componentWillMount() {
    console.log(this.props.scene.uri);
    this.onInteraction = InteractionManager.runAfterInteractions(() => {
      this.setState({
        initalUrl: this.props.scene.uri,
        url: this.props.scene.uri,
      });
    });
    if (Platform.OS === 'ios') {
      Orientation.unlockAllOrientations();
    }
  }

  componentWillUnmount() {
    if (this.onInteraction) this.onInteraction.cancel();
    if (Platform.OS === 'ios') {
      Orientation.lockToPortrait();
    }
  }

  back() {
    if (this.backButtonEnabled) {
      return () => this.webview.goBack();
    }
    return () => this.props.actions.pop('home');
  }

  showShareActionSheet() {
    ActionSheetIOS.showShareActionSheetWithOptions({
      url: this.url,
    },
    (error) => AlertIOS.alert(error),
    (completed, method) => {

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
          style={{ position: 'absolute', bottom: 0, top: 0, left: 0, right: 0 }}
        >
          <ActivityIndicator
            style={{ position: 'absolute', bottom: 0, top: 0, left: 0, right: 0 }}
            animating={this.state.loading}
            size={'small'}
          />
        </View>);
    }

    let webView = <View style={{ flex: 1 }} />;

    if (this.state.initalUrl) {
      webView = (<WebView
        ref={(ref) => { this.webview = ref; }}
        scalesPageToFit
        onNavigationStateChange={(navState) => {
          // console.log('nav state change ', navState);
          this.url = navState.url;
          this.backButtonEnabled = navState.canGoBack;
          // this.setState({
          //   backButtonEnabled: navState.canGoBack,
          //   forwardButtonEnabled: navState.canGoForward,
          //   url: navState.url,
          //   status: navState.title,
          // });
        }}
        onLoadStart={() => this.setState({ loading: true })}
        onLoadEnd={() => this.setState({ loading: false })}
        style={{ flex: 1, backgroundColor: 'transparent', marginTop: 0 }}
        source={{ uri: this.state.initalUrl }}
      />);
    }

    return (
      <View style={{ flex: 1, backgroundColor: 'white', paddingTop: 0}}>
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
    zIndex: 1
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