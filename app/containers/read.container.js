'use strict';
import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  ScrollView,
  Linking
} from 'react-native';
import { connect } from 'react-redux';
var Button = require('react-native-button');
import { bindActionCreators } from 'redux';
import * as authActions from '../actions/auth.actions';
import * as postActions from '../actions/post.actions';
import * as userActions from '../actions/user.actions';
require('../publicenv');
import { globalStyles, fullWidth, fullHeight } from '../styles/global';
import Post from '../components/post.component';

class Read extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
    }
  }

  componentDidMount() {
    //this.props.actions.getPosts();
  }

  render() {
    var self = this;
    var postsEl = null;
    var posts = null;
    //console.log(self, 'read self')
    // if (self.props.posts.index) {
    //   posts = self.props.posts.index;
    //   postsEl = posts.map(function(post, i) {
    //     return (
    //         <Post {...self.props} post={post} styles={styles} />
    //     );
    //   });
    // }

    return (
      <ScrollView style={[styles.readContainer]}>
       {postsEl}
      </ScrollView>
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
    actions: bindActionCreators({ ...authActions, ...postActions, ...userActions}, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Read)

const localStyles = StyleSheet.create({
  readContainer: {
   // padding: 20,
   // borderWidth: 1,
   // borderColor: 'red'
  },
  readHeader: {
    marginBottom: 10
  }
});

var styles = {...localStyles, ...globalStyles};

