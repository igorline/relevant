import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  Image,
  Linking
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import { globalStyles, fullWidth, blue } from '../../styles/global';

let styles;

class PostImage extends Component {
  constructor(props, context) {
    super(props, context);
    this.openLink = this.openLink.bind(this);
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
    // let lastPost = false;
    let linkEl = null;
    if (post) {
      // console.log(post)
      if (post.image) image = post.image.match('http') ? post.image : 'https:' + post.image;
      if (post.link) {
        link = post.link;
        // ► {post.categoryEmoji}{post.categoryName}
        linkEl = (
          <Text
            style={[styles.font12, styles.articleTitle]}
          >
            from {post.domain}
          </Text>
        );
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


    let description = null;
    if (post.body !== '' || !post.body) {
      description = (
        <Text
          style={[styles.font17,
            styles.georgia,
            styles.darkGrey,
            { padding: 10 }]}
          >
          {post.description}
        </Text>
      );
    }

    let imageEl;
    if (image && !image.match('.gif')) {
      imageEl = (
      <View style={{ flex: 1, overflow: 'hidden' }}>
        <Image style={[styles.postImage]} source={image ? { uri: image } : require('../../assets/images/missing.png')} />
        <LinearGradient colors={['hsla(240, 70%, 50%, 0)', 'hsla(240, 70%, 30%, .4)', 'hsla(240, 70%, 30%, 1)']} style={styles.linearGradient} >
          <View style={[styles.textContainer]}>
            <View>
              <Text
                numberOfLines={4}
                style={[
                  { fontSize: 19, marginBottom: 5, fontWeight: 'bold' },
                  styles.articleTitle,
                  styles.georgia]}
              >
                {title || 'Untitled'}
              </Text>
              {linkEl}
            </View>
          </View>
        </LinearGradient>
      </View>);
    }


    return (
      <TouchableHighlight
        style={{ flex: 1, marginTop: 0 }}
        underlayColor={'transparent'}
        onPress={link ? () => this.openLink(link) : null}
      >
        <View style={[styles.postImageContainer]}>
          {imageEl}
          {/*description*/}

          {/*lastPost ? <Text style={[styles.lastPost, styles.white]}>
            Last subscribed post❗️
          </Text> : null*/}

  
        </View>
      </TouchableHighlight>
    );
  }
}

export default PostImage;

const localStyles = StyleSheet.create({
  textContainer: {
    padding: 10,
    paddingVertical: 20,
    flex: 1,
    flexDirection: 'column',
    // alignItems: 'flex-start',
    justifyContent: 'flex-end',
    // backgroundColor: 'white',
  },
  articleTitle: {
    backgroundColor: 'transparent',
    color: 'white',
  },
  postImage: {
    height: 250,
    flex: 1,
    maxWidth: fullWidth,
    position: 'relative',
    resizeMode: 'cover',
  },
  linearGradient: {
    height: 250,
    width: fullWidth,
    position: 'absolute',
    top: 0,
    // alignItems: 'flex-end',
    // justifyContent: 'flex-end'
  },
  postImageContainer: {
    flex: 1,
    alignItems: 'stretch',
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
});

styles = { ...globalStyles, ...localStyles };

