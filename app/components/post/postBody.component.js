import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableWithoutFeedback,
} from 'react-native';
import { globalStyles } from '../../styles/global';

let styles;

class PostBody extends Component {
  constructor(props, context) {
    super(props, context);
    this.goToPost = this.goToPost.bind(this);
    this.state = {
    };
  }

  componentDidMount() {
  }

  setTag(tag) {
    this.props.actions.selectTag({ _id: tag.replace('#', '') });
    this.props.navigator.changeTab('discover');
  }

  setSelected(user) {
    if (!user) return;
    if (this.props.scene && this.props.scene.id === user._id) return;
    this.props.navigator.goToProfile(user);
  }

  goToPost() {
    this.props.navigator.goToPost(this.props.post);
  }

  render() {
    const expanded = this.props.singlePost;
    let body = null;
    let post = this.props.post;
    if (post) {
      if (post.body) body = post.body;
    }
    let bodyEl = null;

    if (body) {
      let bodyObj = {};

      let textArr = body
      .replace((/[,.!?\s+]/g), a => '`' + a + '`')
      .split(/`/);
      textArr.forEach((section, i) => {
        bodyObj[i] = {};
        bodyObj[i].text = section;
        if (section.indexOf('#') > -1) {
          bodyObj[i].hashtag = true;
          bodyObj[i].mention = false;
        } else if (section.indexOf('@') > -1) {
          bodyObj[i].mention = true;
          bodyObj[i].hashtag = false;
        } else {
          bodyObj[i].hashtag = false;
          bodyObj[i].mention = false;
        }
      });

      // console.log(bodyObj);
      let breakText;

      bodyEl = Object.keys(bodyObj).map((key, i) => {

        let space = '';
        if (breakText) space = ' ';

        if (bodyObj[key].hashtag) {
          return (<Text
            key={key}
            onPress={() => this.setTag(bodyObj[key].text)}
            style={styles.active}
          >
            {bodyObj[key].text + space}
          </Text>);
        } else if (bodyObj[key].mention) {
          return (<Text
            key={key}
            onPress={() => this.setSelected(bodyObj[key].text)}
            style={styles.active}
          >
            {bodyObj[key].text + space}
          </Text>);
        }
        if (i < 57 || expanded) {
          return (<Text key={i}>{bodyObj[key].text}</Text>);
        }
        else if (!breakText) {
          breakText = i;
          return <Text key={'break'}>... </Text>;
        }
      });

      if (breakText) {
        bodyEl.push(<Text style={[styles.bebasBold, styles.active]}>● READ MORE</Text>);
      }
    }



    let numberOfLines = 9999999999999;
    let postStyle = styles.bodyText;
    // if (!expanded) numberOfLines = 10;

    if (this.props.short) {
      numberOfLines = 2;
      postStyle = styles.commentaryText;
    }

    if (body.length < 120 && !this.props.short) {
      postStyle = styles.shortBodyText;
    }

    if (this.props.repost) {
      numberOfLines = 4;
      postStyle = styles.bodyText;
    }

    return (<TouchableWithoutFeedback onPress={this.goToPost}>
      <View style={[styles.postBody]}>
        <Text
          style={[styles.darkGrey, postStyle]}
          numberOfLines={numberOfLines}
        >
          {bodyEl}
        </Text>
      </View>
    </TouchableWithoutFeedback>);
  }
}

export default PostBody;

const localStyles = StyleSheet.create({
  postBody: {
    paddingTop: 10,
    paddingBottom: 10,
  },
  bodyText: {
    fontFamily: 'Georgia',
    fontSize: 38 / 2,
    lineHeight: 55 / 2,
  },
  commentaryText: {
    fontFamily: 'Georgia',
    fontSize: 32 / 2,
    lineHeight: 40 / 2,
  },
  shortBodyText: {
    fontFamily: 'Libre Caslon Display',
    fontSize: 63 / 2,
    lineHeight: 82 / 2,
  }
});

styles = { ...globalStyles, ...localStyles };

