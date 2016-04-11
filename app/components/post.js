'use strict';
import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableHighlight
} from 'react-native';
import { connect } from 'react-redux';
var Button = require('react-native-button');
import { bindActionCreators } from 'redux';
import * as authActions from '../actions/authActions';
import * as postActions from '../actions/postActions';
import * as userActions from '../actions/userActions';
require('../publicenv');
import { globalStyles, fullWidth, fullHeight } from '../styles/global';
var postStyles = null;


class Post extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      postUser: null
    }
  }

  componentDidMount() {
    // if (this.props.post.userId) this.postUser();
  }

  // postUser() {
  //   var self = this;
  //   this.props.actions.getPostUser(this.props.post.userId, this.props.token).then(function(results){
  //       self.setState({postUser: results});
  //   })
  // }

  render() {
    var self = this;
    var post = null;
    var title = null;
    var description = null;
    var image = null;
    var link = null;
    var imageEl = null;
    var postUserImage = null;
    var postUserImageEl = null;
    var postUser = null;
    var postUserName = null;

    var postStyles = this.props.styles;
    var styles = {...localStyles, ...postStyles};

    if (this.props.post) {
      post = this.props.post;
      if (post.image) image = post.image;
      if (post.description) description = post.description;
      if (post.title) title = post.title;
      if (post.link) link = post.link;

      if (post.user) {
        postUser = post.user;
        if (postUser.image) postUserImage = postUser.image;
        if (postUser.name) postUserName = postUser.name;
      }
    }



    if (postUserImage) {
      postUserImageEl = (<Image source={{uri: postUserImage}} style={styles.userImage} />);
    }

    if (image) {
      imageEl = (<Image source={{uri: image}} style={styles.postImage} />);
    }

    return (
      <TouchableHighlight underlayColor={'transparent'} onPress={self.props.actions.getActivePost.bind(null, self.props.post._id)}>
      <View  style={[styles.postContainer]}>
        <Text style={styles.font20}>{title}</Text>
        <View style={styles.imageRow}>
          {postUserImageEl}
          <View style={styles.postInfo}>
            {postUserName ? <Text>posted by {postUserName}</Text> : null}
            {link ? <Text numberOfLines={1} style={[styles.link, styles.active]}>{link}</Text> : null}
          </View>
        </View>
        {description ? <Text>{description}</Text> : null}
      </View>
      </TouchableHighlight>
    );
  }
}

export default Post;

const localStyles = StyleSheet.create({
  postContainer: {
    marginBottom: 25,
    textAlign: 'left',
    // borderWidth:1,
    // borderColor: 'blue'
  },
  postImage: {
    height: 100,
    width: 100,
  },
  userImage: {
    height: 80,
    width: 80,
    borderRadius: 40
  },
  imageRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  link: {
    flex: 1,
    // width: 100,
    // whiteSpace: 'wrap',
    // flexWrap: 'wrap'
    // borderWidth: 1,
    // borderColor: 'red'
  },
  postInfo: {
    flex: 1,
    paddingLeft: 10
  }
});






