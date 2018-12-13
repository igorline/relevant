import React from 'react';
import { StyleSheet, View, Text, TouchableHighlight, Linking } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { globalStyles, fullWidth, blue, darkGrey } from '../../styles/global';
import WebViewAuto from './WebViewAuto1';

let styles;

export default function Excerpt(props) {
  const post = props.post;

  const html = `
    <style>
      body {
        font-family: '-apple-system','HelveticaNeue';
        font-size: 13px;
        padding: 0;
        margin: 0;
      }
      figure {
        margin: 0;
      }
      figcaption {
        font-size: 11px;
        margin: 10px 20px 0 20px;
      }
      p, h1, h2, h3, h4 {
        padding: 0 20px;
      }
      img {
        // display: none;
        width: 100% !important;
      }
    </style>
  `;

  function openLink(url) {
    props.actions.push(
      {
        key: 'articleView',
        component: 'articleView',
        back: true,
        uri: url
      },
      'home'
    );
  }

  return (
    <View style={styles.excerpt}>
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
          maxHeight={170}
          autoHeight
          style={{ flex: 1 }}
          source={{ html: html + post.shortText }}
        />
        <LinearGradient
          colors={['hsla(0, 0%, 100%, 0)', 'hsla(0, 0%, 100%, .94)', 'hsla(0, 0%, 100%, 1)']}
          style={styles.linearGradient}
        >
          <TouchableHighlight
            underlayColor={'transparent'}
            active
            style={styles.readMore}
            onPress={() => openLink(post.link)}
          >
            <Text style={styles.readMoreText}>Read Full Article</Text>
          </TouchableHighlight>
        </LinearGradient>
      </View>
      <View style={styles.divider} />
    </View>
  );
}

const localStyles = StyleSheet.create({
  excerpt: {
    marginTop: 10
  },
  divider: {
    marginTop: 10,
    marginHorizontal: 20,
    borderBottomColor: 'black',
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  readMoreText: {
    fontSize: 16,
    // fontFamily: 'BebasNeueRelevantRegular',
    color: blue
    // marginBottom: -3
  },
  readMore: {
    borderColor: blue,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 5
    // borderRadius: 5,
  },
  linearGradient: {
    height: 80,
    width: fullWidth,
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'flex-end'
  }
});

styles = { ...localStyles, ...globalStyles };
