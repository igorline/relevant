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
           <Text onPress={self.props.actions.getActivePost.bind(null, post._id)}>{post.body}</Text>
        );
      });
    }

    return (
      <View style={styles.container}>
       <Text style={styles.welcome}>Read</Text>
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

const styles = StyleSheet.create({
  uploadAvatar: {
    width: 200,
    height: 200
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 20,
    borderStyle: 'solid',
    borderColor: 'transparent'
  },
  wrap: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center'
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  input: {
    borderColor: '#cccccc',
    borderStyle: 'solid',
    borderWidth: 1,
    height: 30,
    width: 200,
    alignSelf: 'center',
    margin: 5
  },
  marginTop: {
    marginTop: 10
  }
});

