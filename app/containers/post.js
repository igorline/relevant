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
let xml = require('react-native').NativeModules.RNMXml;

class Post extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      postText: null,
      postTitle: null
    }
  }

  componentDidMount() {
  }

  render() {
    var self = this;
    var user = null;
    if (self.props.auth) {
      if (self.props.auth.user) user = self.props.auth.user;
    }

    function post() {
      self.props.actions.submitPost(user._id, self.state.postText, self.state.postTitle);
      // fetch(self.state.postText, {
      //       method: 'GET',
      //   })
      //       // .then((response) => response.json())
      //       .then((response) => {
      //         console.log(response, 'response to post');
      //         xml.queryHtml(response._bodyText,
      //        results => console.log(results[0]))
      //       })
      //       .catch((error) => {
      //           console.log(error, 'error');
      //       });
      // self.pro
      self.setState({postText: null, postTitle: null});
    }

    return (
      <View style={styles.fullContainer}>
      <TextInput style={[styles.font20, styles.titleInput]} placeholder='Title' multiline={true} onChangeText={(postTitle) => this.setState({postTitle})} value={this.state.postTitle} onSubmitEditing={post} returnKeyType='done' />
       <TextInput style={[styles.postInput, styles.font20]} placeholder='Relevant text here...' multiline={true} onChangeText={(postText) => this.setState({postText})} value={this.state.postText} onSubmitEditing={post} returnKeyType='done' />
      <Button style={styles.postSubmit} onPress={post}>Submit</Button>
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
    actions: bindActionCreators({...authActions, ...postActions}, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Post)

const localStyles = StyleSheet.create({
  fullContainer: {
    flex: 1
  },
  postSubmit: {
    padding: 10
  },
  postInput: {
    flex: 1,
    padding: 10,
  },
  titleInput: {
    padding: 10,
    flex: 0.075,
    borderWidth: 0.5,
    borderBottomColor: '#C7C7C7',
    borderRightColor: 'transparent',
    borderLeftColor: 'transparent',
    borderTopColor: 'transparent',
  }
});

var styles = {...localStyles, ...globalStyles};
