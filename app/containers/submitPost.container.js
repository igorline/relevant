'use strict';
import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  LayoutAnimation,
  Animated
} from 'react-native';
import { connect } from 'react-redux';
var Button = require('react-native-button');
import { bindActionCreators } from 'redux';
import * as authActions from '../actions/auth.actions';
import * as postActions from '../actions/post.actions';
import * as notifActions from '../actions/notif.actions';
require('../publicenv');
import { globalStyles, fullWidth, fullHeight } from '../styles/global';
import * as utils from '../utils';
import Notification from '../components/notification.component'

class SubmitPost extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      postLink: null,
      postBody: null,
      notifOpac: new Animated.Value(0),
      notifText: null,
      bool: false
    }
  }

  componentDidMount() {
  }

  post() {
    var self = this;
    var link = self.state.postLink;
    var body = self.state.postBody;

    if (!link) {
       self.props.actions.setNotif(true, 'Add url', false);
       return;
    }

    if (!body) {
      self.props.actions.setNotif(true, 'Add relevant text', false);
      return;
    }

    utils.post.generate(link, body, self.props.auth.token).then(function(results){
      if (!results) {
         self.props.actions.setNotif(true, 'Post error please try again', false)
      } else {
        self.props.actions.setNotif(true, 'Posted', true)
      }
    });
    self.setState({postText: null, postLink: null});
  }


  componentDidUpdate() {

  }


  render() {
    var self = this;
    var user = null;
    var postError = self.state.postError;
    if (self.props.auth) {
      if (self.props.auth.user) user = self.props.auth.user;
    }

    return (
      <View style={styles.fullContainer}>
        <TextInput style={[styles.font20, styles.linkInput]} placeholder='Enter URL here...' multiline={false} onChangeText={(postLink) => this.setState({postLink})} value={this.state.postLink} returnKeyType='done' />
          <View style={styles.divider}></View>
         <TextInput style={[styles.postInput, styles.font20]} placeholder='Relevant text here...' multiline={true} onChangeText={(postBody) => this.setState({postBody})} value={this.state.postBody} returnKeyType='done' />
        <Button style={styles.postSubmit} onPress={self.post.bind(self)}>Submit</Button>
          <View pointerEvents={'none'} style={styles.notificationContainer}>
          <Notification />
        </View>
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    auth: state.auth,
    router: state.routerReducer,
    notif: state.notif
   }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({...authActions, ...postActions, ...notifActions}, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SubmitPost)

const localStyles = StyleSheet.create({
  postSubmit: {
    padding: 10
  },
  postError: {
    color: 'red',
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
