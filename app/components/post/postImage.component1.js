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
import { numbers } from '../../utils';
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

  goToPost() {
    if (!this.props.actions) return;
    if (this.props.scene && this.props.scene.id === this.props.post._id) return;
    this.props.actions.goToPost(this.props.post);
  }

  openLink(url) {
    this.props.actions.goToUrl(url);
  }

  render() {
    let image = null;
    let link = null;
    let post = this.props.metaPost || this.props.post;
    let single = false // this.props.singlePost;
    let smallerImg; // = this.props.singlePost;
    let title = null;
    // let lastPost = false;
    let linkEl = null;
    let time;
    let author;
    let authorEl;

    if (post) {
      if (post.articleDate) {
        time = numbers.timeSince(Date.parse(post.articleDate));
      }
      if (post.articleAuthor && post.articleAuthor.length) {
        // test this
        author = post.articleAuthor.filter(a => a ? !a.match('http') : false).join(', ');
        authorEl = (
          <Text
            numberOfLines={1}
            style={[
              styles.font12,
              styles.articleTitle,
              single ? styles.darkGrey : null,
              // styles.darkGrey
            ]}
          >
            {author ? author : ''}
          </Text>
        );
      }
      if (post.image && !post.image.match('gif')) image = post.image.match('http') ? post.image : 'https:' + post.image;
      if (post.link || post.url) {
        link = post.link || post.url;
        linkEl = (
          <View>
            {/*authorEl*/}
            <Text
              // numberOfLines={2}
              style={[
                styles.font12,
                styles.articleTitle,
                single ? styles.darkGrey : null,
                // styles.darkGrey
              ]}
            >
              {post.publisher || post.domain}
              {time ? ' · ' + time : ''}
              {/*post.description ? ' · ' + post.description : null */}
            </Text>
          </View>
        );
      }
      title = post.title ? post.title.trim() : '';
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
    if (post.description) {
      description = (
        <Text
          numberOfLines={3}
          style={[styles.font12,
            // styles.georgia,
            styles.whiteText
            // styles.darkGrey,
            // { padding: 10 }
          ]}
          >
          {post.description}
        </Text>
      );
    }

    let titleEl = (
      <View style={[styles.textContainer]}>
        <View>
          <Text
            numberOfLines={4}
            style={[
              { fontSize: 19, letterSpacing: 0.4, marginBottom: 5, fontWeight: 'bold' },
              styles.articleTitle,
              single ? styles.darkGrey : null,
              styles.georgia]}
          >
            {title || 'Untitled'}
          </Text>
          { linkEl }
          { /*description*/ }
        </View>
      </View>
    );

    let imageEl;

    let imgColors = [
      'hsla(240, 70%, 30%, .01)',
      'hsla(240, 70%, 20%, .05)',
      'hsla(240, 70%, 10%, .2)',
      'hsla(240, 70%, 10%, .7)',
      'hsla(240, 70%, 10%, .6)'
    ];

    let titleLength = post.title ? post.title.length : 0;
    let color = post.body ? post.body.length : titleLength;
    color = color % 220 + 200 || 200;
    color = Math.max(100, color);
    let colors = [
      'hsla(' + parseInt(color - 30) + ', 100%, 50%, 1)',
      'hsla(' + parseInt(color) + ',      100%, 50%, 1)',
      'hsla(' + parseInt(color + 30) + ', 100%, 50%, 1)',
    ];
    let start = { x: 0.8, y: 0.0 };
    let end = { x: 0.2, y: 1.0 };

    let gradient = (
      <LinearGradient
        start={image ? { x: 0.5, y: 0.0 } : start}
        end={image ? { x: 0.5, y: 1.0 } : end}
        colors={image ? imgColors : colors}
        style={[styles.linearGradient,
          smallerImg ? { height: 180 } : null
        ]}
      >
        {single ? null : titleEl}
      </LinearGradient>
    );
    let img;
    if (image) {
      img = (
        <Image
          style={[styles.postImage,
            smallerImg ? { height: 180 } : null
          ]}
          // onLoad={(e) => {
          //   console.log('onLoad ', e);
          // }}
          source={image ? { uri: image } : require('../../assets/images/missing.png')}
        />
      );
    }

    if (post.link || image) {
      imageEl = (
        <View
          style={[
            styles.imageCont,
            smallerImg ? { height: 180 } : null]}
          >
          {img}
          {!single ? gradient : null}
        </View>
      );
    }


    return (
      <TouchableHighlight
        style={{ flex: 1, marginTop: 0 }}
        underlayColor={'transparent'}
        // onPress={link ? () => this.openLink(link) : null}
        onPress={() => this.openLink(post.link)}
      >
        <View style={[styles.postImageContainer]}>
          {/*linkEl*/}
          {imageEl}

          {single ? titleEl : null}

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
  whiteText: {
    backgroundColor: 'transparent',
    color: 'white'
  },
  textContainer: {
    padding: 10,
    paddingVertical: 15,
    flex: 1,
    flexDirection: 'column',
    // alignItems: 'flex-start',
    justifyContent: 'flex-end',
    // backgroundColor: 'white',
  },
  articleTitle: {
    // backgroundColor: blue,
    backgroundColor: 'transparent',
    color: 'white',
  },
  postImage: {
    height: 240,
    flex: 1,
    maxWidth: fullWidth,
    position: 'relative',
    resizeMode: 'cover',
  },
  imageCont: {
    height: 240,
    flex: 1,
    overflow: 'hidden'
  },
  linearGradient: {
    height: 240,
    // paddingTop: 30,
    width: fullWidth,
    position: 'absolute',
    bottom: 0,
    // alignItems: 'flex-end',
    // justifyContent: 'flex-end'
  },
  postImageContainer: {
    marginBottom: 0,
    flex: 1,
    alignItems: 'stretch',
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
});

styles = { ...globalStyles, ...localStyles };

