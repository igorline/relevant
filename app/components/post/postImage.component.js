import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  Image,
  Linking
} from 'react-native';
import * as Progress from 'react-native-progress';
import { globalStyles, fullWidth, fullHeight } from '../../styles/global';
let styles;
let moment = require('moment');

class PostImage extends Component {
  constructor(props, context) {
    super(props, context);
    this.openLink = this.openLink.bind(this);
    // this.extractDomain = this.extractDomain.bind(this);
    this.state = {
    };
  }

  componentDidMount() {
  }

  openLink(url) {
    Linking.openURL(url);
  }

  render() {
    let image = null;
    let link = null;
    let post = this.props.post;
    let title = null;
    let lastPost = false;
    let linkEl = null;
    if (post) {
      if (post.image) image = post.image.match('http') ? post.image : 'https:' + post.image;
      if (post.link) {
        link = post.link;
        linkEl = <Text style={[styles.font12, styles.greyText]}>from {post.domain}</Text>;
      }
      title = post.title;
      // if (post.title) {
      //   title = post.title;
      //   if (title.length > 75) {
      //     let pre = title.substr(0, 75);
      //     pre += '...';
      //     title = pre;
      //   }
      // }
      // if (post.lastPost) {
      //   if (post.lastPost.length) {
      //     post.lastPost.forEach((lastUser) => {
      //       if (lastUser === this.props.auth.user._id) lastPost = true;
      //     });
      //   }
      // }
    }

    return (
      <TouchableHighlight
        style={{ flex: 1 }}
        underlayColor={'transparent'}
        onPress={link ? () => this.openLink(link) : null}
      >
        <View style={[styles.postImageContainer, styles.boxShadow]}>
          <View>
            <Image style={[styles.postImage]} source={image ? { uri: image } : {}} />
          </View>

          {/*lastPost ? <Text style={[styles.lastPost, styles.white]}>
            Last subscribed post❗️
          </Text> : null*/}

          <View style={[styles.textContainer]}>
            <View>
              <Text numberOfLines={3} style={[{ fontSize: 16 }, styles.darkGrey, styles.georgia]}>
                {title ? title : 'Untitled'}
              </Text>
              {linkEl}
            </View>
          </View>
        </View>
      </TouchableHighlight>
    );
  }
}

export default PostImage;

const localStyles = StyleSheet.create({
  textContainer: {
    padding: 10,
    // height: 100,
    // position: 'absolute',
    flex: 1,
    // top: 0,
    // right: 0,
    // bottom: 0,
    // left: 0,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    backgroundColor: 'white',
    // shadowColor: 'red',
    // shadowOffset: { width: -1, height: 1 },
    // shadowRadius: 2,
    // shadowOpacity: 0.9,
  },
  postImage: {
    height: 180,
    // flex: 1,
    // resizeMode: 'cover',
  },
  postImageContainer: {
    // height: 388 / 2,
    flex: 1,
    alignItems: 'stretch',
    flexDirection: 'column',
    justifyContent: 'center',
    marginBottom: 20,
    backgroundColor: 'white',
  },
});

styles = { ...globalStyles, ...localStyles };

