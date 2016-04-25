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
  Animated,
  ScrollView,
  TouchableWithoutFeedback
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
import Notification from '../components/notification.component';
var dismissKeyboard = require('react-native-dismiss-keyboard');

class SubmitPost extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      postLink: null,
      postBody: null,
      editingBody: false
    }
  }

  componentDidMount() {
  }

  post() {
    var self = this;
    var link = self.state.postLink;
    var body = self.state.postBody;

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
    self.setState({postText: null, postLink: null, editingBody: false});
  }


  componentDidUpdate() {

  }

  ValidURL() {
    var str = this.state.postLink;
    var pattern = new RegExp(/^(https?:\/\/)?((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|((\d{1,3}\.){3}\d{1,3}))(\:\d+)?(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(\#[-a-z\d_]*)?$/i);
    if(!pattern.test(str)) {
      console.log("not a valid url");
      return false;
    } else {
      return true;
    }
  }

  nextPhase() {
    var self = this;

    if (!self.state.postLink) {
       self.props.actions.setNotif(true, 'Add url', false);
       return;
    }

    if (!self.ValidURL()) {
      self.props.actions.setNotif(true, 'not a valid url', false);
      return;
    }

    var url = self.state.postLink;
    if (url.indexOf('http://') == -1 && url.indexOf('https://') == -1) {
      self.setState({postLink: 'http://'+url});
    }

    if (!self.state.editingBody) {
      self.setState({editingBody: true});
    }
  }

  prev() {
    var self = this;
    self.setState({editingBody: false});
  }


  render() {
    var self = this;
    var user = null;
    var postError = self.state.postError;
    if (self.props.auth) {
      if (self.props.auth.user) user = self.props.auth.user;
    }


    return (
      <TouchableWithoutFeedback onPress={()=> dismissKeyboard()}>
      <View style={styles.fullContainer}>
        {!self.state.editingBody ? <TextInput numberOfLines={1} style={[styles.font20, styles.linkInput]} placeholder='Enter URL here...' multiline={false} onChangeText={(postLink) => this.setState({postLink})} value={this.state.postLink} returnKeyType='done' /> : <TextInput style={[styles.bodyInput, styles.font20]} placeholder='Relevant text here...' multiline={true} onChangeText={(postBody) => this.setState({postBody})} value={this.state.postBody} returnKeyType='done' />}
        {self.state.editingBody ? <Button style={styles.nextButton} onPress={self.prev.bind(self)}>Prev</Button> : null}
        <Button style={styles.nextButton} onPress={self.state.editingBody ? self.post.bind(self) : self.nextPhase.bind(self)}>{self.state.editingBody ? 'Submit' : 'Next'}</Button>
        <View pointerEvents={'none'} style={styles.notificationContainer}>
          <Notification />
        </View>
      </View>
      </TouchableWithoutFeedback>
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
  nextButton:  {
    width: fullWidth,
    textAlign: 'center',
    padding: 10
  },
  postInput: {
    height: 50,
    padding: 10,
    width: fullWidth,
    textAlign: 'center'
  },
  bodyInput: {
    // flex: 1,
    width: fullWidth,
    height: fullHeight/3,
    // borderWidth: 1,
    // borderColor: 'green',
    padding: 10
  },
  linkInput: {
    height: 50,
    width: fullWidth,
    padding: 10,
    textAlign: 'center',
  },
  createPostContainer: {
    // borderWidth: 1,
    // borderColor: 'red',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch'
  },
  divider: {
    height: 1,
    width: fullWidth,
    backgroundColor: '#c7c7c7'
  }
});

var styles = {...localStyles, ...globalStyles};
