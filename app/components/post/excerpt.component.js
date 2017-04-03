import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableHighlight,
  Linking
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { globalStyles, fullWidth } from '../../styles/global';
import WebViewAuto from './WebViewAuto1';

let styles;

export default function Excerpt(props) {
  let post = props.post;

  let html = `
    <style>
      body {
        font-family: Georgia,
        font-size: 18px;
        padding: 0;
        margin: 0;
      }
      figure {
        margin: 0;
      }
      figcaption {
        font-size: 12px;
        margin: 10px 20px 0 20px;
      }
      p, h1, h2, h3, h4 {
        padding: 0 10px;
      }
      img {
        // display: none;
        width: 100% !important;
      }
    </style>
  `;

  function openLink(url) {
    props.actions.push({
      key: 'articleView',
      component: 'articleView',
      back: true,
      uri: url,
    }, 'home');
  }

  return (
    <View>
      <View>
        <WebViewAuto
          onShouldStartLoadWithRequest={navState => {
            if (navState.url !== 'about:blank') {
              Linking.openURL(navState.url);
              return false;
            }
            return true;
          }}
          // startInLoadingState
          maxHeight={300}
          autoHeight
          style={{ flex: 1 }}
          source={{ html: html + post.shortText }}
        />
        <LinearGradient colors={['hsla(0, 0%, 100%, 0)', 'hsla(0, 0%, 100%, .8)', 'hsla(0, 0%, 100%, 1)']} style={styles.linearGradient} >
          <TouchableHighlight
            style={styles.readMore}
            onPress={() => openLink(post.link)}
          >
            <Text style={styles.largeButtonText}>
              Read Article
            </Text>
          </TouchableHighlight>
        </LinearGradient>
      </View>

    </View>
  );
}

const localStyles = StyleSheet.create({
  readMore: {

  },
  linearGradient: {
    height: 120,
    width: fullWidth,
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
});

styles = { ...localStyles, ...globalStyles };
