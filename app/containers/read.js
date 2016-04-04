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

class Read extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      posts: null
    }
  }

  componentDidMount() {
    this.getPosts();
  }

  getPosts() {
    var self = this;
    fetch('http://localhost:3000/api/post/', {
        credentials: 'include',
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
      }
    })
    .then((response) => response.json())
    .then((responseJSON) => {
        console.log(responseJSON, 'response');
        self.setState({posts: responseJSON});
    })
    .catch((error) => {
        console.log(error, 'error');
    });
  }

  render() {
    var self = this;
    var postsEl = null;
    var posts = null;
    if (self.state.posts) {
      posts = self.state.posts;
      postsEl = posts.map(function(post, i) {
        return (
           <Text>{post.body}</Text>
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
    router: state.routerReducer
   }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(authActions, dispatch)
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

