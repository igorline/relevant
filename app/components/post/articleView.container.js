import React, { Component } from 'react';
import {
  StyleSheet,
  WebView,
  View,
  Image,
  TouchableHighlight,
  Linking
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
      url: '',
      status: '',
      loading: false,
    };
  }

  back() {
    if (this.state.backButtonEnabled) {
      return () => this.webview.goBack();
    }
    return () => this.props.actions.pop('home');
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

  renderFooter() {
    return (
      <View style={styles.webMenu}>
        {this.renderBack()}
      </View>
    );
  }

  render () {
    // console.log(this.props.scene)
    let uri = this.props.scene.uri;
    return (
      <View style={{ flex: 1 }}>
        <WebView
          // startInLoadingState
          ref={(ref) => { this.webview = ref; }}
          onNavigationStateChange={(navState) => {
            this.setState({
              backButtonEnabled: navState.canGoBack,
              forwardButtonEnabled: navState.canGoForward,
              url: navState.url,
              status: navState.title,
              loading: navState.loading,
              // scalesPageToFit: true
            });
          }}
          // onNavigationStateChange={(event) => {
          //   console.log(event)
          //   if (!event.navigationType || event.navigationType === 'other') return true;
          //   if (event.url !== uri) {
          //     this.webview.stopLoading();
          //     Linking.openURL(event.url);
          //     return false;
          //   }
          //   return true;
          // }}
          style={{ flex: 1 }}
          source={{ uri }}
        />
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
    justifyContent: 'center',
    backgroundColor: 'white',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'black',
  },
  leftButton: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
    paddingVertical: 10,
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