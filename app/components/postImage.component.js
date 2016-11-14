import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  TouchableWithoutFeedback,
  Image,
  Modal,
} from 'react-native';
import * as Progress from 'react-native-progress';
import { globalStyles, fullWidth, fullHeight } from '../styles/global';
let styles;
let moment = require('moment');

class PostImage extends Component {
  constructor(props, context) {
    super(props, context);
    this.openLink = this.openLink.bind(this);
    this.extractDomain = this.extractDomain.bind(this);
    this.state = {
    }
  }

  componentDidMount() {
  }

  openLink(url) {
    Linking.openURL(url);
  }

  extractDomain(url) {
    let domain;
    if (url.indexOf('://') > -1) {
      domain = url.split('/')[2];
    } else {
      domain = url.split('/')[0];
    }
    domain = domain.split(':')[0];

    let noPrefix = domain;

    if (domain.indexOf('www.') > -1) {
      noPrefix = domain.replace('www.', '');
    }
    return noPrefix;
  }



// <Image resizeMode={'cover'} source={{ uri: image }} style={styles.postImage} />

  render() {
    const self = this;
    let image = null;
    let link = null;
    let post = this.props.post;
    let lastPost = false;
    if (post) {
      if (post.image) image = post.image.match('http') ? post.image : 'https:' + post.image;
      if (post.link) link = post.link;
      if (post.lastPost) {
        if (post.lastPost.length) {
          post.lastPost.forEach((lastUser) => {
            if (lastUser === self.props.auth.user._id) lastPost = true;
          });
        }
      }
    }

    return (<TouchableHighlight style={styles.postImageContainer} underlayColor={'transparent'} onPress={link ? () => self.openLink(link) : null}>
      <View style={styles.innerPostImage}>

      <Image style={[styles.postImage]} source={{uri: image}}/>
        {lastPost ? <Text style={[styles.lastPost, styles.white]}>
          Last subscribed post❗️
        </Text> : null}

        <View style={styles.imageInnerText}>
          <Text style={[styles.font20, styles.white]}>
            {title ? title : 'Untitled'}
          </Text>
          
          {link ?
            <Text style={[styles.font10, styles.white]}>from {self.extractDomain(link)}</Text>
          : null}
        </View>

      </View>
    </TouchableHighlight>);
  }
}

export default PostImage;

const localStyles = StyleSheet.create({
  innerPostImage: {
    height: 200,
  },
  imageInnerText: {
    position: 'absolute',
    padding: 25,
    bottom: 0,
    left: 0,
  },
  postImage: {
    flex: 1
  },
  postImageContainer: {
  },
});

styles = { ...globalStyles, ...localStyles };

