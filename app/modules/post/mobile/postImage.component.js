import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableHighlight, Image } from 'react-native';
import PropTypes from 'prop-types';
import LinearGradient from 'react-native-linear-gradient';
import { numbers } from 'app/utils';
import { globalStyles, fullWidth, mainPadding, smallScreen } from 'app/styles/global';

let styles;

class PostImage extends Component {
  static propTypes = {
    actions: PropTypes.object,
    post: PropTypes.object,
    metaPost: PropTypes.object
  };

  constructor(props, context) {
    super(props, context);
    this.openLink = this.openLink.bind(this);
    this.state = {};
  }

  componentDidMount() {}

  openLink(url) {
    this.props.actions.goToUrl(url, this.props.post._id);
  }

  render() {
    let image = null;
    let post = this.props.metaPost || this.props.post;
    if (post.metaPost) {
      post = post.metaPost;
    }
    const single = false; // this.props.singlePost;
    let smallerImg; // = this.props.singlePost;
    let title = null;
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
        author = post.articleAuthor.join(', ');
        authorEl = (
          <Text
            numberOfLines={1}
            style={[styles.font12, styles.articleTitle, single ? styles.darkGrey : null]}
          >
            {author || ''}
          </Text>
        );
      }
      if (post.image && !post.image.match('gif')) {
        image = post.image.match('http') ? post.image : 'https:' + post.image;
      }
      if (post.link || post.url) {
        linkEl = (
          <View>
            <Text
              style={[
                styles.font12,
                styles.articleTitle,
                single ? styles.darkGrey : null
              ]}
            >
              {post.publisher || post.domain}
              {time ? ' · ' + time : ''}
              {authorEl ? ' · ' : null}
              {authorEl}
            </Text>
          </View>
        );
      }
      title = post.title ? post.title.trim() : '';
    }

    const titleEl = (
      <View style={[styles.textContainer]}>
        <View>
          <Text
            numberOfLines={3}
            style={[
              styles.articleTitle,
              styles.bebasBold,
              { color: 'white', lineHeight: 28 },
              { fontSize: 30, letterSpacing: 0.1, marginBottom: 0, paddingTop: 3 },
              single ? styles.darkGrey : null
            ]}
          >
            {title || 'Untitled'}
          </Text>
          {linkEl}
        </View>
      </View>
    );

    let imageEl;

    const imgColors = [
      'hsla(240, 70%, 30%, .01)',
      'hsla(240, 70%, 20%, .05)',
      'hsla(240, 70%, 10%, .2)',
      'hsla(240, 70%, 10%, .7)',
      'hsla(240, 70%, 10%, .6)'
    ];

    const titleLength = post.title ? post.title.length : 0;
    let color = post.body ? post.body.length : titleLength;
    color = (color % 220) + 200 || 200;
    color = Math.max(100, color);
    const colors = [
      'hsla(' + parseInt(color - 30, 10) + ', 100%, 50%, 1)',
      'hsla(' + parseInt(color, 10) + ',      100%, 50%, 1)',
      'hsla(' + parseInt(color + 30, 10) + ', 100%, 50%, 1)'
    ];
    const start = { x: 0.8, y: 0.0 };
    const end = { x: 0.2, y: 1.0 };

    const gradient = (
      <LinearGradient
        start={image ? { x: 0.5, y: 0.0 } : start}
        end={image ? { x: 0.5, y: 1.0 } : end}
        colors={image ? imgColors : colors}
        style={[styles.linearGradient, smallerImg ? { height: 180 } : null]}
      >
        {single ? null : titleEl}
      </LinearGradient>
    );
    let img;
    if (image) {
      img = (
        <Image
          style={[styles.postImage, smallerImg ? { height: 180 } : null]}
          source={image ? { uri: image } : require('app/public/img/missing.png')}
        />
      );
    }

    if (post.link || post.url || image) {
      imageEl = (
        <View style={[styles.imageCont, smallerImg ? { height: 180 } : null]}>
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
        onPressIn={e => {
          this.touchable1x = e.nativeEvent.pageX;
        }}
        onPress={e => {
          const x = e.nativeEvent.pageX;
          if (Math.abs(this.touchable1x - x) > 5) {
            return;
          }
          this.openLink(post.link || post.url);
        }}
        pressRetentionOffset={{ top: 100, left: 100, right: 100, bottom: 100 }}
      >
        <View style={[styles.postImageContainer]}>
          {imageEl}
          {single ? titleEl : null}
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
    paddingHorizontal: mainPadding,
    paddingVertical: 15,
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end'
  },
  articleTitle: {
    backgroundColor: 'transparent',
    color: 'white'
  },
  postImage: {
    height: smallScreen ? 200 : 256,
    flex: 1,
    maxWidth: fullWidth,
    position: 'relative',
    resizeMode: 'cover'
  },
  imageCont: {
    height: smallScreen ? 200 : 256,
    flex: 1,
    overflow: 'hidden'
  },
  linearGradient: {
    height: 256,
    width: fullWidth,
    position: 'absolute',
    bottom: 0
  },
  postImageContainer: {
    marginBottom: 0,
    flex: 1,
    alignItems: 'stretch',
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: 'white'
  }
});

styles = { ...globalStyles, ...localStyles };
