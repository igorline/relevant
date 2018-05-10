'use strict';
import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TextInput
} from 'react-native';

class Contact extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      matchUser: null
    }
  }

  componentDidMount() {
  }

  crossReference() {
    var self = this;
    var contactNumbersList = [];
    var userIndex = [];
    if (self.props.userIndex) userIndex = self.props.userIndex;
    var matchUser = self.state.matchUser;
    console.log(contactNumbersList, userIndex, matchUser)

    for (var i = 0; i < self.props.phoneNumbers.length; i++) {
      var altNum = self.props.phoneNumbers[i].number.replace(/\D/g,'');
      var num = Number(altNum);
      contactNumbersList.push(num);

      if (i == self.props.phoneNumbers.length - 1) {
        for (var x = 0; x < contactNumbersList.length; x++) {

          for (var y = 0; y < userIndex.length; y++) {
            if (userIndex[y].phone) {
              if (userIndex[y].phone == contactNumbersList[x]) {
                self.setState({matchUser: userIndex[y]})
              }
            }
          }

        };
      }
    }
  }

  render() {
    var self = this;
    var styles = this.props.styles;
    var matchUser = self.state.matchUser;

    self.crossReference(self);

    return (
      <View style={styles.center}>
        <Text style={matchUser ? styles.green : null}>{this.props.givenName}{matchUser ? '  Relevant username: ' + matchUser.name : null}</Text>
      </View>
    );
  }
}

export default Contact


