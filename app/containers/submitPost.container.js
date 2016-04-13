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
import * as authActions from '../actions/auth.actions';
import * as postActions from '../actions/post.actions';
require('../publicenv');
import { globalStyles, fullWidth, fullHeight } from '../styles/global';
import * as utils from '../utils';

class SubmitPost extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      postLink: null,
      postBody: null
    }
  }

  componentDidMount() {
  }

  post() {
    var self = this;
    var link = self.state.postLink;
    var body = self.state.postBody;
    utils.post.generate(link, body, self.props.auth.token);
    self.setState({postText: null, postTitle: null});
  }

  render() {
    var self = this;
    var user = null;
    if (self.props.auth) {
      if (self.props.auth.user) user = self.props.auth.user;
    }

    return (
      <View style={styles.fullContainer}>
      <TextInput style={[styles.font20, styles.linkInput]} placeholder='Enter URL here...' multiline={false} onChangeText={(postLink) => this.setState({postLink})} value={this.state.linkText} returnKeyType='done' />
        <View style={styles.divider}></View>
       <TextInput style={[styles.postInput, styles.font20]} placeholder='Relevant text here...' multiline={true} onChangeText={(postBody) => this.setState({postBody})} value={this.state.postBody} returnKeyType='done' />
      <Button style={styles.postSubmit} onPress={self.post.bind(self)}>Submit</Button>
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

export default connect(mapStateToProps, mapDispatchToProps)(SubmitPost)

const localStyles = StyleSheet.create({
  postSubmit: {
    padding: 10
  },
  postInput: {
    flex: 1,
    padding: 10,
  },
  linkInput: {
    padding: 10,
    flex: 0.075
  },
  divider: {
    height: 1,
    width: fullWidth,
    backgroundColor: '#c7c7c7'
  }
});

var styles = {...localStyles, ...globalStyles};
