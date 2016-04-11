'use strict';
import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  Link
} from 'react-native';
import { connect } from 'react-redux';
var Button = require('react-native-button');
import { bindActionCreators } from 'redux';
import * as authActions from '../actions/authActions';
import * as postActions from '../actions/postActions';
require('../publicenv');
import { globalStyles, fullWidth, fullHeight } from '../styles/global';

class SinglePost extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
    }
  }

  componentDidMount() {
  }

  render() {
    var self = this;
    var post = null;
    if (this.props.posts.activePost) post = this.props.posts.activePost;
    var title = null;
    var description = null;
    var image = null;
    var link = null;
    if (post.link) link = post.link;
    if (post.title) title = post.title;
    if (post.description) description = post.description;
    if (post.image) image = post.image;
    return (
      <View style={styles.container}>
        {image ? <Image source={{uri: image}} style={styles.postImage} /> : null}
        {title ? <Text style={[styles.font20, styles.textCenter]}>{title}</Text> : null }
        {description ? <Text style={styles.center}>{description}</Text> : null}
        {link ? <Text style={styles.center}>{link}</Text> : null}
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    auth: state.auth,
    posts: state.posts,
    router: state.routerReducer
   }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ ...authActions, ...postActions}, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SinglePost)

const localStyles = StyleSheet.create({
postImage: {
  height: 200,
  width: 200
}
});

var styles = {...localStyles, ...globalStyles}

