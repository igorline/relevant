import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableWithoutFeedback,
} from 'react-native';
import { globalStyles } from '../styles/global';

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
    console.log('go to post');
    this.props.navigator.goToPost(this.props.post);
  }

  render() {
    const self = this;
    const expanded = this.props.expanded;
    let editing = this.props.editing;
    let body = null;
    let post = this.props.post;
    if (post) {
      if (post.body) body = post.body;
    }
    let bodyEl = null;
    let bodyEditingEl = null;

    if (body) {
      let bodyObj = {};

      let textArr = body.replace((/[@#]\S+/g), (a) => { return '`' + a + '`'; }).split(/`/);
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

      bodyEl = Object.keys(bodyObj).map((key, i) => {
        let text = bodyObj[key].text;

        if (bodyObj[key].hashtag) {
          return (<Text
            key={key}
            onPress={() => this.setTag(bodyObj[key].text)}
            style={styles.active}
          >
            {bodyObj[key].text}
          </Text>);
        } else if (bodyObj[key].mention) {
          return (<Text
            key={key}
            onPress={() => this.setSelected(bodyObj[key].text)}
            style={styles.active}
          >
            {bodyObj[key].text}
          </Text>);
        }
        return (<Text key={i}>{bodyObj[key].text}</Text>);
      });
    }

    return (<TouchableWithoutFeedback onPress={this.goToPost}>
      <View style={[styles.postBody]}>
        {body && !editing ?
          <Text style={styles.darkGray} numberOfLines={expanded ? 999999 : 2}>{bodyEl}</Text>
        : null}
        {body && editing ? bodyEditingEl : null}
      </View>
    </TouchableWithoutFeedback>);
  }
}

export default PostBody;

const localStyles = StyleSheet.create({
  postBody: {
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 15,
    paddingRight: 15,
  },
});

styles = { ...globalStyles, ...localStyles };

