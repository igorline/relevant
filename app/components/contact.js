'use strict';
import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View,
  TextInput
} from 'react-native';
var Button = require('react-native-button');

class Contact extends Component {

  render() {
    var self = this;
    var contactNumbersList = [];
    var userIndex = [];
    var matchUser = null;
    var styles = this.props.styles;

    if (this.props) {
      if (this.props.userIndex) userIndex = this.props.userIndex;
    }

    crossReference();

    function crossReference() {
      for (var i = 0; i < self.props.phoneNumbers.length; i++) {
        var altNum = self.props.phoneNumbers[i].number.replace(/\D/g,'');
        var num = Number(altNum);
        contactNumbersList.push(num);

        if (i == self.props.phoneNumbers.length - 1) {
          for (var x = 0; x < contactNumbersList.length; x++) {

            for (var y = 0; y < userIndex.length; y++) {
              if (userIndex[y].phone) {
                if (userIndex[y].phone == contactNumbersList[x]) {
                  matchUser = userIndex[y];
                }
              }
            }

          };
        }
      }
    }

    return (
      <View style={styles.center}>
        <Text style={matchUser ? styles.green : null}>{this.props.givenName}{matchUser ? '  Relevant username: ' + matchUser.name : null}</Text>
      </View>
    );
  }
}

export default Contact


