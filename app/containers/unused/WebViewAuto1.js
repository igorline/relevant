/**
 * Custom WebView with autoHeight feature
 *
 * @prop source: Same as WebView
 * @prop autoHeight: true|false
 * @prop defaultHeight: 100
 * @prop width: device Width
 * @prop maxHeight: null
 * @prop ...props
 *
 * @author Elton Jain
 * @version v1.0.2
 */

import React, { Component } from 'react';
import { View, Dimensions, WebView } from 'react-native';

const injectedScript = function() {
  // window.postMessage = String(Object.hasOwnProperty).replace('hasOwnProperty', 'postMessage');
  function waitForBridge() {
    if (window.postMessage.length !== 1) {
      setTimeout(waitForBridge, 200);
    } else {
      let height = 0;
      if (document.documentElement.clientHeight > document.body.clientHeight) {
        height = document.documentElement.clientHeight;
      } else {
        height = document.body.clientHeight;
      }
      postMessage(height);
    }
  }
  // document.addEventListener('load', () => waitForBridge());
  document.addEventListener('resize', () => waitForBridge());
  waitForBridge();
};

export default class MyWebView extends Component {
  state = {
    webViewHeight: Number
  };

  static defaultProps = {
    autoHeight: true
  };

  constructor(props: Object) {
    super(props);
    this.state = {
      webViewHeight: this.props.defaultHeight
    };

    this._onMessage = this._onMessage.bind(this);
  }

  _onMessage(e) {
    let heith;
    if (this.props.maxHeight) {
      height = Math.min(parseInt(e.nativeEvent.data), this.props.maxHeight);
    } else height = parseInt(e.nativeEvent.data);
    this.setState({
      webViewHeight: height
    });
  }

  render() {
    const _w = this.props.width || Dimensions.get('window').width;
    const _h = this.props.autoHeight ? this.state.webViewHeight : this.props.defaultHeight;
    return (
      <WebView
        injectedJavaScript={'(' + String(injectedScript) + ')();'}
        scrollEnabled={this.props.scrollEnabled || false}
        onMessage={this._onMessage}
        javaScriptEnabled={true}
        // automaticallyAdjustContentInsets={true}
        {...this.props}
        style={[{ width: _w }, this.props.style, { height: _h }]}
      />
    );
  }
}
