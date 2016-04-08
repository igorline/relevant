'use strict';
import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View,
  Image,
  TextInput
} from 'react-native';
import { connect } from 'react-redux';
var Button = require('react-native-button');
import { bindActionCreators } from 'redux';
import * as authActions from '../actions/authActions';
import * as postActions from '../actions/postActions';
require('../publicenv');
import { globalStyles, fullWidth, fullHeight } from '../styles/global';

class Read extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
    }
  }

  componentDidMount() {
    this.props.actions.getPosts();
  }

  render() {
    var self = this;
    var postsEl = null;
    var posts = null;

    if (self.props.posts.index) {
      posts = self.props.posts.index;
      postsEl = posts.map(function(post, i) {
        return (
           <Text style={styles.textCenter} onPress={self.props.actions.getActivePost.bind(null, post._id)}>{post.title}</Text>
        );
      });
    }

    return (
      <View style={[styles.container, styles.textCenter]}>
       <Text style={styles.font20}>Read</Text>
       {postsEl}
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

export default connect(mapStateToProps, mapDispatchToProps)(Read)

const localStyles = StyleSheet.create({
});

var styles = {...localStyles, ...globalStyles};

