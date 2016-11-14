import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  Modal,
} from 'react-native';
import { globalStyles, fullWidth, fullHeight } from '../styles/global';
let styles;

class PostBody extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      // bodyHeight: 0,
      // editedBody: null,
      // editedTitle: null,
    }
  }

  componentDidMount() {
    const self = this;
      //     this.setState({
      //   editedBody: self.props.post.body,
      //   editedTitle: self.props.post.title
      // });
  }

  setTag(tag) {
    this.props.actions.selectTag(tag);
    this.props.navigator.changeTab('discover');
  }

  setSelected(user) {
    if (!user) return;
    if (this.props.scene && this.props.scene.id === user._id) return;
    this.props.navigator.goToProfile(user);
  }


  render() {
    const self = this;
    const expanded = this.props.expanded;
    const toggleFunction = this.props.toggleFunction;
    let editing = this.props.editing;
    let body = this.props.body;
    let bodyEl = null;
    let bodyEditingEl = null;

    // if (editing) {
    //   bodyEditingEl = (
    //     <TextInput
    //       multiline
    //       autoGrow
    //       style={[styles.darkGray, styles.editingInput, { height: Math.max(35, self.state.bodyHeight) }]}
    //       onChange={(event) => {
    //         this.setState({
    //           editedBody: event.nativeEvent.text,
    //           bodyHeight: event.nativeEvent.contentSize.height,
    //         });
    //       }}
    //       value={this.state.editedBody}
    //     />
    //   );

    //   bodyEditingEl = (
    //     <TextInput
    //       multiline
    //       autoGrow
    //       style={[styles.darkGray, styles.editingInput, { height: Math.max(35, self.state.bodyHeight) }]}
    //       onChange={(event) => {
    //         this.setState({
    //           editedBody: event.nativeEvent.text,
    //           bodyHeight: event.nativeEvent.contentSize.height,
    //         });
    //       }}
    //       value={this.state.editedBody}
    //     />
    //   );

    // }

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
          let tagObj = null;
          self.props.post.tags.forEach((tag) => {
            if (tag.name === text.substr(1, text.length)) {
              tagObj = tag;
            }
          });
          return (<Text
            key={i}
            onPress={tagObj ? () => self.setTag(tagObj) : null}
            style={styles.active}
          >
            {bodyObj[key].text}
          </Text>);
        } else if (bodyObj[key].mention) {
          let mentionObj = null;
          if (self.props.post.mentions) {
            if (self.props.post.mentions.length) {
              self.props.post.mentions.forEach((eachUser) => {
                if (eachUser.name) {
                  if (eachUser.name.toLowerCase() === text.substr(1, text.length).toLowerCase()) {
                    mentionObj = eachUser;
                  }
                }
              });
            }
          }
          return (<Text
            key={i}
            onPress={mentionObj ? () => self.setSelected(mentionObj) : null}
            style={mentionObj ? styles.active : null}
          >
            {bodyObj[key].text}
          </Text>);
        } else {
          return (<Text key={i}>{bodyObj[key].text}</Text>);
        }
      });
    }

    return (<View style={[styles.postBody]}>
      {body && !editing ?
        <Text style={styles.darkGray} numberOfLines={expanded ? 999999 : 2}>{bodyEl}</Text>
      : null}
      {body && editing ? bodyEditingEl : null}
    </View>);
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

