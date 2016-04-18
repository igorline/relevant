'use strict';
import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableHighlight,
  LinkingIOS
} from 'react-native';
import { connect } from 'react-redux';
var Button = require('react-native-button');
import { bindActionCreators } from 'redux';
import * as authActions from '../actions/auth.actions';
import * as postActions from '../actions/post.actions';
import * as userActions from '../actions/user.actions';
require('../publicenv');
import { globalStyles, fullWidth, fullHeight } from '../styles/global';

class Notification extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
    }
  }

  componentDidMount() {
  }

  render() {
    var self = this;
    var parentStyles = this.props.styles;
    var styles = {...localStyles, ...parentStyles};
    var message = this.props.message;
    var bool = self.props.bool;

    return (
      <View style={[styles.parent, bool ? styles.green : styles.red]}>
        <Text style={styles.notifText}>{self.props.message}</Text>
      </View>
    );
  }
}

export default Notification;

const localStyles = StyleSheet.create({
parent: {
  width: fullWidth,
  padding: 10,
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center'
},
notifText: {
  color: 'white',
  fontSize: 20,
},
red: {
  backgroundColor: 'red'
},
green: {
  backgroundColor: 'green'
}
});






