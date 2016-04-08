'use strict';
import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  Dimensions
} from 'react-native';
import { globalStyles, fullWidth, fullHeight } from '../styles/global';

var FileUpload = require('NativeModules').FileUpload;
import { connect } from 'react-redux';
var Button = require('react-native-button');
import * as authActions from '../actions/authActions';
import * as postActions from '../actions/postActions';
import { bindActionCreators } from 'redux';
var ImagePickerManager = require('NativeModules').ImagePickerManager;
require('../publicenv');
import * as utils from '../utils';

class User extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
    }
  }

  componentDidMount() {
  }

  render() {
    var self = this;
    // console.log(self, 'userpage self');
    var image = null;
    var user = null;
    var relevance = 0;
    var name = null;
    if (self.props.users.selectedUser) user = self.props.users.selectedUser;
    if (self.props.users.selectedUser.image) image = self.props.users.selectedUser.image;
    if (self.props.users.selectedUser.relevance) relevance = self.props.users.selectedUser.relevance;
    if (self.props.users.selectedUser.name) name = self.props.users.selectedUser.name;

    return (
      <View style={styles.container}>
        <Text style={styles.font20}>{name}</Text>
        {image ? <Image source={{uri: image}} style={styles.userImage} /> : null}
        <Text style={styles.font20}>Relevance: <Text style={styles.active}>{relevance}</Text></Text>
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    auth: state.auth,
    posts: state.posts,
    users: state.user,
    router: state.routerReducer
   }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({...authActions, ...postActions}, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(User)

const localStyles = StyleSheet.create({
  userImage: {
  height: 200,
  width: 200
}
});
var styles = {...localStyles, ...globalStyles};

