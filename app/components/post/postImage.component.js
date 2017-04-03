import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  Image,
  Linking
} from 'react-native';

import { globalStyles, fullWidth } from '../../styles/global';

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
    // Linking.openURL(url);
    this.props.actions.push({
      key: 'articleView',
      component: 'articleView',
      back: true,
      uri: url,
      // title: 'New Post',
      // next: 'Post',
      // direction: 'vertical',
      // ownCard: true
    }, 'home');
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
        linkEl = <Text style={[styles.font12, styles.greyText]}>from {post.domain} ► {post.categoryEmoji}{post.categoryName}</Text>;
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

    let imageEl;
    if (image && !image.match('.gif')) {
      imageEl = (<View style={{ flex: 1, overflow: 'hidden' }}>
        <Image style={[styles.postImage]} source={image ? { uri: image } : require('../../assets/images/missing.png')} />

      </View>);
    }

        // <Text style={styles.postCat}>
        //   {post.categoryEmoji}{post.categoryName}
        // </Text>

    let description = null;
    // if (post.body == '' || !post.body) {
      // description = <Text style={[styles.font14, { paddingTop: 5 }]}>{post.description}</Text>;
    // }

    return (
      <TouchableHighlight
        style={{ flex: 1, marginTop: 25 }}
        underlayColor={'transparent'}
        onPress={link ? () => this.openLink(link) : null}
      >
        <View style={[styles.postImageContainer, styles.boxShadow]}>
          {imageEl}
          {/*lastPost ? <Text style={[styles.lastPost, styles.white]}>
            Last subscribed post❗️
          </Text> : null*/}

          <View style={[styles.textContainer]}>
            <View>
              <Text
                numberOfLines={3}
                style={[{ fontSize: 16, marginBottom: 1 }, styles.darkGrey, styles.georgia]}
              >
                {title || 'Untitled'}
              </Text>
              {linkEl}
              {description}
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
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  postImage: {
    height: 175,
    flex: 1,
    maxWidth: fullWidth - 20,
    position: 'relative',
    resizeMode: 'cover',
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

