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


class Import extends Component {

  // constructor (props, context) {
  //   super(props, context)
  //   this.state = {
  //     "contacts": null
  //   }
  // }

  render() {
    var self = this;
    var contactsEl = null;
    var contacts = self.props.auth.contacts;

    const { getContacts } = this.props.actions;
    console.log(this)

    if (contacts) {
      contactsEl = contacts.map(function(contact, i) {
      return (
        <Contact key={i} {...contact} />
      );
    });
    }

    return (
      <ScrollView contentContainerStyle={styles.contentContainer}>
      <View>
        {contacts ? null : <Button onPress={getContacts}>Import contacts</Button>}
        {contactsEl}
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

