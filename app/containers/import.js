'use strict';
import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView
} from 'react-native';

import {
  Route,
  Router,
  Schema,
  TabBar,
  TabRoute
} from 'react-native-router-redux';

import { connect } from 'react-redux';
var Button = require('react-native-button');
import Contact from '../components/contact';
import * as authActions from '../actions/authActions';
import { bindActionCreators } from 'redux';
// require('../secrets.js');


class Import extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      userIndex: null
    }
  }

  componentDidMount(){
    this.userIndex()
  }

  userIndex() {
    var self = this;
    fetch('http://'+process.env.SERVER_IP+':3000/api/user', {
        credentials: 'include',
        method: 'GET'
      })
      .then((response) => response.json())
      .then((responseJSON) => {
        self.setState({userIndex: responseJSON});
      })
      .catch((error) => {
        console.log(error, 'error');
      });
  }

  render() {
    var self = this;
    var contactsEl = null;
    var contacts = self.props.auth.contacts;
    const { getContacts } = this.props.actions;
     const { actions } = this.props;

    if (contacts) {
      contactsEl = contacts.map(function(contact, i) {
      return (
        <Contact key={i} {...contact} userIndex={self.state.userIndex} />
      );
    });
    }

    return (
      <ScrollView contentContainerStyle={styles.contentContainer}>
      <View>
        {contacts ? null : <Button onPress={getContacts}>Import contacts</Button>}
        {contactsEl}
        <Button onPress={actions.routes.Auth()}>Home</Button>
        </View>
      </ScrollView>
    );
  }
}
export default Import

const styles = StyleSheet.create({
  contentContainer: {
    paddingVertical: 30,
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
    width: 250,
    alignSelf: 'center'
  },
  marginTop: {
    marginTop: 10
  }
});

